<?php

namespace App\Services;

use App\Mail\RefundProcessedMail;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class RefundService
{
    public function __construct(private StripeService $stripe) {}

    /**
     * Process a refund on Stripe and update the local payment record.
     *
     * @throws \RuntimeException
     * @return array{refund_id: string, refunded_amount: float, fully_refunded: bool}
     */
    public function refund(Payment $payment, float $amount, string $reason = 'Remboursement administratif'): array
    {
        if (! $payment->stripe_payment_intent_id) {
            throw new \RuntimeException('Aucun ID de paiement Stripe associé.');
        }

        $maxRefundable = $payment->remainingRefundable();
        if ($amount > $maxRefundable) {
            throw new \RuntimeException("Le montant ne peut pas dépasser {$maxRefundable} MAD.");
        }

        $stripeReason = $this->mapReason($reason);

        $refund = $this->stripe->refundPayment(
            $payment->stripe_payment_intent_id,
            $amount,
            $stripeReason
        );

        $newRefunded  = round((float)$payment->refunded_amount + $amount, 2);
        $fullyRefunded = $newRefunded >= (float)$payment->amount;

        $payment->update([
            'refunded_amount' => $newRefunded,
            'refund_reason'   => $reason,
            'stripe_refund_id'=> $refund->id,
            'status'          => $fullyRefunded ? 'refunded' : $payment->status,
        ]);

        if ($fullyRefunded && $payment->subscription_id) {
            $subscription = Subscription::find($payment->subscription_id);
            $subscription?->cancel('refunded');
        }

        // Notify school owner
        try {
            $school = $payment->autoSchool;
            if ($school?->user) {
                Mail::to($school->user->email)
                    ->queue(new RefundProcessedMail($payment, $amount, $reason));
            }
        } catch (\Throwable $e) {
            Log::warning('RefundService: failed to send email', ['error' => $e->getMessage()]);
        }

        return [
            'refund_id'      => $refund->id,
            'refunded_amount'=> $amount,
            'fully_refunded' => $fullyRefunded,
        ];
    }

    private function mapReason(string $reason): string
    {
        $lower = strtolower($reason);
        if (str_contains($lower, 'duplicat') || str_contains($lower, 'double')) return 'duplicate';
        if (str_contains($lower, 'frauduleux') || str_contains($lower, 'fraud')) return 'fraudulent';
        return 'requested_by_customer';
    }
}

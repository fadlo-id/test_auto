<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmProspect;
use App\Services\CrmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CrmSmsController extends Controller
{
    public function __construct(private CrmService $crm) {}

    public function store(Request $request, CrmProspect $prospect): RedirectResponse
    {
        abort_if(! $prospect->phone, 422, 'Ce prospect n\'a pas de numéro de téléphone.');

        $request->validate([
            'message' => 'required|string|max:160',
        ]);

        $sms = $this->crm->sendSms(
            $prospect,
            $request->input('message'),
            auth()->user(),
        );

        $msg = $sms->status === 'sent'
            ? 'SMS envoyé avec succès.'
            : "SMS enregistré mais l'envoi a échoué : {$sms->error_message}";

        return back()->with($sms->status === 'sent' ? 'success' : 'error', $msg);
    }
}

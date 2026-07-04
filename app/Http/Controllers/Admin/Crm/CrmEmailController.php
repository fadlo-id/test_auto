<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmProspect;
use App\Services\CrmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CrmEmailController extends Controller
{
    public function __construct(private CrmService $crm) {}

    public function store(Request $request, CrmProspect $prospect): RedirectResponse
    {
        abort_if(! $prospect->email, 422, 'Ce prospect n\'a pas d\'adresse email.');

        $request->validate([
            'subject' => 'required|string|max:200',
            'body'    => 'required|string|max:10000',
        ]);

        $email = $this->crm->sendEmail(
            $prospect,
            $request->input('subject'),
            $request->input('body'),
            auth()->user(),
        );

        $msg = $email->status === 'sent'
            ? 'Email envoyé avec succès.'
            : "Email enregistré mais l'envoi a échoué : {$email->error_message}";

        return back()->with($email->status === 'sent' ? 'success' : 'error', $msg);
    }
}

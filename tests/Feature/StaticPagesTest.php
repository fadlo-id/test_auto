<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaticPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_about_page_renders(): void
    {
        $this->get(route('about'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('StaticPages/About'));
    }

    public function test_faq_page_renders(): void
    {
        $this->get(route('faq'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('StaticPages/Faq'));
    }

    public function test_privacy_page_renders(): void
    {
        $this->get(route('privacy'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('StaticPages/Privacy'));
    }

    public function test_terms_page_renders(): void
    {
        $this->get(route('terms'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('StaticPages/Terms'));
    }

    public function test_contact_page_renders(): void
    {
        $this->get(route('contact'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('StaticPages/Contact'));
    }

    public function test_contact_form_submits_successfully(): void
    {
        $this->post(route('contact.submit'), [
            'name'    => 'Ali Benali',
            'email'   => 'ali@test.com',
            'subject' => 'info',
            'message' => 'Bonjour je voudrais des informations sur la plateforme.',
        ])->assertRedirect();
    }

    public function test_contact_form_validates_required_fields(): void
    {
        $this->post(route('contact.submit'), [])
            ->assertSessionHasErrors(['name', 'email', 'subject', 'message']);
    }

    public function test_contact_form_validates_email_format(): void
    {
        $this->post(route('contact.submit'), [
            'name'    => 'Test',
            'email'   => 'not-an-email',
            'subject' => 'info',
            'message' => 'Message de test.',
        ])->assertSessionHasErrors(['email']);
    }
}

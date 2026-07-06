<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_applications', function (Blueprint $table) {
            $table->id();
            $table->string('status', 20)->default('pending'); // pending|approved|rejected

            // 1. Informations générales
            $table->string('school_name');
            $table->string('owner_name');
            $table->date('founded_at')->nullable();
            $table->string('city', 100);
            $table->string('district', 100)->nullable(); // quartier
            $table->text('address');
            $table->string('phone_landline', 30)->nullable();
            $table->string('phone_mobile', 30); // GSM
            $table->string('whatsapp', 30)->nullable();
            $table->string('email');

            // 2. Présentation
            $table->string('tagline')->nullable();
            $table->text('director_message')->nullable();
            $table->text('description');

            // 3. Informations pédagogiques
            $table->json('categories')->nullable(); // category IDs
            $table->json('languages')->nullable();
            $table->json('instructor_genders')->nullable(); // ['male','female']

            // 4. Horaires
            $table->json('opening_hours')->nullable(); // { monday: {open,close,closed}, ... }

            // 5. Présence en ligne
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('tiktok_url')->nullable();
            $table->string('website_url')->nullable();
            $table->string('google_maps_url')->nullable();

            // 6. Chiffres clés
            $table->unsignedSmallInteger('years_experience')->nullable();
            $table->unsignedInteger('total_students')->nullable();
            $table->unsignedInteger('avg_students_per_month')->nullable();
            $table->unsignedTinyInteger('success_rate')->nullable(); // percentage 0-100
            $table->unsignedSmallInteger('staff_count')->nullable();
            $table->unsignedSmallInteger('vehicles_count')->nullable();

            // 8. Services spéciaux
            $table->json('special_services')->nullable();
            $table->string('special_services_other')->nullable();

            // Moderation
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('created_auto_school_id')->nullable()->constrained('auto_schools')->nullOnDelete();
            $table->foreignId('created_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('ip_address', 45)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('email');
            $table->index('city');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_applications');
    }
};

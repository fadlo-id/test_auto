<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_prospect_tags', function (Blueprint $table) {
            $table->foreignId('prospect_id')->constrained('crm_prospects')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('crm_tags')->cascadeOnDelete();
            $table->primary(['prospect_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_prospect_tags');
    }
};

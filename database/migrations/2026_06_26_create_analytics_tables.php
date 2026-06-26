<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Track individual view events
        Schema::create('view_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->string('referrer_url')->nullable();
            $table->string('device_type')->default('desktop'); // desktop, mobile, tablet
            $table->string('browser')->nullable();
            $table->string('operating_system')->nullable();
            $table->timestamps();
            $table->index(['auto_school_id', 'created_at']);
            $table->index('user_id');
        });

        // Track click events by type
        Schema::create('click_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('click_type', ['phone', 'whatsapp', 'website', 'facebook', 'instagram', 'email', 'maps']);
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->string('device_type')->default('desktop');
            $table->string('browser')->nullable();
            $table->text('details')->nullable(); // JSON extra data
            $table->timestamps();
            $table->index(['auto_school_id', 'click_type', 'created_at']);
            $table->index(['auto_school_id', 'created_at']);
        });

        // Track lead/contact form submissions
        Schema::create('lead_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('visitor_name');
            $table->string('visitor_email');
            $table->string('visitor_phone');
            $table->text('visitor_message')->nullable();
            $table->string('referrer_url')->nullable();
            $table->string('ip_address', 45);
            $table->string('device_type')->default('desktop');
            $table->enum('status', ['new', 'contacted', 'converted', 'archived'])->default('new');
            $table->timestamps();
            $table->index(['auto_school_id', 'status', 'created_at']);
            $table->index(['auto_school_id', 'created_at']);
        });

        // Daily aggregated analytics statistics
        Schema::create('analytics_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->onDelete('cascade');
            $table->date('date');
            
            // View metrics
            $table->integer('total_views')->default(0);
            $table->integer('unique_visitors')->default(0);
            $table->integer('returning_visitors')->default(0);
            
            // Click metrics
            $table->integer('phone_clicks')->default(0);
            $table->integer('whatsapp_clicks')->default(0);
            $table->integer('website_clicks')->default(0);
            $table->integer('facebook_clicks')->default(0);
            $table->integer('instagram_clicks')->default(0);
            $table->integer('email_clicks')->default(0);
            $table->integer('maps_clicks')->default(0);
            $table->integer('total_clicks')->default(0);
            
            // Lead metrics
            $table->integer('new_leads')->default(0);
            $table->integer('converted_leads')->default(0);
            
            // Device breakdown
            $table->integer('desktop_views')->default(0);
            $table->integer('mobile_views')->default(0);
            $table->integer('tablet_views')->default(0);
            
            // Traffic sources
            $table->integer('direct_traffic')->default(0);
            $table->integer('organic_traffic')->default(0);
            $table->integer('referral_traffic')->default(0);
            $table->integer('paid_traffic')->default(0);
            
            $table->timestamps();
            $table->unique(['auto_school_id', 'date']);
            $table->index(['auto_school_id', 'date']);
        });

        // Monthly aggregated statistics
        Schema::create('analytics_monthly_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->onDelete('cascade');
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            
            // View metrics
            $table->integer('total_views')->default(0);
            $table->integer('unique_visitors')->default(0);
            
            // Click metrics
            $table->integer('phone_clicks')->default(0);
            $table->integer('whatsapp_clicks')->default(0);
            $table->integer('website_clicks')->default(0);
            $table->integer('facebook_clicks')->default(0);
            $table->integer('instagram_clicks')->default(0);
            $table->integer('email_clicks')->default(0);
            $table->integer('maps_clicks')->default(0);
            $table->integer('total_clicks')->default(0);
            
            // Lead metrics
            $table->integer('new_leads')->default(0);
            $table->integer('converted_leads')->default(0);
            
            // Conversion rates
            $table->decimal('ctr', 5, 2)->default(0); // Click-through rate
            $table->decimal('conversion_rate', 5, 2)->default(0); // Leads / Views
            
            $table->timestamps();
            $table->unique(['auto_school_id', 'year', 'month']);
            $table->index(['auto_school_id', 'year', 'month']);
        });

        // Analytics settings per school
        Schema::create('analytics_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->onDelete('cascade');
            $table->boolean('tracking_enabled')->default(true);
            $table->boolean('collect_device_info')->default(true);
            $table->boolean('collect_referrer')->default(true);
            $table->boolean('collect_browser_info')->default(true);
            $table->integer('data_retention_days')->default(90); // Keep data for 90 days
            $table->boolean('auto_delete_old_data')->default(true);
            $table->timestamps();
            $table->unique('auto_school_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_settings');
        Schema::dropIfExists('analytics_monthly_stats');
        Schema::dropIfExists('analytics_daily_stats');
        Schema::dropIfExists('lead_events');
        Schema::dropIfExists('click_events');
        Schema::dropIfExists('view_events');
    }
};

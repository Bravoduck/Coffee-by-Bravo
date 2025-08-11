<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailCommand extends Command
{
    protected $signature = 'test:email';
    protected $description = 'Sends a test email using the configured mail settings.';

    public function handle()
    {
        try {
            $this->info("Attempting to send a test email to Mailtrap...");
            $this->info("Mailer: " . config('mail.mailer'));
            $this->info("Host: " . config('mail.mailers.smtp.host'));
            $this->info("Port: " . config('mail.mailers.smtp.port'));

            Mail::raw('This is a test email from bravoduck.store.', function ($message) {
                $message->to('test@example.com')
                        ->subject('Test Email from cPanel');
            });

            $this->info("Test email sent successfully! Please check your Mailtrap inbox.");
            return 0;

        } catch (\Exception $e) {
            $this->error("Failed to send email. Error:");
            $this->error($e->getMessage());
            return 1;
        }
    }
}
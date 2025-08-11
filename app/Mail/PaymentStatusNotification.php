<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentStatusNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $status_text;

    public function __construct(Order $order, $status_text)
    {
        $this->order = $order;
        $this->status_text = $status_text;
    }

    public function build()
    {
        return $this->subject('Pembayaran Pesanan Coffee by Bravo')
                    ->view('emails.payment_status_notification');
    }
}

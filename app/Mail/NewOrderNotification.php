<?php

namespace App\Mail;

use App\Models\Order; // Gunakan model Order
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewOrderNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Instance pesanan.
     * @var \App\Models\Order
     */
    public $order;

    /**
     * Buat instance pesan baru.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Dapatkan amplop pesan.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pesanan Baru Diterima #' . $this->order->order_id,
        );
    }

    /**
     * Dapatkan konten pesan.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.notification',
        );
    }

    /**
     * Dapatkan lampiran untuk pesan.
     */
    public function attachments(): array
    {
        return [];
    }
}
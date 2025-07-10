/**
 * @file payment.js
 * Mengelola semua logika untuk halaman pembayaran QRIS.
 * Dikelola oleh objek utama 'PaymentApp'.
 */
document.addEventListener('DOMContentLoaded', () => {

    const PaymentApp = {
        config: {
            WHATSAPP_NUMBER: '6281290493785',
            /**BRAVODUCK**/
            PAYMENT_DURATION_SECONDS: 10 * 60,
            STATIC_QRIS_STRING: '00020101021126570011ID.DANA.WWW011893600915321626938702092162693870303UMI51440014ID.CO.QRIS.WWW0215ID10221466636310303UMI5204481453033605802ID5909BRAVODUCK6014Kab. Tangerang6105155206304778D',
            DEFAULT_OPTIONS: ["Regular Ice", "Normal Sweet", "Normal Ice", "Normal Shot", "Milk"]
        },

        state: {
            total: 0,
            orderSignature: null,
            endTime: null,
        },

        ui: {},

        init() {
            this.bindUIElements();
            if (!this.loadState()) return;

            this.render();
            this.startTimer();
            this.registerHandlers();
        },

        bindUIElements() {
            this.ui = {
                qrCodeContainer: document.getElementById('qrcode-container'),
                paymentTotal: document.getElementById('payment-total'),
                paymentTimer: document.getElementById('payment-timer'),
                downloadButton: document.getElementById('download-qr-btn'),
                confirmPaymentButton: document.getElementById('confirm-payment-btn'),
                confirmationModal: document.getElementById('confirmation-modal'),
                cancelWaButton: document.getElementById('cancel-wa-btn'),
                confirmWaButton: document.getElementById('confirm-wa-btn')
            };
        },

        loadState() {
            this.state.total = sessionStorage.getItem('paymentTotal');
            this.state.orderSignature = this.Helpers.createOrderSignature();

            if (!this.state.total || isNaN(this.state.total) || !this.state.orderSignature) {
                alert('Data pesanan tidak valid atau keranjang kosong. Anda akan diarahkan kembali.');
                window.location.href = 'index.html';
                return false;
            }
            return true;
        },

        render() {
            this.ui.paymentTotal.textContent = this.Helpers.formatCurrency(this.state.total);
            this.QRISGenerator.generate(this.state.total, this.ui.qrCodeContainer);
        },

        startTimer() {
            const savedSession = JSON.parse(localStorage.getItem('paymentSession'));
            if (savedSession && savedSession.orderSignature === this.state.orderSignature) {
                this.state.endTime = savedSession.endTime;
            } else {
                this.state.endTime = Date.now() + this.config.PAYMENT_DURATION_SECONDS * 1000;
                localStorage.setItem('paymentSession', JSON.stringify({
                    endTime: this.state.endTime,
                    orderSignature: this.state.orderSignature
                }));
            }
            this.TimerManager.start(this.state.endTime);
        },

        registerHandlers() {
            this.ui.downloadButton.addEventListener('click', (e) => this.handleDownloadQR(e));
            this.ui.confirmPaymentButton.addEventListener('click', () => {
                this.ui.confirmationModal.style.display = 'block';
            });
            this.ui.cancelWaButton.addEventListener('click', () => {
                this.ui.confirmationModal.style.display = 'none';
            });
            this.ui.confirmWaButton.addEventListener('click', () => {
                localStorage.removeItem('paymentSession');
                this.WhatsAppConfirmation.send();
            });
        },

        handleDownloadQR(event) {
            event.preventDefault();
            const canvas = this.ui.qrCodeContainer.querySelector('canvas');
            if (!canvas) {
                alert('QRIS gagal dimuat.');
                return;
            }

            const timestamp = this.Helpers.getFormattedTimestamp();
            const totalAmount = this.state.total;
            const uniqueFilename = `QRIS_Coffee-by-Bravo_${totalAmount}-${timestamp}.png`;

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = uniqueFilename;
            link.click();
        },

        Helpers: {
            toCRC16(input) {
                let crc = 0xffff;
                for (let i = 0; i < input.length; i++) {
                    crc ^= input.charCodeAt(i) << 8;
                    for (let j = 0; j < 8; j++) {
                        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
                    }
                }
                let hex = (crc & 0xffff).toString(16).toUpperCase();
                return hex.length === 3 ? '0' + hex : hex;
            },
            pad(number) {
                return number < 10 ? '0' + number : String(number);
            },
            getFormattedTimestamp() {
                const now = new Date();
                const year = now.getFullYear();
                const month = this.pad(now.getMonth() + 1); // Bulan dimulai dari 0
                const day = this.pad(now.getDate());
                const hours = this.pad(now.getHours());
                const minutes = this.pad(now.getMinutes());
                const seconds = this.pad(now.getSeconds());
                return `${year}${month}${day}-${hours}${minutes}${seconds}`;
            },
            formatCurrency(amount) {
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(amount);
            },
            createOrderSignature() {
                try {
                    const cart = JSON.parse(localStorage.getItem('cart')) || [];
                    if (cart.length === 0) return null;
                    cart.sort((a, b) => a.name.localeCompare(b.name));
                    return JSON.stringify(cart);
                } catch {
                    return null;
                }
            }
        },

        QRISGenerator: {
            makeQrString(nominal) {
                const config = PaymentApp.config;
                const helpers = PaymentApp.Helpers;
                if (!config.STATIC_QRIS_STRING || !nominal) throw new Error('QRIS string atau nominal tidak boleh kosong');
                const qris = config.STATIC_QRIS_STRING;
                let qrisModified = qris.slice(0, -4).replace('010211', '010212');
                let qrisParts = qrisModified.split('5802ID');
                let amount = '54' + helpers.pad(nominal.toString().length) + nominal;
                amount += '5802ID';
                let output = qrisParts[0].trim() + amount + qrisParts[1].trim();
                output += helpers.toCRC16(output);
                return output;
            },
            generate(nominal, containerElement) {
                try {
                    const qrisDinamis = this.makeQrString(nominal);
                    containerElement.innerHTML = '';
                    QRCode.toCanvas(qrisDinamis, {
                        margin: 1,
                        width: 256
                    }, (err, canvas) => {
                        if (err) throw err;
                        canvas.style.width = '100%';
                        canvas.style.height = 'auto';
                        containerElement.appendChild(canvas);
                    });
                } catch (error) {
                    console.error('QRIS Generation Error:', error);
                    containerElement.innerText = 'Gagal memuat QR Code.';
                }
            }
        },

        WhatsAppConfirmation: {
            buildMessage(cart, store, total) {
                const helpers = PaymentApp.Helpers;
                const config = PaymentApp.config;
                let message = `Halo, saya sudah melakukan pembayaran via QRIS dan ingin mengonfirmasi pesanan berikut:\n\n`;
                message += `*Lokasi Pengambilan:*\n${store}\n\n*Detail Pesanan:*\n---------------------------\n`;
                cart.forEach(item => {
                    const customizations = item.customizations.filter(c => !config.DEFAULT_OPTIONS.includes(c)).join(', ');
                    message += `• ${item.quantity}x *${item.name}*\n`;
                    if (customizations) message += `  (_${customizations}_)\n`;
                });
                message += `---------------------------\n*Total Dibayar: ${helpers.formatCurrency(total)}*\n\nMohon segera diproses. Terima kasih.`;
                return message;
            },
            send() {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const selectedStore = localStorage.getItem('selectedStore') || 'Belum Dipilih';
                const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const message = this.buildMessage(cart, selectedStore, total);
                const whatsappURL = `https://wa.me/${PaymentApp.config.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

                localStorage.removeItem('cart');
                PaymentApp.ui.confirmationModal.style.display = 'none';
                window.open(whatsappURL, '_blank');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }
        },

        TimerManager: {
            intervalId: null,
            endTime: null,
            start(endTime) {
                this.endTime = endTime;
                this.updateDisplay();
                this.intervalId = setInterval(() => this.updateDisplay(), 1000);
            },
            updateDisplay() {
                const timeLeft = Math.round((this.endTime - Date.now()) / 1000);
                if (timeLeft > 0) {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    PaymentApp.ui.paymentTimer.textContent = `Selesaikan pembayaran dalam ${PaymentApp.Helpers.pad(minutes)}:${PaymentApp.Helpers.pad(seconds)}`;
                } else {
                    this.stop();
                    PaymentApp.ui.paymentTimer.textContent = 'Waktu pembayaran habis!';
                    PaymentApp.ui.qrCodeContainer.innerHTML = '<p style="color: red;">Waktu habis, silakan buat pesanan baru.</p>';
                    PaymentApp.ui.confirmPaymentButton.disabled = true;
                    PaymentApp.ui.downloadButton.classList.add('disabled');

                    localStorage.removeItem('paymentSession');

                    setTimeout(() => {
                        localStorage.removeItem('cart');
                        window.location.href = 'index.html';
                    }, 2000);
                }
            },
            stop() {
                clearInterval(this.intervalId);
            }
        }
    };

    PaymentApp.init();
});
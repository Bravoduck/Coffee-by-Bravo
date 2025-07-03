document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------------------------------------------
  // FUNGSI UNTUK GENERATE QRIS DINAMIS
  // -------------------------------------------------------------------
  function toCRC16(input) {
    let crc = 0xffff;
    for (let i = 0; i < input.length; i++) {
      crc ^= input.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    let hex = (crc & 0xffff).toString(16).toUpperCase();
    return hex.length === 3 ? "0" + hex : hex;
  }

  function pad(number) {
    return number < 10 ? "0" + number : number.toString();
  }

  function makeQrString(qris, { nominal } = {}) {
    if (!qris || !nominal) {
      throw new Error("QRIS string atau nominal tidak boleh kosong");
    }
    let qrisModified = qris.slice(0, -4).replace("010211", "010212");
    let qrisParts = qrisModified.split("5802ID");
    let amount = "54" + pad(nominal.toString().length) + nominal;
    amount += "5802ID";
    let output = qrisParts[0].trim() + amount + qrisParts[1].trim();
    output += toCRC16(output);
    return output;
  }

  function generateDynamicQRIS(nominal) {
    // GANTI DENGAN KODE QRIS STATIS DANA ANDA
    const staticQris =
      "00020101021126570011ID.DANA.WWW011893600915321626938702092162693870303UMI51440014ID.CO.QRIS.WWW0215ID10221466636310303UMI5204481453033605802ID5909BRAVODUCK6014Kab. Tangerang6105155206304778D";

    try {
      const qrisDinamis = makeQrString(staticQris, { nominal: nominal });
      const qrcodeElement = document.getElementById("qrcode-container");
      qrcodeElement.innerHTML = "";

      QRCode.toCanvas(
        qrisDinamis,
        { margin: 1, width: 256 },
        function (err, canvas) {
          if (err) throw err;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          qrcodeElement.appendChild(canvas);
        }
      );
    } catch (error) {
      console.error(error);
      document.getElementById("qrcode-container").innerText =
        "Gagal memuat QR Code.";
    }
  }

  // -------------------------------------------------------------
  // LOGIKA HALAMAN PEMBAYARAN
  // -------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const total = params.get("total");

  if (!total || isNaN(total)) {
    alert("Total pembayaran tidak valid. Anda akan diarahkan kembali.");
    window.location.href = "checkout.html";
    return;
  }

  // Tampilkan Total Pembayaran
  const paymentTotalEl = document.getElementById("payment-total");
  paymentTotalEl.textContent = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(total);

  // Generate QRIS
  generateDynamicQRIS(total);

  // Jalankan Timer
  const timerEl = document.getElementById("payment-timer");
  let timeLeft = 15 * 60; // 15 menit
  const timerInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = `Selesaikan pembayaran dalam ${pad(minutes)}:${pad(
      seconds
    )}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerEl.textContent = "Waktu pembayaran habis!";
      document.getElementById("qrcode-container").innerHTML =
        '<p class="text-center" style="color: red;">Waktu habis, silakan buat pesanan baru.</p>';
      document.getElementById("confirm-payment-btn").disabled = true;
      document.getElementById("confirm-payment-btn").style.backgroundColor =
        "#cccccc";
    }
  }, 1000);

  // -------------------------------------------------------------
  // LOGIKA MODAL KONFIRMASI KUSTOM
  // -------------------------------------------------------------
  const confirmButton = document.getElementById("confirm-payment-btn");
  const confirmationModal = document.getElementById("confirmation-modal");
  const cancelWaBtn = document.getElementById("cancel-wa-btn");
  const confirmWaBtn = document.getElementById("confirm-wa-btn");

  // 1. Saat tombol utama "Konfirmasi Pesanan" diklik, TAMPILKAN modal
  confirmButton.addEventListener("click", function () {
    confirmationModal.style.display = "block";
  });

  // 2. Saat tombol "Batal" di dalam modal diklik, SEMBUNYIKAN modal
  cancelWaBtn.addEventListener("click", function () {
    confirmationModal.style.display = "none";
  });

  // 3. Saat tombol "Lanjutkan ke WhatsApp" di dalam modal diklik, jalankan aksi
  confirmWaBtn.addEventListener("click", function () {
    // Ambil data keranjang dan lokasi dari localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const selectedStore =
      localStorage.getItem("selectedStore") || "Belum Dipilih";

    // Nomor WhatsApp Anda
    const yourWhatsAppNumber = "6281290493785";

    // Membuat format pesan
    let message = `Halo, saya sudah melakukan pembayaran via QRIS dan ingin mengonfirmasi pesanan berikut:\n\n`;
    message += `*Lokasi Pengambilan:*\n${selectedStore}\n\n`;
    message += `*Detail Pesanan:*\n`;
    message += `---------------------------\n`;

    let grandTotal = 0;
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      grandTotal += itemTotal;
      const formattedItemTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(itemTotal);

      const defaultOptions = [
        "Regular Ice",
        "Normal Sweet",
        "Normal Ice",
        "Normal Shot",
        "Milk",
      ];
      const customizations = item.customizations
        .filter((c) => !defaultOptions.includes(c))
        .join(", ");

      message += `• ${item.quantity}x *${item.name}*\n`;
      if (customizations) {
        message += `  (_${customizations}_)\n`;
      }
      message += `  Subtotal: ${formattedItemTotal}\n\n`;
    });

    const formattedGrandTotal = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(grandTotal);

    message += `---------------------------\n`;
    message += `*Total Dibayar: ${formattedGrandTotal}*\n\n`;
    message += `Mohon segera diproses. Terima kasih.`;

    // Encode pesan dan buat link WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`;

    // Kosongkan keranjang setelah konfirmasi
    localStorage.removeItem("cart");

    // Sembunyikan modal sebelum beralih halaman
    confirmationModal.style.display = "none";

    // Arahkan pengguna ke WhatsApp, lalu kembali ke halaman utama
    window.open(whatsappURL, "_blank");
    window.location.href = "index.html";
  });
});
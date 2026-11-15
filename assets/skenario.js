/*
 * Sumber tunggal data uji dan skenario Kalis Testbed.
 * Dipakai halaman (panel checklist, indeks, laporan) dan nanti oleh uji otomatis
 * (Playwright dapat membaca globalThis.KALIS_TESTBED).
 *
 * SEMUA DATA DI SINI DUMMY. Jangan pernah memakai password asli di situs ini.
 */
(function () {
  const SITUS_UTAMA = "https://justojanfs.github.io";
  const REPO_RAW = "https://raw.githack.com/justojanfs/kalis-testbed/main/";

  const akun = {
    A: { email: "uji@kalis.test", password: "Uji-Kalis-2026!", catatan: "Akun utama" },
    B: { email: "kedua@kalis.test", password: "Kedua-Kalis-2026!", catatan: "Akun kedua di situs yang sama" },
    C: { email: "dua@kalis.test", password: "Dua-Langkah-2026!", catatan: "Khusus login dua langkah" },
    D: { email: "spa@kalis.test", password: "Spa-Kalis-2026!", catatan: "Khusus login SPA" },
    baru: { email: "baru@kalis.test", password: "Baru-Kalis-2026!", catatan: "Untuk form daftar" },
    polos: { email: "polos@kalis.test", password: "Polos-Kalis-2026!", catatan: "Untuk form daftar tanpa atribut" },
  };

  const passwordGanti = { A: "Ganti-Kalis-2026!", B: "Ganti-Kedua-2026!" };

  const kartu = {
    judul: "Kartu Uji",
    pemilik: "UJI KALIS",
    nomor: "4111 1111 1111 1111",
    bulan: 12,
    tahun: 2030,
    cvv: "123",
    pin: "654321",
  };

  const A = akun.A, B = akun.B, C = akun.C, D = akun.D;

  /** Tiap langkah: apa yang dilakukan, dan hasil yang diharapkan menurut desain Kalis. */
  const skenario = [
    {
      id: "login-dasar",
      kelompok: "Login",
      judul: "Login dasar, beberapa akun, password salah",
      halaman: "login.html",
      tujuan: "Simpan login baru, isi lewat ikon toolbar dan Ctrl+Shift+L, pilih di antara dua akun, dan amati tawaran simpan saat password salah.",
      langkah: [
        { teks: `Pastikan Kalis terbuka. Isi Akun A manual (${A.email} / ${A.password}), klik Masuk.`, harapan: "Halaman 'Masuk berhasil' terbuka, lalu jendela 'Simpan kata sandi?' muncul untuk justojanfs.github.io dengan email Akun A." },
        { teks: "Klik Simpan di jendela itu.", harapan: "Muncul 'Login berhasil disimpan di Kalis', jendela tertutup sendiri, item baru terlihat di aplikasi Kalis." },
        { teks: "Kembali ke halaman login, klik ikon Kalis di toolbar, pilih Akun A.", harapan: "Email dan password terisi. Tabel status kolom menunjukkan keduanya 'terisi'." },
        { teks: "Muat ulang halaman, tekan Ctrl+Shift+L.", harapan: "Popup Kalis terbuka dan menampilkan login untuk situs ini." },
        { teks: `Masuk manual dengan Akun B (${B.email} / ${B.password}), simpan. Kembali, buka popup Kalis.`, harapan: "Popup menampilkan dua login. Memilih Akun B mengisi email Akun B." },
        { teks: "Isi Akun A dengan password salah (mis. Salah-Sekali-1!), klik Masuk.", harapan: "Situs menolak dengan pesan galat. Catat apakah Kalis tetap menawarkan simpan (perilaku saat ini: ditawarkan) dan apakah itu mengganggu." },
        { teks: "Jika tawaran untuk password salah muncul, klik Batal.", harapan: "Jendela tertutup, item Akun A di Kalis tidak berubah." },
        { teks: "Kunci Kalis (menu tray atau tombol Kunci), lalu buka popup ekstensi di halaman ini.", harapan: "Popup meminta Master Password. Setelah dibuka, daftar login langsung tampil." },
      ],
    },
    {
      id: "dua-langkah",
      kelompok: "Login",
      judul: "Login dua langkah (email dulu, lalu password)",
      halaman: "dua-langkah.html",
      tujuan: "Cek pengisian per langkah dan apakah login dua langkah bisa ditangkap untuk disimpan.",
      langkah: [
        { teks: "Di langkah 1 (hanya kolom email), buka popup Kalis, pilih Akun A.", harapan: "Hanya kolom email terisi." },
        { teks: "Klik Lanjut. Di langkah 2, buka popup lagi, pilih Akun A.", harapan: "Kolom password terisi." },
        { teks: "Klik 'Mulai ulang', lalu masuk manual dengan Akun C (" + C.email + " / " + C.password + ") lewat dua langkah.", harapan: "Setelah masuk berhasil, Kalis menawarkan simpan login Akun C (harapan ideal; catat bila tidak muncul)." },
      ],
    },
    {
      id: "spa",
      kelompok: "Login",
      judul: "Login gaya SPA tanpa elemen <form>",
      halaman: "spa.html",
      tujuan: "Situs modern sering tidak memakai <form> dan tidak berpindah halaman. Cek isi dan tangkap login lewat klik tombol maupun tombol Enter.",
      langkah: [
        { teks: "Buka popup Kalis, pilih Akun A.", harapan: "Email dan password terisi walau tanpa <form>." },
        { teks: `Kosongkan kolom, masuk manual dengan Akun D (${D.email} / ${D.password}) dengan menekan Enter di kolom password (jangan klik tombol).`, harapan: "Panel 'Sudah masuk' tampil, lalu Kalis menawarkan simpan Akun D." },
        { teks: "Bila tawaran belum muncul: klik Keluar, lalu masuk lagi dengan Akun D tapi kali ini klik tombol Masuk.", harapan: "Kalis menawarkan simpan Akun D. Simpan." },
      ],
    },
    {
      id: "daftar",
      kelompok: "Daftar & ganti password",
      judul: "Form pendaftaran (dengan autocomplete=\"new-password\")",
      halaman: "daftar.html",
      tujuan: "Form daftar tidak boleh diisi dengan login tersimpan, tetapi akun baru harus ditawarkan untuk disimpan.",
      langkah: [
        { teks: "Buka popup Kalis, pilih Akun A bila daftar login muncul.", harapan: "Tidak ada kolom yang diisi (Kalis memberi tahu tidak ada kolom yang cocok). Kolom password tetap kosong." },
        { teks: `Daftar dengan ${akun.baru.email} / ${akun.baru.password} (konfirmasi sama), klik Daftar.`, harapan: "Halaman berhasil terbuka, Kalis menawarkan simpan login baru untuk " + akun.baru.email + "." },
        { teks: "Kembali, daftar dengan konfirmasi password yang berbeda.", harapan: "Situs menolak. Kalis tidak menawarkan simpan." },
      ],
    },
    {
      id: "daftar-polos",
      kelompok: "Daftar & ganti password",
      judul: "Form pendaftaran tanpa atribut autocomplete",
      halaman: "daftar-polos.html",
      tujuan: "Banyak situs tidak memberi atribut autocomplete. Kalis tetap tidak boleh mengisi login tersimpan ke form pendaftaran.",
      langkah: [
        { teks: "Buka popup Kalis, pilih Akun A.", harapan: "Tidak ada kolom yang diisi, karena ini form pendaftaran." },
        { teks: `Kosongkan, daftar dengan ${akun.polos.email} / ${akun.polos.password} (konfirmasi sama).`, harapan: "Kalis menawarkan simpan login baru untuk " + akun.polos.email + "." },
      ],
    },
    {
      id: "ganti-password",
      kelompok: "Daftar & ganti password",
      judul: "Ganti password, username terlihat",
      halaman: "ganti-password.html",
      tujuan: "Cek alur 'perbarui password' dengan konfirmasi eksplisit.",
      persiapan: "Akun A sudah tersimpan di Kalis (skenario Login dasar).",
      langkah: [
        { teks: "Buka popup Kalis, pilih Akun A.", harapan: "Hanya 'Password saat ini' terisi. Kolom password baru dan konfirmasi tetap kosong." },
        { teks: `Isi password baru ${passwordGanti.A} di dua kolom, klik Simpan password.`, harapan: "Situs menyatakan berhasil. Kalis menawarkan PERBARUI password Akun A dan meminta konfirmasi eksplisit." },
        { teks: "Konfirmasi pembaruan. Buka login.html, isi Akun A lewat Kalis, klik Masuk.", harapan: "Masuk berhasil dengan password baru." },
      ],
    },
    {
      id: "ganti-password-b",
      kelompok: "Daftar & ganti password",
      judul: "Ganti password, username tersembunyi (pola umum)",
      halaman: "ganti-password-b.html",
      tujuan: "Banyak situs (dan panduan Chrome) menaruh username di kolom tersembunyi pada form ganti password. Cek apakah Kalis tetap bisa menawarkan pembaruan.",
      persiapan: "Akun B sudah tersimpan di Kalis.",
      langkah: [
        { teks: `Isi password saat ini Akun B, password baru ${passwordGanti.B} dua kali, klik Simpan password.`, harapan: "Kalis menawarkan perbarui password untuk Akun B (harapan ideal; catat bila tidak muncul)." },
      ],
    },
    {
      id: "jebakan",
      kelompok: "Jebakan & kasus tepi",
      judul: "Kolom jebakan tersembunyi",
      halaman: "jebakan.html",
      tujuan: "Kolom yang tidak terlihat (display:none, visibility:hidden, opacity:0, sr-only 1px, disabled) tidak boleh diisi.",
      langkah: [
        { teks: "Buka popup Kalis, pilih Akun A.", harapan: "Hanya dua kolom asli yang terisi. Semua kolom bertanda 'jebakan' di tabel status tetap kosong." },
      ],
    },
    {
      id: "jebakan-luar-layar",
      kelompok: "Jebakan & kasus tepi",
      judul: "Kolom jebakan di luar layar",
      halaman: "jebakan-luar-layar.html",
      tujuan: "Kolom yang digeser ke luar layar, dipotong clip-path, atau berada di wadah setinggi 0 tidak terlihat oleh pengguna tapi berukuran normal. Kalis tidak boleh mengisinya.",
      langkah: [
        { teks: "Buka popup Kalis, pilih Akun A (semua jebakan aktif).", harapan: "Hanya dua kolom asli yang terisi. Semua kolom jebakan tetap kosong." },
        { teks: "Bila ada jebakan yang terisi: muat ulang, matikan jebakan yang terisi itu di kotak 'Aktifkan jebakan', isi lagi lewat Kalis. Ulangi sampai kolom asli yang terisi. Catat jebakan mana saja yang lolos.", harapan: "Tidak ada jebakan yang terisi pada setiap putaran." },
      ],
    },
    {
      id: "kartu",
      kelompok: "Kartu & iframe",
      judul: "Checkout kartu lengkap (autocomplete cc-*, dropdown, PIN)",
      halaman: "kartu.html",
      tujuan: "Isi kartu lewat klik, PIN tidak pernah keluar, dan form bayar tidak dianggap login.",
      persiapan: "Simpan Kartu Uji di aplikasi Kalis (lihat Data uji di beranda).",
      langkah: [
        { teks: "Buka popup Kalis, tab Kartu, pilih Kartu Uji.", harapan: "Nama, nomor, bulan, tahun, dan CVV terisi. PIN tetap kosong." },
        { teks: `Isi PIN ${kartu.pin} manual, klik Bayar.`, harapan: "Halaman 'Pembayaran berhasil'. Kalis TIDAK menawarkan 'Simpan kata sandi?'." },
      ],
    },
    {
      id: "kartu-polos",
      kelompok: "Kartu & iframe",
      judul: "Checkout kartu tanpa autocomplete, kedaluwarsa satu kolom",
      halaman: "kartu-polos.html",
      tujuan: "Kenali kolom kartu dari nama/placeholder berbahasa Indonesia.",
      langkah: [
        { teks: "Buka popup Kalis, tab Kartu, pilih Kartu Uji.", harapan: "Nomor, nama, kedaluwarsa (12/30), dan CVV terisi." },
      ],
    },
    {
      id: "iframe-sama",
      kelompok: "Kartu & iframe",
      judul: "Kolom kartu di iframe situs yang sama",
      halaman: "iframe-sama.html",
      tujuan: "Bingkai dari situs yang sama boleh diisi tanpa konfirmasi tambahan.",
      langkah: [
        { teks: "Buka popup Kalis, tab Kartu, pilih Kartu Uji.", harapan: "Kolom kartu di dalam bingkai terisi langsung, tanpa tombol konfirmasi." },
      ],
    },
    {
      id: "iframe-lintas",
      kelompok: "Kartu & iframe",
      judul: "Kolom kartu di iframe situs lain (raw.githack.com)",
      halaman: "iframe-lintas.html",
      tujuan: "Bingkai dari situs lain butuh izin dan konfirmasi per situs.",
      langkah: [
        { teks: "Pastikan bingkai pembayaran tampil. Buka popup Kalis, tab Kartu, pilih Kartu Uji.", harapan: "Popup: tidak ada kolom yang cocok di halaman ini, plus tombol 'Periksa bingkai situs lain (raw.githack.com)'." },
        { teks: "Klik tombol itu.", harapan: "Browser meminta izin akses ke raw.githack.com. Setelah diizinkan, muncul tombol 'Isi di bingkai raw.githack.com'." },
        { teks: "Klik 'Isi di bingkai raw.githack.com'.", harapan: "Kolom kartu di bingkai terisi. PIN tetap kosong." },
        { teks: "Muat ulang, isi kartu lewat popup sekali lagi.", harapan: "Kalis tidak mengisi bingkai otomatis; tetap menampilkan tombol konfirmasi per situs." },
      ],
    },
    {
      id: "situs-lain",
      kelompok: "Situs lain",
      judul: "Login tidak bocor ke situs lain + 'Jangan tawarkan'",
      halaman: "situs-lain.html",
      tujuan: "Login justojanfs.github.io tidak boleh ditawarkan di domain lain. Uji juga 'Jangan tawarkan' di domain lain agar situs utama tidak ikut dimatikan.",
      langkah: [
        { teks: "Buka salinan halaman login di raw.githack.com (tautan di halaman ini), buka popup Kalis.", harapan: "Popup: tidak ada login tersimpan untuk raw.githack.com. Akun A tidak ditawarkan." },
        { teks: "Di salinan itu, masuk manual dengan Akun A.", harapan: "Kalis menawarkan simpan sebagai login BARU untuk raw.githack.com (situs berbeda)." },
        { teks: "Klik 'Jangan tawarkan untuk situs ini'.", harapan: "Jendela tertutup, tidak ada yang disimpan." },
        { teks: "Masuk lagi dengan Akun A di salinan itu.", harapan: "Tidak ada tawaran simpan." },
        { teks: "Buka popup Kalis di salinan itu, klik 'Aktifkan lagi'.", harapan: "Pemberitahuan tawaran dimatikan tampil, lalu hilang setelah diklik." },
      ],
    },
    {
      id: "aplikasi",
      kelompok: "Aplikasi",
      judul: "Tray, satu salinan, jeda password salah, kunci otomatis",
      halaman: "aplikasi.html",
      tujuan: "Sisa uji M4 yang ada di sisi aplikasi desktop.",
      langkah: [
        { teks: "Tutup jendela Kalis dengan tombol X.", harapan: "Kalis tetap berjalan di tray. Popup ekstensi masih bisa mengisi login." },
        { teks: "Klik kanan ikon tray, coba Buka, Kunci, lalu Keluar.", harapan: "Ketiganya berfungsi. Setelah Keluar, popup ekstensi memberi tahu aplikasi belum berjalan." },
        { teks: "Jalankan Kalis, lalu jalankan lagi dari menu Start saat masih berjalan.", harapan: "Tidak muncul salinan kedua; jendela yang ada tampil ke depan." },
        { teks: "Kunci Kalis, ketik Master Password salah 3 kali atau lebih.", harapan: "Setelah percobaan ke-3 ada jeda bertahap (maks. 60 detik) dengan pesan sisa waktu. Berlaku juga lewat popup ekstensi." },
        { teks: "Buka Kalis, biarkan tanpa aktivitas 5 menit.", harapan: "Vault terkunci otomatis; popup ekstensi meminta Master Password." },
      ],
    },
  ];

  globalThis.KALIS_TESTBED = { SITUS_UTAMA, REPO_RAW, akun, passwordGanti, kartu, skenario };
})();

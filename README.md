# Kalis Testbed

Situs dummy untuk menguji [Kalis](https://github.com/justojanfs/kalis) (aplikasi + ekstensi Chrome/Edge).
Situs statis murni, tanpa server dan tanpa build: GitHub Pages menyajikan berkas apa adanya.

**Alamat:** https://justojanfs.github.io/kalis-testbed/

> Hanya data dummy. Repo dan situs ini publik. Jangan pernah memakai password atau kartu asli di sini.

## Isi

| Halaman | Yang diuji |
|---|---|
| `login.html` | Simpan login baru, isi lewat ikon/Ctrl+Shift+L, dua akun, password salah, popup saat terkunci |
| `dua-langkah.html` | Isi per langkah, tangkap login dua langkah (username di kolom tersembunyi) |
| `spa.html` | Login tanpa `<form>`, lewat klik tombol dan tombol Enter |
| `daftar.html` / `daftar-polos.html` | Form daftar tidak diisi; akun baru ditawarkan disimpan (dengan dan tanpa `autocomplete`) |
| `ganti-password.html` / `ganti-password-b.html` | Alur perbarui password (username terlihat / tersembunyi) |
| `riwayat.html` | Riwayat penggantian password (v0.8.0): tercatat dari ekstensi dan editor, maks. 5, lihat/salin, kembalikan, hapus |
| `jebakan.html` | Kolom tersembunyi lewat CSS (display, visibility, opacity, sr-only, disabled) |
| `jebakan-luar-layar.html` | Kolom tersembunyi secara geometri (luar layar, clip-path, wadah tinggi 0), dengan sakelar per jebakan |
| `kartu.html` / `kartu-polos.html` | Isi kartu (autocomplete cc-* + dropdown / nama Indonesia + satu kolom BB/TT), PIN tidak diisi, form bayar tidak dianggap login |
| `iframe-sama.html` / `iframe-lintas.html` | Kartu di bingkai situs sama (langsung) dan situs lain (izin + konfirmasi) |
| `situs-lain.html` | Login tidak ditawarkan di domain lain; "Jangan tawarkan" / "Aktifkan lagi" |
| `kunci.html` | Kunci seketika (v0.8.0): tutup jendela ke tray, Win+L, sleep |
| `aplikasi.html` | Checklist tray, satu salinan, jeda password salah, kunci otomatis |

Domain kedua untuk uji lintas situs adalah `raw.githack.com`, yang menyajikan berkas repo ini dari domain lain
(`https://raw.githack.com/justojanfs/kalis-testbed/main/...`). Repo harus publik agar ini berjalan.

## Cara kerja

- `assets/skenario.js` adalah sumber tunggal data uji dan skenario (langkah + hasil yang diharapkan),
  diekspos sebagai `globalThis.KALIS_TESTBED`.
- `assets/uji.js`: "server" tiruan di `localStorage`, panel checklist, tabel status kolom, laporan.
- Hasil uji tersimpan di `localStorage` browser yang dipakai. Beranda punya tombol **Salin laporan** (Markdown).
- Panel checklist sengaja memakai radio, bukan `<button>`: content script Kalis menangkap login saat tombol diklik,
  jadi tombol di panel akan memicu tawaran simpan palsu.

## Untuk uji otomatis nanti

- Setiap kolom punya `data-testid`; kolom yang dipantau punya `data-cek` (label), `data-harapan`
  (`isi` | `kosong` | `manual` | `bukan-kalis`), dan `data-jebakan` untuk kolom jebakan.
  Uji Playwright cukup memanggil isi Kalis lalu memeriksa `data-harapan` terhadap nilai kolom.
- Skenario dibaca dari `KALIS_TESTBED.skenario`.

## Menjalankan lokal

```
python3 -m http.server 8000
```

lalu buka `http://localhost:8000/`. Ekstensi Kalis juga aktif di `http://localhost`, tetapi uji lintas situs tetap memuat bingkai dari raw.githack.com.

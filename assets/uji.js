/*
 * Pembantu bersama: "server" tiruan, panel checklist, tabel status kolom, laporan.
 *
 * Aturan penting supaya situs uji tidak mengganggu ekstensi Kalis:
 * - Panel checklist memakai radio + textarea, BUKAN <button>. Content script Kalis menangkap
 *   login saat tombol diklik; tombol di panel akan memicu tawaran simpan palsu.
 * - Tabel status tidak berisi <input>, jadi tidak ikut terbaca sebagai kolom form.
 */
(function () {
  const T = globalThis.KALIS_TESTBED;
  const KUNCI_HASIL = "kalis-testbed:hasil";
  const KUNCI_AKUN = "kalis-testbed:akun";

  const host = location.hostname;
  const diUtama = host === "justojanfs.github.io" || host === "localhost" || host === "127.0.0.1";

  function baca(kunci, awal) {
    try {
      const v = JSON.parse(localStorage.getItem(kunci) || "null");
      return v ?? awal;
    } catch {
      return awal;
    }
  }
  function tulis(kunci, v) {
    try {
      localStorage.setItem(kunci, JSON.stringify(v));
    } catch {
      /* mode privat: abaikan */
    }
  }

  // ---------- "Server" tiruan (hanya di browser ini) ----------
  function akunAwal() {
    const out = {};
    for (const k of ["A", "B", "C", "D"]) out[T.akun[k].email] = T.akun[k].password;
    return out;
  }
  const server = {
    daftarAkun() {
      return baca(KUNCI_AKUN, akunAwal());
    },
    masuk(email, password) {
      const db = server.daftarAkun();
      return db[(email || "").trim().toLowerCase()] === password;
    },
    ada(email) {
      return (email || "").trim().toLowerCase() in server.daftarAkun();
    },
    daftar(email, password) {
      const db = server.daftarAkun();
      db[email.trim().toLowerCase()] = password;
      tulis(KUNCI_AKUN, db);
    },
    ganti(email, lama, baru) {
      const db = server.daftarAkun();
      const e = email.trim().toLowerCase();
      if (db[e] !== lama) return false;
      db[e] = baru;
      tulis(KUNCI_AKUN, db);
      return true;
    },
    reset() {
      localStorage.removeItem(KUNCI_AKUN);
    },
  };

  /** Pindah ke halaman sukses (navigasi sungguhan, seperti situs asli setelah login). */
  function berhasil(jenis, email) {
    const q = new URLSearchParams({ dari: jenis, kembali: location.pathname.split("/").pop() || "index.html" });
    if (email) q.set("email", email);
    location.href = "berhasil.html?" + q.toString();
  }

  // ---------- Kerangka halaman ----------
  function el(tag, attrs, ...anak) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v);
    }
    for (const a of anak) if (a != null) e.append(a);
    return e;
  }

  function kepala() {
    const bar = el(
      "header",
      { class: "bar" },
      el("a", { href: "index.html", class: "merek" }, el("span", { class: "titik" }), "Kalis Testbed"),
      el("span", { class: "host", text: location.host }),
    );
    document.body.prepend(bar);
    if (!diUtama && window.top === window) {
      bar.after(
        el(
          "div",
          { class: "situs-lain" },
          `Anda berada di ${location.host}, salinan di situs LAIN. Catat hasil uji di halaman "Situs lain" pada situs utama.`,
        ),
      );
    }
  }

  // ---------- Panel checklist ----------
  function hasilSemua() {
    return baca(KUNCI_HASIL, {});
  }
  function simpanHasil(id, fn) {
    const all = hasilSemua();
    const h = all[id] || { langkah: {}, catatan: {} };
    fn(h);
    h.diubah = new Date().toISOString();
    all[id] = h;
    tulis(KUNCI_HASIL, all);
  }

  function panel(id, wadah) {
    const s = T.skenario.find((x) => x.id === id);
    if (!s || !wadah) return;
    if (!diUtama) {
      wadah.remove();
      return;
    }
    const h = hasilSemua()[id] || { langkah: {}, catatan: {} };
    const kotak = el("section", { class: "panel", "aria-label": "Checklist uji" });
    kotak.append(el("p", { class: "kelompok", text: s.kelompok }), el("h2", { text: "Checklist uji" }), el("p", { class: "tujuan", text: s.tujuan }));
    if (s.persiapan) kotak.append(el("p", { class: "persiapan" }, el("strong", { text: "Persiapan: " }), s.persiapan));
    const ol = el("ol", { class: "langkah" });
    s.langkah.forEach((l, i) => {
      const nama = `${id}-${i}`;
      const pilih = el("div", { class: "pilih", role: "radiogroup", "aria-label": "Hasil langkah " + (i + 1) });
      for (const [nilai, label] of [
        ["lulus", "Lulus"],
        ["gagal", "Gagal"],
        ["lewati", "Lewati"],
      ]) {
        const r = el("input", { type: "radio", name: nama, value: nilai, id: `${nama}-${nilai}`, "data-testid": `hasil-${nama}-${nilai}` });
        if (h.langkah[i] === nilai) r.checked = true;
        r.addEventListener("change", () => {
          simpanHasil(id, (x) => (x.langkah[i] = nilai));
          li.dataset.hasil = nilai;
        });
        pilih.append(r, el("label", { for: `${nama}-${nilai}`, class: nilai, text: label }));
      }
      const cat = el("textarea", { rows: "1", placeholder: "Catatan (opsional)", "aria-label": "Catatan langkah " + (i + 1) });
      cat.value = h.catatan[i] || "";
      cat.addEventListener("change", () => simpanHasil(id, (x) => (x.catatan[i] = cat.value.trim())));
      const li = el(
        "li",
        {},
        el("p", { class: "teks", text: l.teks }),
        el("p", { class: "harapan" }, el("strong", { text: "Harapan: " }), l.harapan),
        pilih,
        cat,
      );
      if (h.langkah[i]) li.dataset.hasil = h.langkah[i];
      ol.append(li);
    });
    kotak.append(ol);
    wadah.replaceWith(kotak);
  }

  // ---------- Tabel status kolom ----------
  function samar(v, jenis) {
    if (!v) return "";
    if (jenis === "password") return "•".repeat(Math.min(v.length, 12)) + ` (${v.length})`;
    if (jenis === "kartu") return "•••• " + v.replace(/\D/g, "").slice(-4);
    return v;
  }
  function statusKolom(wadah, akar) {
    if (!wadah) return;
    akar = akar || document;
    const kolom = Array.from(akar.querySelectorAll("[data-cek]"));
    const tabel = el("table", { class: "status" });
    tabel.append(el("thead", {}, el("tr", {}, el("th", { text: "Kolom" }), el("th", { text: "Harapan setelah isi Kalis" }), el("th", { text: "Isi sekarang" }))));
    const tb = el("tbody");
    const baris = kolom.map((k) => {
      const isi = el("td", { class: "isi" });
      const harapan = k.dataset.harapan || "isi";
      const tr = el(
        "tr",
        { class: k.dataset.jebakan != null ? "jebakan" : "" },
        el("td", {}, k.dataset.cek, k.dataset.jebakan != null ? el("span", { class: "label-jebakan", text: "jebakan" }) : null),
        el("td", { text: { kosong: "tetap kosong", manual: "diisi manual", "bukan-kalis": "tidak diisi Kalis (isi manual)" }[harapan] || "terisi" }),
        isi,
      );
      tb.append(tr);
      return { k, tr, isi, harapan };
    });
    tabel.append(tb);
    wadah.replaceChildren(el("h3", { text: "Status kolom" }), tabel);

    function segarkan() {
      for (const b of baris) {
        const v = b.k.value || "";
        b.isi.textContent = v ? samar(v, b.k.dataset.jenis) : "kosong";
        b.tr.dataset.terisi = v ? "ya" : "tidak";
        let nilai = "";
        if (b.harapan === "kosong") nilai = v ? "salah" : "";
        b.tr.dataset.nilai = nilai;
      }
    }
    akar.addEventListener("input", segarkan, true);
    akar.addEventListener("change", segarkan, true);
    setInterval(segarkan, 400);
    segarkan();
  }

  // ---------- Laporan ----------
  function laporan() {
    const all = hasilSemua();
    const baris = [`# Laporan uji Kalis Testbed`, ``, `Dibuat: ${new Date().toLocaleString("id-ID")}`, `Browser: ${navigator.userAgent}`, ``];
    for (const s of T.skenario) {
      const h = all[s.id];
      baris.push(`## ${s.judul} (${s.halaman})`);
      s.langkah.forEach((l, i) => {
        const r = h?.langkah?.[i] || "belum";
        const c = h?.catatan?.[i];
        baris.push(`- [${r.toUpperCase()}] ${i + 1}. ${l.teks}${c ? `\n  - Catatan: ${c}` : ""}`);
      });
      baris.push("");
    }
    return baris.join("\n");
  }

  function ringkas(id) {
    const s = T.skenario.find((x) => x.id === id);
    const h = hasilSemua()[id];
    const n = s.langkah.length;
    let lulus = 0,
      gagal = 0,
      lewati = 0;
    for (let i = 0; i < n; i++) {
      const r = h?.langkah?.[i];
      if (r === "lulus") lulus++;
      else if (r === "gagal") gagal++;
      else if (r === "lewati") lewati++;
    }
    return { n, lulus, gagal, lewati, selesai: lulus + gagal + lewati };
  }

  function hapusHasil() {
    localStorage.removeItem(KUNCI_HASIL);
  }

  globalThis.Uji = { server, berhasil, kepala, panel, statusKolom, laporan, ringkas, hapusHasil, diUtama, el };

  document.addEventListener("DOMContentLoaded", () => {
    if (window.top === window) kepala();
    const p = document.querySelector("[data-panel]");
    if (p) panel(p.getAttribute("data-panel"), p);
    const s = document.querySelector("[data-status]");
    if (s) statusKolom(s);
  });
})();

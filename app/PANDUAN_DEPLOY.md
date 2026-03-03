# 📘 PANDUAN DEPLOYMENT (Untuk Non-Developer)

Panduan lengkap untuk menjalankan aplikasi Smart School Billing & BOS Manager di Vercel secara GRATIS.

---

## 🎯 Ringkasan

Aplikasi ini terdiri dari 2 bagian:
1. **Database** → Supabase (Gratis)
2. **Website** → Vercel (Gratis)

**Total Biaya: Rp 0** ✅

---

## 📋 Persiapan

Sebelum mulai, siapkan:
- ✅ Akun Gmail (untuk login)
- ✅ Akun GitHub (untuk menyimpan kode)
- ✅ Koneksi internet stabil
- ⏱️ Waktu: ~30 menit

---

## 🗂️ Langkah 1: Setup Database (Supabase)

### 1.1 Buat Akun Supabase

1. Buka browser, kunjungi: **https://supabase.com**
2. Klik tombol **"Start your project"**
3. Pilih **"Continue with GitHub"**
4. Login dengan akun GitHub Anda
5. Isi data yang diminta (nama, organisasi, dll)
6. Klik **"Create organization"**

### 1.2 Buat Project Baru

1. Di dashboard Supabase, klik **"New Project"**
2. Pilih organization yang baru dibuat
3. Isi form:
   - **Name**: `smart-school-billing`
   - **Database Password**: Buat password kuat (simpan!)
   - **Region**: Pilih `Southeast Asia (Singapore)`
4. Klik **"Create new project"**
5. Tunggu ~2 menit sampai project selesai dibuat

### 1.3 Jalankan Schema Database

1. Di sidebar kiri, klik **"SQL Editor"**
2. Klik tombol **"New query"**
3. Buka file `database/schema.sql` dari folder project ini
4. Copy SELURUH isi file tersebut
5. Paste ke SQL Editor di Supabase
6. Klik tombol **"Run"** (ikon play ▶️)
7. Tunggu sampai muncul pesan "Success"

### 1.4 Ambil Kode Koneksi (PENTING!)

1. Di sidebar kiri, klik **"Project Settings"** (ikon gear ⚙️)
2. Pilih tab **"API"**
3. Copy 2 informasi ini:
   - **URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIs...`
4. Simpan di Notepad/Word untuk sementara

✅ **Database sudah siap!**

---

## 🚀 Langkah 2: Deploy Website (Vercel)

### 2.1 Upload Kode ke GitHub

1. Buka **https://github.com**
2. Login dengan akun GitHub Anda
3. Klik tombol **"+"** di kanan atas → **"New repository"**
4. Isi:
   - **Repository name**: `smart-school-billing`
   - **Public** (dipilih)
5. Klik **"Create repository"**

6. Upload file project:
   - Di halaman repository baru, klik **"uploading an existing file"**
   - Drag & drop SEMUA file dari folder project ini
   - Klik **"Commit changes"**

### 2.2 Buat Akun Vercel

1. Buka **https://vercel.com**
2. Klik **"Sign Up"**
3. Pilih **"Continue with GitHub"**
4. Izinkan akses ke repository

### 2.3 Deploy Project

1. Di dashboard Vercel, klik **"Add New Project"**
2. Pilih repository `smart-school-billing`
3. Klik **"Import"**
4. Konfigurasi:
   - **Framework Preset**: Pilih `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **"Deploy"**
6. Tunggu ~2 menit sampai deploy selesai

### 2.4 Tambahkan Environment Variables

1. Setelah deploy selesai, klik **"Continue to Dashboard"**
2. Di tab atas, klik **"Settings"**
3. Di sidebar kiri, klik **"Environment Variables"**
4. Tambahkan 2 variabel:

   **Variabel 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Paste URL dari Supabase (Langkah 1.4)

   **Variabel 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Paste anon key dari Supabase (Langkah 1.4)

5. Klik **"Save"**
6. Klik tab **"Deployments"**
7. Klik titik 3 (⋯) di deploy terbaru → **"Redeploy"**

✅ **Website sudah live!**

---

## 🔗 Langkah 3: Akses Aplikasi

1. Di dashboard Vercel, lihat bagian **"Domains"**
2. URL aplikasi Anda: `https://smart-school-billing.vercel.app`
3. Klik URL tersebut untuk membuka aplikasi
4. Simpan URL ini untuk akses selanjutnya

---

## 🧪 Langkah 4: Verifikasi (Test)

### Test 1: Input Pembayaran
1. Buka aplikasi
2. Klik menu **"Pembayaran"**
3. Coba cari siswa dengan NISN: `0012345678`
4. Pilih tagihan
5. Klik **"Proses Pembayaran"**
6. ✅ Berhasil jika muncul notifikasi sukses

### Test 2: Cek Platform Fee
1. Klik menu **"Platform Fee"**
2. Lihat tabel tunggakan
3. ✅ Fee 2.5% sudah terhitung otomatis

### Test 3: Input BOS
1. Klik menu **"Dana BOS"**
2. Coba input pengeluaran Honor Guru > 50%
3. ✅ Sistem akan menolak dengan pesan error

---

## 🔧 Troubleshooting (Masalah Umum)

### ❌ "Failed to connect to Supabase"
**Solusi:**
- Cek Environment Variables di Vercel sudah benar
- Pastikan tidak ada spasi di awal/akhir value
- Redeploy ulang

### ❌ "Table not found"
**Solusi:**
- Kembali ke Supabase SQL Editor
- Jalankan ulang schema.sql
- Pastikan tidak ada error saat run SQL

### ❌ Build Failed
**Solusi:**
- Di Vercel, klik **"View Build Logs"**
- Cari pesan error (biasanya merah)
- Copy error dan search di Google

### ❌ Halaman Blank/Putih
**Solusi:**
- Buka browser console (F12 → Console)
- Cek pesan error merah
- Biasanya karena environment variables belum ter-set

---

## 📱 Langkah 5: Setup Domain Sendiri (Opsional)

Jika ingin menggunakan domain sendiri (contoh: `billing.sekolahsaya.sch.id`):

1. Beli domain di **https://niagahoster.co.id** atau **https://domainesia.com**
2. Di Vercel, buka Project Settings → Domains
3. Klik **"Edit"**
4. Masukkan domain Anda
5. Ikuti instruksi DNS yang diberikan
6. Tunggu ~24 jam untuk propagasi DNS

---

## 💰 Biaya Platform Fee (Untuk Pemilik Platform)

Sebagai pemilik platform, Anda akan menerima:

| Transaksi Sekolah | Fee 2.5% | Setelah Cap |
|-------------------|----------|-------------|
| Rp 10.000.000     | Rp 250.000 | Rp 250.000 |
| Rp 50.000.000     | Rp 1.250.000 | Rp 750.000 |
| Rp 100.000.000    | Rp 2.500.000 | Rp 750.000 |

**Contoh perhitungan bulanan:**
- 10 sekolah × 50 transaksi × Rp 500.000 = Rp 250.000.000
- Platform fee: Rp 250.000.000 × 2.5% = **Rp 6.250.000**

---

## 🔐 Keamanan

### Yang Sudah Dilakukan:
- ✅ Row Level Security (RLS) aktif
- ✅ Data terenkripsi di Supabase
- ✅ HTTPS otomatis di Vercel
- ✅ Environment variables tersembunyi

### Rekomendasi:
- 🔒 Ganti password Supabase secara berkala
- 🔒 Jangan share anon key ke siapapun
- 🔒 Enable 2FA di GitHub dan Vercel

---

## 📞 Butuh Bantuan?

Jika mengalami kendala:

1. **Cek dokumentasi:**
   - Supabase: https://supabase.com/docs
   - Vercel: https://vercel.com/docs

2. **Search error di Google:**
   - Copy pesan error
   - Paste ke Google
   - Biasanya sudah ada solusi

3. **Tanya komunitas:**
   - Grup Facebook: "Programmer Indonesia"
   - Telegram: "@javascript_indonesia"

---

## ✅ Checklist Deployment

- [ ] Akun Supabase dibuat
- [ ] Project Supabase dibuat
- [ ] Schema SQL dijalankan
- [ ] URL & Anon Key disimpan
- [ ] Repository GitHub dibuat
- [ ] File diupload ke GitHub
- [ ] Akun Vercel dibuat
- [ ] Project diimport ke Vercel
- [ ] Environment variables di-set
- [ ] Deploy berhasil
- [ ] Aplikasi bisa diakses
- [ ] Test input pembayaran berhasil
- [ ] Test platform fee berhasil

---

## 🎉 Selamat!

Aplikasi Smart School Billing & BOS Manager sudah berjalan!

**URL Aplikasi:** `https://[nama-project].vercel.app`

Silakan bagikan URL tersebut ke sekolah-sekolah yang ingin menggunakan platform Anda.

---

**Dibuat dengan ❤️ untuk kemajuan pendidikan Indonesia**

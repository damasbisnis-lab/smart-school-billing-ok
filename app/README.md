# Smart School Billing & BOS Manager

Aplikasi SaaS untuk manajemen pembayaran sekolah dan dana BOS (Bantuan Operasional Sekolah) dengan platform fee otomatis.

## Fitur Utama

### 1. Modul Billing (Siswa)
- ✅ Pendataan siswa (NISN, Nama, Kelas)
- ✅ Pembuatan tagihan SPP/Gedung
- ✅ Input pembayaran tunai dengan perhitungan platform fee otomatis
- ✅ Riwayat transaksi dan status pembayaran

### 2. Modul Dana BOS (Juknis 2026)
- ✅ Pencatatan pengeluaran BOS sesuai kategori Permendikdasmen No. 8/2026
- ✅ Validasi otomatis: Honor Guru (Maks 50%) dan Sarpras (Maks 20%)
- ✅ Export LPJ format Excel/CSV untuk ARKAS
- ✅ Monitoring penggunaan dana real-time

### 3. Platform Fee (SaaS)
- ✅ Perhitungan otomatis 2.5% dari setiap transaksi
- ✅ Capping (batas maksimal): Rp 750.000 per transaksi
- ✅ Tabel tunggakan fee sekolah per bulan
- ✅ Notifikasi dan reminder pembayaran fee

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Export**: XLSX untuk Excel/CSV

## Panduan Deployment ke Vercel (GRATIS)

### Langkah 1: Setup Supabase (Database)

1. **Buat akun Supabase**
   - Kunjungi https://supabase.com
   - Sign up dengan akun GitHub/Google (Gratis)

2. **Buat Project Baru**
   - Klik "New Project"
   - Pilih organization
   - Masukkan nama project: `smart-school-billing`
   - Pilih region: `Southeast Asia (Singapore)`
   - Klik "Create new project"

3. **Jalankan SQL Schema**
   - Tunggu project selesai dibuat
   - Buka SQL Editor (sidebar kiri)
   - Copy isi file `database/schema.sql` dari project ini
   - Paste ke SQL Editor
   - Klik "Run" untuk eksekusi

4. **Ambil Credentials**
   - Buka Project Settings > API
   - Copy `URL` dan `anon public` key
   - Simpan untuk langkah berikutnya

### Langkah 2: Deploy ke Vercel

1. **Buat Akun Vercel**
   - Kunjungi https://vercel.com
   - Sign up dengan akun GitHub (Gratis)

2. **Import Project**
   - Klik "Add New Project"
   - Pilih "Import Git Repository"
   - Connect akun GitHub Anda
   - Pilih repository project ini

3. **Konfigurasi Build**
   - Framework Preset: Pilih `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Klik "Deploy"

4. **Environment Variables**
   - Setelah deploy, buka Project Settings > Environment Variables
   - Tambahkan variabel berikut:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Klik "Save" dan redeploy

5. **Selesai!**
   - Aplikasi akan live di URL: `https://your-project.vercel.app`
   - Setiap push ke GitHub akan otomatis redeploy

### Langkah 3: Konfigurasi Lokal (Opsional)

Jika ingin menjalankan di lokal:

```bash
# Clone repository
git clone <your-repo-url>
cd smart-school-billing

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dengan credentials Supabase Anda

# Jalankan development server
npm run dev
```

## Struktur Project

```
smart-school-billing/
├── database/
│   └── schema.sql          # Schema PostgreSQL
├── src/
│   ├── components/
│   │   ├── bos/            # Komponen BOS
│   │   ├── dashboard/      # Komponen dashboard
│   │   ├── layout/         # Sidebar, Header
│   │   └── siswa/          # Komponen siswa
│   ├── hooks/
│   │   └── useSupabase.ts  # Custom hooks Supabase
│   ├── lib/
│   │   └── supabase.ts     # Konfigurasi Supabase client
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── BOSPage.tsx
│   │   └── PlatformFeePage.tsx
│   ├── types/
│   │   ├── index.ts        # TypeScript types
│   │   └── database.ts     # Supabase database types
│   ├── utils/
│   │   ├── platformFee.ts  # Logika platform fee
│   │   └── bosValidator.ts # Validasi BOS Juknis 2026
│   └── App.tsx
├── .env.example
├── package.json
└── README.md
```

## Logika Bisnis Penting

### 1. Perhitungan Platform Fee

```typescript
// Contoh: Transaksi Rp 100.000.000
const fee = calculatePlatformFee(100000000);
// Result: { fee: 750000, isCapped: true }
// Karena 2.5% = Rp 2.500.000 > cap Rp 750.000

// Contoh: Transaksi Rp 10.000.000
const fee = calculatePlatformFee(10000000);
// Result: { fee: 250000, isCapped: false }
// Karena 2.5% = Rp 250.000 < cap Rp 750.000
```

### 2. Validasi BOS (Juknis 2026)

```typescript
// Honor Guru Non-PNS: Maksimal 50%
validateBOSLimits('honor_guru_non_pns', 60000000, 150000000, 400000000);
// Result: { isValid: false, message: "Melebihi batas 50%" }

// Sarpras: Maksimal 20%
validateBOSLimits('sarpras', 25000000, 50000000, 400000000);
// Result: { isValid: true }
```

## Konfigurasi Platform Fee

File: `src/types/index.ts`

```typescript
export const PLATFORM_FEE_CONFIG = {
  PERCENTAGE: 2.5,        // Persentase fee
  MAX_CAP: 750000,        // Batas maksimal per transaksi
  DECIMALS: 2
};
```

## Database Schema

### Tabel Utama

1. **siswa** - Data siswa
2. **jenis_pembayaran** - Master jenis pembayaran (SPP, Gedung, dll)
3. **tagihan_siswa** - Tagihan per siswa per periode
4. **pembayaran_tunai** - Catatan pembayaran dengan platform fee
5. **tunggakan_fee_sekolah** - Akumulasi fee per bulan
6. **bos_penerimaan** - Penerimaan dana BOS
7. **bos_pengeluaran** - Pengeluaran dana BOS
8. **bos_saldo** - Rekapitulasi saldo BOS

## Troubleshooting

### Error: "Failed to connect to Supabase"
- Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah benar
- Cek koneksi internet
- Pastikan project Supabase sudah aktif

### Error: "Table not found"
- Pastikan schema SQL sudah dijalankan di Supabase
- Cek nama tabel sesuai dengan schema

### Build gagal di Vercel
- Pastikan Node.js version >= 18
- Cek tidak ada error di local dengan `npm run build`
- Pastikan semua dependencies terinstall

## Lisensi

MIT License - Bebas digunakan untuk komersial maupun non-komersial.

## Support

Untuk pertanyaan atau bantuan:
- Email: support@smartschool.id
- WhatsApp: 0812-3456-7890

---

**Dibuat dengan ❤️ untuk pendidikan Indonesia**

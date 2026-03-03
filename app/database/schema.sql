-- =====================================================
-- SMART SCHOOL BILLING & BOS MANAGER - DATABASE SCHEMA
-- Stack: PostgreSQL (Supabase)
-- =====================================================

-- =====================================================
-- 0. CREATE ENUM TYPES (PostgreSQL Syntax)
-- =====================================================

-- Enum untuk status siswa
CREATE TYPE status_siswa AS ENUM ('aktif', 'nonaktif', 'lulus');

-- Enum untuk kategori pembayaran
CREATE TYPE kategori_pembayaran AS ENUM ('spp', 'gedung', 'buku', 'seragam', 'lainnya');

-- Enum untuk periode pembayaran
CREATE TYPE periode_pembayaran AS ENUM ('bulanan', 'tahunan', 'semester', 'sekali');

-- Enum untuk status tagihan
CREATE TYPE status_tagihan AS ENUM ('belum_bayar', 'cicil', 'lunas');

-- Enum untuk status fee
CREATE TYPE status_fee AS ENUM ('belum_dibayar', 'sudah_dibayar');

-- Enum untuk metode pembayaran
CREATE TYPE metode_pembayaran AS ENUM ('tunai', 'transfer', 'qris');

-- Enum untuk kategori BOS
CREATE TYPE kategori_bos AS ENUM (
  'honor_guru_non_pns',
  'honor_karyawan',
  'atk',
  'sarpras',
  'perawatan',
  'transport',
  'listrik',
  'air',
  'internet',
  'kegiatan',
  'lainnya'
);

-- Enum untuk status BOS pengeluaran
CREATE TYPE status_bos_pengeluaran AS ENUM ('draft', 'tervalidasi', 'ditolak');

-- Enum untuk status BOS penerimaan
CREATE TYPE status_bos_penerimaan AS ENUM ('terencana', 'diterima', 'dicairkan');

-- Enum untuk jenjang sekolah
CREATE TYPE jenjang_sekolah AS ENUM ('sd', 'smp', 'sma', 'smk');

-- Enum untuk status berlangganan
CREATE TYPE status_berlangganan AS ENUM ('trial', 'aktif', 'nonaktif');

-- Enum untuk user role
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'bendahara', 'operator');

-- Enum untuk status periode tunggakan
CREATE TYPE status_periode AS ENUM ('terbuka', 'ditutup');

-- Enum untuk sumber dana BOS
CREATE TYPE sumber_dana AS ENUM ('pusat', 'provinsi', 'kabupaten');

-- =====================================================
-- 1. TABEL SEKOLAH (Multi-tenant)
-- =====================================================
CREATE TABLE sekolah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npsn VARCHAR(20) UNIQUE,
    nama_sekolah VARCHAR(255) NOT NULL,
    jenjang jenjang_sekolah NOT NULL,
    alamat TEXT,
    kecamatan VARCHAR(100),
    kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    kepala_sekolah VARCHAR(255),
    bendahara VARCHAR(255),
    telepon VARCHAR(20),
    email VARCHAR(255),
    status_berlangganan status_berlangganan DEFAULT 'trial',
    tanggal_aktif DATE,
    tanggal_berakhir DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE sekolah IS 'Tabel data sekolah untuk multi-tenant SaaS';

-- =====================================================
-- 2. TABEL SISWA
-- =====================================================
CREATE TABLE siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    jurusan VARCHAR(100),
    tahun_ajaran VARCHAR(20) NOT NULL,
    nama_orang_tua VARCHAR(255),
    no_telepon VARCHAR(20),
    alamat TEXT,
    status status_siswa DEFAULT 'aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sekolah_id UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE
);

COMMENT ON TABLE siswa IS 'Tabel master data siswa';
COMMENT ON COLUMN siswa.nisn IS 'Nomor Induk Siswa Nasional - unique identifier';
COMMENT ON COLUMN siswa.kelas IS 'Contoh: X, XI, XII';
COMMENT ON COLUMN siswa.sekolah_id IS 'ID sekolah untuk multi-tenant SaaS';

-- =====================================================
-- 3. TABEL JENIS_PEMBAYARAN (SPP, Gedung, DLL)
-- =====================================================
CREATE TABLE jenis_pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    kategori kategori_pembayaran NOT NULL,
    nominal DECIMAL(15,2) NOT NULL,
    periode periode_pembayaran DEFAULT 'bulanan',
    keterangan TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sekolah_id UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE
);

COMMENT ON TABLE jenis_pembayaran IS 'Master data jenis-jenis pembayaran sekolah';

-- =====================================================
-- 4. TABEL TAGIHAN_SISWA
-- =====================================================
CREATE TABLE tagihan_siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    jenis_pembayaran_id UUID NOT NULL REFERENCES jenis_pembayaran(id),
    periode_tagihan VARCHAR(20) NOT NULL,
    nominal_tagihan DECIMAL(15,2) NOT NULL,
    nominal_dibayar DECIMAL(15,2) DEFAULT 0,
    sisa_tagihan DECIMAL(15,2) NOT NULL,
    status status_tagihan DEFAULT 'belum_bayar',
    jatuh_tempo DATE,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tagihan_siswa IS 'Tagihan per siswa per periode';
COMMENT ON COLUMN tagihan_siswa.periode_tagihan IS 'Contoh: Januari 2026, 2025/2026';

-- =====================================================
-- 5. TABEL PEMBAYARAN_TUNAI (DENGAN PLATFORM FEE)
-- =====================================================
CREATE TABLE pembayaran_tunai (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_transaksi VARCHAR(50) UNIQUE NOT NULL,
    
    -- Data Siswa
    siswa_id UUID NOT NULL REFERENCES siswa(id),
    
    -- Data Pembayaran
    tagihan_ids UUID[] NOT NULL,
    total_nominal DECIMAL(15,2) NOT NULL,
    
    -- Platform Fee (PENTING UNTUK BISNIS SAAS)
    platform_fee_percentage DECIMAL(5,2) DEFAULT 2.5,
    platform_fee_calculated DECIMAL(15,2) NOT NULL,
    platform_fee_capped BOOLEAN DEFAULT FALSE,
    
    -- Status Fee
    status_fee status_fee DEFAULT 'belum_dibayar',
    tanggal_bayar_fee TIMESTAMP WITH TIME ZONE,
    
    -- Data Input
    tanggal_bayar TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dicatat_oleh VARCHAR(255) NOT NULL,
    metode_pembayaran metode_pembayaran DEFAULT 'tunai',
    keterangan TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sekolah_id UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE
);

COMMENT ON TABLE pembayaran_tunai IS 'Catatan setiap pembayaran tunai yang masuk - dengan perhitungan platform fee otomatis';
COMMENT ON COLUMN pembayaran_tunai.platform_fee_calculated IS 'Hasil perhitungan 2.5% dengan CAP Rp750.000';
COMMENT ON COLUMN pembayaran_tunai.platform_fee_capped IS 'TRUE jika fee mencapai batas maksimal Rp750.000';
COMMENT ON COLUMN pembayaran_tunai.status_fee IS 'Status pembayaran fee ke pemilik platform';

-- =====================================================
-- 6. TABEL TUNGGAKAN_FEE_SEKOLAH (RINGKASAN BULANAN)
-- =====================================================
CREATE TABLE tunggakan_fee_sekolah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    periode_bulan VARCHAR(7) NOT NULL, -- Format: 2026-01
    
    -- Ringkasan Transaksi
    total_transaksi INTEGER DEFAULT 0,
    total_nominal_masuk DECIMAL(15,2) DEFAULT 0,
    
    -- Platform Fee
    total_platform_fee DECIMAL(15,2) DEFAULT 0,
    total_fee_dibayar DECIMAL(15,2) DEFAULT 0,
    sisa_fee_belum_dibayar DECIMAL(15,2) DEFAULT 0,
    
    -- Status
    status_periode status_periode DEFAULT 'terbuka',
    tanggal_jatuh_tempo_fee DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(sekolah_id, periode_bulan)
);

COMMENT ON TABLE tunggakan_fee_sekolah IS 'Akumulasi total biaya layanan yang harus dibayar sekolah ke pemilik platform per bulan';
COMMENT ON COLUMN tunggakan_fee_sekolah.sisa_fee_belum_dibayar IS 'Jumlah yang masih harus disetor ke pemilik platform';

-- =====================================================
-- 7. TABEL BOS_PENERIMAAN (Dana BOS Masuk)
-- =====================================================
CREATE TABLE bos_penerimaan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    
    -- Data Penerimaan
    tahun_anggaran VARCHAR(9) NOT NULL, -- 2025/2026
    semester VARCHAR(1) NOT NULL CHECK (semester IN ('1', '2')),
    sumber_dana sumber_dana DEFAULT 'pusat',
    
    -- Nominal
    jumlah_siswa INTEGER NOT NULL,
    nominal_per_siswa DECIMAL(12,2) NOT NULL,
    total_penerimaan DECIMAL(15,2) NOT NULL,
    
    -- Dokumen
    nomor_sk VARCHAR(100),
    tanggal_sk DATE,
    file_sk_url TEXT,
    
    -- Status
    status status_bos_penerimaan DEFAULT 'terencana',
    tanggal_pencairan DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bos_penerimaan IS 'Pencatatan penerimaan dana BOS per semester';

-- =====================================================
-- 8. TABEL BOS_PENGELUARAN (Sesuai Juknis 2026)
-- =====================================================
CREATE TABLE bos_pengeluaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    bos_penerimaan_id UUID REFERENCES bos_penerimaan(id),
    
    -- Kategori Pengeluaran (Sesuai Permendikdasmen No. 8/2026)
    kategori kategori_bos NOT NULL,
    
    -- Detail Pengeluaran
    uraian TEXT NOT NULL,
    nominal DECIMAL(15,2) NOT NULL,
    tanggal_pengeluaran DATE NOT NULL,
    
    -- Validasi Juknis
    persentase_dari_total DECIMAL(5,2),
    melebihi_batas BOOLEAN DEFAULT FALSE,
    catatan_validasi TEXT,
    
    -- Dokumen
    nomor_kwitansi VARCHAR(100),
    file_bukti_url TEXT,
    
    -- Status
    status status_bos_pengeluaran DEFAULT 'draft',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dicatat_oleh VARCHAR(255)
);

COMMENT ON TABLE bos_pengeluaran IS 'Pencatatan pengeluaran BOS sesuai kategori Permendikdasmen No. 8/2026';
COMMENT ON COLUMN bos_pengeluaran.melebihi_batas IS 'TRUE jika melebihi batas kategori (Honor 50%, Sarpras 20%)';

-- =====================================================
-- 9. TABEL BOS_SALDO (Rekapitulasi Real-time)
-- =====================================================
CREATE TABLE bos_saldo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    tahun_anggaran VARCHAR(9) NOT NULL,
    semester VARCHAR(1) NOT NULL CHECK (semester IN ('1', '2')),
    
    -- Saldo
    total_penerimaan DECIMAL(15,2) DEFAULT 0,
    total_pengeluaran DECIMAL(15,2) DEFAULT 0,
    sisa_saldo DECIMAL(15,2) DEFAULT 0,
    
    -- Pemakaian per Kategori (Untuk monitoring batas)
    honor_guru_terpakai DECIMAL(15,2) DEFAULT 0,
    honor_guru_persen DECIMAL(5,2) DEFAULT 0,
    sarpras_terpakai DECIMAL(15,2) DEFAULT 0,
    sarpras_persen DECIMAL(5,2) DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(sekolah_id, tahun_anggaran, semester)
);

COMMENT ON TABLE bos_saldo IS 'Rekapitulasi saldo BOS real-time dengan monitoring batas kategori';

-- =====================================================
-- 10. TABEL USERS (Admin Sekolah)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    sekolah_id UUID REFERENCES sekolah(id) ON DELETE SET NULL,
    role user_role DEFAULT 'operator',
    status BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Tabel user/admin sekolah';

-- =====================================================
-- INDEXES untuk Performance
-- =====================================================
CREATE INDEX idx_siswa_sekolah ON siswa(sekolah_id);
CREATE INDEX idx_siswa_kelas ON siswa(kelas);
CREATE INDEX idx_siswa_status ON siswa(status);

CREATE INDEX idx_pembayaran_sekolah ON pembayaran_tunai(sekolah_id);
CREATE INDEX idx_pembayaran_tanggal ON pembayaran_tunai(tanggal_bayar);
CREATE INDEX idx_pembayaran_status_fee ON pembayaran_tunai(status_fee);

CREATE INDEX idx_tagihan_siswa ON tagihan_siswa(siswa_id);
CREATE INDEX idx_tagihan_status ON tagihan_siswa(status);

CREATE INDEX idx_bos_pengeluaran_sekolah ON bos_pengeluaran(sekolah_id);
CREATE INDEX idx_bos_pengeluaran_kategori ON bos_pengeluaran(kategori);
CREATE INDEX idx_bos_pengeluaran_tanggal ON bos_pengeluaran(tanggal_pengeluaran);

CREATE INDEX idx_tunggakan_periode ON tunggakan_fee_sekolah(sekolah_id, periode_bulan);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers untuk updated_at
CREATE TRIGGER update_siswa_updated_at BEFORE UPDATE ON siswa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tagihan_updated_at BEFORE UPDATE ON tagihan_siswa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tunggakan_updated_at BEFORE UPDATE ON tunggakan_fee_sekolah
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sekolah_updated_at BEFORE UPDATE ON sekolah
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bos_penerimaan_updated_at BEFORE UPDATE ON bos_penerimaan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Hitung Platform Fee Otomatis
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_platform_fee_internal(amount DECIMAL)
RETURNS TABLE(fee DECIMAL, is_capped BOOLEAN) AS $$
DECLARE
    fee_percentage DECIMAL := 0.025; -- 2.5%
    max_cap DECIMAL := 750000; -- Rp750.000
    calculated_fee DECIMAL;
    capped BOOLEAN;
BEGIN
    calculated_fee := amount * fee_percentage;
    
    IF calculated_fee > max_cap THEN
        calculated_fee := max_cap;
        capped := TRUE;
    ELSE
        capped := FALSE;
    END IF;
    
    RETURN QUERY SELECT ROUND(calculated_fee, 2), capped;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Update Tunggakan Fee Setelah Pembayaran
-- =====================================================
CREATE OR REPLACE FUNCTION update_tunggakan_fee_after_payment()
RETURNS TRIGGER AS $$
DECLARE
    current_periode VARCHAR(7);
    existing_record UUID;
BEGIN
    -- Format periode: YYYY-MM
    current_periode := TO_CHAR(NEW.tanggal_bayar, 'YYYY-MM');
    
    -- Cek apakah sudah ada record untuk periode ini
    SELECT id INTO existing_record 
    FROM tunggakan_fee_sekolah 
    WHERE sekolah_id = NEW.sekolah_id 
    AND periode_bulan = current_periode;
    
    IF existing_record IS NULL THEN
        -- Buat record baru
        INSERT INTO tunggakan_fee_sekolah (
            sekolah_id, 
            periode_bulan, 
            total_transaksi, 
            total_nominal_masuk, 
            total_platform_fee, 
            sisa_fee_belum_dibayar
        ) VALUES (
            NEW.sekolah_id,
            current_periode,
            1,
            NEW.total_nominal,
            NEW.platform_fee_calculated,
            NEW.platform_fee_calculated
        );
    ELSE
        -- Update record existing
        UPDATE tunggakan_fee_sekolah SET
            total_transaksi = total_transaksi + 1,
            total_nominal_masuk = total_nominal_masuk + NEW.total_nominal,
            total_platform_fee = total_platform_fee + NEW.platform_fee_calculated,
            sisa_fee_belum_dibayar = sisa_fee_belum_dibayar + NEW.platform_fee_calculated,
            updated_at = NOW()
        WHERE id = existing_record;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk update tunggakan fee
CREATE TRIGGER trg_update_tunggakan_after_payment
    AFTER INSERT ON pembayaran_tunai
    FOR EACH ROW
    EXECUTE FUNCTION update_tunggakan_fee_after_payment();

-- =====================================================
-- FUNCTION: Validasi BOS Limits
-- =====================================================
CREATE OR REPLACE FUNCTION validate_bos_limits(
    p_sekolah_id UUID,
    p_kategori kategori_bos,
    p_nominal DECIMAL,
    p_tahun_anggaran VARCHAR,
    p_semester VARCHAR
)
RETURNS TABLE(is_valid BOOLEAN, message TEXT, current_percentage DECIMAL) AS $$
DECLARE
    total_budget DECIMAL;
    current_usage DECIMAL;
    max_percentage DECIMAL;
    new_total DECIMAL;
    new_percentage DECIMAL;
    limit_message TEXT;
BEGIN
    -- Ambil total budget BOS
    SELECT total_penerimaan INTO total_budget
    FROM bos_saldo
    WHERE sekolah_id = p_sekolah_id 
    AND tahun_anggaran = p_tahun_anggaran 
    AND semester = p_semester;
    
    IF total_budget IS NULL OR total_budget = 0 THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, 'Tidak ada data anggaran BOS untuk periode ini'::TEXT, 0::DECIMAL;
        RETURN;
    END IF;
    
    -- Set batas maksimal berdasarkan kategori
    CASE p_kategori
        WHEN 'honor_guru_non_pns' THEN 
            max_percentage := 50;
            limit_message := 'Honor Guru maksimal 50% dari total BOS';
        WHEN 'sarpras' THEN 
            max_percentage := 20;
            limit_message := 'Sarpras maksimal 20% dari total BOS';
        ELSE 
            max_percentage := 100;
            limit_message := NULL;
    END CASE;
    
    -- Ambil penggunaan saat ini
    SELECT COALESCE(SUM(nominal), 0) INTO current_usage
    FROM bos_pengeluaran
    WHERE sekolah_id = p_sekolah_id
    AND kategori = p_kategori
    AND (SELECT tahun_anggaran FROM bos_penerimaan WHERE id = bos_pengeluaran.bos_penerimaan_id) = p_tahun_anggaran
    AND (SELECT semester FROM bos_penerimaan WHERE id = bos_pengeluaran.bos_penerimaan_id) = p_semester;
    
    -- Hitung persentase baru
    new_total := current_usage + p_nominal;
    new_percentage := (new_total / total_budget) * 100;
    
    -- Validasi
    IF max_percentage < 100 AND new_percentage > max_percentage THEN
        RETURN QUERY SELECT 
            FALSE::BOOLEAN, 
            (limit_message || '. Saat ini: ' || ROUND(current_usage/total_budget*100, 2) || '%, Akan menjadi: ' || ROUND(new_percentage, 2) || '%')::TEXT,
            new_percentage;
    ELSE
        RETURN QUERY SELECT TRUE::BOOLEAN, 'Valid'::TEXT, new_percentage;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran_tunai ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagihan_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE bos_pengeluaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE bos_penerimaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE tunggakan_fee_sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE jenis_pembayaran ENABLE ROW LEVEL SECURITY;

-- Policy: Users hanya bisa lihat data sekolahnya sendiri
CREATE POLICY siswa_sekolah_policy ON siswa
    FOR ALL
    USING (sekolah_id IN (
        SELECT sekolah_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY pembayaran_sekolah_policy ON pembayaran_tunai
    FOR ALL
    USING (sekolah_id IN (
        SELECT sekolah_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY bos_pengeluaran_sekolah_policy ON bos_pengeluaran
    FOR ALL
    USING (sekolah_id IN (
        SELECT sekolah_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY jenis_pembayaran_sekolah_policy ON jenis_pembayaran
    FOR ALL
    USING (sekolah_id IN (
        SELECT sekolah_id FROM users WHERE id = auth.uid()
    ));

-- =====================================================
-- SEED DATA (Contoh)
-- =====================================================

-- Insert contoh sekolah
INSERT INTO sekolah (npsn, nama_sekolah, jenjang, alamat, kecamatan, kabupaten, provinsi, status_berlangganan) VALUES
('20201234', 'SMA Negeri 1 Contoh', 'sma', 'Jl. Pendidikan No. 1', 'Kecamatan Contoh', 'Kabupaten Contoh', 'Jawa Barat', 'trial'),
('20205678', 'SMP Negeri 2 Contoh', 'smp', 'Jl. Pelajar No. 2', 'Kecamatan Contoh', 'Kabupaten Contoh', 'Jawa Barat', 'trial');

-- Insert contoh jenis pembayaran (untuk sekolah pertama)
INSERT INTO jenis_pembayaran (kode, nama, kategori, nominal, periode, sekolah_id) VALUES
('SPP', 'SPP Bulanan', 'spp', 500000, 'bulanan', (SELECT id FROM sekolah WHERE npsn = '20201234')),
('GDG', 'Uang Gedung', 'gedung', 5000000, 'tahunan', (SELECT id FROM sekolah WHERE npsn = '20201234')),
('BUKU', 'Uang Buku', 'buku', 750000, 'semester', (SELECT id FROM sekolah WHERE npsn = '20201234'));

-- Insert contoh user admin
INSERT INTO users (email, nama_lengkap, sekolah_id, role) VALUES
('admin@sma1contoh.sch.id', 'Admin SMA 1', (SELECT id FROM sekolah WHERE npsn = '20201234'), 'admin'),
('bendahara@sma1contoh.sch.id', 'Bendahara SMA 1', (SELECT id FROM sekolah WHERE npsn = '20201234'), 'bendahara');

// =====================================================
// TYPES - SMART SCHOOL BILLING & BOS MANAGER
// =====================================================

// =====================================================
// ENUMS
// =====================================================
export type StatusSiswa = 'aktif' | 'nonaktif' | 'lulus';
export type StatusTagihan = 'belum_bayar' | 'cicil' | 'lunas';
export type StatusFee = 'belum_dibayar' | 'sudah_dibayar';
export type KategoriPembayaran = 'spp' | 'gedung' | 'buku' | 'seragam' | 'lainnya';
export type PeriodePembayaran = 'bulanan' | 'tahunan' | 'semester' | 'sekali';
export type MetodePembayaran = 'tunai' | 'transfer' | 'qris';
export type JenjangSekolah = 'sd' | 'smp' | 'sma' | 'smk';
export type StatusBerlangganan = 'trial' | 'aktif' | 'nonaktif';
export type UserRole = 'superadmin' | 'admin' | 'bendahara' | 'operator';

// Kategori BOS sesuai Juknis 2026
export type KategoriBOS = 
  | 'honor_guru_non_pns'
  | 'honor_karyawan'
  | 'atk'
  | 'sarpras'
  | 'perawatan'
  | 'transport'
  | 'listrik'
  | 'air'
  | 'internet'
  | 'kegiatan'
  | 'lainnya';

export type StatusBOSPengeluaran = 'draft' | 'tervalidasi' | 'ditolak';
export type StatusBOSPenerimaan = 'terencana' | 'diterima' | 'dicairkan';

// =====================================================
// INTERFACES - DATABASE TABLES
// =====================================================

export interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan?: string;
  tahun_ajaran: string;
  nama_orang_tua?: string;
  no_telepon?: string;
  alamat?: string;
  status: StatusSiswa;
  created_at: string;
  updated_at: string;
  sekolah_id: string;
}

export interface JenisPembayaran {
  id: string;
  kode: string;
  nama: string;
  kategori: KategoriPembayaran;
  nominal: number;
  periode: PeriodePembayaran;
  keterangan?: string;
  status: boolean;
  created_at: string;
  sekolah_id: string;
}

export interface TagihanSiswa {
  id: string;
  siswa_id: string;
  jenis_pembayaran_id: string;
  periode_tagihan: string;
  nominal_tagihan: number;
  nominal_dibayar: number;
  sisa_tagihan: number;
  status: StatusTagihan;
  jatuh_tempo?: string;
  keterangan?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  siswa?: Siswa;
  jenis_pembayaran?: JenisPembayaran;
}

export interface PembayaranTunai {
  id: string;
  kode_transaksi: string;
  siswa_id: string;
  tagihan_ids: string[];
  total_nominal: number;
  
  // Platform Fee (PENTING!)
  platform_fee_percentage: number;
  platform_fee_calculated: number;
  platform_fee_capped: boolean;
  
  // Status Fee
  status_fee: StatusFee;
  tanggal_bayar_fee?: string;
  
  // Data Input
  tanggal_bayar: string;
  dicatat_oleh: string;
  metode_pembayaran: MetodePembayaran;
  keterangan?: string;
  
  created_at: string;
  sekolah_id: string;
  
  // Relations
  siswa?: Siswa;
  tagihan?: TagihanSiswa[];
}

export interface TunggakanFeeSekolah {
  id: string;
  sekolah_id: string;
  periode_bulan: string;
  
  // Ringkasan Transaksi
  total_transaksi: number;
  total_nominal_masuk: number;
  
  // Platform Fee
  total_platform_fee: number;
  total_fee_dibayar: number;
  sisa_fee_belum_dibayar: number;
  
  // Status
  status_periode: 'terbuka' | 'ditutup';
  tanggal_jatuh_tempo_fee?: string;
  
  created_at: string;
  updated_at: string;
}

export interface BOSPenerimaan {
  id: string;
  sekolah_id: string;
  tahun_anggaran: string;
  semester: '1' | '2';
  sumber_dana: 'pusat' | 'provinsi' | 'kabupaten';
  
  jumlah_siswa: number;
  nominal_per_siswa: number;
  total_penerimaan: number;
  
  nomor_sk?: string;
  tanggal_sk?: string;
  file_sk_url?: string;
  
  status: StatusBOSPenerimaan;
  tanggal_pencairan?: string;
  
  created_at: string;
  updated_at: string;
}

export interface BOSPengeluaran {
  id: string;
  sekolah_id: string;
  bos_penerimaan_id?: string;
  
  kategori: KategoriBOS;
  uraian: string;
  nominal: number;
  tanggal_pengeluaran: string;
  
  // Validasi Juknis
  persentase_dari_total?: number;
  melebihi_batas: boolean;
  catatan_validasi?: string;
  
  nomor_kwitansi?: string;
  file_bukti_url?: string;
  
  status: StatusBOSPengeluaran;
  
  created_at: string;
  dicatat_oleh?: string;
  
  // Relations
  bos_penerimaan?: BOSPenerimaan;
}

export interface BOSSaldo {
  id: string;
  sekolah_id: string;
  tahun_anggaran: string;
  semester: '1' | '2';
  
  total_penerimaan: number;
  total_pengeluaran: number;
  sisa_saldo: number;
  
  honor_guru_terpakai: number;
  honor_guru_persen: number;
  sarpras_terpakai: number;
  sarpras_persen: number;
  
  updated_at: string;
}

export interface Sekolah {
  id: string;
  npsn?: string;
  nama_sekolah: string;
  jenjang: JenjangSekolah;
  alamat?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  kepala_sekolah?: string;
  bendahara?: string;
  telepon?: string;
  email?: string;
  
  status_berlangganan: StatusBerlangganan;
  tanggal_aktif?: string;
  tanggal_berakhir?: string;
  
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  nama_lengkap: string;
  sekolah_id?: string;
  role: UserRole;
  status: boolean;
  last_login?: string;
  created_at: string;
  
  // Relations
  sekolah?: Sekolah;
}

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

export interface CreatePembayaranTunaiDTO {
  siswa_id: string;
  tagihan_ids: string[];
  total_nominal: number;
  metode_pembayaran: MetodePembayaran;
  keterangan?: string;
  dicatat_oleh: string;
  sekolah_id: string;
}

export interface CreateBOSPengeluaranDTO {
  sekolah_id: string;
  bos_penerimaan_id?: string;
  kategori: KategoriBOS;
  uraian: string;
  nominal: number;
  tanggal_pengeluaran: string;
  nomor_kwitansi?: string;
  dicatat_oleh: string;
}

export interface CreateSiswaDTO {
  nisn: string;
  nama: string;
  kelas: string;
  jurusan?: string;
  tahun_ajaran: string;
  nama_orang_tua?: string;
  no_telepon?: string;
  alamat?: string;
  sekolah_id: string;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface PlatformFeeResult {
  fee: number;
  isCapped: boolean;
  percentage: number;
  originalFee: number;
  capAmount: number;
}

export interface BOSValidationResult {
  isValid: boolean;
  message: string;
  currentPercentage: number;
  maxPercentage?: number;
  remainingBudget?: number;
}

export interface DashboardSummary {
  // Siswa
  totalSiswa: number;
  siswaAktif: number;
  
  // Tagihan
  totalTagihanBulanIni: number;
  totalTerbayarBulanIni: number;
  totalTunggakan: number;
  
  // Platform Fee
  platformFeeBulanIni: number;
  platformFeeBelumDibayar: number;
  totalTransaksiBulanIni: number;
  
  // BOS
  totalBOSDiterima: number;
  totalBOSTerpakai: number;
  sisaBOS: number;
}

export interface MonthlyFeeData {
  periode: string;
  totalTransaksi: number;
  totalNominal: number;
  platformFee: number;
  status: StatusFee;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface FormInputPembayaran {
  siswaId: string;
  tagihanTerpilih: string[];
  totalBayar: number;
  metodePembayaran: MetodePembayaran;
  keterangan: string;
}

export interface FormInputBOSPengeluaran {
  kategori: KategoriBOS;
  uraian: string;
  nominal: number;
  tanggalPengeluaran: string;
  nomorKwitansi: string;
}

// =====================================================
// CONSTANTS
// =====================================================

export const PLATFORM_FEE_CONFIG = {
  PERCENTAGE: 2.5,
  MAX_CAP: 750000,
  DECIMALS: 2
} as const;

export const BOS_LIMITS_2026 = {
  HONOR_GURU: { maxPercentage: 50, label: 'Honor Guru Non-PNS' },
  SARPRAS: { maxPercentage: 20, label: 'Sarana dan Prasarana' },
  ATK: { maxPercentage: 100, label: 'ATK' },
  PERAWATAN: { maxPercentage: 100, label: 'Perawatan' },
  TRANSPORT: { maxPercentage: 100, label: 'Transport' },
  LISTRIK: { maxPercentage: 100, label: 'Listrik' },
  AIR: { maxPercentage: 100, label: 'Air' },
  INTERNET: { maxPercentage: 100, label: 'Internet' },
  KEGIATAN: { maxPercentage: 100, label: 'Kegiatan' },
  LAINNYA: { maxPercentage: 100, label: 'Lainnya' }
} as const;

export const KATEGORI_BOS_LABELS: Record<KategoriBOS, string> = {
  honor_guru_non_pns: 'Honor Guru Non-PNS',
  honor_karyawan: 'Honor Karyawan',
  atk: 'Alat Tulis Kantor (ATK)',
  sarpras: 'Sarana dan Prasarana',
  perawatan: 'Perawatan dan Pemeliharaan',
  transport: 'Transportasi',
  listrik: 'Listrik',
  air: 'Air',
  internet: 'Internet',
  kegiatan: 'Kegiatan Pembelajaran',
  lainnya: 'Lainnya'
};

export const KATEGORI_PEMBAYARAN_LABELS: Record<KategoriPembayaran, string> = {
  spp: 'SPP',
  gedung: 'Uang Gedung',
  buku: 'Uang Buku',
  seragam: 'Uang Seragam',
  lainnya: 'Lainnya'
};

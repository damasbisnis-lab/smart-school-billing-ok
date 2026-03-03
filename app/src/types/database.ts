// =====================================================
// SUPABASE DATABASE TYPES
// =====================================================
// Type definitions untuk tabel Supabase
// =====================================================

export interface Database {
  public: {
    Tables: {
      siswa: {
        Row: {
          id: string;
          nisn: string;
          nama: string;
          kelas: string;
          jurusan: string | null;
          tahun_ajaran: string;
          nama_orang_tua: string | null;
          no_telepon: string | null;
          alamat: string | null;
          status: 'aktif' | 'nonaktif' | 'lulus';
          created_at: string;
          updated_at: string;
          sekolah_id: string;
        };
        Insert: Omit<Database['public']['Tables']['siswa']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['siswa']['Insert']>;
      };
      
      jenis_pembayaran: {
        Row: {
          id: string;
          kode: string;
          nama: string;
          kategori: 'spp' | 'gedung' | 'buku' | 'seragam' | 'lainnya';
          nominal: number;
          periode: 'bulanan' | 'tahunan' | 'semester' | 'sekali';
          keterangan: string | null;
          status: boolean;
          created_at: string;
          sekolah_id: string;
        };
        Insert: Omit<Database['public']['Tables']['jenis_pembayaran']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['jenis_pembayaran']['Insert']>;
      };
      
      tagihan_siswa: {
        Row: {
          id: string;
          siswa_id: string;
          jenis_pembayaran_id: string;
          periode_tagihan: string;
          nominal_tagihan: number;
          nominal_dibayar: number;
          sisa_tagihan: number;
          status: 'belum_bayar' | 'cicil' | 'lunas';
          jatuh_tempo: string | null;
          keterangan: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tagihan_siswa']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tagihan_siswa']['Insert']>;
      };
      
      pembayaran_tunai: {
        Row: {
          id: string;
          kode_transaksi: string;
          siswa_id: string;
          tagihan_ids: string[];
          total_nominal: number;
          platform_fee_percentage: number;
          platform_fee_calculated: number;
          platform_fee_capped: boolean;
          status_fee: 'belum_dibayar' | 'sudah_dibayar';
          tanggal_bayar_fee: string | null;
          tanggal_bayar: string;
          dicatat_oleh: string;
          metode_pembayaran: 'tunai' | 'transfer' | 'qris';
          keterangan: string | null;
          created_at: string;
          sekolah_id: string;
        };
        Insert: Omit<Database['public']['Tables']['pembayaran_tunai']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pembayaran_tunai']['Insert']>;
      };
      
      tunggakan_fee_sekolah: {
        Row: {
          id: string;
          sekolah_id: string;
          periode_bulan: string;
          total_transaksi: number;
          total_nominal_masuk: number;
          total_platform_fee: number;
          total_fee_dibayar: number;
          sisa_fee_belum_dibayar: number;
          status_periode: 'terbuka' | 'ditutup';
          tanggal_jatuh_tempo_fee: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tunggakan_fee_sekolah']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tunggakan_fee_sekolah']['Insert']>;
      };
      
      bos_penerimaan: {
        Row: {
          id: string;
          sekolah_id: string;
          tahun_anggaran: string;
          semester: '1' | '2';
          sumber_dana: 'pusat' | 'provinsi' | 'kabupaten';
          jumlah_siswa: number;
          nominal_per_siswa: number;
          total_penerimaan: number;
          nomor_sk: string | null;
          tanggal_sk: string | null;
          file_sk_url: string | null;
          status: 'terencana' | 'diterima' | 'dicairkan';
          tanggal_pencairan: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bos_penerimaan']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bos_penerimaan']['Insert']>;
      };
      
      bos_pengeluaran: {
        Row: {
          id: string;
          sekolah_id: string;
          bos_penerimaan_id: string | null;
          kategori: 'honor_guru_non_pns' | 'honor_karyawan' | 'atk' | 'sarpras' | 'perawatan' | 'transport' | 'listrik' | 'air' | 'internet' | 'kegiatan' | 'lainnya';
          uraian: string;
          nominal: number;
          tanggal_pengeluaran: string;
          persentase_dari_total: number | null;
          melebihi_batas: boolean;
          catatan_validasi: string | null;
          nomor_kwitansi: string | null;
          file_bukti_url: string | null;
          status: 'draft' | 'tervalidasi' | 'ditolak';
          created_at: string;
          dicatat_oleh: string | null;
        };
        Insert: Omit<Database['public']['Tables']['bos_pengeluaran']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bos_pengeluaran']['Insert']>;
      };
      
      bos_saldo: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['bos_saldo']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['bos_saldo']['Insert']>;
      };
      
      sekolah: {
        Row: {
          id: string;
          npsn: string | null;
          nama_sekolah: string;
          jenjang: 'sd' | 'smp' | 'sma' | 'smk';
          alamat: string | null;
          kecamatan: string | null;
          kabupaten: string | null;
          provinsi: string | null;
          kepala_sekolah: string | null;
          bendahara: string | null;
          telepon: string | null;
          email: string | null;
          status_berlangganan: 'trial' | 'aktif' | 'nonaktif';
          tanggal_aktif: string | null;
          tanggal_berakhir: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sekolah']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sekolah']['Insert']>;
      };
      
      users: {
        Row: {
          id: string;
          email: string;
          nama_lengkap: string;
          sekolah_id: string | null;
          role: 'superadmin' | 'admin' | 'bendahara' | 'operator';
          status: boolean;
          last_login: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
  };
}

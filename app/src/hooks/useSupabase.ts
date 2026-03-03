// =====================================================
// CUSTOM HOOKS - SUPABASE OPERATIONS
// =====================================================
// Hooks untuk berinteraksi dengan database Supabase
// =====================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { 
  Siswa, 
  TagihanSiswa, 
  PembayaranTunai, 
  BOSPengeluaran,
  TunggakanFeeSekolah,
  CreatePembayaranTunaiDTO,
  CreateBOSPengeluaranDTO,
  DashboardSummary 
} from '@/types';
import { calculatePlatformFee, generateTransactionCode, getPeriodeBulan } from '@/utils/platformFee';
import { validateBOSLimits } from '@/utils/bosValidator';

// =====================================================
// HOOK: SISWA
// =====================================================

export function useSiswa() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSiswaBySekolah = useCallback(async (sekolahId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('sekolah_id', sekolahId)
        .eq('status', 'aktif')
        .order('kelas')
        .order('nama');
      
      if (error) throw error;
      return data as Siswa[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getSiswaById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Siswa;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchSiswa = useCallback(async (sekolahId: string, keyword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('sekolah_id', sekolahId)
        .or(`nama.ilike.%${keyword}%,nisn.ilike.%${keyword}%`)
        .limit(10);
      
      if (error) throw error;
      return data as Siswa[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { getSiswaBySekolah, getSiswaById, searchSiswa, loading, error };
}

// =====================================================
// HOOK: TAGIHAN SISWA
// =====================================================

export function useTagihan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTagihanBySiswa = useCallback(async (siswaId: string, status?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('tagihan_siswa')
        .select(`
          *,
          jenis_pembayaran:jenis_pembayaran_id (*)
        `)
        .eq('siswa_id', siswaId);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as TagihanSiswa[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTagihanBelumLunas = useCallback(async (_sekolahId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tagihan_siswa')
        .select(`
          *,
          siswa:siswa_id (*),
          jenis_pembayaran:jenis_pembayaran_id (*)
        `)
        .in('status', ['belum_bayar', 'cicil'])
        .order('jatuh_tempo', { ascending: true });
      
      if (error) throw error;
      return data as unknown as TagihanSiswa[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { getTagihanBySiswa, getTagihanBelumLunas, loading, error };
}

// =====================================================
// HOOK: PEMBAYARAN TUNAI (DENGAN PLATFORM FEE)
// =====================================================

export function usePembayaran() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Membuat pembayaran tunai baru dengan perhitungan platform fee otomatis
   */
  const createPembayaran = useCallback(async (dto: CreatePembayaranTunaiDTO) => {
    setLoading(true);
    setError(null);
    
    try {
      // Hitung platform fee
      const feeResult = calculatePlatformFee(dto.total_nominal);
      
      // Generate kode transaksi
      const kodeTransaksi = generateTransactionCode();
      
      // Siapkan data untuk insert
      const pembayaranData = {
        kode_transaksi: kodeTransaksi,
        siswa_id: dto.siswa_id,
        tagihan_ids: dto.tagihan_ids,
        total_nominal: dto.total_nominal,
        platform_fee_percentage: feeResult.percentage,
        platform_fee_calculated: feeResult.fee,
        platform_fee_capped: feeResult.isCapped,
        status_fee: 'belum_dibayar' as const,
        tanggal_bayar: new Date().toISOString(),
        dicatat_oleh: dto.dicatat_oleh,
        metode_pembayaran: dto.metode_pembayaran,
        keterangan: dto.keterangan,
        sekolah_id: dto.sekolah_id
      };
      
      // Insert ke database
      const { data, error } = await supabase
        .from('pembayaran_tunai')
        .insert(pembayaranData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update status tagihan menjadi lunas
      for (const tagihanId of dto.tagihan_ids) {
        await supabase
          .from('tagihan_siswa')
          .update({ 
            status: 'lunas',
            nominal_dibayar: dto.total_nominal,
            sisa_tagihan: 0
          })
          .eq('id', tagihanId);
      }
      
      return { 
        success: true, 
        data: data as PembayaranTunai,
        platformFee: feeResult 
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getPembayaranBySekolah = useCallback(async (sekolahId: string, limit = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('pembayaran_tunai')
        .select(`
          *,
          siswa:siswa_id (*)
        `)
        .eq('sekolah_id', sekolahId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as unknown as PembayaranTunai[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPembayaranByPeriode = useCallback(async (sekolahId: string, periodeBulan: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('pembayaran_tunai')
        .select(`
          *,
          siswa:siswa_id (*)
        `)
        .eq('sekolah_id', sekolahId)
        .gte('tanggal_bayar', `${periodeBulan}-01`)
        .lte('tanggal_bayar', `${periodeBulan}-31`)
        .order('tanggal_bayar', { ascending: false });
      
      if (error) throw error;
      return data as unknown as PembayaranTunai[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    createPembayaran, 
    getPembayaranBySekolah, 
    getPembayaranByPeriode,
    loading, 
    error 
  };
}

// =====================================================
// HOOK: TUNGGAKAN FEE SEKOLAH
// =====================================================

export function useTunggakanFee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTunggakanBySekolah = useCallback(async (sekolahId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tunggakan_fee_sekolah')
        .select('*')
        .eq('sekolah_id', sekolahId)
        .order('periode_bulan', { ascending: false });
      
      if (error) throw error;
      return data as TunggakanFeeSekolah[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTunggakanBulanIni = useCallback(async (sekolahId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const periodeBulan = getPeriodeBulan();
      
      const { data, error } = await supabase
        .from('tunggakan_fee_sekolah')
        .select('*')
        .eq('sekolah_id', sekolahId)
        .eq('periode_bulan', periodeBulan)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data as TunggakanFeeSekolah | null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTotalFeeBelumDibayar = useCallback(async (sekolahId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tunggakan_fee_sekolah')
        .select('sisa_fee_belum_dibayar')
        .eq('sekolah_id', sekolahId)
        .eq('status_periode', 'terbuka');
      
      if (error) throw error;
      
      return data.reduce((total: number, item: { sisa_fee_belum_dibayar: number | null }) => 
        total + (item.sisa_fee_belum_dibayar || 0), 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    getTunggakanBySekolah, 
    getTunggakanBulanIni,
    getTotalFeeBelumDibayar,
    loading, 
    error 
  };
}

// =====================================================
// HOOK: BOS PENGELUARAN
// =====================================================

export function useBOSPengeluaran() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Membuat pengeluaran BOS dengan validasi otomatis
   */
  const createPengeluaran = useCallback(async (
    dto: CreateBOSPengeluaranDTO,
    totalBudget: number,
    currentUsage: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validasi BOS limits
      const validation = validateBOSLimits(
        dto.kategori,
        dto.nominal,
        currentUsage,
        totalBudget
      );
      
      // Hitung persentase
      const persentase = ((currentUsage + dto.nominal) / totalBudget) * 100;
      
      // Siapkan data
      const pengeluaranData = {
        sekolah_id: dto.sekolah_id,
        bos_penerimaan_id: dto.bos_penerimaan_id,
        kategori: dto.kategori,
        uraian: dto.uraian,
        nominal: dto.nominal,
        tanggal_pengeluaran: dto.tanggal_pengeluaran,
        persentase_dari_total: persentase,
        melebihi_batas: !validation.isValid,
        catatan_validasi: validation.message,
        nomor_kwitansi: dto.nomor_kwitansi,
        status: validation.isValid ? 'tervalidasi' as const : 'draft' as const,
        dicatat_oleh: dto.dicatat_oleh
      };
      
      // Insert ke database
      const { data, error } = await supabase
        .from('bos_pengeluaran')
        .insert(pengeluaranData)
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        success: true, 
        data: data as BOSPengeluaran,
        validation 
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getPengeluaranBySekolah = useCallback(async (sekolahId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('bos_pengeluaran')
        .select(`
          *,
          bos_penerimaan:bos_penerimaan_id (*)
        `)
        .eq('sekolah_id', sekolahId)
        .order('tanggal_pengeluaran', { ascending: false });
      
      if (error) throw error;
      return data as unknown as BOSPengeluaran[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPengeluaranByKategori = useCallback(async (sekolahId: string, kategori: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('bos_pengeluaran')
        .select('*')
        .eq('sekolah_id', sekolahId)
        .eq('kategori', kategori)
        .order('tanggal_pengeluaran', { ascending: false });
      
      if (error) throw error;
      return data as BOSPengeluaran[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    createPengeluaran, 
    getPengeluaranBySekolah,
    getPengeluaranByKategori,
    loading, 
    error 
  };
}

// =====================================================
// HOOK: DASHBOARD SUMMARY
// =====================================================

export function useDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboardSummary = useCallback(async (sekolahId: string): Promise<DashboardSummary> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get total siswa
      const { count: totalSiswa, error: siswaError } = await supabase
        .from('siswa')
        .select('*', { count: 'exact', head: true })
        .eq('sekolah_id', sekolahId);
      
      if (siswaError) throw siswaError;

      // Get siswa aktif
      const { count: siswaAktif, error: siswaAktifError } = await supabase
        .from('siswa')
        .select('*', { count: 'exact', head: true })
        .eq('sekolah_id', sekolahId)
        .eq('status', 'aktif');
      
      if (siswaAktifError) throw siswaAktifError;

      // Get platform fee bulan ini
      const periodeBulan = getPeriodeBulan();
      const { data: tunggakanData, error: tunggakanError } = await supabase
        .from('tunggakan_fee_sekolah')
        .select('*')
        .eq('sekolah_id', sekolahId)
        .eq('periode_bulan', periodeBulan)
        .single();
      
      if (tunggakanError && tunggakanError.code !== 'PGRST116') throw tunggakanError;

      // Get total BOS
      const { data: bosData, error: bosError } = await supabase
        .from('bos_saldo')
        .select('*')
        .eq('sekolah_id', sekolahId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (bosError && bosError.code !== 'PGRST116') throw bosError;

      return {
        totalSiswa: totalSiswa || 0,
        siswaAktif: siswaAktif || 0,
        totalTagihanBulanIni: 0, // TODO: Implement
        totalTerbayarBulanIni: tunggakanData?.total_nominal_masuk || 0,
        totalTunggakan: 0, // TODO: Implement
        platformFeeBulanIni: tunggakanData?.total_platform_fee || 0,
        platformFeeBelumDibayar: tunggakanData?.sisa_fee_belum_dibayar || 0,
        totalTransaksiBulanIni: tunggakanData?.total_transaksi || 0,
        totalBOSDiterima: bosData?.total_penerimaan || 0,
        totalBOSTerpakai: bosData?.total_pengeluaran || 0,
        sisaBOS: bosData?.sisa_saldo || 0
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return {
        totalSiswa: 0,
        siswaAktif: 0,
        totalTagihanBulanIni: 0,
        totalTerbayarBulanIni: 0,
        totalTunggakan: 0,
        platformFeeBulanIni: 0,
        platformFeeBelumDibayar: 0,
        totalTransaksiBulanIni: 0,
        totalBOSDiterima: 0,
        totalBOSTerpakai: 0,
        sisaBOS: 0
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { getDashboardSummary, loading, error };
}

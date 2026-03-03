// =====================================================
// BOS VALIDATOR - Sesuai Juknis 2026 (Permendikdasmen No. 8/2026)
// =====================================================
// Aturan penting:
// 1. Honor Guru Non-PNS: Maksimal 50% dari total BOS
// 2. Sarpras: Maksimal 20% dari total BOS
// 3. Kategori lain: Tidak ada batas khusus
// =====================================================

import type { 
  KategoriBOS, 
  BOSValidationResult
} from '@/types';

/**
 * Konfigurasi batasan BOS per kategori
 * Sesuai dengan Permendikdasmen No. 8 Tahun 2026
 */
interface BOSLimitConfig {
  maxPercentage: number;
  label: string;
  warningThreshold: number; // Persentase untuk warning (80% dari batas)
}

const BOS_CATEGORY_LIMITS: Record<KategoriBOS, BOSLimitConfig> = {
  honor_guru_non_pns: {
    maxPercentage: 50,
    label: 'Honor Guru Non-PNS',
    warningThreshold: 40 // Warning jika sudah 40% (80% dari 50%)
  },
  honor_karyawan: {
    maxPercentage: 100,
    label: 'Honor Karyawan',
    warningThreshold: 80
  },
  atk: {
    maxPercentage: 100,
    label: 'Alat Tulis Kantor',
    warningThreshold: 80
  },
  sarpras: {
    maxPercentage: 20,
    label: 'Sarana dan Prasarana',
    warningThreshold: 16 // Warning jika sudah 16% (80% dari 20%)
  },
  perawatan: {
    maxPercentage: 100,
    label: 'Perawatan dan Pemeliharaan',
    warningThreshold: 80
  },
  transport: {
    maxPercentage: 100,
    label: 'Transportasi',
    warningThreshold: 80
  },
  listrik: {
    maxPercentage: 100,
    label: 'Listrik',
    warningThreshold: 80
  },
  air: {
    maxPercentage: 100,
    label: 'Air',
    warningThreshold: 80
  },
  internet: {
    maxPercentage: 100,
    label: 'Internet',
    warningThreshold: 80
  },
  kegiatan: {
    maxPercentage: 100,
    label: 'Kegiatan Pembelajaran',
    warningThreshold: 80
  },
  lainnya: {
    maxPercentage: 100,
    label: 'Lainnya',
    warningThreshold: 80
  }
};

/**
 * Validasi pengeluaran BOS berdasarkan kategori
 * 
 * @param kategori - Kategori pengeluaran BOS
 * @param nominal - Nominal pengeluaran yang diajukan
 * @param currentUsage - Total penggunaan saat ini untuk kategori tersebut
 * @param totalBudget - Total anggaran BOS
 * @returns BOSValidationResult dengan status validasi
 */
export function validateBOSLimits(
  kategori: KategoriBOS,
  nominal: number,
  currentUsage: number,
  totalBudget: number
): BOSValidationResult {
  // Validasi input dasar
  if (nominal <= 0) {
    return {
      isValid: false,
      message: 'Nominal pengeluaran harus lebih dari 0',
      currentPercentage: 0
    };
  }

  if (totalBudget <= 0) {
    return {
      isValid: false,
      message: 'Total anggaran BOS tidak valid',
      currentPercentage: 0
    };
  }

  const config = BOS_CATEGORY_LIMITS[kategori];
  const newTotal = currentUsage + nominal;
  const newPercentage = (newTotal / totalBudget) * 100;
  const currentPercentageOnly = (currentUsage / totalBudget) * 100;

  // Cek apakah melebihi batas
  if (newPercentage > config.maxPercentage) {
    const sisaBudget = (config.maxPercentage / 100 * totalBudget) - currentUsage;
    
    let message = '';
    if (kategori === 'honor_guru_non_pns') {
      message = `⚠️ PERINGATAN KRITIS! Pengeluaran Honor Guru Non-PNS melebihi batas maksimal 50% dari total BOS.\n\n` +
                `Saat ini: ${currentPercentageOnly.toFixed(2)}%\n` +
                `Setelah ditambah: ${newPercentage.toFixed(2)}%\n` +
                `Sisa budget yang bisa digunakan: Rp ${Math.max(0, sisaBudget).toLocaleString('id-ID')}`;
    } else if (kategori === 'sarpras') {
      message = `⚠️ PERINGATAN KRITIS! Pengeluaran Sarpras melebihi batas maksimal 20% dari total BOS.\n\n` +
                `Saat ini: ${currentPercentageOnly.toFixed(2)}%\n` +
                `Setelah ditambah: ${newPercentage.toFixed(2)}%\n` +
                `Sisa budget yang bisa digunakan: Rp ${Math.max(0, sisaBudget).toLocaleString('id-ID')}`;
    } else {
      message = `Pengeluaran ${config.label} tidak valid.`;
    }

    return {
      isValid: false,
      message,
      currentPercentage: newPercentage,
      maxPercentage: config.maxPercentage,
      remainingBudget: Math.max(0, sisaBudget)
    };
  }

  // Cek warning threshold (80% dari batas)
  if (newPercentage > config.warningThreshold && config.maxPercentage < 100) {
    const sisaBudget = (config.maxPercentage / 100 * totalBudget) - newTotal;
    
    return {
      isValid: true,
      message: `⚠️ PERINGATAN: Penggunaan ${config.label} sudah mendekati batas (${newPercentage.toFixed(2)}% dari ${config.maxPercentage}%).\n` +
               `Sisa budget: Rp ${sisaBudget.toLocaleString('id-ID')}`,
      currentPercentage: newPercentage,
      maxPercentage: config.maxPercentage,
      remainingBudget: sisaBudget
    };
  }

  // Validasi berhasil
  return {
    isValid: true,
    message: 'Valid',
    currentPercentage: newPercentage,
    maxPercentage: config.maxPercentage,
    remainingBudget: (config.maxPercentage / 100 * totalBudget) - newTotal
  };
}

/**
 * Dapatkan informasi batas untuk semua kategori
 * Berguna untuk dashboard monitoring
 */
export function getAllBOSLimits(): Array<{
  kategori: KategoriBOS;
  label: string;
  maxPercentage: number;
  warningThreshold: number;
  isRestricted: boolean;
}> {
  return Object.entries(BOS_CATEGORY_LIMITS).map(([kategori, config]) => ({
    kategori: kategori as KategoriBOS,
    label: config.label,
    maxPercentage: config.maxPercentage,
    warningThreshold: config.warningThreshold,
    isRestricted: config.maxPercentage < 100
  }));
}

/**
 * Cek apakah kategori memiliki batas khusus
 * @param kategori - Kategori BOS
 * @returns boolean
 */
export function hasSpecialLimit(kategori: KategoriBOS): boolean {
  return BOS_CATEGORY_LIMITS[kategori].maxPercentage < 100;
}

/**
 * Format pesan validasi untuk ditampilkan ke user
 * @param result - Hasil validasi
 * @returns string yang sudah diformat
 */
export function formatValidationMessage(result: BOSValidationResult): string {
  if (result.isValid && result.message === 'Valid') {
    return '✅ Pengeluaran valid dan dapat diproses.';
  }
  
  return result.message;
}

/**
 * Hitung sisa budget untuk kategori tertentu
 * @param kategori - Kategori BOS
 * @param currentUsage - Penggunaan saat ini
 * @param totalBudget - Total anggaran
 * @returns Sisa budget yang bisa digunakan
 */
export function calculateRemainingBudget(
  kategori: KategoriBOS,
  currentUsage: number,
  totalBudget: number
): number {
  const config = BOS_CATEGORY_LIMITS[kategori];
  const maxAmount = (config.maxPercentage / 100) * totalBudget;
  return Math.max(0, maxAmount - currentUsage);
}

/**
 * Dapatkan rekomendasi alokasi BOS yang ideal
 * Berdasarkan Juknis 2026
 */
export function getIdealBOSAllocation(): Array<{
  kategori: KategoriBOS;
  label: string;
  recommendedPercentage: number;
  description: string;
}> {
  return [
    {
      kategori: 'honor_guru_non_pns',
      label: 'Honor Guru Non-PNS',
      recommendedPercentage: 45,
      description: 'Idealnya 40-50% dari total BOS'
    },
    {
      kategori: 'sarpras',
      label: 'Sarana dan Prasarana',
      recommendedPercentage: 15,
      description: 'Idealnya 10-20% dari total BOS'
    },
    {
      kategori: 'atk',
      label: 'Alat Tulis Kantor',
      recommendedPercentage: 10,
      description: 'Sesuaikan dengan kebutuhan'
    },
    {
      kategori: 'kegiatan',
      label: 'Kegiatan Pembelajaran',
      recommendedPercentage: 10,
      description: 'Untuk kegiatan ekstrakurikuler dll'
    },
    {
      kategori: 'perawatan',
      label: 'Perawatan',
      recommendedPercentage: 8,
      description: 'Pemeliharaan fasilitas'
    },
    {
      kategori: 'listrik',
      label: 'Listrik',
      recommendedPercentage: 5,
      description: 'Sesuaikan dengan pemakaian'
    },
    {
      kategori: 'internet',
      label: 'Internet',
      recommendedPercentage: 3,
      description: 'Untuk kebutuhan digital'
    },
    {
      kategori: 'lainnya',
      label: 'Lainnya',
      recommendedPercentage: 4,
      description: 'Untuk kebutuhan mendesak'
    }
  ];
}

/**
 * Generate laporan compliance BOS
 * Untuk keperluan audit dan monitoring
 */
export function generateComplianceReport(
  pengeluaranPerKategori: Record<KategoriBOS, number>,
  totalBudget: number
): Array<{
  kategori: KategoriBOS;
  label: string;
  nominal: number;
  percentage: number;
  maxPercentage: number;
  status: 'compliant' | 'warning' | 'violation';
  message: string;
}> {
  return Object.entries(pengeluaranPerKategori).map(([kategori, nominal]) => {
    const kat = kategori as KategoriBOS;
    const config = BOS_CATEGORY_LIMITS[kat];
    const percentage = (nominal / totalBudget) * 100;
    
    let status: 'compliant' | 'warning' | 'violation';
    let message: string;
    
    if (percentage > config.maxPercentage) {
      status = 'violation';
      message = `Melebihi batas! Maksimal ${config.maxPercentage}%`;
    } else if (percentage > config.warningThreshold && config.maxPercentage < 100) {
      status = 'warning';
      message = `Mendekati batas (${percentage.toFixed(1)}% dari ${config.maxPercentage}%)`;
    } else {
      status = 'compliant';
      message = 'Sesuai ketentuan';
    }
    
    return {
      kategori: kat,
      label: config.label,
      nominal,
      percentage,
      maxPercentage: config.maxPercentage,
      status,
      message
    };
  });
}

// =====================================================
// CONTOH PENGGUNAAN:
// =====================================================
//
// import { validateBOSLimits } from '@/utils/bosValidator';
//
// // Skenario: Sekolah ingin bayar honor guru Rp 60 juta
// // Total BOS: Rp 100 juta
// // Sudah terpakai untuk honor: Rp 30 juta
//
// const result = validateBOSLimits(
//   'honor_guru_non_pns',
//   60000000,  // Rp 60 juta yang diajukan
//   30000000,  // Rp 30 juta sudah terpakai
//   100000000  // Rp 100 juta total BOS
// );
//
// if (!result.isValid) {
//   console.error(result.message);
//   // Output: "Peringatan! Pengeluaran Honor Guru melebihi batas 50%..."
// }
//
// =====================================================

// =====================================================
// PLATFORM FEE CALCULATOR - LOGIKA BISNIS SAAS
// =====================================================
// Setiap transaksi tunai dikenakan biaya platform 2.5%
// dengan BATAS MAKSIMAL (CAPPING) Rp750.000
// =====================================================

import type { PlatformFeeResult } from '@/types';
import { PLATFORM_FEE_CONFIG } from '@/types';

/**
 * Menghitung platform fee dengan sistem capping
 * 
 * CONTOH PERHITUNGAN:
 * - Input: Rp 10.000.000
 * - 2.5% = Rp 250.000 (di bawah cap, jadi fee = Rp 250.000)
 * 
 * - Input: Rp 100.000.000
 * - 2.5% = Rp 2.500.000 (melebihi cap Rp 750.000)
 * - Fee tetap = Rp 750.000 (kena cap)
 * 
 * @param amount - Nominal transaksi dalam Rupiah
 * @returns PlatformFeeResult dengan detail perhitungan
 */
export function calculatePlatformFee(amount: number): PlatformFeeResult {
  const { PERCENTAGE, MAX_CAP } = PLATFORM_FEE_CONFIG;
  
  // Validasi input
  if (amount <= 0) {
    return {
      fee: 0,
      isCapped: false,
      percentage: PERCENTAGE,
      originalFee: 0,
      capAmount: MAX_CAP
    };
  }
  
  // Hitung 2.5% dari nominal
  const originalFee = (amount * PERCENTAGE) / 100;
  
  // Cek apakah melebihi batas maksimal
  let finalFee: number;
  let isCapped: boolean;
  
  if (originalFee > MAX_CAP) {
    finalFee = MAX_CAP;
    isCapped = true;
  } else {
    finalFee = originalFee;
    isCapped = false;
  }
  
  // Bulatkan ke 2 desimal
  finalFee = Math.round(finalFee * 100) / 100;
  
  return {
    fee: finalFee,
    isCapped,
    percentage: PERCENTAGE,
    originalFee: Math.round(originalFee * 100) / 100,
    capAmount: MAX_CAP
  };
}

/**
 * Format angka ke format Rupiah
 * @param amount - Nominal
 * @returns String format Rupiah (contoh: Rp 1.000.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format angka ke format Rupiah dengan desimal
 * @param amount - Nominal
 * @returns String format Rupiah dengan 2 desimal
 */
export function formatRupiahDecimal(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Generate kode transaksi unik
 * Format: PAY-{timestamp}-{random}
 * Contoh: PAY-20260115-123456-ABC123
 */
export function generateTransactionCode(): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `PAY-${timestamp}-${random}`;
}

/**
 * Generate periode bulan (YYYY-MM) dari tanggal
 * @param date - Date object
 * @returns String periode (contoh: 2026-01)
 */
export function getPeriodeBulan(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Hitung total platform fee dari array transaksi
 * @param transactions - Array nominal transaksi
 * @returns Total fee yang harus dibayar
 */
export function calculateTotalPlatformFee(transactions: number[]): number {
  return transactions.reduce((total, amount) => {
    const feeResult = calculatePlatformFee(amount);
    return total + feeResult.fee;
  }, 0);
}

/**
 * Simulasi perhitungan untuk berbagai skenario
 * Berguna untuk testing dan dokumentasi
 */
export function simulatePlatformFeeScenarios(): Array<{
  nominal: number;
  fee: number;
  isCapped: boolean;
  keterangan: string;
}> {
  const scenarios = [
    100000,    // SPP murah
    500000,    // SPP standar
    1000000,   // SPP mahal
    5000000,   // Uang gedung
    10000000,  // Transaksi besar
    30000000,  // Transaksi sangat besar
    100000000, // Transaksi masif (kena cap)
  ];
  
  return scenarios.map(nominal => {
    const result = calculatePlatformFee(nominal);
    let keterangan = '';
    
    if (result.isCapped) {
      keterangan = `Kena CAP! Seharusnya Rp ${result.originalFee.toLocaleString('id-ID')}, tapi dibatasi Rp ${result.capAmount.toLocaleString('id-ID')}`;
    } else {
      keterangan = `Normal: ${result.percentage}% dari ${formatRupiah(nominal)}`;
    }
    
    return {
      nominal,
      fee: result.fee,
      isCapped: result.isCapped,
      keterangan
    };
  });
}

// =====================================================
// CONTOH PENGGUNAAN:
// =====================================================
// 
// import { calculatePlatformFee, formatRupiah } from '@/utils/platformFee';
// 
// const transaksi = 100000000; // Rp 100 juta
// const result = calculatePlatformFee(transaksi);
// 
// console.log(`Nominal: ${formatRupiah(transaksi)}`);
// console.log(`Fee: ${formatRupiah(result.fee)}`);
// console.log(`Kena Cap: ${result.isCapped ? 'YA' : 'TIDAK'}`);
// 
// Output:
// Nominal: Rp 100.000.000
// Fee: Rp 750.000 (kena cap, seharusnya Rp 2.500.000)
// Kena Cap: YA
//
// =====================================================

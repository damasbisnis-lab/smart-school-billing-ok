// =====================================================
// FORM: INPUT PENGELUARAN BOS
// =====================================================
// Form untuk mencatat pengeluaran BOS dengan validasi
// otomatis sesuai Juknis 2026 (Permendikdasmen No. 8/2026)
// =====================================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Save,
  Info,
  FileText,
  AlertOctagon
} from 'lucide-react';
import { useBOSPengeluaran } from '@/hooks/useSupabase';
import { validateBOSLimits, formatValidationMessage } from '@/utils/bosValidator';
import { KATEGORI_BOS_LABELS } from '@/types';
import { formatRupiah } from '@/utils/platformFee';
import type { KategoriBOS } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface FormPengeluaranBOSProps {
  sekolahId: string;
  adminName: string;
  totalBudget: number;
  currentUsagePerKategori: Record<KategoriBOS, number>;
}

export function FormPengeluaranBOS({ 
  sekolahId, 
  adminName, 
  totalBudget,
  currentUsagePerKategori 
}: FormPengeluaranBOSProps) {
  // State form
  const [kategori, setKategori] = useState<KategoriBOS>('atk');
  const [uraian, setUraian] = useState('');
  const [nominal, setNominal] = useState('');
  const [tanggalPengeluaran, setTanggalPengeluaran] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [nomorKwitansi, setNomorKwitansi] = useState('');
  
  // State validasi
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateBOSLimits> | null>(null);
  
  // State hasil
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  
  // Hook
  const { createPengeluaran, loading } = useBOSPengeluaran();

  // Validasi realtime saat nominal atau kategori berubah
  useEffect(() => {
    const nominalNum = parseFloat(nominal.replace(/[^0-9]/g, '')) || 0;
    
    if (nominalNum > 0) {
      const currentUsage = currentUsagePerKategori[kategori] || 0;
      const result = validateBOSLimits(kategori, nominalNum, currentUsage, totalBudget);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [kategori, nominal, currentUsagePerKategori, totalBudget]);

  // Format input nominal
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNominal(value);
  };

  // Submit form
  const handleSubmit = async () => {
    const nominalNum = parseFloat(nominal) || 0;
    const currentUsage = currentUsagePerKategori[kategori] || 0;
    
    const result = await createPengeluaran(
      {
        sekolah_id: sekolahId,
        kategori,
        uraian,
        nominal: nominalNum,
        tanggal_pengeluaran: tanggalPengeluaran,
        nomor_kwitansi: nomorKwitansi,
        dicatat_oleh: adminName
      },
      totalBudget,
      currentUsage
    );
    
    if (result.success) {
      setResultData(result);
      setShowSuccessDialog(true);
      
      // Reset form
      setUraian('');
      setNominal('');
      setNomorKwitansi('');
      setValidationResult(null);
    }
  };

  // Cek apakah kategori memiliki batas khusus
  const isRestrictedCategory = kategori === 'honor_guru_non_pns' || kategori === 'sarpras';
  
  // Hitung persentase saat ini
  const currentUsage = currentUsagePerKategori[kategori] || 0;
  const nominalNum = parseFloat(nominal) || 0;
  const currentPercentage = totalBudget > 0 ? (currentUsage / totalBudget) * 100 : 0;
  const newPercentage = totalBudget > 0 ? ((currentUsage + nominalNum) / totalBudget) * 100 : 0;
  
  // Batas maksimal
  const maxPercentage = kategori === 'honor_guru_non_pns' ? 50 : 
                        kategori === 'sarpras' ? 20 : 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Input Pengeluaran BOS
        </CardTitle>
        <CardDescription>
          Catat pengeluaran BOS dengan validasi otomatis sesuai Juknis 2026
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Info Budget */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700">Total Anggaran BOS</span>
            <span className="font-bold text-purple-700">{formatRupiah(totalBudget)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700">Sisa Saldo</span>
            <span className="font-bold text-purple-700">
              {formatRupiah(totalBudget - Object.values(currentUsagePerKategori).reduce((a, b) => a + b, 0))}
            </span>
          </div>
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Kategori Pengeluaran *</Label>
          <Select value={kategori} onValueChange={(v) => setKategori(v as KategoriBOS)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori pengeluaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="honor_guru_non_pns">
                👨‍🏫 Honor Guru Non-PNS (Maks 50%)
              </SelectItem>
              <SelectItem value="honor_karyawan">
                👷 Honor Karyawan
              </SelectItem>
              <SelectItem value="atk">
                📝 Alat Tulis Kantor (ATK)
              </SelectItem>
              <SelectItem value="sarpras">
                🏫 Sarana dan Prasarana (Maks 20%)
              </SelectItem>
              <SelectItem value="perawatan">
                🔧 Perawatan dan Pemeliharaan
              </SelectItem>
              <SelectItem value="transport">
                🚗 Transportasi
              </SelectItem>
              <SelectItem value="listrik">
                💡 Listrik
              </SelectItem>
              <SelectItem value="air">
                💧 Air
              </SelectItem>
              <SelectItem value="internet">
                🌐 Internet
              </SelectItem>
              <SelectItem value="kegiatan">
                🎯 Kegiatan Pembelajaran
              </SelectItem>
              <SelectItem value="lainnya">
                📦 Lainnya
              </SelectItem>
            </SelectContent>
          </Select>
          
          {isRestrictedCategory && (
            <div className="flex items-center gap-2 text-sm">
              <AlertOctagon className="h-4 w-4 text-orange-500" />
              <span className="text-orange-600">
                Kategori ini memiliki batas maksimal {maxPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar untuk Kategori Terbatas */}
        {isRestrictedCategory && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Penggunaan Saat Ini</span>
              <span className="font-medium">{currentPercentage.toFixed(1)}% dari {maxPercentage}%</span>
            </div>
            <Progress 
              value={(currentPercentage / maxPercentage) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Sudah terpakai: {formatRupiah(currentUsage)}
            </p>
          </div>
        )}

        {/* Uraian */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Uraian Pengeluaran *</Label>
          <Input
            placeholder="Contoh: Pembayaran honor guru bulan Januari"
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
          />
        </div>

        {/* Nominal */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Nominal (Rp) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
            <Input
              type="text"
              placeholder="0"
              value={nominal ? formatRupiah(parseFloat(nominal)).replace('Rp', '').trim() : ''}
              onChange={handleNominalChange}
              className="pl-10"
            />
          </div>
          
          {/* Preview Persentase */}
          {nominalNum > 0 && (
            <p className="text-sm text-muted-foreground">
              Setelah ditambah: {newPercentage.toFixed(2)}% dari total BOS
            </p>
          )}
        </div>

        {/* Tanggal */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Tanggal Pengeluaran *</Label>
          <Input
            type="date"
            value={tanggalPengeluaran}
            onChange={(e) => setTanggalPengeluaran(e.target.value)}
          />
        </div>

        {/* Nomor Kwitansi */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Nomor Kwitansi</Label>
          <Input
            placeholder="Contoh: KW-001/2026"
            value={nomorKwitansi}
            onChange={(e) => setNomorKwitansi(e.target.value)}
          />
        </div>

        {/* Hasil Validasi */}
        {validationResult && (
          <div className={`p-4 rounded-lg ${
            validationResult.isValid 
              ? validationResult.message !== 'Valid' 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {validationResult.isValid ? (
                validationResult.message !== 'Valid' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                )
              ) : (
                <AlertOctagon className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <div>
                <p className={`font-medium ${
                  validationResult.isValid 
                    ? validationResult.message !== 'Valid' ? 'text-yellow-700' : 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {validationResult.isValid ? 'Validasi Berhasil' : 'Validasi Gagal'}
                </p>
                <p className={`text-sm ${
                  validationResult.isValid 
                    ? validationResult.message !== 'Valid' ? 'text-yellow-600' : 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatValidationMessage(validationResult)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Juknis */}
        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Ketentuan Juknis 2026:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Honor Guru Non-PNS: Maksimal 50% dari total BOS</li>
              <li>Sarpras: Maksimal 20% dari total BOS</li>
              <li>Kategori lain: Tidak ada batas khusus</li>
            </ul>
          </div>
        </div>

        {/* Tombol Submit */}
        <Button 
          className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700"
          onClick={handleSubmit}
          disabled={
            loading || 
            !uraian || 
            !nominal || 
            (validationResult?.isValid === false)
          }
        >
          {loading ? (
            'Menyimpan...'
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Simpan Pengeluaran
            </>
          )}
        </Button>
      </CardContent>

      {/* Dialog Sukses */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              Pengeluaran Tersimpan!
            </DialogTitle>
            <DialogDescription className="text-center">
              Data pengeluaran BOS telah tercatat dalam sistem.
            </DialogDescription>
          </DialogHeader>
          
          {resultData && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kategori</span>
                <span className="font-medium">{KATEGORI_BOS_LABELS[resultData.data?.kategori as KategoriBOS]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nominal</span>
                <span className="font-medium">{formatRupiah(resultData.data?.nominal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Persentase</span>
                <span className="font-medium">{resultData.data?.persentase_dari_total?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={resultData.data?.status === 'tervalidasi' ? 'success' : 'warning'}>
                  {resultData.data?.status === 'tervalidasi' ? 'Tervalidasi' : 'Draft'}
                </Badge>
              </div>
              
              {resultData.validation && resultData.validation.message !== 'Valid' && (
                <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-700">
                  <strong>Catatan:</strong> {resultData.validation.message}
                </div>
              )}
            </div>
          )}
          
          <Button className="w-full" onClick={() => setShowSuccessDialog(false)}>
            Tutup
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

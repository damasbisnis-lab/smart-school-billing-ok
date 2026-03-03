// =====================================================
// FORM: INPUT PEMBAYARAN TUNAI
// =====================================================
// Form untuk admin sekolah menginput pembayaran tunai
// dengan perhitungan platform fee otomatis
// =====================================================

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  User, 
  CreditCard, 
  Calculator, 
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Info
} from 'lucide-react';
import { useSiswa, useTagihan, usePembayaran } from '@/hooks/useSupabase';
import { calculatePlatformFee, formatRupiah } from '@/utils/platformFee';
import type { Siswa, TagihanSiswa, MetodePembayaran } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface FormPembayaranTunaiProps {
  sekolahId: string;
  adminName: string;
}

export function FormPembayaranTunai({ sekolahId, adminName }: FormPembayaranTunaiProps) {
  // State pencarian siswa
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // State tagihan
  const [tagihanList, setTagihanList] = useState<TagihanSiswa[]>([]);
  const [selectedTagihan, setSelectedTagihan] = useState<string[]>([]);
  
  // State pembayaran
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran>('tunai');
  const [keterangan, setKeterangan] = useState('');
  
  // State hasil
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [pembayaranResult, setPembayaranResult] = useState<any>(null);
  
  // Hooks
  const { searchSiswa, loading: loadingSiswa } = useSiswa();
  const { getTagihanBySiswa, loading: loadingTagihan } = useTagihan();
  const { createPembayaran, loading: loadingPembayaran } = usePembayaran();
  
  const [searchResults, setSearchResults] = useState<Siswa[]>([]);

  // Pencarian siswa
  const handleSearch = async () => {
    if (searchKeyword.length < 3) return;
    
    const results = await searchSiswa(sekolahId, searchKeyword);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Pilih siswa
  const handleSelectSiswa = async (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setSearchKeyword(`${siswa.nisn} - ${siswa.nama}`);
    setShowSearchResults(false);
    
    // Load tagihan siswa
    const tagihan = await getTagihanBySiswa(siswa.id, 'belum_bayar');
    setTagihanList(tagihan);
    setSelectedTagihan([]);
  };

  // Toggle pilih tagihan
  const handleToggleTagihan = (tagihanId: string, _nominal: number) => {
    setSelectedTagihan(prev => {
      if (prev.includes(tagihanId)) {
        return prev.filter(id => id !== tagihanId);
      }
      return [...prev, tagihanId];
    });
  };

  // Hitung total
  const totalNominal = tagihanList
    .filter(t => selectedTagihan.includes(t.id))
    .reduce((sum, t) => sum + t.sisa_tagihan, 0);

  // Hitung platform fee
  const platformFeeResult = calculatePlatformFee(totalNominal);

  // Submit pembayaran
  const handleSubmit = async () => {
    if (!selectedSiswa || selectedTagihan.length === 0) return;
    
    const result = await createPembayaran({
      siswa_id: selectedSiswa.id,
      tagihan_ids: selectedTagihan,
      total_nominal: totalNominal,
      metode_pembayaran: metodePembayaran,
      keterangan: keterangan,
      dicatat_oleh: adminName,
      sekolah_id: sekolahId
    });
    
    if (result.success) {
      setPembayaranResult(result);
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      
      // Reset form
      setSelectedSiswa(null);
      setSearchKeyword('');
      setSelectedTagihan([]);
      setTagihanList([]);
      setKeterangan('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-green-600" />
          Input Pembayaran Tunai
        </CardTitle>
        <CardDescription>
          Catat pembayaran dari siswa. Platform fee 2.5% akan dihitung otomatis.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step 1: Cari Siswa */}
        <div className="space-y-2">
          <Label className="text-base font-medium">1. Cari Siswa</Label>
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ketik NISN atau Nama Siswa (min 3 karakter)"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={loadingSiswa || searchKeyword.length < 3}>
                {loadingSiswa ? 'Mencari...' : 'Cari'}
              </Button>
            </div>
            
            {/* Hasil Pencarian */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map((siswa) => (
                  <button
                    key={siswa.id}
                    onClick={() => handleSelectSiswa(siswa)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{siswa.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        NISN: {siswa.nisn} | Kelas: {siswa.kelas}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {showSearchResults && searchResults.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                Siswa tidak ditemukan
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Pilih Tagihan */}
        {selectedSiswa && (
          <div className="space-y-2">
            <Label className="text-base font-medium">2. Pilih Tagihan yang Dibayar</Label>
            
            {loadingTagihan ? (
              <p className="text-sm text-muted-foreground">Memuat tagihan...</p>
            ) : tagihanList.length === 0 ? (
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Tidak ada tagihan yang belum dibayar</p>
                <p className="text-sm text-green-600">Semua tagihan sudah lunas!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tagihanList.map((tagihan) => (
                  <div
                    key={tagihan.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTagihan.includes(tagihan.id)
                        ? 'border-green-500 bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleToggleTagihan(tagihan.id, tagihan.sisa_tagihan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedTagihan.includes(tagihan.id)}
                          onChange={() => {}}
                        />
                        <div>
                          <p className="font-medium">
                            {tagihan.jenis_pembayaran?.nama || 'Tagihan'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Periode: {tagihan.periode_tagihan}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatRupiah(tagihan.sisa_tagihan)}
                        </p>
                        <Badge variant="destructive" className="text-xs">BELUM LUNAS</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Metode Pembayaran */}
        {selectedTagihan.length > 0 && (
          <div className="space-y-2">
            <Label className="text-base font-medium">3. Metode Pembayaran</Label>
            <Select value={metodePembayaran} onValueChange={(v) => setMetodePembayaran(v as MetodePembayaran)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tunai">
                  <div className="flex items-center gap-2">
                    <span>💵</span> Tunai
                  </div>
                </SelectItem>
                <SelectItem value="transfer">
                  <div className="flex items-center gap-2">
                    <span>🏦</span> Transfer Bank
                  </div>
                </SelectItem>
                <SelectItem value="qris">
                  <div className="flex items-center gap-2">
                    <span>📱</span> QRIS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Step 4: Keterangan */}
        {selectedTagihan.length > 0 && (
          <div className="space-y-2">
            <Label className="text-base font-medium">4. Keterangan (Opsional)</Label>
            <Input
              placeholder="Contoh: Dibayar oleh orang tua siswa"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>
        )}

        {/* Ringkasan Pembayaran */}
        {selectedTagihan.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Ringkasan Pembayaran
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tagihan</span>
                <span className="font-medium">{formatRupiah(totalNominal)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  Platform Fee (2.5%)
                  {platformFeeResult.isCapped && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">CAP</span>
                  )}
                </span>
                <div className="text-right">
                  <span className="font-medium text-blue-600">
                    {formatRupiah(platformFeeResult.fee)}
                  </span>
                  {platformFeeResult.isCapped && (
                    <p className="text-xs text-muted-foreground line-through">
                      Seharusnya {formatRupiah(platformFeeResult.originalFee)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-2 flex justify-between text-base">
                <span className="font-semibold">Total yang Diterima Sekolah</span>
                <span className="font-bold text-green-600">
                  {formatRupiah(totalNominal - platformFeeResult.fee)}
                </span>
              </div>
            </div>

            {/* Info Fee */}
            <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 flex items-start gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Informasi Platform Fee:</p>
                <p>
                  Fee sebesar {formatRupiah(platformFeeResult.fee)} akan ditambahkan ke 
                  tunggakan fee sekolah bulan ini dan harus dibayarkan ke pemilik platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tombol Submit */}
        {selectedTagihan.length > 0 && (
          <Button 
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            onClick={() => setShowConfirmDialog(true)}
            disabled={loadingPembayaran}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {loadingPembayaran ? 'Memproses...' : 'Proses Pembayaran'}
          </Button>
        )}
      </CardContent>

      {/* Dialog Konfirmasi */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Pastikan data pembayaran sudah benar sebelum diproses.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Siswa</span>
                <span className="font-medium">{selectedSiswa?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NISN</span>
                <span className="font-medium">{selectedSiswa?.nisn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Pembayaran</span>
                <span className="font-medium">{formatRupiah(totalNominal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium text-blue-600">{formatRupiah(platformFeeResult.fee)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Netto untuk Sekolah</span>
                <span className="font-bold text-green-600">
                  {formatRupiah(totalNominal - platformFeeResult.fee)}
                </span>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Setelah pembayaran tersimpan, platform fee akan ditambahkan ke 
                tunggakan fee sekolah.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirmDialog(false)}>
              Batal
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Ya, Proses
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Sukses */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              Pembayaran Berhasil!
            </DialogTitle>
            <DialogDescription className="text-center">
              Pembayaran telah tercatat dalam sistem.
            </DialogDescription>
          </DialogHeader>
          
          {pembayaranResult && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kode Transaksi</span>
                <span className="font-mono font-medium">{pembayaranResult.data?.kode_transaksi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatRupiah(pembayaranResult.data?.total_nominal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium text-blue-600">
                  {formatRupiah(pembayaranResult.platformFee?.fee || 0)}
                </span>
              </div>
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

// =====================================================
// BOS PAGE
// =====================================================

import { useState } from 'react';
import { FormPengeluaranBOS } from '@/components/bos/FormPengeluaranBOS';
import { ExportLPJ } from '@/components/bos/ExportLPJ';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  TrendingUp,
  DollarSign,
  Users,
  AlertOctagon
} from 'lucide-react';
import { formatRupiah } from '@/utils/platformFee';

interface BOSPageProps {
  sekolahId: string;
  adminName: string;
}

// Data dummy untuk demo
const dummyBOSData = {
  totalBudget: 420000000,
  currentUsage: {
    honor_guru_non_pns: 150000000, // 35.71%
    honor_karyawan: 25000000,
    atk: 20000000,
    sarpras: 50000000, // 11.90%
    perawatan: 10000000,
    transport: 5000000,
    listrik: 8000000,
    air: 3000000,
    internet: 5000000,
    kegiatan: 15000000,
    lainnya: 5000000
  }
};

export function BOSPage({ sekolahId, adminName }: BOSPageProps) {
  const [activeTab, setActiveTab] = useState('input');

  // Hitung total penggunaan
  const totalUsed = Object.values(dummyBOSData.currentUsage).reduce((a, b) => a + b, 0);
  const sisaSaldo = dummyBOSData.totalBudget - totalUsed;
  
  // Hitung persentase per kategori
  const getPercentage = (nominal: number) => (nominal / dummyBOSData.totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Anggaran</p>
                <p className="text-lg font-bold">{formatRupiah(dummyBOSData.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terpakai</p>
                <p className="text-lg font-bold">{formatRupiah(totalUsed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sisa Saldo</p>
                <p className="text-lg font-bold">{formatRupiah(sisaSaldo)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Siswa</p>
                <p className="text-lg font-bold">350 orang</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Batas Kategori */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-purple-600" />
            Monitoring Batas Kategori (Juknis 2026)
          </CardTitle>
          <CardDescription>
            Pantau penggunaan dana per kategori sesuai batasan Permendikdasmen No. 8/2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Honor Guru */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Honor Guru Non-PNS</span>
                  <Badge variant="secondary">Maks 50%</Badge>
                </div>
                <span className="text-sm font-medium">
                  {formatRupiah(dummyBOSData.currentUsage.honor_guru_non_pns)} 
                  ({getPercentage(dummyBOSData.currentUsage.honor_guru_non_pns).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(dummyBOSData.currentUsage.honor_guru_non_pns / (dummyBOSData.totalBudget * 0.5)) * 100} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                Sisa yang bisa digunakan: {formatRupiah((dummyBOSData.totalBudget * 0.5) - dummyBOSData.currentUsage.honor_guru_non_pns)}
              </p>
            </div>

            {/* Sarpras */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Sarana dan Prasarana</span>
                  <Badge variant="secondary">Maks 20%</Badge>
                </div>
                <span className="text-sm font-medium">
                  {formatRupiah(dummyBOSData.currentUsage.sarpras)} 
                  ({getPercentage(dummyBOSData.currentUsage.sarpras).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(dummyBOSData.currentUsage.sarpras / (dummyBOSData.totalBudget * 0.2)) * 100} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                Sisa yang bisa digunakan: {formatRupiah((dummyBOSData.totalBudget * 0.2) - dummyBOSData.currentUsage.sarpras)}
              </p>
            </div>
          </div>

          {/* Status Kepatuhan */}
          <div className="mt-6 flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium">
              Status: PATUH terhadap Juknis 2026
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Input Pengeluaran</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
          <TabsTrigger value="export">Export LPJ</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormPengeluaranBOS 
              sekolahId={sekolahId}
              adminName={adminName}
              totalBudget={dummyBOSData.totalBudget}
              currentUsagePerKategori={dummyBOSData.currentUsage}
            />
            
            {/* Info Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Panduan Penggunaan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Alur Input Pengeluaran
                  </h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Pilih kategori pengeluaran</li>
                    <li>Isi uraian dengan jelas</li>
                    <li>Masukkan nominal pengeluaran</li>
                    <li>Sistem akan validasi otomatis</li>
                    <li>Simpan jika validasi berhasil</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Batasan Penting
                  </h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Honor Guru Non-PNS maksimal 50%</li>
                    <li>Sarpras maksimal 20%</li>
                    <li>Sistem akan menolak jika melebihi batas</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Selalu simpan bukti kwitansi untuk setiap 
                    pengeluaran. Dokumen ini diperlukan untuk LPJ.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="riwayat" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pengeluaran BOS</CardTitle>
              <CardDescription>
                Daftar semua pengeluaran BOS yang telah tercatat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Fitur riwayat lengkap akan segera hadir</p>
                <p className="text-sm">Data pengeluaran akan ditampilkan di sini</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExportLPJ sekolahId={sekolahId} />
            
            {/* Info Export */}
            <Card>
              <CardHeader>
                <CardTitle>Format LPJ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Isi Laporan</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Cover/Sampul laporan</li>
                    <li>Daftar penerimaan dana BOS</li>
                    <li>Daftar pengeluaran per kategori</li>
                    <li>Rekapitulasi penggunaan dana</li>
                    <li>Status kepatuhan Juknis</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Format yang Tersedia</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Excel (.xlsx) - Format lengkap</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">CSV - Untuk import ARKAS</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

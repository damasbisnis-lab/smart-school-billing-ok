// =====================================================
// PLATFORM FEE PAGE
// =====================================================
// Halaman untuk melihat detail tunggakan platform fee
// =====================================================

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Info,
  Download
} from 'lucide-react';
import { useTunggakanFee, usePembayaran } from '@/hooks/useSupabase';
import { formatRupiah } from '@/utils/platformFee';
import type { TunggakanFeeSekolah, PembayaranTunai } from '@/types';

interface PlatformFeePageProps {
  sekolahId: string;
}

export function PlatformFeePage({ sekolahId }: PlatformFeePageProps) {
  const { getTunggakanBySekolah, getTunggakanBulanIni, loading: loadingTunggakan } = useTunggakanFee();
  const { getPembayaranBySekolah, loading: loadingPembayaran } = usePembayaran();
  
  const [tunggakanList, setTunggakanList] = useState<TunggakanFeeSekolah[]>([]);
  const [tunggakanBulanIni, setTunggakanBulanIni] = useState<TunggakanFeeSekolah | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<PembayaranTunai[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [tunggakan, bulanIni, transaksi] = await Promise.all([
        getTunggakanBySekolah(sekolahId),
        getTunggakanBulanIni(sekolahId),
        getPembayaranBySekolah(sekolahId, 20)
      ]);
      
      setTunggakanList(tunggakan);
      setTunggakanBulanIni(bulanIni);
      setRecentTransactions(transaksi);
    };
    
    fetchData();
  }, [sekolahId, getTunggakanBySekolah, getTunggakanBulanIni, getPembayaranBySekolah]);

  // Hitung total
  const totalSemuaFee = tunggakanList.reduce((sum, t) => sum + t.total_platform_fee, 0);
  const totalBelumDibayar = tunggakanList.reduce((sum, t) => sum + t.sisa_fee_belum_dibayar, 0);
  const totalSudahDibayar = tunggakanList.reduce((sum, t) => sum + t.total_fee_dibayar, 0);
  
  // Log untuk debugging
  console.log('Total semua fee:', totalSemuaFee);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fee Bulan Ini</p>
                <p className="text-lg font-bold">
                  {formatRupiah(tunggakanBulanIni?.total_platform_fee || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Belum Dibayar</p>
                <p className="text-lg font-bold text-red-600">
                  {formatRupiah(totalBelumDibayar)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
                <p className="text-lg font-bold text-green-600">
                  {formatRupiah(totalSudahDibayar)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transaksi</p>
                <p className="text-lg font-bold">
                  {tunggakanBulanIni?.total_transaksi || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-start gap-4">
          <Info className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Informasi Platform Fee</h3>
            <p className="text-blue-100 text-sm">
              Platform fee adalah biaya layanan sebesar 2.5% dari setiap transaksi 
              pembayaran tunai yang dicatat. Fee ini dikenakan kepada sekolah sebagai 
              pengguna platform dan harus dibayarkan setiap akhir bulan.
            </p>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Rate: 2.5%</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Max: Rp 750.000/transaksi</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Penagihan: Bulanan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tunggakan">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tunggakan">Tunggakan per Periode</TabsTrigger>
          <TabsTrigger value="transaksi">Detail Transaksi</TabsTrigger>
          <TabsTrigger value="cara-bayar">Cara Pembayaran</TabsTrigger>
        </TabsList>

        <TabsContent value="tunggakan" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daftar Tunggakan Platform Fee
              </CardTitle>
              <CardDescription>
                Ringkasan platform fee per bulan yang harus dibayar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTunggakan ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : tunggakanList.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada data tunggakan</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead className="text-right">Transaksi</TableHead>
                      <TableHead className="text-right">Total Nominal</TableHead>
                      <TableHead className="text-right">Platform Fee</TableHead>
                      <TableHead className="text-right">Sisa</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tunggakanList.map((tunggakan) => (
                      <TableRow key={tunggakan.id}>
                        <TableCell className="font-medium">
                          {tunggakan.periode_bulan}
                        </TableCell>
                        <TableCell className="text-right">
                          {tunggakan.total_transaksi}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(tunggakan.total_nominal_masuk)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(tunggakan.total_platform_fee)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={tunggakan.sisa_fee_belum_dibayar > 0 ? 'text-red-600 font-medium' : ''}>
                            {formatRupiah(tunggakan.sisa_fee_belum_dibayar)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={tunggakan.sisa_fee_belum_dibayar === 0 ? 'success' : 'destructive'}
                          >
                            {tunggakan.sisa_fee_belum_dibayar === 0 ? 'LUNAS' : 'BELUM LUNAS'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transaksi" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detail Transaksi & Platform Fee
              </CardTitle>
              <CardDescription>
                Daftar transaksi dengan rincian platform fee masing-masing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPembayaran ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada transaksi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Transaksi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead className="text-right">Fee (2.5%)</TableHead>
                      <TableHead className="text-center">Cap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((trx) => (
                      <TableRow key={trx.id}>
                        <TableCell className="font-mono text-xs">
                          {trx.kode_transaksi}
                        </TableCell>
                        <TableCell>
                          {new Date(trx.tanggal_bayar).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(trx.total_nominal)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-blue-600">
                            {formatRupiah(trx.platform_fee_calculated)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {trx.platform_fee_capped ? (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                              CAP
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cara-bayar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cara Pembayaran Platform Fee</CardTitle>
              <CardDescription>
                Panduan pembayaran platform fee ke pemilik platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Cek Total Tunggakan</h4>
                    <p className="text-sm text-muted-foreground">
                      Lihat total platform fee yang harus dibayar di tabel tunggakan.
                      Total saat ini: <strong>{formatRupiah(totalBelumDibayar)}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Transfer ke Rekening Platform</h4>
                    <p className="text-sm text-muted-foreground">
                      Bank BCA: 123-456-7890<br />
                      Atas Nama: PT Smart School Indonesia<br />
                      Berita: FEE-[NPSN SEKOLAH]-[PERIODE]
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Konfirmasi Pembayaran</h4>
                    <p className="text-sm text-muted-foreground">
                      Kirim bukti transfer ke WhatsApp: 0812-3456-7890<br />
                      atau email: finance@smartschool.id
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Tunggu Verifikasi</h4>
                    <p className="text-sm text-muted-foreground">
                      Tim finance akan memverifikasi pembayaran dalam 1x24 jam.
                      Status akan berubah menjadi "LUNAS".
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">Penting!</p>
                  <p className="text-sm text-yellow-700">
                    Pembayaran platform fee jatuh tempo setiap tanggal 10 bulan berikutnya.
                    Keterlambatan akan dikenakan denda 1% per hari.
                  </p>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

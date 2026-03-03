// =====================================================
// WIDGET: RINGKASAN PLATFORM FEE BULAN INI
// =====================================================
// Menampilkan total tagihan platform fee yang harus 
// dibayar sekolah ke pemilik platform
// =====================================================

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  TrendingUp,
  Calendar,
  Info
} from 'lucide-react';
import { useTunggakanFee } from '@/hooks/useSupabase';
import { formatRupiah } from '@/utils/platformFee';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PlatformFeeWidgetProps {
  sekolahId: string;
}

export function PlatformFeeWidget({ sekolahId }: PlatformFeeWidgetProps) {
  const { getTunggakanBulanIni, getTunggakanBySekolah, loading } = useTunggakanFee();
  const [tunggakanBulanIni, setTunggakanBulanIni] = useState<Awaited<ReturnType<typeof getTunggakanBulanIni>>>(null);
  const [historiTunggakan, setHistoriTunggakan] = useState<Awaited<ReturnType<typeof getTunggakanBySekolah>>>([]);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const bulanIni = await getTunggakanBulanIni(sekolahId);
      setTunggakanBulanIni(bulanIni);
      
      const histori = await getTunggakanBySekolah(sekolahId);
      setHistoriTunggakan(histori);
    };
    
    fetchData();
  }, [sekolahId, getTunggakanBulanIni, getTunggakanBySekolah]);

  // Hitung total dari semua periode
  const totalSemuaFee = historiTunggakan.reduce((sum, t) => sum + t.total_platform_fee, 0);
  const totalBelumDibayar = historiTunggakan.reduce((sum, t) => sum + t.sisa_fee_belum_dibayar, 0);
  const totalSudahDibayar = historiTunggakan.reduce((sum, t) => sum + t.total_fee_dibayar, 0);

  // Status warna berdasarkan jumlah
  const getStatusColor = (sisa: number) => {
    if (sisa === 0) return 'success';
    if (sisa > 1000000) return 'destructive';
    return 'warning';
  };

  return (
    <>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Platform Fee Bulan Ini
              </CardTitle>
              <CardDescription>
                Biaya layanan yang harus disetor ke pemilik platform
              </CardDescription>
            </div>
            <Badge variant={getStatusColor(tunggakanBulanIni?.sisa_fee_belum_dibayar || 0)}>
              {tunggakanBulanIni?.sisa_fee_belum_dibayar === 0 ? 'LUNAS' : 'BELUM LUNAS'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Nominal Utama */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fee Bulan Ini</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatRupiah(tunggakanBulanIni?.total_platform_fee || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Sisa yang Harus Dibayar</p>
                  <p className={`text-2xl font-semibold ${
                    (tunggakanBulanIni?.sisa_fee_belum_dibayar || 0) > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatRupiah(tunggakanBulanIni?.sisa_fee_belum_dibayar || 0)}
                  </p>
                </div>
              </div>

              {/* Info Transaksi */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-700">
                    {tunggakanBulanIni?.total_transaksi || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Transaksi</p>
                </div>
                <div className="text-center border-x">
                  <p className="text-2xl font-semibold text-gray-700">
                    {formatRupiah(tunggakanBulanIni?.total_nominal_masuk || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Masuk</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-700">2.5%</p>
                  <p className="text-xs text-muted-foreground">Rate Fee</p>
                </div>
              </div>

              {/* Info Capping */}
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  <strong>Info Capping:</strong> Setiap transaksi dikenakan fee 2.5% 
                  dengan batas maksimal Rp 750.000 per transaksi.
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowDetail(true)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Lihat Detail
                </Button>
                {(tunggakanBulanIni?.sisa_fee_belum_dibayar || 0) > 0 && (
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bayar Fee
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detail */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detail Tunggakan Platform Fee
            </DialogTitle>
            <DialogDescription>
              Riwayat platform fee dari semua periode
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Ringkasan Total */}
            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {formatRupiah(totalSemuaFee)}
                </p>
                <p className="text-xs text-muted-foreground">Total Semua Fee</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {formatRupiah(totalSudahDibayar)}
                </p>
                <p className="text-xs text-muted-foreground">Sudah Dibayar</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${totalBelumDibayar > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatRupiah(totalBelumDibayar)}
                </p>
                <p className="text-xs text-muted-foreground">Belum Dibayar</p>
              </div>
            </div>

            {/* Tabel Histori */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Transaksi</TableHead>
                  <TableHead className="text-right">Total Fee</TableHead>
                  <TableHead className="text-right">Sisa</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historiTunggakan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Belum ada data tunggakan
                    </TableCell>
                  </TableRow>
                ) : (
                  historiTunggakan.map((tunggakan) => (
                    <TableRow key={tunggakan.id}>
                      <TableCell className="font-medium">
                        {tunggakan.periode_bulan}
                      </TableCell>
                      <TableCell className="text-right">
                        {tunggakan.total_transaksi}
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
                          className="text-xs"
                        >
                          {tunggakan.sisa_fee_belum_dibayar === 0 ? 'LUNAS' : 'BELUM'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

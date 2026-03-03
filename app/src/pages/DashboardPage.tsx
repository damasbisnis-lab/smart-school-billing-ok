// =====================================================
// DASHBOARD PAGE
// =====================================================

import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { PlatformFeeWidget } from '@/components/dashboard/PlatformFeeWidget';
import { FormPembayaranTunai } from '@/components/siswa/FormPembayaranTunai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';

interface DashboardPageProps {
  sekolahId: string;
  adminName: string;
}

export function DashboardPage({ sekolahId, adminName }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <DashboardSummary sekolahId={sekolahId} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form Pembayaran */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="pembayaran" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pembayaran">Input Pembayaran</TabsTrigger>
              <TabsTrigger value="transaksi">Transaksi Terbaru</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pembayaran" className="mt-4">
              <FormPembayaranTunai sekolahId={sekolahId} adminName={adminName} />
            </TabsContent>
            
            <TabsContent value="transaksi" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaksi Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentTransactions sekolahId={sekolahId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Platform Fee */}
        <div className="space-y-6">
          <PlatformFeeWidget sekolahId={sekolahId} />
          
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informasi Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Platform</span>
                <span className="font-medium">2.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batas Maksimal</span>
                <span className="font-medium">Rp 750.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Periode Penagihan</span>
                <span className="font-medium">Bulanan</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Platform fee akan ditagihkan setiap akhir bulan. 
                  Pastikan untuk membayar tepat waktu.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

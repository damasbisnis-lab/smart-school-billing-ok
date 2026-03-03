// =====================================================
// SMART SCHOOL BILLING & BOS MANAGER
// =====================================================
// Aplikasi SaaS untuk manajemen pembayaran sekolah dan
// dana BOS dengan platform fee otomatis
// =====================================================

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardPage } from '@/pages/DashboardPage';
import { BOSPage } from '@/pages/BOSPage';
import { PlatformFeePage } from '@/pages/PlatformFeePage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  School,
  CreditCard,
  BookOpen
} from 'lucide-react';

// Konfigurasi aplikasi
const APP_CONFIG = {
  sekolahId: '550e8400-e29b-41d4-a716-446655440000', // UUID dummy
  adminName: 'Bendahara Sekolah',
  sekolahName: 'SMA Negeri 1 Contoh',
  npsn: '20201234'
};

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Render konten berdasarkan menu aktif
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardPage 
            sekolahId={APP_CONFIG.sekolahId} 
            adminName={APP_CONFIG.adminName} 
          />
        );
      
      case 'siswa':
        return <SiswaPage />;
      
      case 'pembayaran':
        return (
          <DashboardPage 
            sekolahId={APP_CONFIG.sekolahId} 
            adminName={APP_CONFIG.adminName} 
          />
        );
      
      case 'bos':
        return (
          <BOSPage 
            sekolahId={APP_CONFIG.sekolahId} 
            adminName={APP_CONFIG.adminName} 
          />
        );
      
      case 'platform-fee':
        return (
          <PlatformFeePage 
            sekolahId={APP_CONFIG.sekolahId} 
          />
        );
      
      case 'laporan':
        return <LaporanPage />;
      
      case 'pengaturan':
        return <PengaturanPage />;
      
      default:
        return (
          <DashboardPage 
            sekolahId={APP_CONFIG.sekolahId} 
            adminName={APP_CONFIG.adminName} 
          />
        );
    }
  };

  // Get page title
  const getPageTitle = () => {
    const titles: Record<string, { title: string; subtitle?: string }> = {
      dashboard: { title: 'Dashboard', subtitle: 'Ringkasan data sekolah' },
      siswa: { title: 'Data Siswa', subtitle: 'Kelola data siswa' },
      pembayaran: { title: 'Pembayaran', subtitle: 'Input dan kelola pembayaran' },
      bos: { title: 'Dana BOS', subtitle: 'Kelola dana BOS sesuai Juknis 2026' },
      'platform-fee': { title: 'Platform Fee', subtitle: 'Kelola biaya platform' },
      laporan: { title: 'Laporan', subtitle: 'Export dan cetak laporan' },
      pengaturan: { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' }
    };
    return titles[activeMenu] || { title: 'Dashboard' };
  };

  const pageInfo = getPageTitle();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          activeMenu={activeMenu} 
          onMenuChange={setActiveMenu}
          platformFeeCount={2}
        />
      </div>

      {/* Sidebar - Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar 
              activeMenu={activeMenu} 
              onMenuChange={(menu) => {
                setActiveMenu(menu);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuClick={() => setMobileMenuOpen(true)}
          userName={APP_CONFIG.adminName}
          userRole="Bendahara"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// =====================================================
// HALAMAN SEMENTARA (PLACEHOLDER)
// =====================================================

function SiswaPage() {
  const siswaDummy = [
    { nisn: '0012345678', nama: 'Ahmad Fauzi', kelas: 'X IPA 1', status: 'aktif' },
    { nisn: '0012345679', nama: 'Budi Santoso', kelas: 'X IPA 2', status: 'aktif' },
    { nisn: '0012345680', nama: 'Citra Dewi', kelas: 'XI IPS 1', status: 'aktif' },
    { nisn: '0012345681', nama: 'Dian Pratama', kelas: 'XII IPA 1', status: 'aktif' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari siswa..." className="pl-10 w-64" />
          </div>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Siswa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">NISN</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Nama</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Kelas</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {siswaDummy.map((siswa, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{siswa.nisn}</td>
                    <td className="p-3 font-medium">{siswa.nama}</td>
                    <td className="p-3">{siswa.kelas}</td>
                    <td className="p-3">
                      <Badge variant="success">{siswa.status}</Badge>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">Detail</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LaporanPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Laporan Pembayaran</h3>
                <p className="text-sm text-muted-foreground">Rekap pembayaran siswa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Laporan BOS</h3>
                <p className="text-sm text-muted-foreground">LPJ dan rekap BOS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Laporan Platform Fee</h3>
                <p className="text-sm text-muted-foreground">Rekap biaya platform</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Format Laporan</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>PDF - Untuk arsip dan cetak</li>
              <li>Excel - Untuk analisis lebih lanjut</li>
              <li>CSV - Untuk import ke sistem lain</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Export laporan secara rutin setiap akhir bulan 
              untuk arsip dan keperluan audit.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PengaturanPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Informasi Sekolah
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Nama Sekolah</label>
              <Input value="SMA Negeri 1 Contoh" readOnly />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">NPSN</label>
              <Input value="20201234" readOnly />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Alamat</label>
            <Input value="Jl. Pendidikan No. 1" readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Platform Fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Persentase Platform Fee</p>
              <p className="text-sm text-muted-foreground">Biaya yang dikenakan per transaksi</p>
            </div>
            <Badge variant="secondary" className="text-lg">2.5%</Badge>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Batas Maksimal (Cap)</p>
              <p className="text-sm text-muted-foreground">Maksimal fee per transaksi</p>
            </div>
            <Badge variant="secondary" className="text-lg">Rp 750.000</Badge>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              Pengaturan platform fee hanya dapat diubah oleh pemilik platform.
              Hubungi support untuk informasi lebih lanjut.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;

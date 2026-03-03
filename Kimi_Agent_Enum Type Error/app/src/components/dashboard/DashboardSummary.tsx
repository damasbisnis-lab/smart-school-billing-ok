// =====================================================
// DASHBOARD SUMMARY - RINGKASAN UTAMA
// =====================================================
// Menampilkan ringkasan data sekolah secara keseluruhan
// =====================================================

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useDashboard } from '@/hooks/useSupabase';
import { formatRupiah } from '@/utils/platformFee';
import type { DashboardSummary as DashboardSummaryType } from '@/types';

interface DashboardSummaryProps {
  sekolahId: string;
}

export function DashboardSummary({ sekolahId }: DashboardSummaryProps) {
  const { getDashboardSummary, loading } = useDashboard();
  const [summary, setSummary] = useState<DashboardSummaryType | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const data = await getDashboardSummary(sekolahId);
      setSummary(data);
    };
    
    fetchSummary();
  }, [sekolahId, getDashboardSummary]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const stats = [
    {
      title: 'Total Siswa',
      value: summary.totalSiswa.toString(),
      subtitle: `${summary.siswaAktif} aktif`,
      icon: Users,
      color: 'blue',
      trend: '+5%'
    },
    {
      title: 'Pembayaran Bulan Ini',
      value: formatRupiah(summary.totalTerbayarBulanIni),
      subtitle: `${summary.totalTransaksiBulanIni} transaksi`,
      icon: CreditCard,
      color: 'green',
      trend: '+12%'
    },
    {
      title: 'Platform Fee',
      value: formatRupiah(summary.platformFeeBulanIni),
      subtitle: `Sisa: ${formatRupiah(summary.platformFeeBelumDibayar)}`,
      icon: DollarSign,
      color: 'purple',
      warning: summary.platformFeeBelumDibayar > 0
    },
    {
      title: 'Saldo BOS',
      value: formatRupiah(summary.sisaBOS),
      subtitle: `Dari ${formatRupiah(summary.totalBOSDiterima)}`,
      icon: BookOpen,
      color: 'orange',
      warning: summary.sisaBOS < summary.totalBOSDiterima * 0.2
    }
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    {stat.trend && (
                      <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getColorClass(stat.color)}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              
              {stat.warning && (
                <div className="mt-3 flex items-center gap-1 text-xs text-yellow-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Perlu perhatian</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Selamat Datang di Smart School Billing & BOS Manager
            </h3>
            <p className="text-blue-100 text-sm max-w-2xl">
              Kelola pembayaran siswa dan dana BOS dengan mudah. Sistem akan 
              otomatis menghitung platform fee 2.5% dengan batas maksimal Rp 750.000 
              per transaksi.
            </p>
            
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Validasi BOS Otomatis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Export LPJ ke Excel</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Platform Fee Transparan</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <Calendar className="h-16 w-16 text-white/30" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500 cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Input Pembayaran</p>
              <p className="text-sm text-muted-foreground">Catat pembayaran tunai siswa</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Input BOS</p>
              <p className="text-sm text-muted-foreground">Catat pengeluaran dana BOS</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500 cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Lihat Laporan</p>
              <p className="text-sm text-muted-foreground">Export LPJ dan ringkasan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

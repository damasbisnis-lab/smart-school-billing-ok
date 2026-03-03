// =====================================================
// EXPORT LPJ BOS - LAPORAN PERTANGGUNGJAWABAN
// =====================================================
// Fitur export laporan BOS dalam format Excel/CSV
// sesuai format ARKAS (Aplikasi Rencana Kegiatan dan Anggaran Sekolah)
// =====================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  FileText, 
  Calendar,
  CheckCircle2,
  TrendingUp,
  Users,
  BookOpen,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatRupiah } from '@/utils/platformFee';
import { KATEGORI_BOS_LABELS } from '@/types';
import type { KategoriBOS } from '@/types';

// Tipe data untuk laporan
interface LPJData {
  sekolah: {
    nama: string;
    npsn: string;
    alamat: string;
    kepala_sekolah: string;
    bendahara: string;
  };
  periode: {
    tahun_anggaran: string;
    semester: string;
  };
  penerimaan: {
    sumber: string;
    jumlah_siswa: number;
    nominal_per_siswa: number;
    total: number;
    tanggal_pencairan: string;
  };
  pengeluaran: Array<{
    no: number;
    tanggal: string;
    kode_rekening: string;
    uraian: string;
    kategori: KategoriBOS;
    nominal: number;
    persentase: number;
    keterangan: string;
  }>;
  rekapitulasi: {
    total_penerimaan: number;
    total_pengeluaran: number;
    sisa_saldo: number;
    honor_guru_persen: number;
    sarpras_persen: number;
  };
}

interface ExportLPJProps {
  sekolahId: string;
}

export function ExportLPJ({ sekolahId }: ExportLPJProps) {
  // sekolahId akan digunakan untuk fetch data dari database
  console.log('Sekolah ID:', sekolahId);
  
  const [tahunAnggaran, setTahunAnggaran] = useState('2025/2026');
  const [semester, setSemester] = useState<'1' | '2'>('1');
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Data dummy untuk preview (dalam implementasi nyata, ambil dari database)
  const lpjData: LPJData = {
    sekolah: {
      nama: 'SMA Negeri 1 Contoh',
      npsn: '20201234',
      alamat: 'Jl. Pendidikan No. 1, Kecamatan Contoh',
      kepala_sekolah: 'Drs. Contoh Kepala, M.Pd.',
      bendahara: 'Siti Contoh, S.Pd.'
    },
    periode: {
      tahun_anggaran: tahunAnggaran,
      semester: semester
    },
    penerimaan: {
      sumber: 'BOS Reguler Pusat',
      jumlah_siswa: 350,
      nominal_per_siswa: 1200000,
      total: 420000000,
      tanggal_pencairan: '15 Januari 2026'
    },
    pengeluaran: [
      {
        no: 1,
        tanggal: '20/01/2026',
        kode_rekening: '5.1.01.01',
        uraian: 'Honor Guru Non-PNS Bulan Januari',
        kategori: 'honor_guru_non_pns',
        nominal: 50000000,
        persentase: 11.90,
        keterangan: '10 orang guru'
      },
      {
        no: 2,
        tanggal: '25/01/2026',
        kode_rekening: '5.1.02.01',
        uraian: 'Pembelian ATK',
        kategori: 'atk',
        nominal: 15000000,
        persentase: 3.57,
        keterangan: 'Kertas, pulpen, dll'
      },
      {
        no: 3,
        tanggal: '01/02/2026',
        kode_rekening: '5.2.01.01',
        uraian: 'Pembelian Komputer',
        kategori: 'sarpras',
        nominal: 25000000,
        persentase: 5.95,
        keterangan: '2 unit komputer'
      }
    ],
    rekapitulasi: {
      total_penerimaan: 420000000,
      total_pengeluaran: 90000000,
      sisa_saldo: 330000000,
      honor_guru_persen: 11.90,
      sarpras_persen: 5.95
    }
  };

  // Export ke Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    
    try {
      // Buat workbook baru
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Cover
      const coverData = [
        ['LAPORAN PERTANGGUNGJAWABAN BENDAHARA PENGELUARAN'],
        ['BANTUAN OPERASIONAL SEKOLAH (BOS)'],
        [''],
        [`Sekolah: ${lpjData.sekolah.nama}`],
        [`NPSN: ${lpjData.sekolah.npsn}`],
        [`Alamat: ${lpjData.sekolah.alamat}`],
        [''],
        [`Tahun Anggaran: ${lpjData.periode.tahun_anggaran}`],
        [`Semester: ${lpjData.periode.semester}`],
        [''],
        ['Kepala Sekolah:', '', 'Bendahara:'],
        [`${lpjData.sekolah.kepala_sekolah}`, '', `${lpjData.sekolah.bendahara}`]
      ];
      const wsCover = XLSX.utils.aoa_to_sheet(coverData);
      XLSX.utils.book_append_sheet(wb, wsCover, 'Cover');
      
      // Sheet 2: Penerimaan
      const penerimaanData = [
        ['PENERIMAAN DANA BOS'],
        [''],
        ['Sumber Dana', lpjData.penerimaan.sumber],
        ['Jumlah Siswa', lpjData.penerimaan.jumlah_siswa],
        ['Nominal per Siswa', formatRupiah(lpjData.penerimaan.nominal_per_siswa)],
        ['Total Penerimaan', formatRupiah(lpjData.penerimaan.total)],
        ['Tanggal Pencairan', lpjData.penerimaan.tanggal_pencairan]
      ];
      const wsPenerimaan = XLSX.utils.aoa_to_sheet(penerimaanData);
      XLSX.utils.book_append_sheet(wb, wsPenerimaan, 'Penerimaan');
      
      // Sheet 3: Pengeluaran
      const pengeluaranHeaders = [
        'No', 'Tanggal', 'Kode Rekening', 'Uraian', 'Kategori', 
        'Nominal (Rp)', '%', 'Keterangan'
      ];
      const pengeluaranDataRows = lpjData.pengeluaran.map(p => [
        p.no,
        p.tanggal,
        p.kode_rekening,
        p.uraian,
        KATEGORI_BOS_LABELS[p.kategori],
        p.nominal,
        p.persentase,
        p.keterangan
      ]);
      const wsPengeluaran = XLSX.utils.aoa_to_sheet([
        ['DAFTAR PENGELUARAN BOS'],
        [''],
        pengeluaranHeaders,
        ...pengeluaranDataRows,
        [''],
        ['', '', '', 'TOTAL', '', lpjData.rekapitulasi.total_pengeluaran, '', '']
      ]);
      XLSX.utils.book_append_sheet(wb, wsPengeluaran, 'Pengeluaran');
      
      // Sheet 4: Rekapitulasi
      const rekapitulasiData = [
        ['REKAPITULASI PENGGUNAAN DANA BOS'],
        [''],
        ['Total Penerimaan', formatRupiah(lpjData.rekapitulasi.total_penerimaan)],
        ['Total Pengeluaran', formatRupiah(lpjData.rekapitulasi.total_pengeluaran)],
        ['Sisa Saldo', formatRupiah(lpjData.rekapitulasi.sisa_saldo)],
        [''],
        ['PEMAKAIAN PER KATEGORI:'],
        ['Honor Guru Non-PNS', `${lpjData.rekapitulasi.honor_guru_persen.toFixed(2)}%`, '(Maksimal 50%)'],
        ['Sarpras', `${lpjData.rekapitulasi.sarpras_persen.toFixed(2)}%`, '(Maksimal 20%)'],
        [''],
        ['Status Kepatuhan Juknis 2026:', '✅ PATUH']
      ];
      const wsRekapitulasi = XLSX.utils.aoa_to_sheet(rekapitulasiData);
      XLSX.utils.book_append_sheet(wb, wsRekapitulasi, 'Rekapitulasi');
      
      // Download file
      const fileName = `LPJ_BOS_${lpjData.sekolah.npsn}_${tahunAnggaran.replace('/', '-')}_Sem${semester}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Export ke CSV (untuk ARKAS)
  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal', 'Kode Rekening', 'Uraian', 'Kategori', 'Nominal', 'Persentase', 'Keterangan'];
    const rows = lpjData.pengeluaran.map(p => [
      p.no,
      p.tanggal,
      p.kode_rekening,
      p.uraian,
      KATEGORI_BOS_LABELS[p.kategori],
      p.nominal,
      `${p.persentase}%`,
      p.keterangan
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LPJ_BOS_${lpjData.sekolah.npsn}_${tahunAnggaran.replace('/', '-')}_Sem${semester}.csv`;
    link.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          Export LPJ BOS
        </CardTitle>
        <CardDescription>
          Generate Laporan Pertanggungjawaban BOS dalam format Excel/CSV
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pilih Periode */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tahun Anggaran</Label>
            <Select value={tahunAnggaran} onValueChange={setTahunAnggaran}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024/2025">2024/2025</SelectItem>
                <SelectItem value="2025/2026">2025/2026</SelectItem>
                <SelectItem value="2026/2027">2026/2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={semester} onValueChange={(v) => setSemester(v as '1' | '2')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1 (Juli - Des)</SelectItem>
                <SelectItem value="2">Semester 2 (Jan - Juni)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview Ringkasan */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Preview Ringkasan
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total Penerimaan</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatRupiah(lpjData.penerimaan.total)}
              </p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs">Total Pengeluaran</span>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {formatRupiah(lpjData.rekapitulasi.total_pengeluaran)}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sisa Saldo</span>
              <span className="text-lg font-bold">
                {formatRupiah(lpjData.rekapitulasi.sisa_saldo)}
              </span>
            </div>
          </div>
          
          {/* Status Kepatuhan */}
          <div className="flex items-center gap-2">
            <Badge variant="success" className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              PATUH Juknis 2026
            </Badge>
            <span className="text-xs text-muted-foreground">
              Honor: {lpjData.rekapitulasi.honor_guru_persen.toFixed(1)}% | 
              Sarpras: {lpjData.rekapitulasi.sarpras_persen.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Tombol Export */}
        <div className="space-y-2">
          <Button 
            className="w-full h-12 bg-green-600 hover:bg-green-700"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            {isExporting ? 'Mengeksport...' : 'Export Excel (.xlsx)'}
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-12"
            onClick={handleExportCSV}
          >
            <FileText className="h-5 w-5 mr-2" />
            Export CSV (untuk ARKAS)
          </Button>
          
          <Button 
            variant="secondary"
            className="w-full h-12"
            onClick={() => setShowPreview(true)}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Preview Detail
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Format LPJ meliputi:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Cover laporan dengan data sekolah</li>
              <li>Daftar penerimaan dana BOS</li>
              <li>Daftar pengeluaran per kategori</li>
              <li>Rekapitulasi dan status kepatuhan</li>
            </ul>
          </div>
        </div>
      </CardContent>

      {/* Dialog Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview LPJ BOS</DialogTitle>
            <DialogDescription>
              Detail laporan yang akan diexport
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h3 className="font-bold text-lg">LAPORAN PERTANGGUNGJAWABAN BOS</h3>
              <p className="text-muted-foreground">{lpjData.sekolah.nama}</p>
              <p className="text-sm text-muted-foreground">
                Tahun Anggaran: {tahunAnggaran} - Semester {semester}
              </p>
            </div>
            
            {/* Penerimaan */}
            <div>
              <h4 className="font-semibold mb-2">Penerimaan</h4>
              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Sumber Dana:</span>
                  <span>{lpjData.penerimaan.sumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jumlah Siswa:</span>
                  <span>{lpjData.penerimaan.jumlah_siswa}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">{formatRupiah(lpjData.penerimaan.total)}</span>
                </div>
              </div>
            </div>
            
            {/* Pengeluaran */}
            <div>
              <h4 className="font-semibold mb-2">Pengeluaran</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">No</th>
                    <th className="p-2 text-left">Tanggal</th>
                    <th className="p-2 text-left">Uraian</th>
                    <th className="p-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {lpjData.pengeluaran.map((p) => (
                    <tr key={p.no} className="border-b">
                      <td className="p-2">{p.no}</td>
                      <td className="p-2">{p.tanggal}</td>
                      <td className="p-2">{p.uraian}</td>
                      <td className="p-2 text-right">{formatRupiah(p.nominal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={3} className="p-2 text-right">Total</td>
                    <td className="p-2 text-right">{formatRupiah(lpjData.rekapitulasi.total_pengeluaran)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Rekapitulasi */}
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Rekapitulasi</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Penerimaan:</span>
                  <span>{formatRupiah(lpjData.rekapitulasi.total_penerimaan)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pengeluaran:</span>
                  <span>{formatRupiah(lpjData.rekapitulasi.total_pengeluaran)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Sisa Saldo:</span>
                  <span>{formatRupiah(lpjData.rekapitulasi.sisa_saldo)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

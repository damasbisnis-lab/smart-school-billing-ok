// =====================================================
// RECENT TRANSACTIONS
// =====================================================

import { useEffect, useState } from 'react';
import { usePembayaran } from '@/hooks/useSupabase';
import { formatRupiah } from '@/utils/platformFee';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CreditCard, TrendingUp, User } from 'lucide-react';
import type { PembayaranTunai } from '@/types';

interface RecentTransactionsProps {
  sekolahId: string;
  limit?: number;
}

export function RecentTransactions({ sekolahId, limit = 10 }: RecentTransactionsProps) {
  const { getPembayaranBySekolah, loading } = usePembayaran();
  const [transactions, setTransactions] = useState<PembayaranTunai[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await getPembayaranBySekolah(sekolahId, limit);
      setTransactions(data);
    };
    
    fetchTransactions();
  }, [sekolahId, limit, getPembayaranBySekolah]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Belum ada transaksi</p>
        <p className="text-sm">Transaksi pembayaran akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Siswa</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead className="text-right">Platform Fee</TableHead>
            <TableHead>Status Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((trx) => (
            <TableRow key={trx.id}>
              <TableCell className="font-mono text-xs">
                {trx.kode_transaksi}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm">{trx.siswa?.nama || '-'}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatRupiah(trx.total_nominal)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span className="text-sm text-blue-600">
                    {formatRupiah(trx.platform_fee_calculated)}
                  </span>
                  {trx.platform_fee_capped && (
                    <Badge variant="secondary" className="text-xs">CAP</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={trx.status_fee === 'sudah_dibayar' ? 'success' : 'destructive'}
                  className="text-xs"
                >
                  {trx.status_fee === 'sudah_dibayar' ? 'LUNAS' : 'BELUM'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

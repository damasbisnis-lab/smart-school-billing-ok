// =====================================================
// SIDEBAR NAVIGATION
// =====================================================

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BookOpen, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
  LogOut,
  DollarSign
} from 'lucide-react';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
};

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  platformFeeCount?: number;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'siswa', label: 'Data Siswa', icon: Users },
  { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
  { id: 'bos', label: 'Dana BOS', icon: BookOpen },
  { id: 'platform-fee', label: 'Platform Fee', icon: DollarSign, badge: 'NEW' },
  { id: 'laporan', label: 'Laporan', icon: FileText },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

export function Sidebar({ activeMenu, onMenuChange, platformFeeCount }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "bg-slate-900 text-white h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <School className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg truncate">Smart School</h1>
              <p className="text-xs text-slate-400">Billing & BOS</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs bg-purple-600 text-white">
                      {item.badge}
                    </Badge>
                  )}
                  {item.id === 'platform-fee' && platformFeeCount && platformFeeCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {platformFeeCount}
                    </Badge>
                  )}
                </>
              )}
              {isActive && collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-700 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Keluar</span>}
        </button>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}

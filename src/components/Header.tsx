import React from 'react';
import { ShoppingBag, Clock, ArrowLeft } from 'lucide-react';
import { StoreSettings } from '../types/martabak';
import { isStoreOpen, formatRupiah } from '../utils/formatters';

interface HeaderProps {
  settings: StoreSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  currentView: 'store' | 'admin';
  onViewChange: (view: 'store' | 'admin') => void;
  onOpenPromoModal: () => void;
  onLogoutAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  cartTotal,
  onOpenCart,
  currentView,
  onViewChange,
  onOpenPromoModal,
}) => {
  const storeStatus = isStoreOpen(settings);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 text-xs font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="shrink-0 bg-stone-950 text-amber-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
              PROMO
            </span>
            <span className="truncate">{settings.announcementText}</span>
          </div>
          <button
            onClick={onOpenPromoModal}
            className="shrink-0 text-stone-950 font-bold underline hover:text-stone-800 text-xs whitespace-nowrap cursor-pointer transition-colors"
          >
            Lihat Voucher
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onViewChange('store')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
              🥞
            </div>
            <div>
              <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                {settings.storeName}
              </div>
              <div className="text-[11px] text-amber-300/80 hidden sm:block truncate max-w-xs font-medium">
                {settings.tagline}
              </div>
            </div>
          </button>

          {/* Live Store Hours Indicator */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-stone-700 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span
              className={`font-semibold ${
                storeStatus.isOpen ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {storeStatus.statusText}
            </span>
            <span className="text-stone-400">({settings.openTime} - {settings.closeTime} WIB)</span>
          </div>
        </div>

        {/* Center / Nav Links for Customers */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
          <button
            onClick={() => onViewChange('store')}
            className={`transition-colors hover:text-amber-400 whitespace-nowrap cursor-pointer ${
              currentView === 'store' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Menu Martabak
          </button>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-amber-400 whitespace-nowrap flex items-center gap-1.5 text-emerald-400 font-medium"
          >
            <span>Hubungi WhatsApp Kasir</span>
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* If Owner is in Admin View: show return button */}
          {currentView === 'admin' ? (
            <button
              onClick={() => onViewChange('store')}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Tampilan Pembeli</span>
            </button>
          ) : (
            /* Regular Customer View: Cart Button */
            <button
              onClick={onOpenCart}
              className="relative px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm rounded-xl flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {cartCount > 0 && (
                <span className="bg-stone-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-black tabular-nums">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden md:inline pl-1 border-l border-stone-900/40 text-xs font-black tabular-nums">
                  {formatRupiah(cartTotal)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

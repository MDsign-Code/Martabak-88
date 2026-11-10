import React from 'react';
import { Clock, Star, Flame, Award, MapPin } from 'lucide-react';
import { StoreSettings } from '../types/martabak';
import { isStoreOpen } from '../utils/formatters';
import { IMAGES } from '../data/initialData';

interface HeroSectionProps {
  settings: StoreSettings;
  onExploreMenu: () => void;
  onOpenPromo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onExploreMenu,
  onOpenPromo,
}) => {
  const storeStatus = isStoreOpen(settings);

  return (
    <section className="relative overflow-hidden bg-stone-950 text-white border-b border-stone-800">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-radial from-amber-900/20 via-stone-950/80 to-stone-950 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status & Trust Badges */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border ${
                  storeStatus.isOpen
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{storeStatus.statusText}</span>
                <span className="text-stone-400">· {settings.openTime} - {settings.closeTime} WIB</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 text-amber-300 border border-stone-800 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{settings.ratingScore} ({settings.ratingCount}+ Ulasan Pelanggan)</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 text-stone-300 border border-stone-800">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>100% Halal & Higienis</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-100 leading-tight">
              Martabak Juara Rasa, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                Lumeran Wijsman & Telur Bebek Gurih
              </span>
            </h1>

            {/* Description */}
            <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Nikmati kelezatan martabak manis bersarang tebal nan empuk dengan butter Wijsman Belanda asli, serta martabak telur bebek krispi berlapis daging sapi bumbu rempah istimewa.
            </p>

            {/* Key Perks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-300">
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Fresh Dari Wajan</div>
                  <div className="text-[11px] text-stone-400">Dimasak saat dipesan</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Topping Bebas Pilih</div>
                  <div className="text-[11px] text-stone-400">Bisa mix sesukamu</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Antar Langsung</div>
                  <div className="text-[11px] text-stone-400">Order masuk WhatsApp</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreMenu}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>Lihat Menu & Pesan</span>
                <span className="text-base">👇</span>
              </button>

              <button
                onClick={onOpenPromo}
                className="px-5 py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30 hover:border-amber-400 font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Klaim Voucher Diskon</span>
                <span className="text-xs bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-black">
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Right Image Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/20 shadow-2xl group">
              <img
                src={IMAGES.hero}
                alt="Martabak Manis dan Martabak Telur Spesial"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

              {/* Float Information Tag */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-stone-900/90 backdrop-blur-md border border-stone-700/80 text-white flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-amber-400">Menu Rekomendasi Hari Ini</div>
                  <div className="text-sm font-extrabold text-stone-100">
                    Paket Combo Sultan (Manis Wijsman + Telur Bebek)
                  </div>
                </div>
                <button
                  onClick={onExploreMenu}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Pilih
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

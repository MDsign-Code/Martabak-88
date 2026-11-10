import React from 'react';
import { Plus, Flame, Clock } from 'lucide-react';
import { MenuItem } from '../types/martabak';
import { formatRupiah } from '../utils/formatters';

interface MenuCardProps {
  item: MenuItem;
  onSelectForCustomize: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelectForCustomize }) => {
  return (
    <div
      className={`group rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${
        !item.isAvailable ? 'opacity-70 grayscale-30' : ''
      }`}
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {item.isBestSeller && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 text-[11px] font-black px-2.5 py-1 rounded-md shadow-sm">
                <Flame className="w-3 h-3 fill-stone-950" />
                <span>Terlaris</span>
              </span>
            )}
            {item.category === 'manis' && (
              <span className="bg-stone-900/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Manis Bersarang
              </span>
            )}
            {item.category === 'telur' && (
              <span className="bg-stone-900/80 backdrop-blur-sm text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Gurih Renyah
              </span>
            )}
            {item.category === 'tipker' && (
              <span className="bg-stone-900/80 backdrop-blur-sm text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Tipis Kering Crispy
              </span>
            )}
          </div>

          {/* Prep time or portions */}
          {item.prepTimeMinutes && (
            <div className="absolute bottom-2.5 right-2.5 bg-stone-900/85 backdrop-blur-sm text-stone-200 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>~{item.prepTimeMinutes} mnt</span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow uppercase tracking-wider">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
          </div>

          {item.portions && (
            <div className="text-xs text-amber-700 font-semibold mb-2">
              Porsi: {item.portions}
            </div>
          )}

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer / Price and CTA */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-stone-100 flex items-center justify-between gap-3 mt-auto">
        <div>
          <div className="text-[11px] text-stone-500 font-medium">Mulai dari</div>
          <div className="text-base sm:text-lg font-black text-stone-950 tabular-nums">
            {formatRupiah(item.basePrice)}
          </div>
        </div>

        <button
          onClick={() => onSelectForCustomize(item)}
          disabled={!item.isAvailable}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            item.isAvailable
              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 hover:shadow active:scale-95'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{item.category === 'minuman' ? 'Pesan' : 'Kustomisasi'}</span>
        </button>
      </div>
    </div>
  );
};

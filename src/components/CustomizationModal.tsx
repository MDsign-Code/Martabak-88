import React, { useState } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';
import {
  MenuItem,
  CustomizationSelection,
  CartItem,
} from '../types/martabak';
import {
  DOUGH_OPTIONS,
  BUTTER_OPTIONS,
  SWEET_TOPPINGS,
  SAVORY_TOPPINGS,
  EGG_COUNTS,
} from '../data/initialData';
import { formatRupiah } from '../utils/formatters';

interface CustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !item) return null;

  // State for selections
  const [quantity, setQuantity] = useState<number>(1);

  // Sweet selections
  const [selectedDough, setSelectedDough] = useState<string>('Original Kuning Keemasan');
  const [doughPriceDiff, setDoughPriceDiff] = useState<number>(0);

  const [selectedButter, setSelectedButter] = useState<string>('Mentega Wijsman Asli Belanda');
  const [butterPriceDiff, setButterPriceDiff] = useState<number>(
    item.name.toLowerCase().includes('wijsman') ? 0 : 10000
  );

  const [portionSize, setPortionSize] = useState<'regular' | 'jumbo'>('regular');
  const [sweetnessLevel, setSweetnessLevel] = useState<
    'Normal' | 'Sedang (Less Sweet)' | 'Sedikit Susu' | 'Ekstra Susu Manis'
  >('Normal');

  // Savory selections
  const [eggType, setEggType] = useState<'ayam' | 'bebek'>('bebek');
  const [eggPriceDiff, setEggPriceDiff] = useState<number>(4000);
  const [eggCount, setEggCount] = useState<number>(3);
  const [eggCountDiff, setEggCountDiff] = useState<number>(6000);
  const [spicinessLevel, setSpicinessLevel] = useState<
    'Tidak Pedas' | 'Sedang' | 'Pedas Mantap' | 'Ekstra Pedas Mercon'
  >('Sedang');

  // Toppings
  const [selectedToppings, setSelectedToppings] = useState<{ id: string; name: string; price: number }[]>([]);

  // Special Notes
  const [notes, setNotes] = useState<string>('');

  // Handle topping toggle
  const toggleTopping = (topping: { id: string; name: string; price: number }) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  // Calculate Unit Price
  let unitPrice = item.basePrice;

  if (item.category === 'manis') {
    unitPrice += doughPriceDiff;
    unitPrice += butterPriceDiff;
    if (portionSize === 'jumbo') unitPrice += 15000;
  } else if (item.category === 'telur') {
    unitPrice += eggPriceDiff;
    unitPrice += eggCountDiff;
  }

  // Add toppings
  const toppingsTotal = selectedToppings.reduce((acc, curr) => acc + curr.price, 0);
  unitPrice += toppingsTotal;

  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const customization: CustomizationSelection = {
      dough: item.category === 'manis' ? selectedDough : undefined,
      butter: item.category === 'manis' ? selectedButter : undefined,
      portionSize: item.category === 'manis' ? portionSize : undefined,
      portionPriceDiff: portionSize === 'jumbo' ? 15000 : 0,
      eggType: item.category === 'telur' ? eggType : undefined,
      eggCount: item.category === 'telur' ? eggCount : undefined,
      eggPriceDiff: item.category === 'telur' ? eggPriceDiff + eggCountDiff : 0,
      sweetnessLevel: item.category === 'manis' ? sweetnessLevel : undefined,
      spicinessLevel: item.category === 'telur' ? spicinessLevel : undefined,
      selectedToppings,
      notes: notes.trim() || undefined,
    };

    const newCartItem: CartItem = {
      cartItemId: `${item.id}-${Date.now()}`,
      menuItem: item,
      customization,
      quantity,
      unitPrice,
      totalPrice,
    };

    onAddToCart(newCartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="relative p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-xs"
            />
            <div>
              <h3 className="font-extrabold text-stone-900 text-base sm:text-lg leading-tight">
                {item.name}
              </h3>
              <p className="text-xs text-stone-500 font-semibold tabular-nums">
                Harga Dasar: {formatRupiah(item.basePrice)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Customizations */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto text-stone-800 text-sm">
          {/* MARTABAK MANIS OPTIONS */}
          {item.category === 'manis' && (
            <>
              {/* Pilihan Adonan */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-900 flex items-center gap-1.5">
                    <span>1. Pilihan Rasa Adonan</span>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Wajib Pilih
                    </span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DOUGH_OPTIONS.map((dough) => (
                    <button
                      key={dough.id}
                      type="button"
                      onClick={() => {
                        setSelectedDough(dough.name);
                        setDoughPriceDiff(dough.price);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedDough === dough.name
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-stone-300"
                          style={{ backgroundColor: dough.colorHex || '#ccc' }}
                        />
                        <span className="font-semibold text-xs text-stone-900">{dough.name}</span>
                      </div>
                      <span className="text-xs text-stone-600 font-bold tabular-nums">
                        {dough.price > 0 ? `+${formatRupiah(dough.price)}` : 'Gratis'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pilihan Mentega */}
              <div className="space-y-2.5">
                <label className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>2. Pilihan Mentega / Butter</span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Rekomendasi Wijsman
                  </span>
                </label>
                <div className="space-y-2">
                  {BUTTER_OPTIONS.map((butter) => (
                    <button
                      key={butter.id}
                      type="button"
                      onClick={() => {
                        setSelectedButter(butter.name);
                        setButterPriceDiff(butter.price);
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedButter === butter.name
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-stone-900">{butter.name}</div>
                        <div className="text-[11px] text-stone-500">{butter.description}</div>
                      </div>
                      <span className="text-xs text-stone-800 font-bold tabular-nums shrink-0 pl-2">
                        {butter.price > 0 ? `+${formatRupiah(butter.price)}` : 'Gratis'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Porsi Ukuran Loyang */}
              <div className="space-y-2.5">
                <label className="font-bold text-stone-900">3. Ukuran Loyang</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPortionSize('regular')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      portionSize === 'regular'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900">Reguler (12 Potong)</div>
                      <div className="text-[11px] text-stone-500">Pas untuk 2-3 orang</div>
                    </div>
                    <span className="text-xs font-bold text-stone-600">Standar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPortionSize('jumbo')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      portionSize === 'jumbo'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900">Jumbo (16 Potong)</div>
                      <div className="text-[11px] text-stone-500">Porsi kumpul keluarga</div>
                    </div>
                    <span className="text-xs font-bold text-amber-700 tabular-nums">+15rb</span>
                  </button>
                </div>
              </div>

              {/* Tingkat Kemanisan */}
              <div className="space-y-2.5">
                <label className="font-bold text-stone-900">4. Tingkat Manis & Susu Kental Manis</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    ['Normal', 'Sedang (Less Sweet)', 'Sedikit Susu', 'Ekstra Susu Manis'] as const
                  ).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSweetnessLevel(lvl)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                        sweetnessLevel === lvl
                          ? 'border-amber-500 bg-amber-500 text-stone-950 font-bold'
                          : 'border-stone-200 text-stone-700 bg-white hover:border-stone-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MARTABAK TELUR OPTIONS */}
          {item.category === 'telur' && (
            <>
              {/* Jenis Telur */}
              <div className="space-y-2.5">
                <label className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>1. Pilihan Jenis Telur</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Wajib Pilih
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEggType('ayam');
                      setEggPriceDiff(0);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      eggType === 'ayam'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900">Telur Ayam Negeri</div>
                      <div className="text-[11px] text-stone-500">Gurih ringan klasik</div>
                    </div>
                    <span className="text-xs font-bold text-stone-600">Standar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEggType('bebek');
                      setEggPriceDiff(4000);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      eggType === 'bebek'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900">Telur Bebek Super ⭐</div>
                      <div className="text-[11px] text-stone-500">Lebih gurih, tebal & crispy</div>
                    </div>
                    <span className="text-xs font-bold text-amber-700 tabular-nums">+Rp 4.000</span>
                  </button>
                </div>
              </div>

              {/* Jumlah Butir Telur */}
              <div className="space-y-2.5">
                <label className="font-bold text-stone-900">2. Jumlah Butir Telur</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EGG_COUNTS.map((opt) => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => {
                        setEggCount(opt.count);
                        setEggCountDiff(opt.priceDiff);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        eggCount === opt.count
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900">{opt.label}</div>
                      <div className="text-[11px] font-bold text-amber-700 tabular-nums">
                        {opt.priceDiff > 0 ? `+${formatRupiah(opt.priceDiff)}` : 'Standar'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tingkat Kepedasan Kuah Cuka & Acar */}
              <div className="space-y-2.5">
                <label className="font-bold text-stone-900">3. Level Pedas Kuah Cuka & Acar Timun</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Tidak Pedas', 'Sedang', 'Pedas Mantap', 'Ekstra Pedas Mercon'] as const).map(
                    (spice) => (
                      <button
                        key={spice}
                        type="button"
                        onClick={() => setSpicinessLevel(spice)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                          spicinessLevel === spice
                            ? 'border-amber-500 bg-amber-500 text-stone-950 font-bold'
                            : 'border-stone-200 text-stone-700 bg-white hover:border-stone-300'
                        }`}
                      >
                        {spice}
                      </button>
                    )
                  )}
                </div>
              </div>
            </>
          )}

          {/* TOPPING TAMBAHAN (OPSIONAL) */}
          {(item.category === 'manis' || item.category === 'telur' || item.category === 'tipker') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Topping Tambahan (Opsional)</span>
                  <span className="text-[11px] text-stone-500">Bisa pilih lebih dari satu</span>
                </label>
                {selectedToppings.length > 0 && (
                  <span className="text-xs text-amber-700 font-bold">
                    +{formatRupiah(toppingsTotal)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(item.category === 'telur' ? SAVORY_TOPPINGS : SWEET_TOPPINGS).map((topping) => {
                  const isChecked = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      type="button"
                      onClick={() => toggleTopping(topping)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/70 text-stone-900'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center text-xs transition-colors ${
                            isChecked
                              ? 'bg-amber-500 border-amber-600 text-stone-950'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{topping.name}</span>
                      </div>
                      <span className="text-xs font-bold text-stone-900 tabular-nums pl-2">
                        +{formatRupiah(topping.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catatan Khusus */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-900 text-xs">
              Catatan Khusus untuk Koki (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Potong kecil-kecil, kuah cuka dipisah plastik, dll."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer / Quantity & CTA */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs font-bold text-stone-700">Jumlah:</span>
            <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-stone-600 hover:bg-stone-100 rounded-l-xl transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-black text-sm text-stone-900 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-stone-600 hover:bg-stone-100 rounded-r-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Tambah ke Pesanan</span>
            <span className="tabular-nums font-black">
              · {formatRupiah(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

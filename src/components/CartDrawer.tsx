import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  MapPin,
  Phone,
  User,
  CreditCard,
  QrCode,
  Truck,
  Store,
  Wallet,
  Coins,
  Send,
  AlertCircle,
} from 'lucide-react';
import {
  CartItem,
  PaymentMethod,
  DeliveryMethod,
  OrderCustomerInfo,
  PromoVoucher,
  StoreSettings,
  Order,
} from '../types/martabak';
import { formatRupiah, buildWhatsAppMessage } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  vouchers: PromoVoucher[];
  storeSettings: StoreSettings;
  onOrderCreated: (order: Order) => void;
  appliedPromoCode: string;
  setAppliedPromoCode: (code: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  vouchers,
  storeSettings,
  onOrderCreated,
  appliedPromoCode,
  setAppliedPromoCode,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate Subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  // Delivery fee calculation
  let deliveryFee = 0;
  if (deliveryMethod === 'delivery') {
    if (subtotal >= storeSettings.freeDeliveryThreshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = storeSettings.flatDeliveryFee;
    }
  }

  // Active Voucher Calculation
  const activeVoucher = vouchers.find(
    (v) => v.code.toUpperCase() === appliedPromoCode.toUpperCase()
  );

  let discountAmount = 0;
  if (activeVoucher && subtotal >= activeVoucher.minOrder) {
    if (activeVoucher.discountPercent) {
      let calc = (subtotal * activeVoucher.discountPercent) / 100;
      if (activeVoucher.maxDiscount && calc > activeVoucher.maxDiscount) {
        calc = activeVoucher.maxDiscount;
      }
      discountAmount = calc;
    } else if (activeVoucher.discountFlat) {
      discountAmount = activeVoucher.discountFlat;
    }

    if (activeVoucher.freeShipping) {
      deliveryFee = 0;
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyVoucher = () => {
    setVoucherError(null);
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;

    const matched = vouchers.find((v) => v.code.toUpperCase() === code);
    if (!matched) {
      setVoucherError('Kode voucher tidak ditemukan!');
      return;
    }

    if (subtotal < matched.minOrder) {
      setVoucherError(`Minimal belanja ${formatRupiah(matched.minOrder)} untuk pakai kupon ini!`);
      return;
    }

    setAppliedPromoCode(matched.code);
    setVoucherInput('');
  };

  const handleRemoveVoucher = () => {
    setAppliedPromoCode('');
    setVoucherError(null);
  };

  const handleSubmitOrder = () => {
    setFormError(null);

    if (cartItems.length === 0) {
      setFormError('Keranjang Anda masih kosong. Silakan pilih martabak favorit terlebih dahulu!');
      return;
    }

    if (!customerName.trim()) {
      setFormError('Mohon isi nama lengkap Anda.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 8) {
      setFormError('Mohon isi nomor WhatsApp yang valid untuk konfirmasi pesanan.');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      setFormError('Mohon isi alamat lengkap pengantaran dan patokan lokasi.');
      return;
    }

    const orderCode = `#MS-${Math.floor(1000 + Math.random() * 9000)}`;

    const customer: OrderCustomerInfo = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      deliveryMethod,
      deliveryAddress:
        deliveryMethod === 'delivery' ? deliveryAddress.trim() : 'Ambil Sendiri di Outlet',
      notes: customerNotes.trim() || undefined,
    };

    const { waUrl } = buildWhatsAppMessage({
      orderCode,
      customer,
      items: cartItems,
      subtotal,
      deliveryFee,
      discountAmount,
      appliedPromo: activeVoucher?.code,
      totalAmount,
      paymentMethod,
      storeSettings,
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode,
      customer,
      items: [...cartItems],
      subtotal,
      deliveryFee,
      discountAmount,
      appliedPromo: activeVoucher?.code,
      totalAmount,
      paymentMethod,
      status: 'baru',
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      whatsappUrl: waUrl,
    };

    onOrderCreated(newOrder);

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-lg bg-stone-50 h-full shadow-2xl flex flex-col justify-between text-stone-900 border-l border-stone-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
              Keranjang Pesanan ({cartItems.length} Item)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Error notice */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center text-3xl">
                🥞
              </div>
              <h3 className="font-bold text-stone-800 text-base">Keranjang Anda Masih Kosong</h3>
              <p className="text-xs max-w-xs mx-auto">
                Yuk pilih martabak manis favorit atau martabak telur gurih dengan topping sesukamu!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-500">
                Daftar Pesanan:
              </div>
              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-200"
                      />
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm leading-tight">
                          {item.menuItem.name}
                        </h4>
                        <div className="text-xs text-amber-700 font-bold tabular-nums">
                          {formatRupiah(item.unitPrice)} / porsi
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Hapus menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Customization Details Pills */}
                  <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg space-y-1">
                    {item.customization.dough && (
                      <div>
                        <span className="font-semibold text-stone-700">Adonan:</span>{' '}
                        {item.customization.dough}
                      </div>
                    )}
                    {item.customization.butter && (
                      <div>
                        <span className="font-semibold text-stone-700">Mentega:</span>{' '}
                        {item.customization.butter}
                      </div>
                    )}
                    {item.customization.portionSize && (
                      <div>
                        <span className="font-semibold text-stone-700">Ukuran:</span>{' '}
                        {item.customization.portionSize === 'jumbo' ? 'Jumbo 16 Potong' : 'Reguler 12 Potong'}
                      </div>
                    )}
                    {item.customization.eggType && (
                      <div>
                        <span className="font-semibold text-stone-700">Telur:</span>{' '}
                        Telur {item.customization.eggType === 'bebek' ? 'Bebek Super' : 'Ayam'} ({item.customization.eggCount} Butir)
                      </div>
                    )}
                    {item.customization.sweetnessLevel && (
                      <div>
                        <span className="font-semibold text-stone-700">Manis/Susu:</span>{' '}
                        {item.customization.sweetnessLevel}
                      </div>
                    )}
                    {item.customization.spicinessLevel && (
                      <div>
                        <span className="font-semibold text-stone-700">Kuah Cuka:</span>{' '}
                        {item.customization.spicinessLevel}
                      </div>
                    )}
                    {item.customization.selectedToppings &&
                      item.customization.selectedToppings.length > 0 && (
                        <div>
                          <span className="font-semibold text-stone-700">Ekstra Topping:</span>{' '}
                          {item.customization.selectedToppings.map((t) => t.name).join(', ')}
                        </div>
                      )}
                    {item.customization.notes && (
                      <div className="italic text-stone-500">
                        Catatan: &ldquo;{item.customization.notes}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Quantity & Item Subtotal */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1.5 text-stone-600 hover:bg-stone-200 rounded-l-lg transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-stone-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1.5 text-stone-600 hover:bg-stone-200 rounded-r-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-stone-900 tabular-nums">
                        {formatRupiah(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <>
              {/* Voucher Code Box */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kupon / Kode Promo Diskon</span>
                </label>

                {appliedPromoCode ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                        {appliedPromoCode}
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        Hemat {formatRupiah(discountAmount)}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-stone-500 hover:text-red-600 font-bold text-xs cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      placeholder="Contoh: SULTAN20"
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Pasang
                    </button>
                  </div>
                )}
                {voucherError && <p className="text-[11px] text-red-600">{voucherError}</p>}
              </div>

              {/* Delivery Method Switcher */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-stone-900 text-xs">Pilihan Pengambilan Pesanan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      deliveryMethod === 'delivery'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-stone-900">Antar ke Alamat</div>
                      <div className="text-[11px] text-stone-500">
                        {subtotal >= storeSettings.freeDeliveryThreshold
                          ? 'Gratis Ongkir'
                          : formatRupiah(storeSettings.flatDeliveryFee)}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-stone-900">Ambil di Outlet</div>
                      <div className="text-[11px] text-stone-500">Takeaway (0 Ongkir)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3 pt-2 bg-white p-4 rounded-xl border border-stone-200">
                <div className="font-bold text-stone-900 text-xs">Informasi Pemesan</div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Nama Lengkap *</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>Nomor WhatsApp Aktif *</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>Alamat Lengkap Pengantaran & Patokan *</span>
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Jalan, No. Rumah, RT/RW, Kecamatan, Patokan (misal: Pagar hitam depan musholla)"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">
                    Catatan Tambahan untuk Kasir / Kurir (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Contoh: Jangan dibunyikan bel, hubungi WA jika sampai"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2.5 pt-2">
                <label className="font-bold text-stone-900 text-xs">Pilihan Sistem Pembayaran</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/30 font-bold'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>QRIS Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bca')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'bca'
                        ? 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/30 font-bold'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Transfer BCA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gopay')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'gopay'
                        ? 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/30 font-bold'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>GoPay / OVO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/30 font-bold'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Bayar di Tempat</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer / Price Recap and Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200 space-y-3">
            {/* Price Calculations */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Menu:</span>
                <span className="font-semibold tabular-nums">{formatRupiah(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Kupon Promo:</span>
                  <span className="tabular-nums">-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Ongkos Kirim:</span>
                <span className="font-semibold tabular-nums">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">GRATIS</span>
                  ) : (
                    formatRupiah(deliveryFee)
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline text-stone-900">
                <span className="font-black text-sm">Total Pembayaran:</span>
                <span className="font-black text-lg text-amber-600 tabular-nums">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Order CTA Button */}
            <button
              onClick={handleSubmitOrder}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pesanan ke WhatsApp Sekarang</span>
            </button>
            <p className="text-[11px] text-center text-stone-500">
              Format rincian pesanan, topping & alamat otomatis terangkum untuk kasir toko.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import { CartItem, OrderCustomerInfo, PaymentMethod, StoreSettings } from '../types/martabak';

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function isStoreOpen(settings: StoreSettings): {
  isOpen: boolean;
  statusText: string;
  subtext: string;
} {
  if (settings.isForceClosed) {
    return {
      isOpen: false,
      statusText: 'Tutup Sementara',
      subtext: 'Toko sedang tidak menerima pesanan saat ini',
    };
  }

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const [openH, openM] = settings.openTime.split(':').map(Number);
  const [closeH, closeM] = settings.closeTime.split(':').map(Number);
  const openTotalMinutes = openH * 60 + openM;
  const closeTotalMinutes = closeH * 60 + closeM;

  let isOpen = false;
  if (openTotalMinutes <= closeTotalMinutes) {
    // Standard daytime e.g. 10:00 to 22:00
    isOpen = currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
  } else {
    // Overnight e.g. 16:00 to 01:00 (next day)
    isOpen = currentTotalMinutes >= openTotalMinutes || currentTotalMinutes < closeTotalMinutes;
  }

  if (isOpen) {
    return {
      isOpen: true,
      statusText: 'Buka Sekarang',
      subtext: `Melayani pesanan • ${settings.openTime} - ${settings.closeTime} WIB`,
    };
  } else {
    return {
      isOpen: false,
      statusText: 'Tutup',
      subtext: `Buka nanti pukul ${settings.openTime} WIB (Bisa Pre-Order)`,
    };
  }
}

export function buildWhatsAppMessage(params: {
  orderCode: string;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  appliedPromo?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  storeSettings: StoreSettings;
}): { text: string; waUrl: string } {
  const {
    orderCode,
    customer,
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    appliedPromo,
    totalAmount,
    paymentMethod,
    storeSettings,
  } = params;

  const paymentLabels: Record<PaymentMethod, string> = {
    qris: 'QRIS Instant (Gopay/OVO/Dana/BCA/dll)',
    bca: 'Transfer Bank BCA',
    mandiri: 'Transfer Bank Mandiri',
    gopay: 'GoPay',
    dana: 'DANA E-Wallet',
    shopee: 'ShopeePay',
    cod: 'Bayar di Tempat (COD / Tunai)',
  };

  const deliveryMethodLabel =
    customer.deliveryMethod === 'delivery'
      ? '🛵 Antar ke Alamat (Kurir Toko)'
      : '🏪 Ambil Sendiri di Outlet (Takeaway)';

  let itemsText = '';
  items.forEach((item, index) => {
    itemsText += `${index + 1}. *${item.menuItem.name}* (${item.quantity}x)\n`;
    itemsText += `   Harga: ${formatRupiah(item.unitPrice)} (Subtotal: ${formatRupiah(item.totalPrice)})\n`;

    const cust = item.customization;
    if (cust.dough) itemsText += `   • Adonan: ${cust.dough}\n`;
    if (cust.butter) itemsText += `   • Mentega: ${cust.butter}\n`;
    if (cust.portionSize) itemsText += `   • Ukuran: ${cust.portionSize === 'jumbo' ? 'Jumbo (+Rp 15.000)' : 'Reguler'}\n`;
    if (cust.eggType) itemsText += `   • Jenis Telur: Telur ${cust.eggType === 'bebek' ? 'Bebek Super' : 'Ayam'}\n`;
    if (cust.eggCount) itemsText += `   • Jumlah Telur: ${cust.eggCount} Butir\n`;
    if (cust.sweetnessLevel) itemsText += `   • Tingkat Manis/Susu: ${cust.sweetnessLevel}\n`;
    if (cust.spicinessLevel) itemsText += `   • Level Kuah Cuka: ${cust.spicinessLevel}\n`;

    if (cust.selectedToppings && cust.selectedToppings.length > 0) {
      itemsText += `   • Topping Tambahan: ${cust.selectedToppings.map(t => `${t.name} (+${formatRupiah(t.price)})`).join(', ')}\n`;
    }
    if (cust.notes) {
      itemsText += `   • Catatan Item: "${cust.notes}"\n`;
    }
    itemsText += `\n`;
  });

  const fullText = `*HALO ${storeSettings.storeName.toUpperCase()}! SAYA MAU PESAN MARTABAK* 🥞✨

━━━━━━━━━━━━━━━━━━━━
*KODE PESANAN:* ${orderCode}
*WAKTU PESAN:* ${new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })} WIB

👤 *DATA PEMESAN:*
- Nama: ${customer.name}
- No. WhatsApp: ${customer.phone}
- Layanan: ${deliveryMethodLabel}
${customer.deliveryMethod === 'delivery' ? `- Alamat Pengantaran: ${customer.deliveryAddress}\n` : ''}${customer.notes ? `- Catatan Khusus: ${customer.notes}\n` : ''}
📦 *RINCIAN MENU YANG DIPESAN:*
${itemsText}━━━━━━━━━━━━━━━━━━━━
💰 *RINGKASAN PEMBAYARAN:*
- Subtotal Menu: ${formatRupiah(subtotal)}
${deliveryFee > 0 ? `- Ongkos Kirim: ${formatRupiah(deliveryFee)}\n` : `- Ongkos Kirim: GRATIS\n`}${discountAmount > 0 ? `- Diskon Promo (${appliedPromo || 'Voucher'}): -${formatRupiah(discountAmount)}\n` : ''}*TOTAL PEMBAYARAN: ${formatRupiah(totalAmount)}*
💳 Metode Bayar: ${paymentLabels[paymentMethod]}

Mohon konfirmasi pesanan dan ketersediaannya ya kak. Terima kasih! 🙏`;

  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(fullText);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

  return { text: fullText, waUrl };
}

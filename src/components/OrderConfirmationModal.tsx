import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  QrCode,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { Order, StoreSettings } from '../types/martabak';
import { formatRupiah, buildWhatsAppMessage } from '../utils/formatters';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  storeSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if (!isOpen || !order) return null;

  const { text: waText, waUrl } = buildWhatsAppMessage({
    orderCode: order.orderCode,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discountAmount: order.discountAmount,
    appliedPromo: order.appliedPromo,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    storeSettings,
  });

  const handleCopyChat = () => {
    navigator.clipboard.writeText(waText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Pesanan Berhasil Dibuat!</h3>
              <p className="text-xs text-stone-400">Kode Pesanan: {order.orderCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800 text-xs sm:text-sm">
          {/* WhatsApp Primary Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Langkah Terakhir: Kirim Rincian ke WhatsApp Toko
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                  Klik tombol di bawah untuk membuka WhatsApp otomatis. Jika tidak terbuka otomatis, Anda bisa menyalin teks pesanan.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm text-center"
              >
                <span>Buka Chat WhatsApp Kasir</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCopyChat}
                className="py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Teks Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>
          </div>

          {/* Payment Detail Section */}
          {order.paymentMethod === 'qris' && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-center">
              <div className="flex items-center justify-center gap-1.5 font-bold text-stone-900 text-xs">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>Pembayaran via QRIS Instant</span>
              </div>

              {/* Simulated QR Box */}
              <div className="w-44 h-44 mx-auto bg-white p-3 rounded-xl border border-stone-300 shadow-sm flex flex-col items-center justify-center relative">
                {/* Visual QR Pattern representation */}
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer Frame */}
                  <rect x="5" y="5" width="26" height="26" fill="#1C1917" />
                  <rect x="9" y="9" width="18" height="18" fill="white" />
                  <rect x="13" y="13" width="10" height="10" fill="#1C1917" />

                  <rect x="69" y="5" width="26" height="26" fill="#1C1917" />
                  <rect x="73" y="9" width="18" height="18" fill="white" />
                  <rect x="77" y="13" width="10" height="10" fill="#1C1917" />

                  <rect x="5" y="69" width="26" height="26" fill="#1C1917" />
                  <rect x="9" y="73" width="18" height="18" fill="white" />
                  <rect x="13" y="77" width="10" height="10" fill="#1C1917" />

                  {/* QR details & dots */}
                  <rect x="36" y="8" width="6" height="6" fill="#1C1917" />
                  <rect x="46" y="8" width="6" height="6" fill="#1C1917" />
                  <rect x="56" y="14" width="6" height="6" fill="#1C1917" />
                  <rect x="36" y="24" width="10" height="6" fill="#1C1917" />
                  <rect x="50" y="24" width="12" height="6" fill="#1C1917" />

                  <rect x="10" y="38" width="8" height="8" fill="#1C1917" />
                  <rect x="22" y="44" width="6" height="12" fill="#1C1917" />
                  <rect x="34" y="36" width="14" height="14" fill="#D97706" />
                  <rect x="54" y="38" width="8" height="8" fill="#1C1917" />
                  <rect x="68" y="42" width="12" height="8" fill="#1C1917" />
                  <rect x="84" y="38" width="10" height="10" fill="#1C1917" />

                  <rect x="36" y="56" width="8" height="6" fill="#1C1917" />
                  <rect x="48" y="56" width="12" height="6" fill="#1C1917" />
                  <rect x="66" y="56" width="6" height="6" fill="#1C1917" />
                  <rect x="78" y="56" width="10" height="8" fill="#1C1917" />

                  <rect x="36" y="70" width="8" height="12" fill="#1C1917" />
                  <rect x="48" y="68" width="12" height="8" fill="#1C1917" />
                  <rect x="66" y="74" width="10" height="8" fill="#1C1917" />
                  <rect x="80" y="70" width="12" height="14" fill="#1C1917" />
                  <rect x="40" y="86" width="20" height="8" fill="#1C1917" />
                </svg>
              </div>

              <div>
                <div className="text-[11px] text-stone-500">Total yang harus dibayar:</div>
                <div className="text-base font-black text-amber-600 tabular-nums">
                  {formatRupiah(order.totalAmount)}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Mendukung BCA Mobile, Livin Mandiri, GoPay, OVO, DANA, ShopeePay & LinkAja
                </p>
              </div>

              <button
                onClick={() => setPaymentDone(true)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  paymentDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                {paymentDone ? '✓ Pembayaran Sedang Diverifikasi' : 'Saya Sudah Transfer / Scan'}
              </button>
            </div>
          )}

          {order.paymentMethod === 'bca' && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Instruksi Transfer BCA</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-stone-500">Nomor Rekening BCA:</div>
                  <div className="font-mono font-bold text-sm text-stone-900">8820 4492 1102</div>
                  <div className="text-[10px] text-stone-500">a.n. Martabak Sultan Nusantara</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('882044921102');
                    alert('Nomor Rekening BCA berhasil disalin!');
                  }}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded text-xs cursor-pointer"
                >
                  Salin Rekening
                </button>
              </div>
              <p className="text-[11px] text-stone-600">
                Kirim bukti transfer ke WhatsApp admin agar pesanan langsung masuk ke antrean wajan penggorengan.
              </p>
            </div>
          )}

          {order.paymentMethod === 'cod' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold">Bayar di Tempat (Tunai / COD)</div>
              <p className="text-stone-600">
                Siapkan uang pas sebesar{' '}
                <span className="font-bold text-stone-900">{formatRupiah(order.totalAmount)}</span> saat
                pesanan diantar oleh kurir toko ke alamat Anda.
              </p>
            </div>
          )}

          {/* Order Summary Recap */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="font-bold text-stone-900">Ringkasan Pesanan:</div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-stone-700">
                <span>
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span className="font-medium tabular-nums">{formatRupiah(item.totalPrice)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-stone-900">
              <span>Total Akhir:</span>
              <span className="text-amber-600 tabular-nums">{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
          >
            Selesai & Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  );
};

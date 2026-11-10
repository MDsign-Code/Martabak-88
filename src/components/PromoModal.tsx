import React, { useState } from 'react';
import { X, Tag, Copy, Check, Sparkles } from 'lucide-react';
import { PromoVoucher } from '../types/martabak';
import { formatRupiah } from '../utils/formatters';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: PromoVoucher[];
  onApplyVoucher?: (code: string) => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  onApplyVoucher,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
    if (onApplyVoucher) {
      onApplyVoucher(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-stone-950" />
            <h3 className="font-extrabold text-lg tracking-tight">Kupon Promo & Diskon Martabak</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition-colors text-stone-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className="text-sm text-stone-300">
            Salin atau klik tombol voucher di bawah untuk mendapatkan potongan harga spesial pada pesanan Anda:
          </p>

          <div className="space-y-3">
            {vouchers.map((v) => (
              <div
                key={v.code}
                className="p-4 rounded-xl border border-stone-800 bg-stone-950/60 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-400 text-sm tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {v.code}
                    </span>
                    {v.discountPercent && (
                      <span className="text-xs font-semibold text-emerald-400">
                        Diskon {v.discountPercent}%
                      </span>
                    )}
                    {v.discountFlat && (
                      <span className="text-xs font-semibold text-emerald-400">
                        Potongan {formatRupiah(v.discountFlat)}
                      </span>
                    )}
                    {v.freeShipping && (
                      <span className="text-xs font-semibold text-emerald-400">
                        Gratis Ongkir
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300">{v.description}</p>
                  <p className="text-[11px] text-stone-500">
                    Min. Transaksi {formatRupiah(v.minOrder)}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(v.code)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    copiedCode === v.code
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  }`}
                >
                  {copiedCode === v.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin & Terpasang!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Pakai Kupon</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
            <Tag className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Voucher promo akan otomatis memotong total biaya di keranjang Anda dan tertera pada format pesanan WhatsApp ke kasir.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

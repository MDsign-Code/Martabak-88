import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  expectedPin: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  expectedPin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const entered = pinInput.trim();
    const target = (expectedPin || '8888').trim();

    if (entered === target) {
      setPinInput('');
      onLoginSuccess();
    } else {
      setErrorMsg('PIN Pemilik salah! Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
            <Lock className="w-4 h-4" />
            <span>Autentikasi Pemilik Toko</span>
          </div>
          <button
            onClick={() => {
              setErrorMsg(null);
              setPinInput('');
              onClose();
            }}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-white">Login Khusus Pemilik</h3>
            <p className="text-xs text-stone-400">
              Panel admin hanya dapat diakses oleh pemilik toko untuk mengubah harga, stok, dan jam operasional.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">
              Masukkan PIN Rahasia Pemilik:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                maxLength={12}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Masukkan PIN"
                autoFocus
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-stone-950 border border-stone-700 text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 text-center mt-1">
              PIN Bawaan Awal: <span className="font-mono text-amber-400 font-bold">8888</span> (dapat diubah di dalam pengaturan toko).
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Masuk ke Panel Pemilik
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

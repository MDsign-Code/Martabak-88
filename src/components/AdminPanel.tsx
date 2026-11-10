import React, { useState } from 'react';
import {
  Store,
  Clock,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ShoppingBag,
  TrendingUp,
  Settings,
  Phone,
  MessageCircle,
  Save,
  Tag,
  AlertTriangle,
  Flame,
  Search,
  LogOut,
  KeyRound,
} from 'lucide-react';
import {
  MenuItem,
  Order,
  StoreSettings,
  MenuCategory,
  PromoVoucher,
} from '../types/martabak';
import { formatRupiah, isStoreOpen } from '../utils/formatters';
import { IMAGES } from '../data/initialData';

interface AdminPanelProps {
  menuItems: MenuItem[];
  onUpdateMenuItem: (updatedItem: MenuItem) => void;
  onAddMenuItem: (newItem: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  storeSettings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  vouchers: PromoVoucher[];
  onAddVoucher: (voucher: PromoVoucher) => void;
  onDeleteVoucher: (code: string) => void;
  onBackToStore: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  menuItems,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
  orders,
  onUpdateOrderStatus,
  storeSettings,
  onUpdateSettings,
  vouchers,
  onAddVoucher,
  onDeleteVoucher,
  onBackToStore,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'settings' | 'analytics'>('menu');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState<string>('');

  // Editing state for Menu
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Menu Form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MenuCategory>('manis');
  const [newPrice, setNewPrice] = useState<number>(45000);
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState(IMAGES.manisSpesial);
  const [newPortions, setNewPortions] = useState('12 Potong');
  const [newIsBestSeller, setNewIsBestSeller] = useState(false);

  // Store Settings Form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...storeSettings });
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  // New Voucher Form state
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherPercent, setNewVoucherPercent] = useState<number>(15);
  const [newVoucherMin, setNewVoucherMin] = useState<number>(50000);
  const [newVoucherDesc, setNewVoucherDesc] = useState('');

  // Quick Inline Price Editing
  const [inlinePriceMap, setInlinePriceMap] = useState<Record<string, number>>({});

  const handlePriceChange = (id: string, value: number) => {
    setInlinePriceMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveInlinePrice = (item: MenuItem) => {
    const updatedPrice = inlinePriceMap[item.id];
    if (updatedPrice !== undefined && updatedPrice > 0) {
      onUpdateMenuItem({ ...item, basePrice: updatedPrice });
      alert(`Harga ${item.name} berhasil diperbarui menjadi ${formatRupiah(updatedPrice)}!`);
    }
  };

  const handleToggleStock = (item: MenuItem) => {
    const updated = { ...item, isAvailable: !item.isAvailable };
    onUpdateMenuItem(updated);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPrice <= 0) {
      alert('Nama menu dan harga harus valid!');
      return;
    }

    const newItem: MenuItem = {
      id: `m-custom-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      basePrice: Number(newPrice),
      description: newDesc.trim() || 'Menu spesial pilihan Martabak Sultan dibuat dengan bahan istimewa.',
      image: newImage,
      portions: newPortions,
      isAvailable: true,
      isBestSeller: newIsBestSeller,
      prepTimeMinutes: newCategory === 'minuman' ? 5 : 15,
    };

    onAddMenuItem(newItem);
    setIsAddModalOpen(false);
    // Reset form
    setNewName('');
    setNewPrice(45000);
    setNewDesc('');
    alert(`Menu "${newItem.name}" berhasil ditambahkan ke katalog toko!`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 3000);
  };

  const handleAddVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode.trim()) return;

    const voucher: PromoVoucher = {
      code: newVoucherCode.trim().toUpperCase(),
      discountPercent: Number(newVoucherPercent),
      minOrder: Number(newVoucherMin),
      description: newVoucherDesc || `Diskon ${newVoucherPercent}% min. belanja ${formatRupiah(newVoucherMin)}`,
    };

    onAddVoucher(voucher);
    setNewVoucherCode('');
    setNewVoucherDesc('');
  };

  // Analytics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCompletedOrders = orders.filter((o) => o.status === 'selesai').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'selesai' && o.status !== 'batal').length;
  const storeStatus = isStoreOpen(storeSettings);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    const matchSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-16">
      {/* Admin Top Header */}
      <div className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
              ⚙️
            </div>
            <div>
              <div className="font-extrabold text-base flex items-center gap-2">
                <span>Panel Admin & Manajemen Menu</span>
                <span className="text-xs bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded">
                  Real-time
                </span>
              </div>
              <div className="text-xs text-stone-400 flex items-center gap-2">
                <span>{storeSettings.storeName}</span>
                <span>·</span>
                <span className={storeStatus.isOpen ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {storeStatus.statusText} ({storeSettings.openTime} - {storeSettings.closeTime} WIB)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Force Open / Closed Toggle */}
            <button
              onClick={() => {
                const updated = {
                  ...storeSettings,
                  isForceClosed: !storeSettings.isForceClosed,
                };
                onUpdateSettings(updated);
                setSettingsForm(updated);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                storeSettings.isForceClosed
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{storeSettings.isForceClosed ? 'Toko Ditutup Manual (Klik untuk Buka)' : 'Toko Buka Normal'}</span>
            </button>

            {/* Back to Customer Storefront */}
            <button
              onClick={onBackToStore}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Lihat Toko Pelanggan</span>
            </button>

            {/* Logout Owner */}
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              title="Kunci & Keluar dari Panel Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Kunci)</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-stone-800 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'menu'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Manajemen Menu & Harga ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pesanan Masuk</span>
            {activeOrdersCount > 0 && (
              <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ringkasan Omset & Analitik</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Jam Buka, WhatsApp & Promo</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ================= TAB 1: MENU & PRICE MANAGEMENT ================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Cari martabak atau minuman..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
                    }`}
                  >
                    Semua ({menuItems.length})
                  </button>
                  <button
                    onClick={() => setFilterCategory('manis')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'manis' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
                    }`}
                  >
                    Manis
                  </button>
                  <button
                    onClick={() => setFilterCategory('telur')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'telur' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
                    }`}
                  >
                    Telur Gurih
                  </button>
                  <button
                    onClick={() => setFilterCategory('tipker')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'tipker' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
                    }`}
                  >
                    Tipker
                  </button>
                  <button
                    onClick={() => setFilterCategory('minuman')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'minuman' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
                    }`}
                  >
                    Minuman
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Menu Baru</span>
              </button>
            </div>

            {/* Menu Items Table / Grid */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-800 font-extrabold border-b border-stone-200">
                    <tr>
                      <th className="py-3.5 px-4">Menu & Foto</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Status Stok</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Harga Dasar (Instan)</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredMenuItems.map((item) => {
                      const currentPrice = inlinePriceMap[item.id] ?? item.basePrice;
                      const hasPriceChanged = inlinePriceMap[item.id] !== undefined && inlinePriceMap[item.id] !== item.basePrice;

                      return (
                        <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                                  <span>{item.name}</span>
                                  {item.isBestSeller && (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                      Terlaris
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="capitalize font-semibold text-stone-700">
                              {item.category === 'manis'
                                ? 'Martabak Manis'
                                : item.category === 'telur'
                                ? 'Martabak Telur'
                                : item.category === 'tipker'
                                ? 'Tipker Crispy'
                                : 'Minuman'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleStock(item)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                item.isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {item.isAvailable ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>Tersedia</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  <span>Habis</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-stone-500 font-semibold text-xs">
                                  Rp
                                </span>
                                <input
                                  type="number"
                                  step="1000"
                                  value={currentPrice}
                                  onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                                  className="w-28 pl-8 pr-2 py-1.5 rounded-lg border border-stone-300 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              {hasPriceChanged && (
                                <button
                                  onClick={() => handleSaveInlinePrice(item)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Simpan harga baru"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>Simpan</span>
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-1.5 text-stone-500 hover:text-amber-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Edit Detail Menu"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus menu "${item.name}"?`)) {
                                    onDeleteMenuItem(item.id);
                                  }
                                }}
                                className="p-1.5 text-stone-500 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Hapus Menu"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LIVE ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-stone-900">Pesanan Masuk & Antrean Dapur</h2>
                <p className="text-xs text-stone-500">
                  Update status memasak secara real-time agar pelanggan dan kurir dapat memantau pesanan.
                </p>
              </div>
              <div className="text-xs text-stone-600 font-semibold bg-white px-3 py-1.5 rounded-xl border border-stone-200">
                Total: {orders.length} Pesanan tercatat
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <div className="font-mono font-black text-sm text-stone-900">
                          {ord.orderCode}
                        </div>
                        <div className="text-[11px] text-stone-500">{ord.createdAt}</div>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer border ${
                          ord.status === 'baru'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ord.status === 'dimasak'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : ord.status === 'siap'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : ord.status === 'selesai'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        <option value="baru">🔵 Baru Masuk</option>
                        <option value="dimasak">🍳 Sedang Dimasak</option>
                        <option value="siap">📦 Siap Diambil/Diantar</option>
                        <option value="selesai">✅ Selesai</option>
                        <option value="batal">❌ Dibatalkan</option>
                      </select>
                    </div>

                    {/* Customer */}
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{ord.customer.name}</span>
                        <a
                          href={`https://wa.me/${ord.customer.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat WA</span>
                        </a>
                      </div>
                      <div className="text-stone-500">{ord.customer.phone}</div>
                      <div className="text-stone-600 font-medium">
                        {ord.customer.deliveryMethod === 'delivery'
                          ? `🛵 Antar: ${ord.customer.deliveryAddress}`
                          : '🏪 Ambil di Toko'}
                      </div>
                      {ord.customer.notes && (
                        <div className="text-[11px] text-amber-800 italic bg-amber-50/70 p-1.5 rounded">
                          Catatan: &ldquo;{ord.customer.notes}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="text-xs bg-stone-50 p-2.5 rounded-xl space-y-1.5 border border-stone-100">
                      <div className="font-bold text-stone-700 text-[11px] uppercase">Menu Pesanan:</div>
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between font-semibold text-stone-800">
                            <span>
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="tabular-nums">{formatRupiah(item.totalPrice)}</span>
                          </div>
                          <div className="text-[10px] text-stone-500 pl-2">
                            {item.customization.dough && `${item.customization.dough} • `}
                            {item.customization.butter && `${item.customization.butter} • `}
                            {item.customization.eggCount && `Telur ${item.customization.eggCount} butir • `}
                            {item.customization.selectedToppings &&
                              item.customization.selectedToppings.length > 0 &&
                              `+Topping: ${item.customization.selectedToppings.map((t) => t.name).join(', ')}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-stone-500">
                        Bayar via {ord.paymentMethod.toUpperCase()}
                      </div>
                      <div className="font-black text-sm text-amber-600 tabular-nums">
                        {formatRupiah(ord.totalAmount)}
                      </div>
                    </div>

                    {ord.status !== 'selesai' && (
                      <button
                        onClick={() => {
                          const nextStatus: Record<Order['status'], Order['status']> = {
                            baru: 'dimasak',
                            dimasak: 'siap',
                            siap: 'selesai',
                            selesai: 'selesai',
                            batal: 'batal',
                          };
                          onUpdateOrderStatus(ord.id, nextStatus[ord.status]);
                        }}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {ord.status === 'baru' && 'Mulai Masak →'}
                        {ord.status === 'dimasak' && 'Selesai Masak →'}
                        {ord.status === 'siap' && 'Tandai Selesai ✓'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SETTINGS, HOURS & WHATSAPP ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6">
            {settingsSavedNotice && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Pengaturan toko dan nomor WhatsApp berhasil disimpan!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                Pengaturan Jam Operasional & Kontak Kasir
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Nama Toko Martabak</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800 flex items-center gap-1 text-emerald-700">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Nomor WhatsApp Tujuan Pesanan (Kasir) *</span>
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="Contoh: 6281234567890"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-mono font-bold text-stone-900"
                  />
                  <p className="text-[10px] text-stone-500">Format internasional dengan 62 (contoh: 6281298765432)</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Jam Buka Toko (WIB)</label>
                  <input
                    type="time"
                    value={settingsForm.openTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, openTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Jam Tutup Toko (WIB)</label>
                  <input
                    type="time"
                    value={settingsForm.closeTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, closeTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-800">Alamat Fisik Outlet</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Ongkos Kirim Standar (Rp)</label>
                  <input
                    type="number"
                    step="1000"
                    value={settingsForm.flatDeliveryFee}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, flatDeliveryFee: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Minimal Belanja Gratis Ongkir (Rp)</label>
                  <input
                    type="number"
                    step="5000"
                    value={settingsForm.freeDeliveryThreshold}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        freeDeliveryThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-800">Teks Banner Pengumuman Promo</label>
                  <input
                    type="text"
                    value={settingsForm.announcementText}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, announcementText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <label className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>PIN Rahasia Pemilik Toko (Keamanan Akses Panel Admin)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={settingsForm.adminPin || '8888'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                    className="w-48 px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold tracking-widest text-stone-900 bg-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-stone-600">
                    PIN ini digunakan saat Anda membuka panel admin dari link tersembunyi pemilik. Konsumen biasa tidak memiliki PIN ini sehingga tidak bisa mengakses atau mengubah menu.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Toko</span>
                </button>
              </div>
            </form>

            {/* Voucher Management */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Manajemen Kupon & Promo Diskon</span>
              </h3>

              {/* Add Voucher Form */}
              <form onSubmit={handleAddVoucherSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Kode Voucher (cth: HEMAT50)"
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                  className="px-3 py-2 rounded-xl border border-stone-300 font-mono uppercase focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  placeholder="Diskon (%)"
                  value={newVoucherPercent}
                  onChange={(e) => setNewVoucherPercent(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  placeholder="Min Belanja (Rp)"
                  value={newVoucherMin}
                  onChange={(e) => setNewVoucherMin(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Tambah Kupon
                </button>
              </form>

              {/* Active Vouchers List */}
              <div className="space-y-2">
                {vouchers.map((v) => (
                  <div
                    key={v.code}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded mr-2">
                        {v.code}
                      </span>
                      <span className="text-stone-700 font-medium">{v.description}</span>
                      <span className="text-stone-400 ml-2">
                        (Min. order {formatRupiah(v.minOrder)})
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteVoucher(v.code)}
                      className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Hapus voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ANALYTICS & SALES REPORT ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="text-xs font-semibold text-stone-500">Total Omset Penjualan</div>
                <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">
                  {formatRupiah(totalRevenue)}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  ↑ Transaksi hari ini
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="text-xs font-semibold text-stone-500">Jumlah Pesanan Masuk</div>
                <div className="text-2xl font-black text-stone-900 mt-1 tabular-nums">
                  {orders.length}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  {activeOrdersCount} sedang diproses
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="text-xs font-semibold text-stone-500">Pesanan Sukses Selesai</div>
                <div className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">
                  {totalCompletedOrders}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Telah diterima pelanggan</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="text-xs font-semibold text-stone-500">Rata-rata Nilai Pesanan (AOV)</div>
                <div className="text-2xl font-black text-stone-900 mt-1 tabular-nums">
                  {orders.length > 0 ? formatRupiah(Math.round(totalRevenue / orders.length)) : 'Rp 0'}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Per transaksi pemesanan</div>
              </div>
            </div>

            {/* Popular Items Showcase */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Menu Terlaris & Rekomendasi Favorit Pelanggan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems
                  .filter((m) => m.isBestSeller)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-stone-200 flex items-center gap-3 bg-stone-50"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900 line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-xs font-black text-amber-700 tabular-nums">
                          {formatRupiah(item.basePrice)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          ✓ Best Seller Aktif
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: TAMBAH MENU BARU ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Menu Martabak Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800">Nama Menu Martabak *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Martabak Manis Matcha Kitkat Crispy"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MenuCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                  >
                    <option value="manis">Martabak Manis</option>
                    <option value="telur">Martabak Telur</option>
                    <option value="tipker">Tipker (Tipis Kering)</option>
                    <option value="minuman">Minuman Segar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Harga Dasar (Rp) *</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800">Deskripsi Menu & Bahan</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Kombinasi bahan istimewa..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800">Pilih Preset Foto Menu</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Manis', url: IMAGES.manisSpesial },
                    { label: 'Telur Bebek', url: IMAGES.telurBebek },
                    { label: 'Combo Sultan', url: IMAGES.hero },
                    { label: 'Tipker', url: IMAGES.tipker },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewImage(preset.url)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        newImage === preset.url ? 'border-amber-500 ring-2 ring-amber-400' : 'border-stone-200'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[9px] text-white py-0.5 text-center">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bestSellerCheck"
                  checked={newIsBestSeller}
                  onChange={(e) => setNewIsBestSeller(e.target.checked)}
                  className="rounded border-stone-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <label htmlFor="bestSellerCheck" className="font-bold text-stone-800 cursor-pointer">
                  Tandai sebagai Menu Terlaris (Best Seller)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Tambahkan ke Toko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT MENU ITEM ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Edit Detail: {editingItem.name}</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateMenuItem(editingItem);
                setEditingItem(null);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-stone-800">Nama Menu</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Harga Dasar (Rp)</label>
                  <input
                    type="number"
                    step="1000"
                    value={editingItem.basePrice}
                    onChange={(e) => setEditingItem({ ...editingItem, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Porsi</label>
                  <input
                    type="text"
                    value={editingItem.portions || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, portions: e.target.value })}
                    placeholder="12 Potong"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800">Deskripsi Menu</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable}
                    onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                    className="rounded border-stone-300 text-amber-500"
                  />
                  <span>Stok Tersedia</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingItem.isBestSeller || false}
                    onChange={(e) => setEditingItem({ ...editingItem, isBestSeller: e.target.checked })}
                    className="rounded border-stone-300 text-amber-500"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

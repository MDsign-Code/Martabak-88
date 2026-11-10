import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  CartItem,
  Order,
  StoreSettings,
  PromoVoucher,
} from './types/martabak';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_STORE_SETTINGS,
  INITIAL_ORDERS,
  PROMO_VOUCHERS,
  IMAGES,
} from './data/initialData';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MenuCard } from './components/MenuCard';
import { CustomizationModal } from './components/CustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { PromoModal } from './components/PromoModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { isStoreOpen, formatRupiah } from './utils/formatters';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Flame,
  Award,
  Lock,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  // Persistence state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('martabak_menu_items');
    if (saved) {
      try {
        const parsed: MenuItem[] = JSON.parse(saved);
        // Fix any stale development paths from earlier sessions
        return parsed.map((item) => {
          if (typeof item.image === 'string' && item.image.startsWith('/src/assets/images/')) {
            if (item.image.includes('manis_spesial')) return { ...item, image: IMAGES.manisSpesial };
            if (item.image.includes('telur_bebek')) return { ...item, image: IMAGES.telurBebek };
            if (item.image.includes('tipker')) return { ...item, image: IMAGES.tipker };
            return { ...item, image: IMAGES.hero };
          }
          return item;
        });
      } catch {
        return INITIAL_MENU_ITEMS;
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('martabak_store_settings');
    return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('martabak_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('martabak_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [vouchers, setVouchers] = useState<PromoVoucher[]>(() => {
    const saved = localStorage.getItem('martabak_vouchers');
    return saved ? JSON.parse(saved) : PROMO_VOUCHERS;
  });

  // Owner Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('martabak_owner_auth') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);

  // UI state
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForCustomize, setSelectedItemForCustomize] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState<boolean>(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isOrderConfirmModalOpen, setIsOrderConfirmModalOpen] = useState<boolean>(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>('SULTAN20');

  // Check URL query parameter on first mount (e.g. ?admin=1 or ?owner=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('admin') || params.has('owner')) {
      if (isAdminAuthenticated) {
        setCurrentView('admin');
      } else {
        setIsAdminLoginModalOpen(true);
      }
    }
  }, [isAdminAuthenticated]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('martabak_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('martabak_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('martabak_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('martabak_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('martabak_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  // Owner Login / Logout Handlers
  const handleOpenAdminPortal = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('martabak_owner_auth', 'true');
    setIsAdminLoginModalOpen(false);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('martabak_owner_auth');
    setCurrentView('store');
  };

  // Cart operations
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.menuItem.id === newItem.menuItem.id &&
          ci.customization.dough === newItem.customization.dough &&
          ci.customization.butter === newItem.customization.butter &&
          ci.customization.portionSize === newItem.customization.portionSize &&
          ci.customization.eggType === newItem.customization.eggType &&
          ci.customization.eggCount === newItem.customization.eggCount &&
          ci.customization.spicinessLevel === newItem.customization.spicinessLevel &&
          JSON.stringify(ci.customization.selectedToppings) ===
            JSON.stringify(newItem.customization.selectedToppings) &&
          ci.customization.notes === newItem.customization.notes
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const exist = updated[existingIdx];
        const newQty = exist.quantity + newItem.quantity;
        updated[existingIdx] = {
          ...exist,
          quantity: newQty,
          totalPrice: exist.unitPrice * newQty,
        };
        return updated;
      }
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty }
          : item
      )
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderCreated = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setLatestOrder(order);
    handleClearCart();
    setIsCartOpen(false);
    setIsOrderConfirmModalOpen(true);
  };

  // Admin handlers
  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    if (latestOrder && latestOrder.id === orderId) {
      setLatestOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleAddVoucher = (voucher: PromoVoucher) => {
    setVouchers((prev) => [...prev.filter((v) => v.code !== voucher.code), voucher]);
  };

  const handleDeleteVoucher = (code: string) => {
    setVouchers((prev) => prev.filter((v) => v.code !== code));
  };

  // Badge calculations
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const storeStatus = isStoreOpen(storeSettings);

  // Filter Catalog
  const filteredCatalog = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/20 text-stone-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <Header
        settings={storeSettings}
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'admin' && !isAdminAuthenticated) {
            setIsAdminLoginModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenPromoModal={() => setIsPromoModalOpen(true)}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Floating Owner Indicator (Only visible if the owner is logged in and viewing the customer store) */}
      {isAdminAuthenticated && currentView === 'store' && (
        <div className="bg-stone-900 text-amber-300 text-xs py-2 px-4 border-b border-stone-800 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Sesi Pemilik Toko Aktif (Mode Pratinjau Pembeli)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('admin')}
                className="px-2.5 py-1 bg-amber-500 text-stone-950 font-black rounded hover:bg-amber-400 cursor-pointer"
              >
                Buka Panel Admin
              </button>
              <button
                onClick={handleAdminLogout}
                className="px-2 py-1 text-stone-400 hover:text-white cursor-pointer font-semibold"
              >
                Kunci / Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: ADMIN PANEL (OWNER ONLY) */}
      {currentView === 'admin' && isAdminAuthenticated && (
        <AdminPanel
          menuItems={menuItems}
          onUpdateMenuItem={handleUpdateMenuItem}
          onAddMenuItem={handleAddMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          storeSettings={storeSettings}
          onUpdateSettings={setStoreSettings}
          vouchers={vouchers}
          onAddVoucher={handleAddVoucher}
          onDeleteVoucher={handleDeleteVoucher}
          onBackToStore={() => setCurrentView('store')}
          onLogout={handleAdminLogout}
        />
      )}

      {/* VIEW 2: STOREFRONT / MAIN MENU (CONSUMERS & PUBLIC) */}
      {currentView === 'store' && (
        <main className="flex-1">
          {/* Hero Section */}
          <HeroSection
            settings={storeSettings}
            onExploreMenu={() => {
              const el = document.getElementById('katalog-menu');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenPromo={() => setIsPromoModalOpen(true)}
          />

          {/* Store Status Alert if Closed */}
          {!storeStatus.isOpen && (
            <div className="bg-amber-500 text-stone-950 font-medium py-3 px-4 text-center text-xs sm:text-sm border-b border-amber-600">
              <span className="font-bold">Pemberitahuan Toko:</span> Outlet saat ini sedang tutup.
              Jam buka reguler adalah pukul {storeSettings.openTime} - {storeSettings.closeTime} WIB.
              Anda tetap dapat membuat pesanan awal (Pre-Order) untuk diproses saat buka.
            </div>
          )}

          {/* Catalog & Filter Section */}
          <section id="katalog-menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Catalog Controls: Categories & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  Pilihan Menu Martabak
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Pilih menu favorit Anda dan kustomisasi topping, mentega, serta level kemanisan.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px] sm:min-w-[320px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari coklat keju, telur bebek, tipker..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
              </div>
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/80 rounded-2xl overflow-x-auto text-xs font-bold scrollbar-none">
              {[
                { id: 'all', label: 'Semua Menu', count: menuItems.length },
                {
                  id: 'manis',
                  label: 'Martabak Manis',
                  count: menuItems.filter((m) => m.category === 'manis').length,
                },
                {
                  id: 'telur',
                  label: 'Martabak Telur',
                  count: menuItems.filter((m) => m.category === 'telur').length,
                },
                {
                  id: 'tipker',
                  label: 'Tipis Kering (Tipker)',
                  count: menuItems.filter((m) => m.category === 'tipker').length,
                },
                {
                  id: 'minuman',
                  label: 'Minuman & Segar',
                  count: menuItems.filter((m) => m.category === 'minuman').length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === tab.id
                      ? 'bg-stone-900 text-amber-300 shadow-sm font-extrabold'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === tab.id
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-stone-300 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Menu Cards Grid */}
            {filteredCatalog.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                <div className="text-4xl">🥞</div>
                <h3 className="font-bold text-stone-900 text-base">Menu Tidak Ditemukan</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Tidak ada menu martabak yang sesuai dengan pencarian &ldquo;{searchQuery}&rdquo;. Coba kata kunci lain atau pilih kategori &ldquo;Semua Menu&rdquo;.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-stone-900 text-amber-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCatalog.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onSelectForCustomize={(menu) => setSelectedItemForCustomize(menu)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Social Proof & Perks Section */}
          <section className="bg-stone-900 text-stone-200 py-12 border-t border-stone-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Award className="w-5 h-5" />
                    <span>Mentega Wijsman Pilihan</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Kami menggunakan mentega kaleng Wijsman Belanda asli untuk menghasilkan rasa gurih creamy lumer yang harum semerbak di setiap gigitan.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Flame className="w-5 h-5" />
                    <span>Telur Bebek Berkualitas</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Martabak telur dibuat dengan telur bebek segar berbutir besar dan isian daging sapi rempah gurih, dipanggang dengan kulit renyah berlapis.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Sparkles className="w-5 h-5" />
                    <span>Pesan Cepat Masuk WhatsApp</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Pesanan Anda langsung terhubung dengan kasir dan juru masak toko secara instan dengan rincian topping, kupon, dan metode bayar.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Floating Bottom Cart Bar (Mobile & Sticky) */}
      {currentView === 'store' && totalCartCount > 0 && !isCartOpen && (
        <aside
          aria-label="Keranjang Belanja Singkat"
          className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 bg-stone-950 text-white p-3.5 rounded-2xl shadow-2xl border border-stone-700 flex items-center justify-between gap-4 animate-bounce-subtle"
        >
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-amber-500 text-stone-950 rounded-xl font-bold">
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-1.5 bg-stone-950 text-amber-400 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border border-stone-800">
                {totalCartCount}
              </span>
            </div>
            <div>
              <div className="text-xs text-stone-400 font-medium">Total Pesanan:</div>
              <div className="text-sm font-black text-amber-400 tabular-nums">
                {formatRupiah(totalCartPrice)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Buka Keranjang & WA</span>
            <span>→</span>
          </button>
        </aside>
      )}

      {/* Footer with Discreet Owner Login */}
      <footer className="bg-stone-950 text-stone-400 text-xs py-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-extrabold text-white text-sm">
              {storeSettings.storeName}
            </div>
            <p className="text-stone-500 text-[11px]">{storeSettings.address}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400">
            <span>Buka: {storeSettings.openTime} - {storeSettings.closeTime} WIB</span>
            <span>·</span>
            {/* Discreet Owner Access Link */}
            <button
              onClick={handleOpenAdminPortal}
              className="text-stone-600 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Akses khusus pemilik toko"
            >
              <Lock className="w-3 h-3" />
              <span>Kelola Toko (Pemilik)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      {/* 1. Customization Modal */}
      <CustomizationModal
        item={selectedItemForCustomize}
        isOpen={!!selectedItemForCustomize}
        onClose={() => setSelectedItemForCustomize(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        vouchers={vouchers}
        storeSettings={storeSettings}
        onOrderCreated={handleOrderCreated}
        appliedPromoCode={appliedPromoCode}
        setAppliedPromoCode={setAppliedPromoCode}
      />

      {/* 3. Promo Modal */}
      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        vouchers={vouchers}
        onApplyVoucher={(code) => {
          setAppliedPromoCode(code);
          setIsPromoModalOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* 4. Order Confirmation Modal with QRIS / Bank Transfer (without Lacak Pesanan) */}
      <OrderConfirmationModal
        order={latestOrder}
        isOpen={isOrderConfirmModalOpen}
        onClose={() => setIsOrderConfirmModalOpen(false)}
        storeSettings={storeSettings}
      />

      {/* 5. Secret Owner PIN Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        expectedPin={storeSettings.adminPin || '8888'}
      />
    </div>
  );
}

export type MenuCategory = 'manis' | 'telur' | 'tipker' | 'minuman';

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
  category?: 'sweet' | 'savory' | 'all';
}

export interface DoughOption {
  id: string;
  name: string;
  price: number;
  colorHex?: string;
}

export interface ButterOption {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface EggTypeOption {
  id: string;
  name: string;
  price: number;
}

export interface EggCountOption {
  count: number;
  label: string;
  priceDiff: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  basePrice: number;
  image: string;
  isAvailable: boolean;
  isBestSeller?: boolean;
  isPromo?: boolean;
  promoPrice?: number;
  tags?: string[];
  prepTimeMinutes?: number;
  portions?: string;
}

export interface CustomizationSelection {
  dough?: string; // e.g. 'original', 'pandan', 'redvelvet', 'charcoal'
  butter?: string; // e.g. 'blueband', 'wijsman', 'palmia'
  portionSize?: 'regular' | 'jumbo';
  portionPriceDiff?: number;
  eggType?: string; // 'ayam' | 'bebek'
  eggCount?: number; // 2, 3, 4, 5
  eggPriceDiff?: number;
  selectedToppings: {
    id: string;
    name: string;
    price: number;
  }[];
  sweetnessLevel?: 'Normal' | 'Sedang (Less Sweet)' | 'Sedikit Susu' | 'Ekstra Susu Manis';
  spicinessLevel?: 'Tidak Pedas' | 'Sedang' | 'Pedas Mantap' | 'Ekstra Pedas Mercon';
  notes?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  customization: CustomizationSelection;
  quantity: number;
  unitPrice: number; // basePrice + addons
  totalPrice: number; // unitPrice * quantity
}

export type PaymentMethod = 'qris' | 'bca' | 'mandiri' | 'gopay' | 'dana' | 'shopee' | 'cod';

export type DeliveryMethod = 'pickup' | 'delivery';

export type OrderStatus = 'baru' | 'dimasak' | 'siap' | 'selesai' | 'batal';

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  notes?: string;
}

export interface PromoVoucher {
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  maxDiscount?: number;
  minOrder: number;
  freeShipping?: boolean;
  description: string;
}

export interface Order {
  id: string;
  orderCode: string;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  appliedPromo?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  whatsappUrl: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  address: string;
  openTime: string; // "16:00"
  closeTime: string; // "23:30"
  isForceClosed: boolean;
  flatDeliveryFee: number;
  freeDeliveryThreshold: number;
  announcementText: string;
  ratingScore: number;
  ratingCount: number;
  adminPin: string; // Secret PIN for store owner authentication
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl: string;
  producer: string;
  producer_id?: string;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        const maxStock = item.stock ?? 99; // Se não informar estoque, assume 99

        if (existing) {
          const newQuantity = Math.min(existing.quantity + item.quantity, maxStock);
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: newQuantity } : i
            ),
          };
        }
        
        // Verifica se a própria quantidade do item a ser adicionado já não supera o estoque
        const safeQuantity = Math.min(item.quantity, maxStock);
        return { items: [...state.items, { ...item, quantity: safeQuantity }] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      updateQuantity: (id, delta) => set((state) => ({
        items: state.items.map((i) => {
          if (i.id === id) {
            const maxStock = i.stock ?? 99;
            const newQuantity = Math.max(1, Math.min(i.quantity + delta, maxStock));
            return { ...i, quantity: newQuantity };
          }
          return i;
        }),
      })),
      clearCart: () => set({ items: [] }),
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // key in localStorage
    }
  )
);

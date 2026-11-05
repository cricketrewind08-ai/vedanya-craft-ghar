import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId: string | null;
  title: string;
  variantLabel: string | null;
  unitPrice: number;
  imageUrl: string;
  quantity: number;
  preparationDays: number;
  maxAvailable: number;
}

export interface QuickPurchaseItem {
  productId: string;
  variantId: string | null;
  title: string;
  variantLabel: string | null;
  unitPrice: number;
  imageUrl: string;
  quantity: number;
  preparationDays: number;
}

interface CartStore {
  // Multi-item persistent cart
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number
  ) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Quick Purchase (Isolated session)
  quickItem: QuickPurchaseItem | null;
  setQuickItem: (item: QuickPurchaseItem | null) => void;
  clearQuickItem: () => void;

  // Computed helpers
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      quickItem: null,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const currentQty = updated[existingIndex].quantity;
            const newQty = Math.min(
              currentQty + quantity,
              item.maxAvailable > 0 ? item.maxAvailable : 99
            );
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: newQty,
            };
            return { items: updated, isOpen: true };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: Math.min(
                  quantity,
                  item.maxAvailable > 0 ? item.maxAvailable : 99
                ),
              },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.variantId === variantId)
              ),
            };
          }

          return {
            items: state.items.map((i) => {
              if (i.productId === productId && i.variantId === variantId) {
                const max = i.maxAvailable > 0 ? i.maxAvailable : 99;
                return { ...i, quantity: Math.min(quantity, max) };
              }
              return i;
            }),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      setQuickItem: (item) => set({ quickItem: item }),
      clearQuickItem: () => set({ quickItem: null }),

      getCartTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },

      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "vedanya-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, quickItem: state.quickItem }),
    }
  )
);


import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Contexte global du panier.
 *
 * Centralise :
 * - la liste des articles
 * - le nombre total d'articles (`count`)
 * - le sous‑total (`subtotal`)
 * - les opérations : ajout, suppression, modification de quantité, vidage
 */
const CartContext = createContext(null);

/**
 * Fournisseur de panier à placer autour de l'application.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  /**
   * Ajoute un produit au panier.
   * - Si le produit existe déjà, on incrémente simplement sa quantité
   * - Sinon on l'ajoute en tant que nouvelle ligne
   */
  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product._id === product._id);

      if (found) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...prev, { product, quantity }];
    });
  }, []);

  /**
   * Supprime complètement un produit du panier.
   */
  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  }, []);

  /**
   * Met à jour la quantité d'un produit.
   * - Si la quantité est < 1, on supprime la ligne du panier.
   */
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.product._id !== productId));
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId ? { ...i, quantity } : i
      )
    );
  }, []);

  /**
   * Vide entièrement le panier.
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Nombre total d'articles
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  // Montant total hors frais de livraison
  const subtotal = items.reduce(
    (acc, i) => acc + i.product.price * i.quantity,
    0
  );

  const value = {
    items,
    count,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook utilitaire pour consommer le panier.
 * Doit être utilisé à l'intérieur d'un `<CartProvider>`.
 */
export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return ctx;
}

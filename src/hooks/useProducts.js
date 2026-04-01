import { useState, useEffect } from 'react';
import { DEFAULT_PRODUCTS, STORAGE_KEY } from '../data/config';

export function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProduct = (id, changes) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  };

  return { products, addProduct, deleteProduct, updateProduct };
}

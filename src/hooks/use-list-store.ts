"use client";

import { useState, useEffect, useCallback } from 'react';
import { Item, initialItems as defaultItems } from '@/data/items';

const COOKIE_KEY = 'prolist-data';

export type Quantities = { [key: string]: number };

type StoredData = {
  items: Item[];
  quantities: Quantities;
  notes: string;
};

export function useListStore() {
  const [items, setItems] = useState<Item[]>(defaultItems);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [notes, setNotes] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${COOKIE_KEY}=`));
      
      if (cookieValue) {
        const storedDataJSON = decodeURIComponent(cookieValue.split('=')[1]);
        const storedData: StoredData = JSON.parse(storedDataJSON);
        if (storedData.items) setItems(storedData.items);
        if (storedData.quantities) setQuantities(storedData.quantities);
        if (storedData.notes) setNotes(storedData.notes);
      }
    } catch (error) {
      console.error("Failed to load data from cookies", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        const dataToStore: StoredData = { items, quantities, notes };
        const dataString = JSON.stringify(dataToStore);
        const expires = new Date();
        expires.setDate(expires.getDate() + 365); // 1 year expiry
        document.cookie = `${COOKIE_KEY}=${encodeURIComponent(dataString)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      } catch (error) {
        console.error("Failed to save data to cookies", error);
      }
    }
  }, [items, quantities, notes, isLoaded]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      if (quantity > 0) {
        newQuantities[itemId] = quantity;
      } else {
        delete newQuantities[itemId];
      }
      return newQuantities;
    });
  }, []);

  const updateNotes = useCallback((newNotes: string) => {
    setNotes(newNotes);
  }, []);

  const addItem = useCallback((name: string) => {
    setItems(prev => [
      ...prev,
      { id: `item-${Date.now()}`, name }
    ]);
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });
  }, []);

  return {
    items,
    quantities,
    notes,
    isLoaded,
    updateQuantity,
    updateNotes,
    addItem,
    deleteItem,
  };
}

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Item, initialItems as defaultItems } from '@/data/items';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

const COOKIE_KEY = 'prolist-data';
const MAX_PAST_ORDERS = 20;

export type Quantities = { [key: string]: number };

export type PastOrderItem = {
  id: string;
  quantity: number;
}
export type PastOrder = {
  date: string;
  items: PastOrderItem[];
};

type StoredData = {
  items: Item[];
  quantities: Quantities;
  notes: string;
  pastOrders: PastOrder[];
};

export function useListStore() {
  const [items, setItems] = useState<Item[]>(defaultItems);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [notes, setNotes] = useState('');
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { consent } = useCookieConsent();

  // Effect to load data from cookies once consent is given and confirmed.
  useEffect(() => {
    if (consent === null) return; // Don't do anything until consent status is determined

    if (consent) {
        try {
            const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${COOKIE_KEY}=`));
            
            if (cookieValue) {
                const storedDataJSON = decodeURIComponent(cookieValue.split('=')[1]);
                const storedData: StoredData = JSON.parse(storedDataJSON);
                // Ensure default items are present if cookies are old/malformed
                const allItems = [...defaultItems];
                const storedItemIds = new Set(allItems.map(i => i.id));
                if (storedData.items) {
                    storedData.items.forEach(storedItem => {
                        if (!storedItemIds.has(storedItem.id)) {
                            allItems.push(storedItem);
                            storedItemIds.add(storedItem.id);
                        }
                    });
                }
                
                setItems(allItems);
                if (storedData.quantities) setQuantities(storedData.quantities);
                if (storedData.notes) setNotes(storedData.notes);
                if (storedData.pastOrders) setPastOrders(storedData.pastOrders);
            } else {
                setItems(defaultItems);
            }
        } catch (error) {
            console.error("Failed to load data from cookies", error);
            setItems(defaultItems);
        }
    } else {
        // If consent is denied, reset to default state
        setItems(defaultItems);
        setQuantities({});
        setNotes('');
        setPastOrders([]);
    }
    setIsLoaded(true);
  }, [consent]);

  // Effect to save data to cookies whenever it changes.
  useEffect(() => {
    // Only save if data has been loaded and consent is granted.
    if (isLoaded && consent) {
      try {
        const dataToStore: StoredData = { items, quantities, notes, pastOrders };
        const dataString = JSON.stringify(dataToStore);
        const expires = new Date();
        expires.setDate(expires.getDate() + 365); // 1 year expiry
        document.cookie = `${COOKIE_KEY}=${encodeURIComponent(dataString)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      } catch (error) {
        console.error("Failed to save data to cookies", error);
      }
    }
  }, [items, quantities, notes, pastOrders, isLoaded, consent]);

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
  
  const setAllQuantities = useCallback((newQuantities: Quantities) => {
    setQuantities(newQuantities);
  }, []);

  const updateNotes = useCallback((newNotes: string) => {
    setNotes(newNotes);
  }, []);

  const addItem = useCallback((name: string) => {
    const newItem = { id: `item-${Date.now()}-${Math.random()}`, name };
    setItems(prev => [...prev, newItem]);
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });
  }, []);

  const saveOrder = useCallback(() => {
    if (Object.keys(quantities).length === 0 || !consent) return;

    const newOrder: PastOrder = {
      date: new Date().toISOString(),
      items: Object.entries(quantities).map(([id, quantity]) => ({ id, quantity })),
    };

    setPastOrders(prev => {
      const updatedOrders = [newOrder, ...prev];
      if (updatedOrders.length > MAX_PAST_ORDERS) {
        return updatedOrders.slice(0, MAX_PAST_ORDERS);
      }
      return updatedOrders;
    });
  }, [quantities, consent]);

  const clearList = useCallback(() => {
    setQuantities({});
    setNotes('');
  }, []);

  return {
    items,
    quantities,
    notes,
    isLoaded,
    pastOrders,
    updateQuantity,
    updateNotes,
    addItem,
    deleteItem,
    saveOrder,
    setQuantities: setAllQuantities,
    clearList,
  };
}

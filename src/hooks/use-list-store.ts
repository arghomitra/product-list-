'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item } from '@/data/items';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

const COOKIE_KEY = 'prolist-data';
const MAX_PAST_ORDERS = 20;

export type Quantities = { [key: string]: number };

export type PastOrderItem = {
  id: string;
  quantity: number;
};
export type PastOrder = {
  date: string;
  items: PastOrderItem[];
};

type StoredData = {
  items: Item[];
  quantities: Quantities;
  pastOrders: PastOrder[];
};

export function useListStore() {
  const [items, setItems] = useState<Item[]>([]);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { consent } = useCookieConsent();
  
  // Effect to fetch initial items from Google Sheet
  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTVhC7TK3cb5Q6xA9aNx6D88y4AEHt8EODrricZ79BJb1_OZ6IxJcRErCZxN69Rc0kqOR7mjHehOEW5/pub?gid=0&single=true&output=csv');
        const csvText = await response.text();
        const itemNames = csvText.split('\n').slice(1).map(row => row.trim()).filter(Boolean);
        const fetchedItems: Item[] = itemNames.map((name, index) => ({
          id: `item-${index + 1}`,
          name,
        }));
        setItems(fetchedItems);
      } catch (error) {
        console.error("Failed to fetch items from Google Sheet", error);
        // Fallback to empty list or some default
        setItems([]);
      }
    }
    fetchItems();
  }, []);


  // Effect to load data from cookies once consent is given and confirmed.
  useEffect(() => {
    if (consent === null || items.length === 0) return; // Don't do anything until consent is determined and items are fetched

    let loadedData = false;
    if (consent) {
      try {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${COOKIE_KEY}=`));

        if (cookieValue) {
          const storedDataJSON = decodeURIComponent(cookieValue.split('=')[1]);
          const storedData: StoredData = JSON.parse(storedDataJSON);
          
          if (storedData.quantities) setQuantities(storedData.quantities);
          if (storedData.pastOrders) setPastOrders(storedData.pastOrders);
          loadedData = true;
        }
      } catch (error) {
        console.error("Failed to load data from cookies", error);
      }
    }

    if (!consent || !loadedData) {
      // If consent is denied or no cookie, reset to default state
      setQuantities({});
      setPastOrders([]);
    }
    setIsLoaded(true);
  }, [consent, items]);

  // Effect to save data to cookies whenever it changes.
  useEffect(() => {
    // Only save if data has been loaded and consent is granted.
    if (isLoaded && consent) {
      try {
        // We only store user-generated data, not the item list itself
        const dataToStore = { quantities, pastOrders };
        const dataString = JSON.stringify(dataToStore);
        const expires = new Date();
        expires.setDate(expires.getDate() + 365); // 1 year expiry
        document.cookie = `${COOKIE_KEY}=${encodeURIComponent(dataString)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      } catch (error) {
        console.error('Failed to save data to cookies', error);
      }
    }
  }, [quantities, pastOrders, isLoaded, consent]);

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

  const addItem = useCallback((name: string) => {
    // This function is now effectively disabled as items are managed in Google Sheets.
    // We could show a toast message to inform the user.
    console.log("Items are managed via Google Sheets and cannot be added here.");
  }, []);

  const deleteItem = useCallback((itemId: string) => {
     // This function is now effectively disabled as items are managed in Google Sheets.
    console.log("Items are managed via Google Sheets and cannot be deleted here.");
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
  }, []);

  return {
    items,
    quantities,
    isLoaded,
    pastOrders,
    updateQuantity,
    addItem,
    deleteItem,
    saveOrder,
    setQuantities: setAllQuantities,
    clearList,
  };
}

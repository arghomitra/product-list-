export type Item = {
  id: string;
  name: string;
};

// This file is no longer the primary source of items.
// Items are now fetched from a Google Sheet in use-list-store.ts.
// This is kept for type definition.
export const initialItems: Item[] = [];

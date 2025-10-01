// src/types/cart.ts
import { Product } from './product';

/**
 * Represents an item within the shopping cart.
 * The productId is populated with the full product details.
 */
export interface CartItem {
  _id: string;
  productId: Product;
  quantity: number;
}

/**
 * Represents the user's shopping cart.
 */
export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
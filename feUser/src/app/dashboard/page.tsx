"use client";

import { getProducts } from "@/services/productService";
import { use } from "react";

export default function DashboardPage() {
  const products = use(getProducts());

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {products.map((product: any) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
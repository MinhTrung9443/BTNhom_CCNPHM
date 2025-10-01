import { Product } from '@/types/product';
import ProductCard from './product-card';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

export default function ProductSection({ title, subtitle, products }: ProductSectionProps) {
  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
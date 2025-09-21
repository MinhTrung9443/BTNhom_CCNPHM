import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import ProductSection from './ProductSection'; 
const RecentlyViewedSection = ({ currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchViewed = async () => {
      const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
      const idsToFetch = viewedIds.filter(id => id !== currentProductId);

      if (idsToFetch.length > 0) {
        setLoading(true);
        try {
          const response = await productService.getProductsByIds(idsToFetch);
          const sortedProducts = idsToFetch.map(id => 
            response.data.data.find(p => p._id === id)
          ).filter(Boolean);

          setProducts(sortedProducts);
        } catch (error) {
          console.error("Failed to fetch recently viewed products", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchViewed();
  }, [currentProductId]); 

  if (products.length === 0) {
    return null;
  }

  return (
    <ProductSection
      title="Sản phẩm đã xem gần đây"
      products={products}
      loading={loading}
    />
  );
};

export default RecentlyViewedSection;
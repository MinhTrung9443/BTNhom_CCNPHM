import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { productService } from '../services/productService';
import ProductSection from '../components/common/ProductSection';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HomePage.css';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    latestProducts: [],
    bestSellers: [],
    mostViewed: [],
    topDiscounts: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        setLoading(true);
        
        const [latest, bestSellers, mostViewed, topDiscounts] = await Promise.allSettled([
          productService.getLatestProducts(),
          productService.getBestSellerProducts(),
          productService.getMostViewedProducts(),
          productService.getTopDiscountProducts()
        ]);

        setData({
          latestProducts: latest.status === 'fulfilled' ? latest.value.data : [],
          bestSellers: bestSellers.status === 'fulfilled' ? bestSellers.value.data : [],
          mostViewed: mostViewed.status === 'fulfilled' ? mostViewed.value.data : [],
          topDiscounts: topDiscounts.status === 'fulfilled' ? topDiscounts.value.data : []
        });

        setErrors({
          latest: latest.status === 'rejected' ? latest.reason : null,
          bestSellers: bestSellers.status === 'rejected' ? bestSellers.reason : null,
          mostViewed: mostViewed.status === 'rejected' ? mostViewed.reason : null,
          topDiscounts: topDiscounts.status === 'rejected' ? topDiscounts.reason : null
        });

      } catch (error) {
        console.error('Error fetching homepage data:', error);
        setErrors({ general: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section page-section">
        <div className="hero-content text-center py-5">
          <Container className="container-spacing">
            <h1 className="hero-title mb-4">
              🏺 Đặc Sản Sóc Trăng Chính Gốc
            </h1>
            <p className="hero-subtitle mb-4">
              Khám phá hương vị truyền thống đậm đà từ vùng đất Sóc Trăng
            </p>
            <button className="btn btn-warning btn-lg">
              Khám phá ngay
            </button>
          </Container>
        </div>
      </section>

      {/* Latest Products */}
      <section className="latest-products page-section">
        <Container className="container-spacing">
          <ProductSection 
            title="Sản phẩm mới nhất"
            subtitle="Khám phá những đặc sản Sóc Trăng vừa ra mắt"
            products={data.latestProducts}
            loading={loading}
            error={errors.latest}
          />
        </Container>
      </section>

      {/* Best Sellers */}
      <section className="bestsellers page-section">
        <Container className="container-spacing">
          <ProductSection 
            title="Sản phẩm bán chạy"
            subtitle="Những món đặc sản được yêu thích nhất"
            products={data.bestSellers}
            loading={loading}
            error={errors.bestSellers}
          />
        </Container>
      </section>

      {/* Most Viewed */}
      <section className="most-viewed page-section">
        <Container className="container-spacing">
          <ProductSection 
            title="Sản phẩm được xem nhiều"
            subtitle="Những sản phẩm thu hút nhiều sự quan tâm"
            products={data.mostViewed}
            loading={loading}
            error={errors.mostViewed}
          />
        </Container>
      </section>

      {/* Top Discounts */}
      <section className="top-discounts page-section">
        <Container className="container-spacing">
          <ProductSection 
            title="Khuyến mãi cao nhất"
            subtitle="Đừng bỏ lỡ những ưu đãi hấp dẫn"
            products={data.topDiscounts}
            loading={loading}
            error={errors.topDiscounts}
          />
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
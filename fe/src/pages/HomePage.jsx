import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductSection from '../components/common/ProductSection';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HomePage.css';

const HomePage = () => {
 
  const [loading, setLoading] = useState({
    latest: false,
    bestSellers: false,
    mostViewed: false,
    topDiscounts: false
  });

  const [data, setData] = useState({
    latestProducts: [],
    bestSellers: [],
    mostViewed: [],
    topDiscounts: []
  });

  const [pagination, setPagination] = useState({
    latest: { currentPage: 1, totalPages: 1 },
    bestSellers: { currentPage: 1, totalPages: 1 },
    mostViewed: { currentPage: 1, totalPages: 1 },
    topDiscounts: { currentPage: 1, totalPages: 1 }
  });

  const [errors, setErrors] = useState({});

  // Fetch latest products
  const fetchLatestProducts = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, latest: true }));
      const response = await productService.getLatestProducts(page, 8);
      
      // Check if response has pagination structure
      if (response.data?.pagination) {
        // New structure with pagination
        setData(prev => ({ ...prev, latestProducts: response.data.products }));
        setPagination(prev => ({
          ...prev,
          latest: {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages
          }
        }));
      } else {
        // Old structure without pagination
        setData(prev => ({ ...prev, latestProducts: response.data || [] }));
        setPagination(prev => ({
          ...prev,
          latest: { currentPage: 1, totalPages: 1 }
        }));
      }
      setErrors(prev => ({ ...prev, latest: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, latest: error }));
    } finally {
      setLoading(prev => ({ ...prev, latest: false }));
    }
  };

  // Fetch best sellers
  const fetchBestSellers = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, bestSellers: true }));
      const response = await productService.getBestSellerProducts(page, 4);
      
      if (response.data?.pagination) {
        setData(prev => ({ ...prev, bestSellers: response.data.products }));
        setPagination(prev => ({
          ...prev,
          bestSellers: {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages
          }
        }));
      } else {
        setData(prev => ({ ...prev, bestSellers: response.data || [] }));
        setPagination(prev => ({
          ...prev,
          bestSellers: { currentPage: 1, totalPages: 1 }
        }));
      }
      setErrors(prev => ({ ...prev, bestSellers: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, bestSellers: error }));
    } finally {
      setLoading(prev => ({ ...prev, bestSellers: false }));
    }
  };

  // Fetch most viewed
  const fetchMostViewed = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, mostViewed: true }));
      const response = await productService.getMostViewedProducts(page, 4);
      
      if (response.data?.pagination) {
        setData(prev => ({ ...prev, mostViewed: response.data.products }));
        setPagination(prev => ({
          ...prev,
          mostViewed: {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages
          }
        }));
      } else {
        setData(prev => ({ ...prev, mostViewed: response.data || [] }));
        setPagination(prev => ({
          ...prev,
          mostViewed: { currentPage: 1, totalPages: 1 }
        }));
      }
      setErrors(prev => ({ ...prev, mostViewed: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, mostViewed: error }));
    } finally {
      setLoading(prev => ({ ...prev, mostViewed: false }));
    }
  };

  // Fetch top discounts
  const fetchTopDiscounts = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, topDiscounts: true }));
      const response = await productService.getTopDiscountProducts(page, 4);
      
      if (response.data?.pagination) {
        setData(prev => ({ ...prev, topDiscounts: response.data.products }));
        setPagination(prev => ({
          ...prev,
          topDiscounts: {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages
          }
        }));
      } else {
        setData(prev => ({ ...prev, topDiscounts: response.data || [] }));
        setPagination(prev => ({
          ...prev,
          topDiscounts: { currentPage: 1, totalPages: 1 }
        }));
      }
      setErrors(prev => ({ ...prev, topDiscounts: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, topDiscounts: error }));
    } finally {
      setLoading(prev => ({ ...prev, topDiscounts: false }));
    }
  };

  useEffect(() => {
    fetchLatestProducts();
    fetchBestSellers();
    fetchMostViewed();
    fetchTopDiscounts();
  }, []);

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

      {/* Latest Products - 8 sản phẩm với phân trang */}
      <section className="latest-products page-section">
        <Container className="container-spacing">
          <ProductSection 
            title="Sản phẩm mới nhất"
            subtitle="Khám phá những đặc sản Sóc Trăng vừa ra mắt"
            products={data.latestProducts}
            loading={loading.latest}
            error={errors.latest}
            enablePagination={pagination.latest.totalPages > 1}
            currentPage={pagination.latest.currentPage}
            totalPages={pagination.latest.totalPages}
            onPageChange={fetchLatestProducts}
            itemsPerPage={8}
          />
        </Container>
      </section>

      {/* Best Sellers - 4 sản phẩm với phân trang */}
      <section className="bestsellers page-section">
        <Container className="container-spacing">
          <ProductSection 
            title="Sản phẩm bán chạy"
            subtitle="Những món đặc sản được yêu thích nhất"
            products={data.bestSellers}
            loading={loading.bestSellers}
            error={errors.bestSellers}
            enablePagination={pagination.bestSellers.totalPages > 1}
            currentPage={pagination.bestSellers.currentPage}
            totalPages={pagination.bestSellers.totalPages}
            onPageChange={fetchBestSellers}
            itemsPerPage={4}
          />
        </Container>
      </section>

      {/* Most Viewed - 4 sản phẩm với phân trang */}
      <section className="most-viewed page-section">
        <Container className="container-spacing">
          <ProductSection 
            title="Sản phẩm được xem nhiều"
            subtitle="Những sản phẩm thu hút nhiều sự quan tâm"
            products={data.mostViewed}
            loading={loading.mostViewed}
            error={errors.mostViewed}
            enablePagination={pagination.mostViewed.totalPages > 1}
            currentPage={pagination.mostViewed.currentPage}
            totalPages={pagination.mostViewed.totalPages}
            onPageChange={fetchMostViewed}
            itemsPerPage={4}
          />
        </Container>
      </section>

      {/* Top Discounts - 4 sản phẩm với phân trang */}
      <section className="top-discounts page-section">
        <Container className="container-spacing">
          <ProductSection 
            title="Khuyến mãi cao nhất"
            subtitle="Đừng bỏ lỡ những ưu đãi hấp dẫn"
            products={data.topDiscounts}
            loading={loading.topDiscounts}
            error={errors.topDiscounts}
            enablePagination={pagination.topDiscounts.totalPages > 1}
            currentPage={pagination.topDiscounts.currentPage}
            totalPages={pagination.topDiscounts.totalPages}
            onPageChange={fetchTopDiscounts}
            itemsPerPage={4}
          />
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
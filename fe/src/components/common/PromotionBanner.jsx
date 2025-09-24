import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { couponService } from '../../services/couponService';
import './PromotionBanner.css';



const PromotionBanner = () => {
  const [activePromotions, setActivePromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  // Auto-rotate promotions every 5 seconds
  useEffect(() => {
    if (activePromotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prevIndex) =>
          prevIndex === activePromotions.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activePromotions.length]);

  const fetchActivePromotions = async () => {
    try {
      setLoading(true);
      const response = await couponService.getActivePromotions(5);
      const promotions = response.data || [];

      // Sort by priority (you can add a priority field to your model if needed)
      const sortedPromos = promotions.sort((a, b) => {
        // Prioritize percentage discounts over fixed amount
        if (a.discountType === 'percentage' && b.discountType === 'fixed') return -1;
        if (a.discountType === 'fixed' && b.discountType === 'percentage') return 1;
        return 0;
      });

      setActivePromotions(sortedPromos);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setActivePromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (promotion) => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}%`;
    } else {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(promotion.discountValue);
    }
  };

  const getDiscountBadgeColor = (promotion) => {
    if (promotion.discountType === 'percentage') {
      const percentage = promotion.discountValue;
      if (percentage >= 50) return 'danger';
      if (percentage >= 30) return 'warning';
      if (percentage >= 20) return 'success';
      return 'info';
    } else {
      return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="promotion-banner loading">
        <Container>
          <div className="text-center py-2">
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (activePromotions.length === 0) {
    return null; // Don't show banner if no active promotions
  }

  const currentPromo = activePromotions[currentPromoIndex];

  return (
    <div className="promotion-banner">
      <Container>
        <Row className="align-items-center">
          <Col md={8}>
            <div className="promotion-content">
              <div className="promotion-text">
                <Badge
                  bg={getDiscountBadgeColor(currentPromo)}
                  className="promotion-badge mb-2"
                >
                  🎉 {formatDiscount(currentPromo)} OFF
                </Badge>
                <h3 className="promotion-title">{currentPromo.name}</h3>
                <p className="promotion-code mb-0">
                  Mã: <strong>{currentPromo.code}</strong>
                </p>
              </div>
            </div>
          </Col>
          <Col md={4} className="text-end">
            <div className="promotion-actions">
              <Button
                variant="outline-light"
                size="sm"
                className="me-2"
                onClick={() => {
                  navigator.clipboard.writeText(currentPromo.code);
                  // You could add a toast notification here
                }}
              >
                <i className="fas fa-copy me-1"></i>
                Copy mã
              </Button>
              {activePromotions.length > 1 && (
                <div className="promotion-dots mt-2">
                  {activePromotions.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${index === currentPromoIndex ? 'active' : ''}`}
                      onClick={() => setCurrentPromoIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PromotionBanner;

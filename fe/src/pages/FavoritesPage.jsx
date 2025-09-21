import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import  userService  from '../services/userService';
import ProductCard from '../components/product/ProductCard'; 
import LoadingSpinner from '../components/common/LoadingSpinner';

const FavoritesPage = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await userService.getFavorites(); 
        setFavoriteProducts(response.data.favorites);
      } catch (err) {
        console.error('Failed to fetch favorite products:', err);
        setError('Không thể tải danh sách sản phẩm yêu thích. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <h1 className="mb-4">Sản phẩm yêu thích</h1>
      {favoriteProducts.length > 0 ? (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {favoriteProducts.map(product => (
            <Col key={product._id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">
          Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm sản phẩm vào danh sách nhé!
        </Alert>
      )}
    </Container>
  );
};

export default FavoritesPage;
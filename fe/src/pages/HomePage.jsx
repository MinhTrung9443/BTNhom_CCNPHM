import React from 'react';
import { Container } from 'react-bootstrap';
import Header from '../components/common/Header'; 
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div>
            <Header />
            <Container className="mt-4">
                <h1>Chào mừng đến với trang chủ!</h1>
                {user && <p>Bạn đã đăng nhập với tư cách là <strong>{user.name}</strong>.</p>}
            </Container>
        </div>
    );
};

export default HomePage;
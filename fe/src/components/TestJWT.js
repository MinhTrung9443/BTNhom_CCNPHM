import React, { useState } from 'react';
import { testJWTFrontend } from '../utils/testJWT';
import './TestJWT.css';

const TestJWT = () => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const addResult = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setResults(prev => [...prev, { message, type, timestamp }]);
    };

    const clearResults = () => {
        setResults([]);
    };

    const handleTestLogin = async () => {
        setIsLoading(true);
        addResult('🔐 Đang test login...', 'info');
        
        const result = await testJWTFrontend.testLogin();
        if (result.success) {
            addResult(`✅ Login thành công! User: ${result.user.email}`, 'success');
        } else {
            addResult(`❌ Login lỗi: ${result.error}`, 'error');
        }
        setIsLoading(false);
    };

    const handleTestAuthRequest = async () => {
        setIsLoading(true);
        addResult('🔒 Đang test authenticated request...', 'info');
        
        const result = await testJWTFrontend.testAuthenticatedRequest();
        if (result.success) {
            addResult(`✅ API call thành công! Profile: ${result.data.email}`, 'success');
        } else {
            addResult(`❌ API call lỗi: ${result.error}`, 'error');
        }
        setIsLoading(false);
    };

    const handleCheckToken = () => {
        addResult('🔍 Đang kiểm tra token...', 'info');
        const result = testJWTFrontend.checkToken();
        
        if (result.hasToken) {
            addResult(`✅ Có token! User: ${result.user?.email || 'Unknown'}`, 'success');
        } else {
            addResult('❌ Không có token trong localStorage', 'warning');
        }
    };

    const handleTestLogout = async () => {
        addResult('🚪 Đang test logout...', 'info');
        await testJWTFrontend.testLogout();
        addResult('✅ Logout thành công! Token đã được xóa.', 'success');
    };

    const handleFullTest = async () => {
        setIsLoading(true);
        clearResults();
        addResult('🚀 Bắt đầu full JWT test...', 'info');
        
        await testJWTFrontend.runFullTest();
        addResult('🎉 Hoàn thành full JWT test!', 'success');
        setIsLoading(false);
    };

    return (
        <div className="test-jwt-container">
            <h2>🔐 JWT Authentication Test</h2>
            
            <div className="test-buttons">
                <button onClick={handleCheckToken} disabled={isLoading}>
                    🔍 Kiểm tra Token
                </button>
                <button onClick={handleTestLogin} disabled={isLoading}>
                    🔐 Test Login
                </button>
                <button onClick={handleTestAuthRequest} disabled={isLoading}>
                    🔒 Test Auth Request
                </button>
                <button onClick={handleTestLogout} disabled={isLoading}>
                    🚪 Test Logout
                </button>
                <button onClick={handleFullTest} disabled={isLoading} className="full-test-btn">
                    🚀 Full Test
                </button>
                <button onClick={clearResults} disabled={isLoading} className="clear-btn">
                    🗑️ Clear Results
                </button>
            </div>

            {isLoading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <span>Đang thực hiện test...</span>
                </div>
            )}

            <div className="test-results">
                <h3>📊 Kết quả Test:</h3>
                {results.length === 0 ? (
                    <p className="no-results">Chưa có kết quả test nào.</p>
                ) : (
                    <div className="results-list">
                        {results.map((result, index) => (
                            <div key={index} className={`result-item ${result.type}`}>
                                <span className="timestamp">[{result.timestamp}]</span>
                                <span className="message">{result.message}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="test-info">
                <h3>📋 Thông tin Test:</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <strong>Backend URL:</strong> http://localhost:3000/api/auth
                    </div>
                    <div className="info-item">
                        <strong>Test Account:</strong> test@example.com / 123456
                    </div>
                    <div className="info-item">
                        <strong>Token Storage:</strong> localStorage
                    </div>
                    <div className="info-item">
                        <strong>Token Expiry:</strong> 7 ngày
                    </div>
                </div>
            </div>

            <div className="test-instructions">
                <h3>🔧 Hướng dẫn Test:</h3>
                <ol>
                    <li><strong>Kiểm tra Token:</strong> Xem có token nào đã lưu chưa</li>
                    <li><strong>Test Login:</strong> Đăng nhập và lưu token</li>
                    <li><strong>Test Auth Request:</strong> Gọi API với token</li>
                    <li><strong>Test Logout:</strong> Xóa token khỏi localStorage</li>
                    <li><strong>Full Test:</strong> Chạy tất cả test theo thứ tự</li>
                </ol>
                
                <div className="note">
                    <strong>Lưu ý:</strong> Đảm bảo backend server đang chạy trên port 3000 
                    và đã tạo test user bằng lệnh <code>npm run create-test-user</code>
                </div>
            </div>
        </div>
    );
};

export default TestJWT;

import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Components
import ProductCardOrder from '../components/common/ProductCardOrder';
import RecipientInfoForm from '../components/common/RecipientInfoForm';
import PaymentMethodSelector from '../components/common/PaymentMethodSelector';
import ShippingMethodSelector from '../components/common/ShippingMethodSelector';
import VoucherSelector from '../components/common/VoucherSelector';
import PointsToggle from '../components/common/PointsToggle';
import OrderSummaryCard from '../components/common/OrderSummaryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import DebugPanel from '../components/common/DebugPanel';

// Services
import * as orderService from '../services/orderService';
import couponService from '../services/couponService';
import paymentService from '../services/paymentService';
import { createOrder } from '../services/orderService';

const initialState = {
  previewData: {
    orderLines: [],
    recipientName: '',
    phoneNumber: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    paymentMethod: '',
    subtotal: 0,
    shippingFee: 0,
    discount: 0,
    pointsApplied: 0,
    totalAmount: 0,
  },
  vouchers: {
    userVouchers: [],
    selectedVoucher: null,
  },
  deliveryMethods: {
    availableMethods: [],
    selectedMethod: null,
  },
  loading: {
    preview: true,
    vouchers: false,
    deliveryMethods: false,
  },
  errors: {
    preview: null,
    vouchers: null,
    deliveryMethods: null,
  },
};

function orderPreviewReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_START':
      return { ...state, loading: { ...state.loading, preview: true }, errors: { ...state.errors, preview: null } };
    case 'INITIALIZE_SUCCESS':
      return { ...state, loading: { ...state.loading, preview: false }, previewData: { ...state.previewData, ...action.payload } };
    case 'INITIALIZE_FAILURE':
      return { ...state, loading: { ...state.loading, preview: false }, errors: { ...state.errors, preview: action.payload } };
    case 'UPDATE_PREVIEW_DATA':
      return { ...state, previewData: { ...state.previewData, ...action.payload } };
    case 'SET_RECIPIENT_INFO':
      return { ...state, previewData: { ...state.previewData, [action.payload.field]: action.payload.value } };
    case 'SET_VOUCHERS':
      return { ...state, vouchers: { ...state.vouchers, userVouchers: action.payload }, loading: { ...state.loading, vouchers: false } };
    case 'SET_VOUCHERS_LOADING':
        return { ...state, loading: { ...state.loading, vouchers: true } };
    case 'SET_VOUCHERS_ERROR':
        return { ...state, errors: { ...state.errors, vouchers: action.payload }, loading: { ...state.loading, vouchers: false } };
    case 'SELECT_VOUCHER':
      return { ...state, vouchers: { ...state.vouchers, selectedVoucher: action.payload } };
    case 'SET_DELIVERY_METHODS':
      return { ...state, deliveryMethods: { ...state.deliveryMethods, availableMethods: action.payload }, loading: { ...state.loading, deliveryMethods: false } };
    case 'SET_DELIVERY_METHODS_LOADING':
        return { ...state, loading: { ...state.loading, deliveryMethods: true } };
    case 'SET_DELIVERY_METHODS_ERROR':
        return { ...state, errors: { ...state.errors, deliveryMethods: action.payload }, loading: { ...state.loading, deliveryMethods: false } };
    case 'SELECT_DELIVERY_METHOD':
      return { ...state, deliveryMethods: { ...state.deliveryMethods, selectedMethod: action.payload } };
    case 'SET_PAYMENT_METHOD':
      return { ...state, previewData: { ...state.previewData, paymentMethod: action.payload } };
    case 'SET_POINTS_TO_APPLY':
        return { ...state, previewData: { ...state.previewData, pointsApplied: action.payload } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}


const OrderPreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedCartItems = location.state?.selectedItems || [];
  
  const user = useSelector(state => state.user.user);
  const loyaltyPoints = useSelector(state => state.user.loyaltyPoints);

  const [state, dispatch] = useReducer(orderPreviewReducer, initialState);
  const { previewData, loading, errors, vouchers, deliveryMethods } = state;

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const updatePreview = useCallback(async (changes) => {
    dispatch({ type: 'INITIALIZE_START' });
    try {
      const payload = {
        orderLines: state.previewData.orderLines.map(p => ({ productId: p.productId, quantity: p.quantity })),
        shippingMethod: changes.shippingMethod !== undefined ? changes.shippingMethod : state.deliveryMethods.selectedMethod?.type,
        pointsToApply: changes.pointsToApply !== undefined ? changes.pointsToApply : state.previewData.pointsApplied,
        ...changes,
      };
      
      // Determine the voucher code, prioritizing the one from the 'changes' object.
      const voucherCode = changes.voucherCode !== undefined
          ? changes.voucherCode
          : state.vouchers.selectedVoucher?.code;

      // If a voucher code exists (is not null or undefined), add it to the payload.
      if (voucherCode) {
          payload.voucherCode = voucherCode;
      } else {
          // Otherwise, ensure it is not in the payload, especially if it came from 'changes'.
          delete payload.voucherCode;
      }

      const response = await orderService.previewOrder(payload);
      dispatch({ type: 'INITIALIZE_SUCCESS', payload: response.data.previewOrder });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update order preview';
      toast.error(errorMessage);
      dispatch({ type: 'INITIALIZE_FAILURE', payload: errorMessage });
    }
  }, [state.previewData.orderLines, state.vouchers.selectedVoucher, state.deliveryMethods.selectedMethod, state.previewData.pointsApplied]);

  useEffect(() => {
    if (selectedCartItems.length === 0) {
      toast.error('Không có sản phẩm nào được chọn');
      navigate('/cart');
      return;
    }

    const orderLines = selectedCartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    const fetchVouchers = async (currentOrderLines) => {
        if (!currentOrderLines || currentOrderLines.length === 0) return;
        dispatch({ type: 'SET_VOUCHERS_LOADING' });
        try {
            const payload = { orderLines: currentOrderLines };
            const response = await couponService.getApplicableVouchers(payload);
            dispatch({ type: 'SET_VOUCHERS', payload: response.data });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch vouchers';
            toast.error(errorMessage);
            dispatch({ type: 'SET_VOUCHERS_ERROR', payload: errorMessage });
        }
    };

    const runInitialFetches = async () => {
      // Fetch methods first to get a default
      dispatch({ type: 'SET_DELIVERY_METHODS_LOADING' });
      let defaultShippingMethodType = null;
      try {
        const methodsResponse = await paymentService.getDeliveryOptions();
        const methods = methodsResponse.data;
        dispatch({ type: 'SET_DELIVERY_METHODS', payload: methods });
        if (methods && methods.length > 0) {
          const defaultMethod = methods[0];
          dispatch({ type: 'SELECT_DELIVERY_METHOD', payload: defaultMethod });
          defaultShippingMethodType = defaultMethod.type;
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch delivery methods';
        toast.error(errorMessage);
        dispatch({ type: 'SET_DELIVERY_METHODS_ERROR', payload: errorMessage });
      }

      // Now fetch initial preview with the default shipping method if available
      dispatch({ type: 'INITIALIZE_START' });
      try {
        const previewPayload = { orderLines };
        if (defaultShippingMethodType) {
          previewPayload.shippingMethod = defaultShippingMethodType;
        }
        const response = await orderService.previewOrder(previewPayload);
        dispatch({ type: 'INITIALIZE_SUCCESS', payload: response.data.previewOrder });
        
        if (user) {
          dispatch({ type: 'SET_RECIPIENT_INFO', payload: { field: 'recipientName', value: user.name || '' } });
          dispatch({ type: 'SET_RECIPIENT_INFO', payload: { field: 'phoneNumber', value: user.phone || '' } });
          if (user.address) {
            dispatch({ type: 'SET_RECIPIENT_INFO', payload: { field: 'street', value: user.address } });
          }
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to initialize order preview';
        toast.error(errorMessage);
        dispatch({ type: 'INITIALIZE_FAILURE', payload: errorMessage });
      }

      // Also fetch vouchers
      fetchVouchers(orderLines);

      // Set default payment method
      const paymentMethods = [
        { id: 'COD', label: 'Thanh toán khi nhận hàng (COD)' },
        { id: 'VNPAY', label: 'Ví điện tử VNPay' },
        { id: 'BANK', label: 'Chuyển khoản ngân hàng' }
      ];
      if (paymentMethods.length > 0) {
        dispatch({ type: 'SET_PAYMENT_METHOD', payload: paymentMethods[0].id });
      }
    };

    runInitialFetches();

    return () => {
      dispatch({ type: 'RESET' });
    };
  }, [navigate, user, selectedCartItems]);

  const handleVoucherSelect = (voucher) => {
    dispatch({ type: 'SELECT_VOUCHER', payload: voucher });
    updatePreview({ voucherCode: voucher?.code || null });
    setShowVoucherModal(false);
  };

  const handleDeliveryMethodSelect = (method) => {
    dispatch({ type: 'SELECT_DELIVERY_METHOD', payload: method });
    updatePreview({ shippingMethod: method?.type });
  };

  const handlePaymentMethodSelect = (method) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const handlePointsApply = (toggled) => {
    const pointsToApply = toggled ? Math.min(loyaltyPoints, Math.floor(previewData.subtotal * 0.5)) : 0;
    dispatch({ type: 'SET_POINTS_TO_APPLY', payload: pointsToApply });
    updatePreview({ pointsToApply });
  };

  const handleRecipientInfoChange = (field, value) => {
    dispatch({ type: 'SET_RECIPIENT_INFO', payload: { field, value } });
  };

  const validateForm = () => {
    const validationErrors = [];
    const requiredFields = {
      recipientName: 'Vui lòng nhập tên người nhận',
      phoneNumber: 'Vui lòng nhập số điện thoại',
      province: 'Vui lòng chọn tỉnh/thành phố',
      district: 'Vui lòng chọn quận/huyện',
      ward: 'Vui lòng chọn phường/xã',
      street: 'Vui lòng nhập địa chỉ cụ thể',
      paymentMethod: 'Vui lòng chọn phương thức thanh toán',
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!previewData[field] || !String(previewData[field]).trim()) {
        validationErrors.push(message);
      }
    }

    if (!deliveryMethods.selectedMethod) {
      validationErrors.push('Vui lòng chọn phương thức vận chuyển');
    }
    
    return validationErrors;
  };

  const handleCreateOrder = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setIsCreatingOrder(true);
    try {
      const orderPayload = {
        previewOrder: {
          ...previewData,
          shippingAddress: {
            recipientName: previewData.recipientName,
            phoneNumber: previewData.phoneNumber,
            province: previewData.province,
            district: previewData.district,
            ward: previewData.ward,
            street: previewData.street,
          },
          shippingMethod: deliveryMethods.selectedMethod.type,
          voucherCode: vouchers.selectedVoucher?.code,
        }
      };

      // Remove fields not allowed by the backend from the root of previewOrder
      delete orderPayload.previewOrder.recipientName;
      delete orderPayload.previewOrder.phoneNumber;
      delete orderPayload.previewOrder.province;
      delete orderPayload.previewOrder.district;
      delete orderPayload.previewOrder.ward;
      delete orderPayload.previewOrder.street;
      
      const response = await createOrder(orderPayload);
      toast.success('Đặt hàng thành công!');
      navigate('/order-success', {
        state: { 
          orderId: response.data._id,
          orderData: response.data 
        }
      });
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading.preview && previewData.orderLines.length === 0) {
    return <LoadingSpinner message="Đang tải thông tin đơn hàng..." />;
  }

  if (errors.preview && !loading.preview) {
    return (
      <ErrorState 
        message={errors.preview}
        onRetry={() => window.location.reload()} // Simple retry by reloading
      />
    );
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Xem lại đơn hàng</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/cart')}>
          ← Quay lại giỏ hàng
        </Button>
      </div>

      <DebugPanel data={{ selectedCartItems, orderPreviewState: state, loyaltyPoints }} title="Order Preview Debug Data" />

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Sản phẩm</h5></Card.Header>
            <Card.Body>
              {previewData.orderLines && <ProductCardOrder products={previewData.orderLines} />}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Thông tin người nhận</h5></Card.Header>
            <Card.Body>
              <RecipientInfoForm 
                formData={previewData}
                onChange={handleRecipientInfoChange}
              />
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Phương thức vận chuyển</h5></Card.Header>
            <Card.Body>
              <ShippingMethodSelector
                methods={deliveryMethods.availableMethods}
                selectedMethod={deliveryMethods.selectedMethod}
                onMethodSelect={handleDeliveryMethodSelect}
                loading={loading.deliveryMethods}
                error={errors.deliveryMethods}
              />
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Phương thức thanh toán</h5></Card.Header>
            <Card.Body>
              <PaymentMethodSelector
                selectedMethod={previewData.paymentMethod}
                onMethodSelect={handlePaymentMethodSelect}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Mã giảm giá</h5></Card.Header>
            <Card.Body>
              <VoucherSelector
                selectedVoucher={vouchers.selectedVoucher}
                userVouchers={vouchers.userVouchers}
                onSelectVoucher={handleVoucherSelect}
                onClearVoucher={() => handleVoucherSelect(null)}
                isLoading={loading.vouchers}
                error={errors.vouchers}
              />
            </Card.Body>
          </Card>

          <PointsToggle
            availablePoints={loyaltyPoints}
            appliedPoints={previewData.pointsApplied}
            orderSubtotal={previewData.subtotal || 0}
            onToggle={() => handlePointsApply(previewData.pointsApplied === 0)}
            isLoading={loading.preview}
          />

          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Tóm tắt đơn hàng</h5></Card.Header>
            <Card.Body>
              <OrderSummaryCard
                subtotal={previewData.subtotal}
                shippingFee={previewData.shippingFee}
                discount={previewData.discount}
                pointsApplied={previewData.pointsApplied}
                totalAmount={previewData.totalAmount}
                voucherCode={vouchers.selectedVoucher?.code}
              />
            </Card.Body>
          </Card>

          <div className="d-grid gap-2">
            <Button variant="primary" size="lg" onClick={handleCreateOrder} disabled={isCreatingOrder || loading.preview}>
              {isCreatingOrder ? (
                <><Spinner animation="border" size="sm" className="me-2" />Đang xử lý...</>
              ) : (
                <>
                  Xác nhận đặt hàng
                  {previewData.totalAmount > 0 && (
                    <Badge bg="light" text="dark" className="ms-2">
                      {formatCurrency(previewData.totalAmount)}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>

    </Container>
  );
};

export default OrderPreviewPage;
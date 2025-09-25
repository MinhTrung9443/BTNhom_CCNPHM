/**
 * Validate order preview request data
 * @param {object} requestData - Request data to validate
 * @returns {object} Validation result
 */
export const validateOrderPreviewRequest = (requestData) => {
  const errors = [];
  
  // Check required orderLines
  if (!requestData.orderLines || !Array.isArray(requestData.orderLines) || requestData.orderLines.length === 0) {
    errors.push('orderLines is required and must contain at least 1 item');
  } else {
    // Validate each order line
    requestData.orderLines.forEach((line, index) => {
      if (!line.productId) {
        errors.push(`orderLines[${index}].productId is required`);
      }
      if (!line.quantity || line.quantity < 1) {
        errors.push(`orderLines[${index}].quantity must be at least 1`);
      }
    });
  }
  
  // Validate shippingMethod if provided
  if (requestData.shippingMethod && !['express', 'regular', 'standard'].includes(requestData.shippingMethod)) {
    errors.push('shippingMethod must be one of [express, regular, standard]');
  }
  
  // Validate payment method if provided
  if (requestData.payment) {
    if (!requestData.payment.paymentMethod) {
      errors.push('payment.paymentMethod is required when payment object is provided');
    } else if (!['VNPAY', 'COD', 'BANK'].includes(requestData.payment.paymentMethod)) {
      errors.push('payment.paymentMethod must be one of [VNPAY, COD, BANK]');
    }
  }
  
  // Validate shippingAddress if provided
  if (requestData.shippingAddress) {
    const requiredAddressFields = ['recipientName', 'phoneNumber', 'province', 'district', 'ward', 'street'];
    requiredAddressFields.forEach(field => {
      if (!requestData.shippingAddress[field]) {
        errors.push(`shippingAddress.${field} is required`);
      }
    });
  }
  
  // Validate pointsToApply if provided
  if (requestData.pointsToApply !== undefined) {
    if (typeof requestData.pointsToApply !== 'number' || requestData.pointsToApply < 0) {
      errors.push('pointsToApply must be a non-negative number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Clean request data by removing empty/undefined values
 * @param {object} requestData - Request data to clean
 * @returns {object} Cleaned request data
 */
export const cleanOrderPreviewRequest = (requestData) => {
  const cleaned = { ...requestData };
  
  // Remove empty strings and undefined values, but keep 0 and false
  Object.keys(cleaned).forEach(key => {
    const value = cleaned[key];
    
    if (value === undefined || value === null || value === '') {
      delete cleaned[key];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Clean nested objects
      const cleanedNested = cleanOrderPreviewRequest(value);
      if (Object.keys(cleanedNested).length === 0) {
        delete cleaned[key];
      } else {
        cleaned[key] = cleanedNested;
      }
    }
  });
  
  return cleaned;
};

/**
 * Prepare order preview request data
 * @param {object} params - Parameters for building request
 * @returns {object} Prepared request data
 */
export const prepareOrderPreviewRequest = (params) => {
  const {
    selectedCartItems = [],
    orderPreviewState = {},
    changes = {}
  } = params;
  
  // Build base request
  const requestData = {
    orderLines: selectedCartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    ...changes // Apply changes first so they can override
  };
  
  // Always include current state values, but allow changes to override
  
  // Shipping Address
  if (orderPreviewState.data) {
    const hasCompleteAddress = orderPreviewState.data.recipientName && 
                               orderPreviewState.data.phoneNumber && 
                               orderPreviewState.data.province && 
                               orderPreviewState.data.district && 
                               orderPreviewState.data.ward && 
                               orderPreviewState.data.street;
    
    if (hasCompleteAddress && !changes.hasOwnProperty('shippingAddress')) {
      requestData.shippingAddress = {
        recipientName: orderPreviewState.data.recipientName,
        phoneNumber: orderPreviewState.data.phoneNumber,
        province: orderPreviewState.data.province,
        district: orderPreviewState.data.district,
        ward: orderPreviewState.data.ward,
        street: orderPreviewState.data.street
      };
    }
  }
  
  // Voucher Code - always include if exists
  if (orderPreviewState.vouchers?.selectedVoucher?.code && !changes.hasOwnProperty('voucherCode')) {
    requestData.voucherCode = orderPreviewState.vouchers.selectedVoucher.code;
  }
  
  // Shipping Method - always include if exists
  if (orderPreviewState.deliveryMethods?.selectedMethod?.type && !changes.hasOwnProperty('shippingMethod')) {
    requestData.shippingMethod = orderPreviewState.deliveryMethods.selectedMethod.type;
  }
  
  // Payment Method - always include if exists
  if (orderPreviewState.data?.paymentMethod && !changes.hasOwnProperty('payment')) {
    requestData.payment = {
      paymentMethod: orderPreviewState.data.paymentMethod
    };
  }
  
  // Points - always include if exists
  if (orderPreviewState.data?.pointsApplied >= 0 && !changes.hasOwnProperty('pointsToApply')) {
    requestData.pointsToApply = orderPreviewState.data.pointsApplied;
  }
  
  // Clean and validate
  const cleanedData = cleanOrderPreviewRequest(requestData);
  const validation = validateOrderPreviewRequest(cleanedData);
  
  return {
    requestData: cleanedData,
    validation
  };
};
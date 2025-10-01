import api from './apiService'

const sanitizeParams = (params = {}) => {
  const sanitized = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) {
      return
    }

    sanitized[key] = value
  })

  return sanitized
}

const voucherService = {
  createVoucher: (data) => {
    return api.post('/admin/vouchers', data)
  },

  updateVoucher: (voucherId, data) => {
    return api.put(`/admin/vouchers/${voucherId}`, data)
  },
  getVouchers: (params = {}) => {
    return api.get('/admin/vouchers', { params: sanitizeParams(params) })
  },

  getVoucherById: (voucherId) => {
    return api.get(`/admin/vouchers/${voucherId}`)
  },

  deactivateVoucher: (voucherId) => {
    return api.delete(`/admin/vouchers/${voucherId}`)
  },
}

export default voucherService





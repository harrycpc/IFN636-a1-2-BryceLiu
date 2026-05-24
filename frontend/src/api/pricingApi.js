import axiosInstance from '../axiosConfig';

// Simple API client for pricing endpoints
// Keep functions small and focused — used by admin UI and public display

export const getPublicPricing = async () => {
  const res = await axiosInstance.get('/api/pricing/public');
  return res.data;
};

// Admin functions require Authorization header set by caller
export const getAllLongStayRules = async (token) => {
  const res = await axiosInstance.get('/api/pricing/admin/long-stay-rules', { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const createLongStayRule = async (token, payload) => {
  const res = await axiosInstance.post('/api/pricing/admin/long-stay-rules', payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const updateLongStayRule = async (token, id, payload) => {
  const res = await axiosInstance.put(`/api/pricing/admin/long-stay-rules/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const deleteLongStayRule = async (token, id) => {
  const res = await axiosInstance.delete(`/api/pricing/admin/long-stay-rules/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getWeekendSurcharge = async (token) => {
  const res = await axiosInstance.get('/api/pricing/admin/weekend-surcharge', { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const updateWeekendSurcharge = async (token, payload) => {
  const res = await axiosInstance.put('/api/pricing/admin/weekend-surcharge', payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};


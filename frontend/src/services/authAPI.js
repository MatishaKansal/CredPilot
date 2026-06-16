import api from './api';

export const loginUser = async (email, password, role) => {
  const res = await api.post('/auth/login', { email, password, role });
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};
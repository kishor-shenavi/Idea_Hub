import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get('/api/v1/auth/me');
      setUser({ ...data.data, id: data.data._id });
    } catch (err) {
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/v1/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ ...data.user, id: data.user.id });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleToken) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/v1/auth/google', { token: googleToken });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ ...data.user, id: data.user.id });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const sendOtpForRegister = async (email) => {
    await axios.post('/api/v1/auth/sendotp', { email });
    localStorage.setItem('pendingEmail', email);
    navigate('/verify-otp');
  };

  const verifyOtpAndRegister = async (name, email, password, role, otp) => {
    setLoading(true);
    try {
      await axios.post('/api/v1/auth/verifyotp', { email, otp });
      const { data } = await axios.post('/api/v1/auth/register', { name, email, password, role });
      localStorage.setItem('token', data.token);
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingName');
      localStorage.removeItem('pendingPassword');
      localStorage.removeItem('pendingRole');
      setToken(data.token);
      setUser({ ...data.user, id: data.user.id });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUser();
  }, [token, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, googleLogin, sendOtpForRegister, verifyOtpAndRegister }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
//import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
//import { GoogleLogin } from '@react-oauth/google';
const AuthContext = createContext();
//const base_url='http://localhost:5000';
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/v1/auth/login', { email, password });
      console.log(data)
      localStorage.setItem('token', data.token);
      setToken(data.token);
      await fetchUser();
      navigate('/projects');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const googleLogin = async (token) => {
  localStorage.setItem('token', token);
  setToken(token);
  await fetchUser();
  navigate('/projects');
};


  // const register = async (name, email, password, role) => {
  //   try {
  //     const { data } = await axios.post('/api/v1/auth/register', {
  //       name,
  //       email,
  //       password,
  //       role
  //     });
  //     localStorage.setItem('token', data.token);
  //     setToken(data.token);
  //     await fetchUser();
  //    navigate('/projects');
    
  //   } catch (error) {
  //     console.log(error);
  //     console.error('Registration failed:', error);
  //     throw error;
  //   }
  // };
   
const sendOtpForRegister = async (email) => {
  try {
    const { data } = await axios.post('/api/v1/auth/sendotp', { email });

    localStorage.setItem('pendingEmail', email); // Store it temporarily
    navigate('/verify-otp'); // Go to OTP entry page

    return data;
  } catch (error) {
    console.error('OTP sending failed:', error);
    throw error;
  }
};
const verifyOtpAndRegister = async (name, email, password, role, otp) => {
  try {
    const { data: otpRes } = await axios.post('/api/v1/auth/verifyotp', {
      email,
      otp,
    });

    if (otpRes.success) {
      // Proceed with registration
      const { data } = await axios.post('/api/v1/auth/register', {
        name,
        email,
        password,
        role,
      });

      localStorage.setItem('token', data.token);
      localStorage.removeItem('pendingEmail'); // clear temporary email
      setToken(data.token);
      await fetchUser();
      navigate('/projects');
    } else {
      throw new Error("OTP verification failed");
    }
  } catch (error) {
    console.error('OTP verification or registration failed:', error);
    throw error;
  }
};


const fetchUser = useCallback(async () => {
  try {
    LoadingSpinner(true);
    const { data } = await axios.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userWithId = {
      ...data.data,
      id: data.data._id
    };

    setUser(userWithId);
  } catch (error) {
    if (
      error.response?.status === 401 || 
      error.response?.data?.message === 'Not authorized'
    ) {
      logout();
    } else {
      console.error("❌ Failed to fetch user but skipping logout:", error.message);
    }
  }finally {LoadingSpinner(false); }
}, [token, logout]);

//   const fetchUser = useCallback(async () => {
//   try {
//     const { data } = await axios.get('/api/v1/auth/me', {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     const userWithId = {
//       ...data.data,
//       id: data.data._id // Map _id to id
//     };

//     setUser(userWithId);
//     //console.log('Fetched user:', userWithId);

//   } catch (error) {
//     logout();
//   }
// }, [token, logout]);



//   const fetchUser = useCallback(async () => {
//     try {
//       const { data } = await axios.get('/api/v1/auth/me', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//      setUser({
//   ...data.data,
//   id: data.data._id  // Add a consistent `id` field
// });

//     } catch (error) {
//       logout();
//     }
//   }, [token, logout]);
// const fetchUser = useCallback(async () => {
//   try {
//     const { data } = await axios.get('/api/v1/auth/me', {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     // Ensure both id and _id exist for consistency in frontend
//     const userWithId = {
//       ...data.data,
//       id: data.data._id
//     };

//     setUser(userWithId);
//   console.log('Fetched user:', userWithId);
 

//   } catch (error) {
//     logout();
//   }
// }, [token, logout]);

  useEffect(() => {
    if (token) fetchUser();
  }, [token, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, login, 
    //register, 
    logout,googleLogin,  sendOtpForRegister,
    verifyOtpAndRegister }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };

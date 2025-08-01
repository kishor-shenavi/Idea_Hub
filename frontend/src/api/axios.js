import axios from 'axios';

const instance = axios.create({
  baseURL:  'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
// axios.js
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');  // ⬅️ fetch fresh every time
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// instance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     console.log("Token being sent:", token);
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default instance;
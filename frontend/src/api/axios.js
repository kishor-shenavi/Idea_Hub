import axios from 'axios';

// const instance = axios.create({
//   baseURL:  'http://localhost:5000',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
 
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("ENV:", process.env.REACT_APP_API_BASE_URL);



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






// import axios from 'axios';

// const instance = axios.create({
//   baseURL:"" , 
  
//   headers: {
//     'Content-Type': 'application/json',
    
//   },
// });


// // Request interceptor
// instance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     } else {
//       delete config.headers.Authorization;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );


// export default instance;

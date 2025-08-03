// import { createContext, useContext, useEffect, useRef, useState } from 'react';
// import io from 'socket.io-client';
// import { useAuth } from './AuthContext';

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const { token } = useAuth();
//   const [socket, setSocket] = useState(null);
//   const socketRef = useRef(null); // ✅ useRef to persist socket
// useEffect(() => {
//   if (!token) {
//     return; // Don't try to connect without token
//   }
//   console.log("token in socket provider:", token);
//   console.log('🧹 Cleaning up socket connection...');
//   if (socketRef.current) {
//     socketRef.current.disconnect();
//     console.log('🔌 Previous socket disconnected');
//   }

//   // const newSocket = io('http://localhost:5000', {
//   //   auth: { token },
//   //   transports: ['websocket'],
//   // });
// // const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'https://idea-hub-backend.onrender.com', {
// //   auth: { token },
// //   transports: ['websocket'],
// // });
// const newSocket = io('https://idea-hub-backend.onrender.com', {
//   auth: { token },
//   transports: ['websocket'],
// });

//   socketRef.current = newSocket;
//   setSocket(newSocket);

//   newSocket.on('connect', () => {
//     console.log('✅ Socket connected:', newSocket.id);
//   });
// console.log("sab thik till 33");
//   newSocket.on('connect_error', (err) => {
//     console.error('❌ Socket connection error:', err.message);
//   });

//   newSocket.on('disconnect', (reason) => {
//     console.warn('⚠️ Socket disconnected. Reason:', reason);
//   });

//   return () => {
//     newSocket.disconnect();
//   };
// }, [token]); // ⛳ Only run when token is available

//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);




import { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      console.log('🚫 No token, socket connection skipped.');
      return;
    }

    console.log('🔑 Token in socket provider:', token);

    // Clean up previous socket connection
    if (socketRef.current) {
      console.log('🧹 Cleaning up previous socket connection...');
      socketRef.current.disconnect();
    }

    // Create a new socket with retry mechanism
    const newSocket = io('https://idea-hub-backend.onrender.com', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true, // ✅ enable auto-reconnect
      reconnectionAttempts: 5, // ✅ max retries
      reconnectionDelay: 2000, // ✅ wait 2 seconds between retries
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected. Reason:', reason);
    });

    return () => {
      console.log('🧹 Cleanup: disconnecting socket...');
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);






// import { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/SocketContext';
// import axios from '../api/axios';
// import { FiSend } from 'react-icons/fi';

// function isValidObjectId(id) {
//   return /^[a-fA-F0-9]{24}$/.test(id);
// }

// export default function Chat() {
//   const { projectId, userId } = useParams();
//   const cleanProjectId = projectId.trim();
//   const cleanUserId = userId.trim();

//   const { user } = useAuth();
//   const socket = useSocket();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [recipient, setRecipient] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     const fetchChatData = async () => {
//       if (!isValidObjectId(cleanProjectId)) {
//         setError('Invalid project ID');
//         return;
//       }

//       try {
//         setLoading(true);

//         // Fetch project to get owner info
//         const { data: projectResponse } = await axios.get(`/api/v1/projects/${cleanProjectId}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
           
//         });
        
//   console.log("➡️ Chat route projectId:", cleanProjectId, "userId:", cleanUserId);

//         setRecipient(projectResponse.data.createdBy);
        

//         // Fetch chat history
//         const { data: chatHistory } = await axios.get(`/api/v1/chat/${cleanProjectId}/${cleanUserId}/messages`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });

//         if (!chatHistory.data || chatHistory.data.length === 0) {
//           console.log("📭 No chat messages yet");
//           setMessages([]);
//         } else {
//           setMessages(chatHistory.data);
//         }
         
//         setLoading(false);
//       } catch (err) {
        
//         console.error('Failed to fetch chat data:', err);
//         setError('❌ Failed to load chat. Project might not be accessible.');
//         setLoading(false);
//       }
//     };

//     fetchChatData();
//   }, [cleanProjectId, cleanUserId]);

//    useEffect(() => {
//   if (!socket || !projectId) return;

//   socket.emit('joinProject', projectId);

//   socket.on('newMessage', (message) => {
//     // Only add if not already present (prevent duplicates)
//     setMessages((prev) => {
//       const exists = prev.some(m => m._id === message._id);
//       return exists ? prev : [...prev, message];
//     });
//   });

//   return () => {
//     socket.off('newMessage');
//   };
// }, [socket, projectId]);

//  // ✅ cleaned dependency

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !socket || !recipient) return;

//     const messageData = {
//       recipientId: recipient._id,
//       projectId: cleanProjectId,
//       content: newMessage
//     };

//     socket.emit('sendMessage', messageData);
//     setNewMessage('');
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="bg-blue-600 p-4 shadow-md">
//         <h2 className="text-xl font-semibold text-white">
//           Chat with {recipient?.name || 'User'}
//         </h2>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {loading ? (
//           <p className="text-gray-500 text-center">Loading chat...</p>
//         ) : error ? (
//           <p className="text-red-500 text-center">{error}</p>
//         ) : messages.length === 0 ? (
//           <p className="text-gray-500 text-sm text-center">📭 No messages yet. Start the conversation!</p>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message._id}
//               className={`flex ${message.sender === user.id ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`max-w-xs md:max-w-md rounded-lg p-3 ${
//                   message.sender === user.id
//                     ? 'bg-primary text-white'
//                     : 'bg-white border border-gray-200'
//                 }`}
//               >
//                 <p>{message.content}</p>
//                 <p className="text-xs mt-1 opacity-70">
//                   {new Date(message.createdAt).toLocaleTimeString()}
//                 </p>
//               </div>
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="bg-white p-4 border-t border-gray-200">
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type your message..."
//             className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
//           />
//           <button
//             onClick={handleSendMessage}
//             className="bg-primary text-blue-600 rounded-md px-4 py-2 hover:bg-primary-dark flex items-center"
//           >
//             <FiSend className="mr-2" />
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


















//all good 


// import { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/SocketContext';
// import axios from '../api/axios';
// import { FiSend } from 'react-icons/fi';

// function isValidObjectId(id) {
//   return /^[a-fA-F0-9]{24}$/.test(id);
// }

// export default function Chat() {
//   const { projectId, userId } = useParams();
//   const cleanProjectId = projectId?.trim();
//   const cleanUserId = userId?.trim();

//   const { user } = useAuth();
//   const socket = useSocket();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [projectOwner, setProjectOwner] = useState(null);
//   const messagesEndRef = useRef(null);

//   // Fetch owner + history
//   useEffect(() => {
//     const fetchChatData = async () => {
//       if (!isValidObjectId(cleanProjectId) || !isValidObjectId(cleanUserId)) return;

//       try {
//         // ✅ 1. Fetch project to get owner
//         const { data: projectRes } = await axios.get(`/api/v1/projects/${cleanProjectId}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         const owner = projectRes.data.createdBy;
//         setProjectOwner(owner);

//         // ✅ 2. Fetch full chat history between owner and selected user
//         const { data: chatRes } = await axios.get(
//           `/api/v1/chat/${cleanProjectId}/${cleanUserId}/messages`,
//           {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//           }
//         );

//         const history = chatRes.data?.data || [];
//         setMessages(history);

//         // ✅ 3. Mark unread messages as read
//         await axios.put(`/api/v1/chat/${cleanProjectId}/${cleanUserId}/read`, {}, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         setMessages(prevMessages =>
//           prevMessages.map((msg) =>
//             msg.recipient._id === user._id ? { ...msg, read: true } : msg
//           )
//         );
//       } catch (err) {
//         console.error("❌ Failed to fetch chat:", err);
//       }
//     };

//     fetchChatData();
//   }, [cleanProjectId, cleanUserId, user._id]);

//   // Socket: messagesRead event
//   useEffect(() => {
//     if (!socket || !cleanProjectId) return;

//     const handleMessagesRead = ({ readerId, projectId: pId, fromUserId }) => {
//       setMessages((prevMessages) =>
//         prevMessages.map((msg) =>
//           msg.sender._id === user._id && msg.recipient._id === readerId
//             ? { ...msg, read: true }
//             : msg
//         )
//       );
//     };

//     socket.on('messagesRead', handleMessagesRead);
//     return () => socket.off('messagesRead', handleMessagesRead);
//   }, [socket, cleanProjectId, user._id]);

//   // Socket: receive new message
//   useEffect(() => {
//     if (!socket || !cleanProjectId || !user) return;

//     socket.emit('joinProject', cleanProjectId);
//     socket.emit('joinUserRoom', user._id); // optional for read receipts

//     const handleNewMessage = async (message) => {
//       setMessages(prev => {
//         if (prev.some(m => m._id === message._id)) return prev;
//         return [...prev, message];
//       });

//       if (message.recipient._id === user._id) {
//         await axios.put(`/api/v1/chat/${cleanProjectId}/${cleanUserId}/read`, {}, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         setMessages(prev =>
//           prev.map(msg =>
//             msg._id === message._id ? { ...msg, read: true } : msg
//           )
//         );
//       }
//     };

//     socket.on('newMessage', handleNewMessage);
//     return () => socket.off('newMessage', handleNewMessage);
//   }, [socket, cleanProjectId, cleanUserId, user]);

//   // Scroll to bottom
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !socket || !projectOwner) return;

//     const messageData = {
//       recipientId: cleanUserId, // ⚠️ if owner is chatting with user
//       projectId: cleanProjectId,
//       content: newMessage
//     };

//     socket.emit('sendMessage', messageData);
//     setNewMessage('');
//   };

//   const isOwner = user._id === projectOwner?._id;

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="bg-blue-600 p-4 shadow-md">
//         <h2 className="text-xl font-semibold text-white">
//           Chat with {projectOwner?.name || 'Loading...'}
//         </h2>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 && (
//           <p className="text-gray-500 text-center text-sm">
//             📭 No messages yet.
//           </p>
//         )}

//         {messages.map((message) => {
//           const isMsgFromOwner = message.sender._id === isOwner?._id;
//           const alignRight = isMsgFromOwner;

//           return (
//             <div
//               key={message._id}
//               className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}
//             >
//               <div className="flex flex-col max-w-xs md:max-w-md">
//                 <span className="text-xs text-gray-500 mb-1 ml-1">
//                   {message.sender.name}
//                 </span>
//                 <div
//                   className={`rounded-lg p-3 ${
//                     alignRight ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'
//                   }`}
//                 >
//                   <p>{message.content}</p>
//                   <div className="flex justify-between text-xs mt-1 opacity-70">
//                     <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
//                     {alignRight && message.sender._id === user._id && (
//                       <span>{message.read ? '✓✓' : '✓'}</span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         <div ref={messagesEndRef} />
//       </div>

//       <div className="bg-white p-4 border-t border-gray-200">
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type your message..."
//             className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             onClick={handleSendMessage}
//             className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 flex items-center"
//           >
//             <FiSend className="mr-1" />
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }








































//good code for chat component



// import { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/SocketContext';
// import axios from '../api/axios';
// import { FiSend } from 'react-icons/fi';

// function isValidObjectId(id) {
//   return /^[a-fA-F0-9]{24}$/.test(id);
// }

// export default function Chat() {
//   const { projectId, userId } = useParams();
//   const cleanProjectId = projectId?.trim();
//   const cleanUserId = userId?.trim();

//   const { user } = useAuth();
//   const socket = useSocket();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [projectOwner, setProjectOwner] = useState(null);
//   const messagesEndRef = useRef(null);

//   // 📩 Fetch chat history + mark as read
//   useEffect(() => {
//     const fetchChatData = async () => {
//       if (!isValidObjectId(cleanProjectId) || !isValidObjectId(cleanUserId)) return;

//       try {
//         const { data: projectRes } = await axios.get(`/api/v1/projects/${cleanProjectId}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         setProjectOwner(projectRes.data.createdBy);

//         const { data: chatRes } = await axios.get(
//           `/api/v1/chat/${cleanProjectId}/${cleanUserId}/messages`,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );

//         const history = chatRes.data?.data || [];

//         await axios.put(`/api/v1/chat/${cleanProjectId}/${cleanUserId}/read`, {}, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         const updated = history.map((msg) =>
//           msg.recipient._id === user._id ? { ...msg, read: true } : msg
//         );
//         setMessages(updated);
//       } catch (err) {
//         console.error("❌ Failed to fetch chat data:", err);
//       }
//     };

//     fetchChatData();
//   }, [cleanProjectId, cleanUserId, user._id]);

//   // ✅ Listen for read receipts
//   useEffect(() => {
//     if (!socket || !cleanProjectId) return;

//     const handleMessagesRead = ({ readerId, projectId: pId, fromUserId }) => {
//       setMessages((prevMessages) =>
//         prevMessages.map((msg) =>
//           msg.sender._id === user._id && msg.recipient._id === readerId
//             ? { ...msg, read: true }
//             : msg
//         )
//       );
//     };

//     socket.on('messagesRead', handleMessagesRead);
//     return () => socket.off('messagesRead', handleMessagesRead);
//   }, [socket, cleanProjectId, user._id]);

//   // ✅ Real-time message handler
//   useEffect(() => {
//     if (!socket || !cleanProjectId || !user) return;

//     socket.emit('joinProject', cleanProjectId);
//     socket.emit('joinUserRoom', user._id);

//     const handleNewMessage = async (message) => {
//       setMessages(prev => {
//         if (prev.some(m => m._id === message._id)) return prev;
//         return [...prev, message];
//       });

//       if (message.recipient._id === user._id) {
//         await axios.put(`/api/v1/chat/${cleanProjectId}/${cleanUserId}/read`, {}, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         setMessages(prev =>
//           prev.map(msg =>
//             msg._id === message._id ? { ...msg, read: true } : msg
//           )
//         );
//       }
//     };

//     socket.on('newMessage', handleNewMessage);
//     return () => socket.off('newMessage', handleNewMessage);
//   }, [socket, cleanProjectId, cleanUserId, user]);

//   // ⬇️ Auto-scroll to latest
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !socket || !projectOwner) return;

//     const messageData = {
//       recipientId: projectOwner._id,
//       projectId: cleanProjectId,
//       content: newMessage
//     };

//     socket.emit('sendMessage', messageData);
//     setNewMessage('');
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="bg-blue-600 p-4 shadow-md">
//         <h2 className="text-xl font-semibold text-white">
//           Chat for Project: {projectId}
//         </h2>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 && (
//           <p className="text-gray-500 text-center text-sm">
//             📭 No messages yet. Start the conversation!
//           </p>
//         )}

//         {messages.map((message) => {
//           const isOwner = message.sender._id === projectOwner?._id;

//           return (
//             <div key={message._id} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
//               <div className="flex flex-col max-w-xs md:max-w-md">
//                 {/* Show sender name */}
//                 <span className="text-xs text-gray-500 mb-1 ml-1">
//                   {message.sender.name}
//                 </span>

//                 <div
//                   className={`rounded-lg p-3 ${
//                     isOwner ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'
//                   }`}
//                 >
//                   <p>{message.content}</p>
//                   <div className="flex justify-between text-xs mt-1 opacity-70">
//                     <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
//                     {/* ✅ Only show read status for owner's own messages */}
//                     {message.sender._id === user._id && isOwner && (
//                       <span className="ml-2">
//                         {message.read ? '✓✓' : '✓'}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="bg-white p-4 border-t border-gray-200">
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type your message..."
//             className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             onClick={handleSendMessage}
//             className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 flex items-center"
//           >
//             <FiSend className="mr-1" />
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }























































































 // last corrected code:

// import { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/SocketContext';
// import axios from '../api/axios';
// import { FiSend } from 'react-icons/fi';

// function isValidObjectId(id) {
//   return /^[a-fA-F0-9]{24}$/.test(id);
// }

// export default function Chat() {
//   const { projectId, userId } = useParams();
//   const cleanProjectId = projectId?.trim();
//   const cleanUserId = userId?.trim();

//   const { user } = useAuth();
//   const socket = useSocket();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [recipient, setRecipient] = useState(null);
//   const messagesEndRef = useRef(null);

//   // 📩 Fetch chat history + mark as read
//   useEffect(() => {
//     const fetchChatData = async () => {
//       if (!isValidObjectId(cleanProjectId) || !isValidObjectId(cleanUserId)) return;

//       try {
//         // Get recipient
//         const { data: projectRes } = await axios.get(`/api/v1/projects/${cleanProjectId}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         setRecipient(projectRes.data.createdBy);

//         // Get chat history
//         const { data: chatRes } = await axios.get(
//           `/api/v1/chat/${cleanProjectId}/${cleanUserId}/messages`,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );

//         const history = chatRes.data?.data || [];
//         setMessages(history);

//         // Mark unread as read
//         await axios.put(`/api/v1/chat/${cleanProjectId}/${cleanUserId}/read`, {}, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         // Update local read status
//         setMessages((prevMessages) =>
//           prevMessages.map((msg) =>
//             msg.recipient._id === user._id ? { ...msg, read: true } : msg
//           )
//         );
//       } catch (err) {
//         console.error("❌ Failed to fetch chat data:", err);
//       }
//     };
   
//     fetchChatData();
//   }, [cleanProjectId, cleanUserId, user._id]);

//  useEffect(() => {
//   if (!socket || !cleanProjectId) return;

//   const handleMessagesRead = ({ readerId, projectId: pId, fromUserId }) => {
//     console.log("📬 messagesRead event received:", { readerId, pId, fromUserId });

  

//     // ✅ Mark my sent messages to this recipient as read
//     setMessages((prevMessages) =>
//       prevMessages.map((msg) =>
//         msg.sender._id === user._id && msg.recipient._id === readerId
//           ? { ...msg, read: true }
//           : msg
//       )
//     );
//   };

//   socket.on('messagesRead', handleMessagesRead);

//   return () => socket.off('messagesRead', handleMessagesRead);
// }, [socket, cleanProjectId, user._id]);

//  // 🔌 Listen for real-time messages
//   useEffect(() => {
//     if (!socket || !cleanProjectId) return;

//     socket.emit('joinProject', cleanProjectId);

//     const handleNewMessage = async (message) => {
//       setMessages(prev => {
//         if (prev.some(m => m._id === message._id)) return prev;
//         return [...prev, message];
//       });

//       // Mark received messages as read if for current user
//       if (message.recipient._id === user._id) {
//         await axios.put(`/api/v1/chat/${cleanProjectId}/${cleanUserId}/read`, {}, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         setMessages(prevMessages =>
//           prevMessages.map((msg) =>
//             msg._id === message._id ? { ...msg, read: true } : msg
//           )
//         );
//       }
//     };

//     socket.on('newMessage', handleNewMessage);
//     return () => socket.off('newMessage', handleNewMessage);
//   }, [socket, cleanProjectId, cleanUserId, user._id]);

//   // ⬇️ Auto-scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//      console.log("🔍 Messages updated:", messages);
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !socket || !recipient) return;

//     const messageData = {
//       recipientId: recipient._id,
//       projectId: cleanProjectId,
//       content: newMessage
//     };

//     socket.emit('sendMessage', messageData);
//     setNewMessage('');
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="bg-blue-600 p-4 shadow-md">
//         <h2 className="text-xl font-semibold text-white">
//           Chat with {recipient?.name || 'User'}
//         </h2>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 && (
//           <p className="text-gray-500 text-center text-sm">
//             📭 No messages yet. Start the conversation!
//           </p>
//         )}

//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
//           >
//             <div
//               className={`max-w-xs md:max-w-md rounded-lg p-3 ${
//                 message.sender._id === user.id
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-white border border-gray-200'
//               }`}
//             >
//               <p>{message.content}</p>
//               <div className="flex justify-between text-xs mt-1 opacity-70">
//                 <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
//                 {message.sender._id === user.id && (
//                   <span className="ml-2">
//                     {message.read ? '✓✓' : '✓'}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}

//         <div ref={messagesEndRef} />
//       </div>

//       <div className="bg-white p-4 border-t border-gray-200">
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type your message..."
//             className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             onClick={handleSendMessage}
//             className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 flex items-center"
//           >
//             <FiSend className="mr-1" />
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
























// corrected 


// import { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/SocketContext';
// import axios from '../api/axios';
// import { FiSend } from 'react-icons/fi';

// function isValidObjectId(id) {
//   return /^[a-fA-F0-9]{24}$/.test(id);
// }

// export default function Chat() {
//   const { projectId, userId } = useParams();
//   const cleanProjectId = projectId.trim();
//   const cleanUserId = userId.trim();

//   const { user } = useAuth();
//   const socket = useSocket();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [recipient, setRecipient] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     const fetchChatData = async () => {
//       if (!isValidObjectId(cleanProjectId)) {
//         setError('Invalid project ID');
//         return;
//       }

//       try {
//         setLoading(true);

//         // Fetch project to get owner info
//         const { data: projectResponse } = await axios.get(`/api/v1/projects/${cleanProjectId}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
           
//         });
        
//   console.log("➡️ Chat route projectId:", cleanProjectId, "userId:", cleanUserId);

//         setRecipient(projectResponse.data.createdBy);
        

//         // Fetch chat history
//         const { data: chatHistory } = await axios.get(`/api/v1/chat/${cleanProjectId}/${cleanUserId}/messages`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });

//         if (!chatHistory.data || chatHistory.data.length === 0) {
//           console.log("📭 No chat messages yet");
//           setMessages([]);
//         } else {
//           setMessages(chatHistory.data);
//         }
         
//         setLoading(false);
//       } catch (err) {
        
//         console.error('Failed to fetch chat data:', err);
//         setError('❌ Failed to load chat. Project might not be accessible.');
//         setLoading(false);
//       }
//     };

//     fetchChatData();
//   }, [cleanProjectId, cleanUserId]);

//    useEffect(() => {
//   if (!socket || !projectId) return;

//   socket.emit('joinProject', projectId);

//   socket.on('newMessage', (message) => {
//     // Only add if not already present (prevent duplicates)
//     setMessages((prev) => {
//       const exists = prev.some(m => m._id === message._id);
//       return exists ? prev : [...prev, message];
//     });
//   });

//   return () => {
//     socket.off('newMessage');
//   };
// }, [socket, projectId]);

//  // ✅ cleaned dependency

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !socket || !recipient) return;

//     const messageData = {
//       recipientId: recipient._id,
//       projectId: cleanProjectId,
//       content: newMessage
//     };

//     socket.emit('sendMessage', messageData);
//     setNewMessage('');
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="bg-blue-600 p-4 shadow-md">
//         <h2 className="text-xl font-semibold text-white">
//           Chat with {recipient?.name || 'User'}
//         </h2>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {loading ? (
//           <p className="text-gray-500 text-center">Loading chat...</p>
//         ) : error ? (
//           <p className="text-red-500 text-center">{error}</p>
//         ) : messages.length === 0 ? (
//           <p className="text-gray-500 text-sm text-center">📭 No messages yet. Start the conversation!</p>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message._id}
//               className={`flex ${message.sender === user.id ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`max-w-xs md:max-w-md rounded-lg p-3 ${
//                   message.sender === user.id
//                     ? 'bg-primary text-white'
//                     : 'bg-white border border-gray-200'
//                 }`}
//               >
//                 <p>{message.content}</p>
//                 <p className="text-xs mt-1 opacity-70">
//                   {new Date(message.createdAt).toLocaleTimeString()}
//                 </p>
//               </div>
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="bg-white p-4 border-t border-gray-200">
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type your message..."
//             className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
//           />
//           <button
//             onClick={handleSendMessage}
//             className="bg-primary text-blue-600 rounded-md px-4 py-2 hover:bg-primary-dark flex items-center"
//           >
//             <FiSend className="mr-2" />
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }









//corrected code:


// import { useEffect, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/SocketContext';
// import axios from '../api/axios';
// import { FiSend } from 'react-icons/fi';


// export default function Chat() {
//   const { projectId } = useParams();
//   const { user } = useAuth();
//   const socket = useSocket();

//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const messagesEndRef = useRef(null);
//   const [projectOwner,setProjectOwner]=useState(null);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         // const res = await axios.get(`/api/v1/chat/${projectId}/messages`);
//         // setMessages(res.data.data);
//         // Get messages
// const res = await axios.get(`/api/v1/chat/${projectId}/messages`);
// setMessages(res.data.data);

// // Get project details to find the owner
// const projectRes = await axios.get(`/api/v1/projects/${projectId}`);
// setProjectOwner(projectRes.data.data.createdBy);

//       } catch (err) {
//         console.error('Failed to fetch messages:', err);
//       }
//     };
//     fetchMessages();
//   }, [projectId]);

//   useEffect(() => {
//     if (!socket) return;

//     socket.emit('joinProject', projectId);

//     const handleNewMessage = (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     };

//     socket.on('newProjectMessage', handleNewMessage);
//     return () => socket.off('newProjectMessage', handleNewMessage);
//   }, [socket, projectId]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!newMessage.trim()) return;

//     socket.emit('sendProjectMessage', {
//       projectId,
//       content: newMessage
//     });

//     setNewMessage('');
//   };

  
//  return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 text-lg font-semibold flex items-center">
//         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//         </svg>
//         Project Chat
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg) => (
//           <div key={msg._id} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
//             <div className={`p-4 rounded-2xl max-w-xs md:max-w-md ${msg.sender._id === user._id 
//               ? 'bg-indigo-600 text-white rounded-br-none' 
//               : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'}`}
//             >
//               <p className="text-sm font-medium mb-1">
//                 {projectOwner && msg.sender._id === projectOwner._id ? (
//                   <span className="text-yellow-300">👑 Owner</span>
//                 ) : (
//                   msg.sender.name
//                 )}
//               </p>
//               <p className="text-sm">{msg.content}</p>
//               <p className="text-xs opacity-70 mt-2 text-right">
//                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </p>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="p-4 bg-white border-t border-gray-200">
//         <div className="flex space-x-2">
//           <input
//             className="flex-1 border border-gray-300 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//             placeholder="Type your message..."
//           />
//           <button 
//             onClick={sendMessage}
//             className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
//           >
//             <FiSend className="w-5 h-5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }











//   return (
//     <div className="flex flex-col h-screen">
//       <div className="bg-blue-600 text-white p-4 text-lg font-semibold">Project Chat</div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
//         {messages.map((msg) => (
//           <div key={msg._id} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
//             <div className={`p-3 rounded-lg max-w-md ${msg.sender._id === user._id ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
//               {/* <p className="text-sm font-medium">{msg.sender.name}</p> */}
//               <p className="text-sm font-medium">
//   {projectOwner && msg.sender._id === projectOwner._id
//     ? 'Owner'
//     : msg.sender.name}
// </p>

//               <p>{msg.content}</p>
//               <p className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="p-4 bg-white border-t flex space-x-2">
//         <input
//           className="flex-1 border px-4 py-2 rounded-md"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//           placeholder="Type message..."
//         />
//         <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
//           <FiSend className="mr-1" /> Send
//         </button>
//       </div>
//     </div>
//   );
// }

















import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from '../api/axios';
import { FiSend } from 'react-icons/fi';

export default function Chat() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [projectOwner, setProjectOwner] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch messages and project owner
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/v1/chat/${projectId}/messages`);
        setMessages(res.data.data);

        const projectRes = await axios.get(`/api/v1/projects/${projectId}`);
        setProjectOwner(projectRes.data.data.createdBy);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [projectId]);

  // Handle socket join and new messages
  useEffect(() => {
    if (!socket) return;

    socket.emit('joinProject', projectId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('newProjectMessage', handleNewMessage);
    return () => socket.off('newProjectMessage', handleNewMessage);
  }, [socket, projectId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('sendProjectMessage', {
      projectId,
      content: newMessage,
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 text-lg font-semibold flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Project Chat
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          if (!msg?.sender || !msg.sender._id) return null; // Skip invalid messages

          const isSender = msg.sender._id === user?._id;
          const isOwner = projectOwner && msg.sender._id === projectOwner._id;

          return (
            <div key={msg._id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-4 rounded-2xl max-w-xs md:max-w-md ${
                  isSender
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm font-medium mb-1">
                  {isOwner ? <span className="text-yellow-300">👑 Owner</span> : msg.sender.name || 'Unknown'}
                </p>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-2 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            className="flex-1 border border-gray-300 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

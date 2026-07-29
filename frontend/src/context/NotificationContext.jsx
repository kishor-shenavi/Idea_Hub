import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const activeChatRef = useRef(null);
  const activeViewRef = useRef(null);

  // seed from the database on login — this is what makes notifications survive being logged out
  useEffect(() => {
    if (!user) { setItems([]); return; }
    axios.get('/api/v1/notifications/unread').then(res => {
      setItems(res.data.data.map(n => ({ id: n._id, type: n.type, title: n.title, body: n.body, to: n.to, meta: n.meta })));
    }).catch(() => {});
  }, [user]);

  const push = (item) => setItems(prev => [item, ...prev].slice(0, 30));

  const setActiveChat = (chat) => {
    activeChatRef.current = chat;
    if (chat) {
      const toDismiss = items.filter(item =>
        (chat.type === 'project' && item.type === 'project' && item.meta?.projectId === chat.id) ||
        (chat.type === 'mentorChat' && item.type === 'mentorChat' && item.meta?.requestId === chat.id)
      );
      toDismiss.forEach(item => remove(item.id));
    }
  };

  const setActiveView = (view) => { activeViewRef.current = view; };

  useEffect(() => {
    if (!socket || !user) return;

    const onProjectMsg = (p) => {
      const isViewing = activeChatRef.current?.type === 'project' && activeChatRef.current?.id === p.projectId;
      if (isViewing) { axios.put(`/api/v1/notifications/${p.notifId}/read`).catch(() => {}); return; }
      const chatTarget = p.senderId === p.creatorId ? p.creatorId : (user.id === p.creatorId ? p.senderId : p.creatorId);
      push({ id: p.notifId, type: 'project', title: `💬 ${p.projectTitle}`, body: `${p.senderName}: ${p.preview}`, to: `/chat/${p.projectId}/${chatTarget}`, meta: { projectId: p.projectId } });
    };
    const onMentorMsg = (p) => {
      const isViewing = activeChatRef.current?.type === 'mentorChat' && activeChatRef.current?.id === p.requestId;
      if (isViewing) { axios.put(`/api/v1/notifications/${p.notifId}/read`).catch(() => {}); return; }
      push({ id: p.notifId, type: 'mentorChat', title: '💬 New message', body: `${p.senderName}: ${p.preview}`, to: `/mentor/chat/${p.requestId}`, meta: { requestId: p.requestId } });
    };
    const onNewRequest = (r) => {
      if (activeViewRef.current === 'mentor-received') { axios.put(`/api/v1/notifications/${r.notifId}/read`).catch(() => {}); return; }
      push({ id: r.notifId, type: 'mentorRequest', title: '🎯 New mentorship request', body: `${r.student?.name} wants guidance from you`, to: '/mentor', meta: {} });
    };
    const onRequestUpdate = (r) => {
      if (!r.notifId) return; // only fires a notification for accepted/rejected — pending updates don't create one server-side
      push({ id: r.notifId, type: 'mentorUpdate', title: r.status === 'accepted' ? '✅ Request accepted' : 'Request declined', body: `${r.senior?.name} ${r.status === 'accepted' ? 'accepted' : 'declined'} your request`, to: '/mentor', meta: {} });
    };

    socket.on('newProjectMessageNotification', onProjectMsg);
    socket.on('mentorMessageNotification', onMentorMsg);
    socket.on('newMentorRequest', onNewRequest);
    socket.on('mentorRequestUpdate', onRequestUpdate);

    return () => {
      socket.off('newProjectMessageNotification', onProjectMsg);
      socket.off('mentorMessageNotification', onMentorMsg);
      socket.off('newMentorRequest', onNewRequest);
      socket.off('mentorRequestUpdate', onRequestUpdate);
    };
  }, [socket, user]);

  const remove = (id) => {
    setItems(prev => prev.filter(x => x.id !== id));
    axios.put(`/api/v1/notifications/${id}/read`).catch(() => {}); // fire-and-forget — persists the dismissal
  };

  return (
    <NotificationContext.Provider value={{ items, push, remove, setActiveChat, setActiveView }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
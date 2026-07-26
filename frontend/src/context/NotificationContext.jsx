import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const [items, setItems] = useState([]); // single source of truth — every unread notification is one entry here

  const push = (item) => {
    const id = Date.now() + Math.random();
    setItems(prev => [{ id, ...item }, ...prev].slice(0, 30));
  };

  useEffect(() => {
    if (!socket || !user) return;

    const onProjectMsg = (p) => push({ type: 'project', title: `💬 ${p.projectTitle}`, body: `${p.senderName}: ${p.preview}`, to: `/chat/${p.projectId}/${p.creatorId}` });
    const onMentorMsg = (p) => push({ type: 'mentorChat', title: '💬 New message', body: `${p.senderName}: ${p.preview}`, to: `/mentor/chat/${p.requestId}` });
    const onNewRequest = (r) => push({ type: 'mentorRequest', title: '🎯 New mentorship request', body: `${r.student?.name} wants guidance from you`, to: '/mentor' });
    const onRequestUpdate = (r) => {
      if (r.status === 'accepted') push({ type: 'mentorUpdate', title: '✅ Request accepted', body: `${r.senior?.name} accepted your request`, to: '/mentor' });
      if (r.status === 'rejected') push({ type: 'mentorUpdate', title: 'Request declined', body: `${r.senior?.name} declined your request`, to: '/mentor' });
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

  // removes exactly one item — used by both toast auto-dismiss and clicking a dropdown entry
  const remove = (id) => setItems(prev => prev.filter(x => x.id !== id));

  return (
    <NotificationContext.Provider value={{ items, push, remove }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
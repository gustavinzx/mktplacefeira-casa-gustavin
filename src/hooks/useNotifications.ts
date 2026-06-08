import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // 1. Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('mktplace_feira_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    };

    fetchNotifications();

    // 2. Subscribe to realtime inserts
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mktplace_feira_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mktplace_feira_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotif = payload.new as Notification;
          setNotifications(prev => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));
          // Recalculate unread count
          setNotifications(current => {
             const newCount = current.map(n => n.id === updatedNotif.id ? updatedNotif : n).filter(n => !n.read).length;
             setUnreadCount(newCount);
             return current.map(n => n.id === updatedNotif.id ? updatedNotif : n);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    await supabase
      .from('mktplace_feira_notifications')
      .update({ read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Call update in chunks or use multiple updates
    for (const id of unreadIds) {
       await supabase.from('mktplace_feira_notifications').update({ read: true }).eq('id', id);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

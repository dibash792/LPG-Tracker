import React, { createContext, useContext, useState } from 'react';

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  type: 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO';
  timestamp: string;
  read: boolean;
  linkAction?: string;
}

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const initialNotifications: SystemNotification[] = [
  {
    id: 'n1',
    title: 'Discrepancy Escalation on Lumbini Route',
    description: '25 cylinders unconfirmed on truck BA 2 KHA 8812. Status flagged as Suspected Diversion.',
    type: 'CRITICAL',
    timestamp: '15 mins ago',
    read: false,
    linkAction: 'discrepancies'
  },
  {
    id: 'n2',
    title: 'New Bottling Plant Registration Request',
    description: 'Himalayan Frontier Gas & Energy submitted EIA and OCR docs for Surkhet plant approval.',
    type: 'WARNING',
    timestamp: '1 hour ago',
    read: false,
    linkAction: 'approvals'
  },
  {
    id: 'n3',
    title: 'Karnali Province Winter Reserve Updated',
    description: 'Monthly quota elevated to 1,900 MT to forestall cold weather highway disruptions.',
    type: 'INFO',
    timestamp: '2 hours ago',
    read: true,
  },
  {
    id: 'n4',
    title: 'Automated Integrity Check Cleared',
    description: 'All 28 Bottling Plants digital calibration logs matched NBSM standards with 99.4% conformity.',
    type: 'SUCCESS',
    timestamp: '4 hours ago',
    read: true,
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (n: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...n,
      id: 'n-' + Date.now(),
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      toast,
      showToast
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

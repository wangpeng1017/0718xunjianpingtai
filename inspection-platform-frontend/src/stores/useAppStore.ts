import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, Notification } from '../types';

interface AppState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  
  // UI状态
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  
  // 通知状态
  notifications: Notification[];
  unreadCount: number;
  
  // 加载状态
  loading: boolean;
  
  // 错误状态
  error: string | null;
}

interface AppActions {
  // 用户操作
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  
  // UI操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // 通知操作
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  
  // 状态操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  sidebarCollapsed: false,
  theme: 'light',
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 用户操作
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      login: (user) => set({ 
        user, 
        isAuthenticated: true,
        error: null 
      }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        notifications: [],
        unreadCount: 0 
      }),
      
      // UI操作
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setTheme: (theme) => set({ theme }),
      
      // 通知操作
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: state.notifications.find(n => n.id === id && !n.read) 
          ? state.unreadCount - 1 
          : state.unreadCount,
      })),
      
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.notifications.find(n => n.id === id && !n.read)
          ? state.unreadCount - 1
          : state.unreadCount,
      })),
      
      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      })),
      
      clearNotifications: () => set({
        notifications: [],
        unreadCount: 0,
      }),
      
      // 状态操作
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-store',
    }
  )
);

// 选择器
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useTheme = () => useAppStore((state) => state.theme);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadCount = () => useAppStore((state) => state.unreadCount);
export const useLoading = () => useAppStore((state) => state.loading);
export const useError = () => useAppStore((state) => state.error);

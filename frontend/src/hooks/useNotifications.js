/**
 * useNotifications.js
 * ────────────────────
 * React Query hooks for the Notification Drawer and Activity Timeline page.
 * All API calls go through apiClient so the base URL stays centrally configured.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({ baseURL: API_BASE });

// ─── Notifications ───────────────────────────────────────────────────────────

/**
 * Fetch notifications for the current user.
 * @param {string} userId  - Firebase UID
 * @param {object} opts    - { unreadOnly, category, limit }
 */
export function useNotifications(userId, opts = {}) {
  const { unreadOnly = false, category = 'all', limit = 50 } = opts;
  return useQuery({
    queryKey: ['notifications', userId, unreadOnly, category],
    queryFn: async () => {
      if (!userId) return { notifications: [], unreadCount: 0 };
      const { data } = await apiClient.get('/v1/notifications', {
        params: { userId, unreadOnly, category, limit }
      });
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 30,          // Refresh every 30 s
    refetchInterval: 1000 * 30,    // Poll until Firestore realtime is wired
  });
}

/** Mark a single notification as read. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ notificationId }) => {
      const { data } = await apiClient.post(`/v1/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/** Mark ALL notifications read for a user. */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId }) => {
      const { data } = await apiClient.post('/v1/notifications/mark-all-read', null, {
        params: { userId }
      });
      return data;
    },
    onSuccess: () => {
      toast.success('All notifications marked as read.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/** Delete a single notification. */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ notificationId }) => {
      const { data } = await apiClient.delete(`/v1/notifications/${notificationId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ─── Activity ────────────────────────────────────────────────────────────────

/**
 * Fetch paginated activity logs.
 * @param {object} opts - { userId, type, priority, limit, page }
 */
export function useActivity(opts = {}) {
  const { userId, type = 'all', priority = 'all', limit = 100, page = 1 } = opts;
  return useQuery({
    queryKey: ['activity', userId, type, priority, page],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/activity', {
        params: { userId, type, priority, limit, page }
      });
      return data;
    },
    staleTime: 1000 * 60,        // 1 minute cache
    refetchInterval: 1000 * 60, // Poll every minute
  });
}

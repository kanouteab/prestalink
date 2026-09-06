import { useEffect } from 'react';
import { realtimeClient } from '../services/realtime';
import { useAuthStore } from '../store/authStore';

export function useRealtimeConnection() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;
    realtimeClient.connect();
    return () => realtimeClient.disconnect();
  }, [token]);
}

import { useEffect } from 'react';
import { realtimeClient } from '../services/realtime';
import { useAuthStore } from '../store/authStore';

/** Ouvre la connexion STOMP tant qu'une session est active, la ferme sinon (livrable 23). */
export function useRealtimeConnection() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;
    realtimeClient.connect();
    return () => realtimeClient.disconnect();
  }, [token]);
}

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // sockjs-client (utilise par le RealtimeClient STOMP) reference le `global`
  // de Node, absent du navigateur : sans ce polyfill, toute page qui ouvre la
  // connexion WebSocket plante au chargement.
  define: {
    global: 'globalThis',
  },
})

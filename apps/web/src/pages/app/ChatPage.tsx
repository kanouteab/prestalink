import { useLocation } from 'react-router-dom';
import { ChatPanel } from '../../features/chat/ChatPanel';
import type { ChatContext } from '../../features/chat/types';
import { EmptyState, LinkButton } from '../../components';
import shared from '../shared.module.css';

export function ChatPage() {
  const location = useLocation();
  const context = location.state as ChatContext | null;

  if (!context) {
    return (
      <div className={shared.page} style={{ padding: 0 }}>
        <EmptyState
          title="Conversation introuvable"
          message="Ouvrez une conversation depuis Messages ou depuis le detail d'une publication."
          action={<LinkButton to="/app/messages" variant="secondary" size="sm">Retour aux messages</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <ChatPanel context={context} />
    </div>
  );
}

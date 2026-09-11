import { useLocation } from 'react-router-dom';
import { ChatPanel } from '../../features/chat/ChatPanel';
import type { ChatContext } from '../../features/chat/types';
import { EmptyState, LinkButton } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function ChatPage() {
  const location = useLocation();
  const context = location.state as ChatContext | null;
  const { t } = useTranslation();

  if (!context) {
    return (
      <div className={shared.page} style={{ padding: 0 }}>
        <EmptyState
          title={t('chat.conversationNotFoundTitle')}
          message={t('chat.conversationNotFoundMessage')}
          action={<LinkButton to="/app/messages" variant="secondary" size="sm">{t('chat.backToMessages')}</LinkButton>}
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

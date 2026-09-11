import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readRecentConversations, type RecentConversation } from '../../services/recentConversations';
import { EmptyState } from '../../components';
import { formatRelativeDate } from '../../utils/format';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';
import styles from './MessagesPage.module.css';

export function MessagesPage() {
  const [conversations] = useState<RecentConversation[]>(() => readRecentConversations());
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={shared.page} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>{t('messages.title')}</h1>
        <p>{t('messages.subtitle')}</p>
      </header>

      {conversations.length === 0 ? (
        <EmptyState title={t('messages.emptyTitle')} message={t('messages.emptyMessage')} />
      ) : (
        <div className={styles.list}>
          {conversations.map((conversation) => (
            <button
              key={conversation.conversationKey}
              className={styles.item}
              onClick={() => navigate('/app/messages/chat', { state: conversation })}
            >
              <span className={styles.name}>{conversation.otherUserName}</span>
              <span className={styles.context}>
                {conversation.publicationTitle} · {formatRelativeDate(conversation.lastMessageAt)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

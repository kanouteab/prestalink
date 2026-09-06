import { useEffect, useRef, useState } from 'react';
import { useConversation, useSendChatMessage } from '../../hooks/useChat';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/apiClient';
import { upsertRecentConversation } from '../../services/recentConversations';
import { Button, useToast } from '../../components';
import type { ChatContext } from './types';
import styles from './ChatPanel.module.css';

const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function ChatPanel({ context }: { context: ChatContext }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: messages, isLoading } = useConversation(context);
  const sendMessage = useSendChatMessage();
  const { showToast } = useToast();
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    upsertRecentConversation({ ...context, lastMessageAt: new Date().toISOString() });
    if (currentUserId) api.chat.readAllConversation(context.conversationKey, currentUserId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.conversationKey, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    sendMessage.mutate(
      { context, content },
      { onError: () => showToast("Impossible d'envoyer le message", 'error') },
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <div className={styles.headerName}>{context.otherUserName}</div>
          <div className={styles.headerContext}>a propos de : {context.publicationTitle}</div>
        </div>
      </div>

      <div className={styles.messages}>
        {isLoading && <p>Chargement de la conversation...</p>}
        {messages?.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={[styles.bubbleRow, mine && styles.mine].filter(Boolean).join(' ')}>
              <div>
                <div className={styles.bubble}>{message.content}</div>
                <div className={styles.bubbleTime}>{timeFormatter.format(new Date(message.sentAt))}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.composer} onSubmit={onSubmit}>
        <textarea
          rows={1}
          placeholder="Ecrire un message..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSubmit(event);
            }
          }}
        />
        <Button type="submit" variant="primary" loading={sendMessage.isPending} disabled={!draft.trim()}>
          Envoyer
        </Button>
      </form>
    </div>
  );
}

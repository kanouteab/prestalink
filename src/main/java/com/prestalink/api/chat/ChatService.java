package com.prestalink.api.chat;

import com.prestalink.api.mission.Mission;
import com.prestalink.api.mission.MissionRepository;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import com.prestalink.api.websocket.ChatEvent;
import com.prestalink.api.websocket.ChatReadEvent;
import com.prestalink.api.websocket.ChatUpdateEvent;
import com.prestalink.api.websocket.PresenceEvent;
import com.prestalink.api.websocket.TypingEvent;
import com.prestalink.api.websocket.UnreadCountEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final MissionRepository missionRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();
    private static final long DOCUMENT_MAX_SIZE = 10L * 1024L * 1024L;
    private static final long VIDEO_MAX_SIZE = 50L * 1024L * 1024L;
    private static final Path CHAT_UPLOAD_ROOT = Path.of("uploads", "chat");
    private static final Map<String, Long> ALLOWED_ATTACHMENT_TYPES = Map.ofEntries(
            Map.entry("application/pdf", DOCUMENT_MAX_SIZE),
            Map.entry("image/jpeg", DOCUMENT_MAX_SIZE),
            Map.entry("image/png", DOCUMENT_MAX_SIZE),
            Map.entry("image/webp", DOCUMENT_MAX_SIZE),
            Map.entry("application/msword", DOCUMENT_MAX_SIZE),
            Map.entry("application/vnd.openxmlformats-officedocument.wordprocessingml.document", DOCUMENT_MAX_SIZE),
            Map.entry("application/vnd.ms-excel", DOCUMENT_MAX_SIZE),
            Map.entry("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", DOCUMENT_MAX_SIZE),
            Map.entry("video/mp4", VIDEO_MAX_SIZE),
            Map.entry("video/webm", VIDEO_MAX_SIZE),
            Map.entry("video/quicktime", VIDEO_MAX_SIZE)
    );

    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Expediteur introuvable"));

        if (request.getMissionId() == null) {
            return sendDirectMessage(request, sender);
        }

        return sendMissionMessage(request, sender);
    }

    public ChatMessageResponse sendMessageWithAttachment(ChatMessageRequest request, MultipartFile file) {
        validateAttachment(file);
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Expediteur introuvable"));

        validateDirectReceiver(request, sender);
        AttachmentMetadata attachment = storeAttachment(file);
        ChatMessageResponse response = sendDirectMessage(request, sender, attachment);

        return response;
    }

    private ChatMessageResponse sendMissionMessage(ChatMessageRequest request, User sender) {
        Mission mission = missionRepository.findById(request.getMissionId())
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        if (!mission.getClient().getId().equals(sender.getId())
                && !mission.getProvider().getId().equals(sender.getId())) {
            throw new RuntimeException("Cet utilisateur ne participe pas a cette mission");
        }

        User receiver = getOtherParticipant(mission, sender.getId());

        ChatMessage message = ChatMessage.builder()
                .mission(mission)
                .sender(sender)
                .receiver(receiver)
                .conversationKey(buildMissionConversationKey(mission.getId()))
                .content(request.getContent())
                .isRead(false)
                .isEdited(false)
                .sentAt(LocalDateTime.now())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        sendUnreadCount(mission.getId(), receiver.getId());

        messagingTemplate.convertAndSend(
                "/topic/missions/" + mission.getId() + "/chat",
                ChatEvent.builder()
                        .type("CHAT_MESSAGE_SENT")
                        .missionId(mission.getId())
                        .conversationKey(savedMessage.getConversationKey())
                        .messageId(savedMessage.getId())
                        .senderId(sender.getId())
                        .receiverId(receiver.getId())
                        .senderName(sender.getFullName())
                        .content(savedMessage.getContent())
                        .status(resolveStatus(savedMessage))
                        .build()
        );

        return toChatMessageResponse(savedMessage);
    }

    private ChatMessageResponse sendDirectMessage(ChatMessageRequest request, User sender) {
        return sendDirectMessage(request, sender, null);
    }

    private ChatMessageResponse sendDirectMessage(
            ChatMessageRequest request,
            User sender,
            AttachmentMetadata attachment
    ) {
        if (request.getReceiverId() == null) {
            throw new RuntimeException("Destinataire obligatoire");
        }

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable"));

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Vous ne pouvez pas vous envoyer un message");
        }

        String conversationKey = request.getConversationKey() != null && !request.getConversationKey().isBlank()
                ? request.getConversationKey()
                : buildDirectConversationKey(
                sender.getId(),
                receiver.getId(),
                request.getPublicationType(),
                request.getPublicationId()
        );

        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .conversationKey(conversationKey)
                .publicationType(request.getPublicationType())
                .publicationId(request.getPublicationId())
                .publicationTitle(request.getPublicationTitle())
                .content(request.getContent() == null ? "" : request.getContent())
                .isRead(false)
                .isEdited(false)
                .sentAt(LocalDateTime.now())
                .build();

        if (attachment != null) {
            message.setAttachmentFileName(attachment.fileName());
            message.setAttachmentFileType(attachment.fileType());
            message.setAttachmentFileSize(attachment.fileSize());
            message.setAttachmentUrl(attachment.url());
            message.setAttachmentCreatedAt(LocalDateTime.now());
        }

        if (onlineUsers.contains(receiver.getId())) {
            message.setDeliveredAt(LocalDateTime.now());
        }

        ChatMessage savedMessage = chatMessageRepository.save(message);
        ChatMessageResponse response = toChatMessageResponse(savedMessage);

        publishDirectMessage(response, sender.getId());
        publishDirectMessage(response, receiver.getId());

        return response;
    }

    private void validateDirectReceiver(ChatMessageRequest request, User sender) {
        if (request.getReceiverId() == null) {
            throw new RuntimeException("Destinataire obligatoire");
        }

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable"));

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Vous ne pouvez pas vous envoyer un message");
        }
    }

    public List<ChatMessageResponse> getMissionMessages(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        return chatMessageRepository.findByMissionOrderBySentAtAsc(mission)
                .stream()
                .map(this::toChatMessageResponse)
                .toList();
    }

    public List<ChatMessageResponse> getConversationMessages(
            Long userId,
            Long otherUserId,
            String publicationType,
            Long publicationId
    ) {
        String conversationKey = buildDirectConversationKey(userId, otherUserId, publicationType, publicationId);

        markConversationMessagesDelivered(conversationKey, userId);

        return chatMessageRepository.findByConversationKeyOrderBySentAtAsc(conversationKey)
                .stream()
                .map(this::toChatMessageResponse)
                .toList();
    }

    public void sendTypingEvent(Long missionId, Long userId, String userName) {
        messagingTemplate.convertAndSend(
                "/topic/missions/" + missionId + "/chat",
                TypingEvent.builder()
                        .type("USER_TYPING")
                        .missionId(missionId)
                        .userId(userId)
                        .userName(userName)
                        .build()
        );
    }

    public ChatMessageResponse markMessageAsRead(Long messageId, Long readerId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message introuvable"));

        validateReader(message, readerId);

        if (message.getSender().getId().equals(readerId)) {
            return toChatMessageResponse(message);
        }

        message.setIsRead(true);
        message.setReadAt(LocalDateTime.now());
        if (message.getDeliveredAt() == null) {
            message.setDeliveredAt(LocalDateTime.now());
        }

        ChatMessage savedMessage = chatMessageRepository.save(message);
        publishReadEvent(savedMessage, readerId);

        return toChatMessageResponse(savedMessage);
    }

    public List<ChatMessageResponse> markAllMissionMessagesAsRead(Long missionId, Long readerId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        User reader = userRepository.findById(readerId)
                .orElseThrow(() -> new RuntimeException("Lecteur introuvable"));

        if (!mission.getClient().getId().equals(reader.getId())
                && !mission.getProvider().getId().equals(reader.getId())) {
            throw new RuntimeException("Cet utilisateur ne participe pas a cette mission");
        }

        List<ChatMessage> unreadMessages =
                chatMessageRepository.findByMissionAndSenderIdNotAndIsReadFalse(mission, readerId);

        unreadMessages.forEach(message -> {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            if (message.getDeliveredAt() == null) {
                message.setDeliveredAt(LocalDateTime.now());
            }
        });

        List<ChatMessage> savedMessages = chatMessageRepository.saveAll(unreadMessages);
        sendUnreadCount(missionId, readerId);

        messagingTemplate.convertAndSend(
                "/topic/missions/" + missionId + "/chat",
                ChatReadEvent.builder()
                        .type("ALL_CHAT_MESSAGES_READ")
                        .missionId(missionId)
                        .messageId(null)
                        .readerId(readerId)
                        .build()
        );

        return savedMessages.stream().map(this::toChatMessageResponse).toList();
    }

    public List<ChatMessageResponse> markAllConversationMessagesAsRead(String conversationKey, Long readerId) {
        List<ChatMessage> unreadMessages =
                chatMessageRepository.findByConversationKeyAndReceiverIdAndIsReadFalse(conversationKey, readerId);

        unreadMessages.forEach(message -> {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            if (message.getDeliveredAt() == null) {
                message.setDeliveredAt(LocalDateTime.now());
            }
        });

        List<ChatMessage> savedMessages = chatMessageRepository.saveAll(unreadMessages);

        messagingTemplate.convertAndSend(
                "/topic/conversations/" + conversationKey + "/chat",
                ChatReadEvent.builder()
                        .type("ALL_CHAT_MESSAGES_READ")
                        .missionId(null)
                        .messageId(null)
                        .readerId(readerId)
                        .build()
        );

        return savedMessages.stream().map(this::toChatMessageResponse).toList();
    }

    public long getUnreadMessagesCount(Long missionId, Long readerId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        User reader = userRepository.findById(readerId)
                .orElseThrow(() -> new RuntimeException("Lecteur introuvable"));

        if (!mission.getClient().getId().equals(reader.getId())
                && !mission.getProvider().getId().equals(reader.getId())) {
            throw new RuntimeException("Cet utilisateur ne participe pas a cette mission");
        }

        return chatMessageRepository.countByMissionAndSenderIdNotAndIsReadFalse(mission, readerId);
    }

    public List<ChatMessageResponse> getMissionMessagesPaginated(Long missionId, int page, int size) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        return chatMessageRepository
                .findByMissionOrderBySentAtAsc(mission, PageRequest.of(page, size))
                .stream()
                .map(this::toChatMessageResponse)
                .toList();
    }

    public void deleteMessage(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message introuvable"));

        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Vous ne pouvez supprimer que vos propres messages");
        }

        Long missionId = message.getMission() != null ? message.getMission().getId() : null;
        Long readerId = message.getReceiver() != null ? message.getReceiver().getId() : null;
        String conversationKey = message.getConversationKey();

        chatMessageRepository.delete(message);

        if (missionId != null) {
            messagingTemplate.convertAndSend(
                    "/topic/missions/" + missionId + "/chat",
                    ChatReadEvent.builder()
                            .type("CHAT_MESSAGE_DELETED")
                            .missionId(missionId)
                            .messageId(messageId)
                            .readerId(userId)
                            .build()
            );

            if (readerId != null) {
                sendUnreadCount(missionId, readerId);
            }
        } else {
            messagingTemplate.convertAndSend(
                    "/topic/conversations/" + conversationKey + "/chat",
                    ChatReadEvent.builder()
                            .type("CHAT_MESSAGE_DELETED")
                            .messageId(messageId)
                            .readerId(userId)
                            .build()
            );
        }
    }

    public ChatMessageResponse updateMessage(Long messageId, Long userId, String newContent) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message introuvable"));

        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres messages");
        }

        message.setContent(newContent);
        message.setIsEdited(true);
        message.setEditedAt(LocalDateTime.now());
        ChatMessage savedMessage = chatMessageRepository.save(message);

        String destination = savedMessage.getMission() != null
                ? "/topic/missions/" + savedMessage.getMission().getId() + "/chat"
                : "/topic/conversations/" + savedMessage.getConversationKey() + "/chat";

        messagingTemplate.convertAndSend(
                destination,
                ChatUpdateEvent.builder()
                        .type("CHAT_MESSAGE_UPDATED")
                        .missionId(savedMessage.getMission() != null ? savedMessage.getMission().getId() : null)
                        .messageId(savedMessage.getId())
                        .senderId(userId)
                        .content(savedMessage.getContent())
                        .build()
        );

        return toChatMessageResponse(savedMessage);
    }

    public void markUserOnline(Long userId) {
        onlineUsers.add(userId);

        List<ChatMessage> deliveredMessages = chatMessageRepository.findByReceiverIdAndDeliveredAtIsNull(userId);
        deliveredMessages.forEach(message -> message.setDeliveredAt(LocalDateTime.now()));
        chatMessageRepository.saveAll(deliveredMessages);

        publishPresence(userId, true);
    }

    public void markUserOffline(Long userId) {
        onlineUsers.remove(userId);
        publishPresence(userId, false);
    }

    public Map<String, Object> getUserPresence(Long userId) {
        boolean online = onlineUsers.contains(userId);
        return Map.of(
                "userId", userId,
                "online", online,
                "statusLabel", online ? "En ligne" : "Hors ligne"
        );
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .missionId(message.getMission() != null ? message.getMission().getId() : null)
                .conversationKey(message.getConversationKey())
                .senderId(message.getSender().getId())
                .receiverId(message.getReceiver() != null ? message.getReceiver().getId() : null)
                .senderName(message.getSender().getFullName())
                .receiverName(message.getReceiver() != null ? message.getReceiver().getFullName() : null)
                .content(message.getContent())
                .isRead(message.getIsRead())
                .isEdited(message.getIsEdited())
                .status(resolveStatus(message))
                .sentAt(message.getSentAt())
                .deliveredAt(message.getDeliveredAt())
                .readAt(message.getReadAt())
                .editedAt(message.getEditedAt())
                .publicationType(message.getPublicationType())
                .publicationId(message.getPublicationId())
                .publicationTitle(message.getPublicationTitle())
                .attachmentFileName(message.getAttachmentFileName())
                .attachmentFileType(message.getAttachmentFileType())
                .attachmentFileSize(message.getAttachmentFileSize())
                .attachmentUrl(message.getAttachmentUrl())
                .attachmentCreatedAt(message.getAttachmentCreatedAt())
                .build();
    }

    private void validateAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Fichier obligatoire");
        }

        String contentType = file.getContentType();
        Long maxSize = ALLOWED_ATTACHMENT_TYPES.get(contentType);

        if (maxSize == null) {
            throw new RuntimeException("Type de fichier non autorisé.");
        }

        if (file.getSize() > maxSize) {
            throw new RuntimeException(
                    "Fichier trop volumineux. Taille maximale autorisée : " + (maxSize / 1024 / 1024) + " Mo."
            );
        }
    }

    private AttachmentMetadata storeAttachment(MultipartFile file) {
        try {
            Path uploadRoot = CHAT_UPLOAD_ROOT.toAbsolutePath().normalize();
            Files.createDirectories(uploadRoot);

            String originalName = sanitizeFileName(file.getOriginalFilename());
            String storedName = UUID.randomUUID() + "-" + originalName;
            Path target = uploadRoot.resolve(storedName).normalize();

            if (!target.startsWith(uploadRoot)) {
                throw new RuntimeException("Nom de fichier invalide");
            }

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return new AttachmentMetadata(
                    originalName,
                    file.getContentType(),
                    file.getSize(),
                    "/uploads/chat/" + storedName
            );
        } catch (IOException error) {
            throw new RuntimeException("Impossible d’enregistrer le fichier");
        }
    }

    private String sanitizeFileName(String fileName) {
        String sanitized = fileName == null ? "fichier" : Path.of(fileName).getFileName().toString();
        sanitized = sanitized.replaceAll("[^A-Za-z0-9._-]", "_");
        sanitized = sanitized.replaceAll("_+", "_");

        return sanitized.isBlank() ? "fichier" : sanitized;
    }

    private record AttachmentMetadata(String fileName, String fileType, Long fileSize, String url) {
    }

    private void markConversationMessagesDelivered(String conversationKey, Long receiverId) {
        List<ChatMessage> undelivered =
                chatMessageRepository.findByConversationKeyAndReceiverIdAndDeliveredAtIsNull(conversationKey, receiverId);

        undelivered.forEach(message -> message.setDeliveredAt(LocalDateTime.now()));
        chatMessageRepository.saveAll(undelivered);
    }

    private void sendUnreadCount(Long missionId, Long readerId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        long unreadCount =
                chatMessageRepository.countByMissionAndSenderIdNotAndIsReadFalse(mission, readerId);

        messagingTemplate.convertAndSend(
                "/topic/missions/" + missionId + "/chat",
                UnreadCountEvent.builder()
                        .type("UNREAD_COUNT_UPDATED")
                        .missionId(missionId)
                        .readerId(readerId)
                        .unreadCount(unreadCount)
                        .build()
        );
    }

    private void publishReadEvent(ChatMessage message, Long readerId) {
        if (message.getMission() != null) {
            sendUnreadCount(message.getMission().getId(), readerId);
            messagingTemplate.convertAndSend(
                    "/topic/missions/" + message.getMission().getId() + "/chat",
                    ChatReadEvent.builder()
                            .type("CHAT_MESSAGE_READ")
                            .missionId(message.getMission().getId())
                            .messageId(message.getId())
                            .readerId(readerId)
                            .build()
            );
            return;
        }

        messagingTemplate.convertAndSend(
                "/topic/conversations/" + message.getConversationKey() + "/chat",
                ChatReadEvent.builder()
                        .type("CHAT_MESSAGE_READ")
                        .messageId(message.getId())
                        .readerId(readerId)
                        .build()
        );
    }

    private void publishDirectMessage(ChatMessageResponse response, Long userId) {
        messagingTemplate.convertAndSend(
                "/topic/users/" + userId + "/chat",
                ChatEvent.builder()
                        .type("CHAT_MESSAGE_SENT")
                        .conversationKey(response.getConversationKey())
                        .messageId(response.getId())
                        .senderId(response.getSenderId())
                        .receiverId(response.getReceiverId())
                        .senderName(response.getSenderName())
                        .content(response.getContent())
                        .status(response.getStatus())
                        .publicationType(response.getPublicationType())
                        .publicationId(response.getPublicationId())
                        .publicationTitle(response.getPublicationTitle())
                        .attachmentFileName(response.getAttachmentFileName())
                        .attachmentFileType(response.getAttachmentFileType())
                        .attachmentFileSize(response.getAttachmentFileSize())
                        .attachmentUrl(response.getAttachmentUrl())
                        .build()
        );
    }

    private void publishPresence(Long userId, boolean online) {
        messagingTemplate.convertAndSend(
                "/topic/presence",
                PresenceEvent.builder()
                        .type("USER_PRESENCE")
                        .userId(userId)
                        .online(online)
                        .statusLabel(online ? "En ligne" : "Hors ligne")
                        .build()
        );
    }

    private void validateReader(ChatMessage message, Long readerId) {
        if (message.getMission() != null) {
            Mission mission = message.getMission();
            if (!mission.getClient().getId().equals(readerId)
                    && !mission.getProvider().getId().equals(readerId)) {
                throw new RuntimeException("Cet utilisateur ne participe pas a cette mission");
            }
            return;
        }

        if (message.getReceiver() == null || !message.getReceiver().getId().equals(readerId)) {
            throw new RuntimeException("Cet utilisateur ne participe pas a cette conversation");
        }
    }

    private User getOtherParticipant(Mission mission, Long userId) {
        if (mission.getClient().getId().equals(userId)) {
            return mission.getProvider();
        }

        if (mission.getProvider().getId().equals(userId)) {
            return mission.getClient();
        }

        throw new RuntimeException("Cet utilisateur ne participe pas a cette mission");
    }

    private Long getOtherParticipantId(Mission mission, Long userId) {
        return getOtherParticipant(mission, userId).getId();
    }

    private String buildMissionConversationKey(Long missionId) {
        return "mission:" + missionId;
    }

    private String buildDirectConversationKey(Long userId, Long otherUserId, String publicationType, Long publicationId) {
        Long first = Math.min(userId, otherUserId);
        Long second = Math.max(userId, otherUserId);
        String contextType = publicationType == null || publicationType.isBlank() ? "general" : publicationType;
        String contextId = publicationId == null ? "none" : String.valueOf(publicationId);

        return "direct:" + first + ":" + second + ":" + contextType + ":" + contextId;
    }

    private String resolveStatus(ChatMessage message) {
        if (Boolean.TRUE.equals(message.getIsRead()) || message.getReadAt() != null) {
            return "Lu";
        }

        if (message.getDeliveredAt() != null) {
            return "Distribue";
        }

        return "Envoye";
    }
}


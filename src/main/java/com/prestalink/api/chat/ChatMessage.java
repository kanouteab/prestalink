package com.prestalink.api.chat;

import com.prestalink.api.mission.Mission;
import com.prestalink.api.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private LocalDateTime sentAt;

    private Boolean isRead;
    private Boolean isEdited;

    private LocalDateTime editedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime readAt;

    private String conversationKey;
    private String publicationType;
    private Long publicationId;
    private String publicationTitle;
    private String attachmentFileName;
    private String attachmentFileType;
    private Long attachmentFileSize;
    private String attachmentUrl;
    private LocalDateTime attachmentCreatedAt;

    @ManyToOne
    @JoinColumn(name = "mission_id")
    private Mission mission;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @RestController
    @RequestMapping("/api/chat")
    @RequiredArgsConstructor
    public static class ChatController {

        private final ChatService chatService;


        @PostMapping("/send")
        public ChatMessageResponse sendMessage(@RequestBody ChatMessageRequest request) {
            return chatService.sendMessage(request);
        }

        @GetMapping("/mission/{missionId}")
        public List<ChatMessageResponse> getMissionMessages(@PathVariable Long missionId) {
            return chatService.getMissionMessages(missionId);
        }

        @GetMapping("/conversation")
        public List<ChatMessageResponse> getConversationMessages(
                @RequestParam Long userId,
                @RequestParam Long otherUserId,
                @RequestParam(required = false) String publicationType,
                @RequestParam(required = false) Long publicationId
        ) {
            return chatService.getConversationMessages(userId, otherUserId, publicationType, publicationId);
        }

        @PutMapping("/conversation/read-all")
        public List<ChatMessageResponse> markAllConversationMessagesAsRead(
                @RequestParam String conversationKey,
                @RequestParam Long readerId
        ) {
            return chatService.markAllConversationMessagesAsRead(conversationKey, readerId);
        }

        @PostMapping("/presence/{userId}/online")
        public void markUserOnline(@PathVariable Long userId) {
            chatService.markUserOnline(userId);
        }

        @PostMapping("/presence/{userId}/offline")
        public void markUserOffline(@PathVariable Long userId) {
            chatService.markUserOffline(userId);
        }

        @GetMapping("/users/{userId}/presence")
        public java.util.Map<String, Object> getUserPresence(@PathVariable Long userId) {
            return chatService.getUserPresence(userId);
        }
        @PostMapping("/typing")
        public void typing(
                @RequestParam Long missionId,
                @RequestParam Long userId,
                @RequestParam String userName
        ) {

            chatService.sendTypingEvent(
                    missionId,
                    userId,
                    userName
            );
        }

        @PutMapping("/messages/{messageId}/read")
        public ChatMessageResponse markMessageAsRead(
                @PathVariable Long messageId,
                @RequestParam Long readerId
        ) {
            return chatService.markMessageAsRead(messageId, readerId);
        }
        @PutMapping("/mission/{missionId}/read-all")
        public List<ChatMessageResponse> markAllMissionMessagesAsRead(
                @PathVariable Long missionId,
                @RequestParam Long readerId
        ) {
            return chatService.markAllMissionMessagesAsRead(missionId, readerId);
        }

        @GetMapping("/mission/{missionId}/unread-count")
        public long getUnreadMessagesCount(
                @PathVariable Long missionId,
                @RequestParam Long readerId
        ) {
            return chatService.getUnreadMessagesCount(missionId, readerId);
        }

        @GetMapping("/mission/{missionId}/paginated")
        public List<ChatMessageResponse> getMissionMessagesPaginated(
                @PathVariable Long missionId,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size
        ) {
            return chatService.getMissionMessagesPaginated(missionId, page, size);
        }

        @DeleteMapping("/messages/{messageId}")
        public void deleteMessage(
                @PathVariable Long messageId,
                @RequestParam Long userId
        ) {
            chatService.deleteMessage(messageId, userId);
        }

        @PutMapping("/messages/{messageId}")
        public ChatMessageResponse updateMessage(
                @PathVariable Long messageId,
                @RequestParam Long userId,
                @RequestParam String content
        ) {

            return chatService.updateMessage(
                    messageId,
                    userId,
                    content
            );
        }
    }
}


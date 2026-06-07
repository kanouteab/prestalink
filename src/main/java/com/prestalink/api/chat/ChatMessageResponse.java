package com.prestalink.api.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {

    private Long id;

    private Long missionId;

    private String conversationKey;

    private Long senderId;

    private Long receiverId;

    private String senderName;

    private String receiverName;

    private String content;

    private Boolean isRead;

    private Boolean isEdited;

    private String status;

    private LocalDateTime sentAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime readAt;

    private LocalDateTime editedAt;

    private String publicationType;

    private Long publicationId;

    private String publicationTitle;

    private String attachmentFileName;

    private String attachmentFileType;

    private Long attachmentFileSize;

    private String attachmentUrl;

    private LocalDateTime attachmentCreatedAt;
}


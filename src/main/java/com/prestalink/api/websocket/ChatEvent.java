package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatEvent {
    private String type;
    private Long missionId;
    private String conversationKey;
    private Long messageId;
    private Long senderId;
    private Long receiverId;
    private String senderName;
    private String content;
    private String status;
    private String publicationType;
    private Long publicationId;
    private String publicationTitle;
    private String attachmentFileName;
    private String attachmentFileType;
    private Long attachmentFileSize;
    private String attachmentUrl;
}


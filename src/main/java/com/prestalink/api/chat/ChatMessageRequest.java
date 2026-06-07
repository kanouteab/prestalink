package com.prestalink.api.chat;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private Long missionId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private String conversationKey;
    private String publicationType;
    private Long publicationId;
    private String publicationTitle;
}


package com.prestalink.api.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class ChatAttachmentController {

    private final ChatService chatService;

    @PostMapping("/{conversationId}/attachments")
    public ChatMessageResponse sendMessageWithAttachment(
            @PathVariable String conversationId,
            @RequestParam MultipartFile file,
            @RequestParam Long senderId,
            @RequestParam Long receiverId,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String conversationKey,
            @RequestParam(required = false) String publicationType,
            @RequestParam(required = false) Long publicationId,
            @RequestParam(required = false) String publicationTitle
    ) {
        ChatMessageRequest request = new ChatMessageRequest();
        request.setSenderId(senderId);
        request.setReceiverId(receiverId);
        request.setContent(content);
        request.setConversationKey(conversationKey != null && !conversationKey.isBlank() ? conversationKey : conversationId);
        request.setPublicationType(publicationType);
        request.setPublicationId(publicationId);
        request.setPublicationTitle(publicationTitle);

        return chatService.sendMessageWithAttachment(request, file);
    }
}


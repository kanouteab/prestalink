package com.prestalink.api.chat;

import com.prestalink.api.mission.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByMissionOrderBySentAtAsc(Mission mission);
    List<ChatMessage> findByMissionAndIsReadFalse(Mission mission);
    List<ChatMessage> findByMissionAndSenderIdNotAndIsReadFalse(Mission mission, Long senderId);
    long countByMissionAndIsReadFalse(Mission mission);
    long countByMissionAndSenderIdNotAndIsReadFalse(Mission mission, Long senderId);
    Page<ChatMessage> findByMissionOrderBySentAtAsc(Mission mission, Pageable pageable);
    List<ChatMessage> findByConversationKeyOrderBySentAtAsc(String conversationKey);
    List<ChatMessage> findByConversationKeyAndReceiverIdAndDeliveredAtIsNull(String conversationKey, Long receiverId);
    List<ChatMessage> findByConversationKeyAndReceiverIdAndIsReadFalse(String conversationKey, Long receiverId);
    List<ChatMessage> findByReceiverIdAndDeliveredAtIsNull(Long receiverId);
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}


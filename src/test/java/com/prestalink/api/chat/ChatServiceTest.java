package com.prestalink.api.chat;

import com.prestalink.api.mission.Mission;
import com.prestalink.api.mission.MissionRepository;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    @Test
    void sendMessagePublishesUnreadCountForRecipientOnly() {
        User client = User.builder().id(1L).fullName("Client").build();
        User provider = User.builder().id(2L).fullName("Provider").build();
        Mission mission = Mission.builder().id(10L).client(client).provider(provider).build();

        ChatMessageRequest request = new ChatMessageRequest();
        request.setMissionId(mission.getId());
        request.setSenderId(client.getId());
        request.setContent("Bonjour");

        when(missionRepository.findById(mission.getId())).thenReturn(Optional.of(mission));
        when(userRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(chatMessageRepository.countByMissionAndSenderIdNotAndIsReadFalse(mission, provider.getId()))
                .thenReturn(1L);

        chatService.sendMessage(request);

        verify(chatMessageRepository)
                .countByMissionAndSenderIdNotAndIsReadFalse(mission, provider.getId());
        verify(messagingTemplate, atLeastOnce()).convertAndSend(any(String.class), any(Object.class));
    }

    @Test
    void markAllMissionMessagesAsReadOnlyMarksMessagesUnreadForReader() {
        User client = User.builder().id(1L).fullName("Client").build();
        User provider = User.builder().id(2L).fullName("Provider").build();
        Mission mission = Mission.builder().id(10L).client(client).provider(provider).build();
        ChatMessage providerMessage = ChatMessage.builder()
                .id(100L)
                .mission(mission)
                .sender(provider)
                .content("Salut")
                .isRead(false)
                .build();

        when(missionRepository.findById(mission.getId())).thenReturn(Optional.of(mission));
        when(userRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(chatMessageRepository.findByMissionAndSenderIdNotAndIsReadFalse(mission, client.getId()))
                .thenReturn(List.of(providerMessage));
        when(chatMessageRepository.saveAll(List.of(providerMessage))).thenReturn(List.of(providerMessage));
        when(chatMessageRepository.countByMissionAndSenderIdNotAndIsReadFalse(mission, client.getId()))
                .thenReturn(0L);

        List<ChatMessageResponse> responses =
                chatService.markAllMissionMessagesAsRead(mission.getId(), client.getId());

        assertEquals(1, responses.size());
        assertEquals(true, providerMessage.getIsRead());
        verify(chatMessageRepository)
                .findByMissionAndSenderIdNotAndIsReadFalse(mission, client.getId());
    }

    @Test
    void getUnreadMessagesCountExcludesReaderOwnMessages() {
        User client = User.builder().id(1L).fullName("Client").build();
        User provider = User.builder().id(2L).fullName("Provider").build();
        Mission mission = Mission.builder().id(10L).client(client).provider(provider).build();

        when(missionRepository.findById(mission.getId())).thenReturn(Optional.of(mission));
        when(userRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(chatMessageRepository.countByMissionAndSenderIdNotAndIsReadFalse(mission, client.getId()))
                .thenReturn(3L);

        long unreadCount = chatService.getUnreadMessagesCount(mission.getId(), client.getId());

        assertEquals(3L, unreadCount);
        verify(chatMessageRepository)
                .countByMissionAndSenderIdNotAndIsReadFalse(mission, client.getId());
    }
}

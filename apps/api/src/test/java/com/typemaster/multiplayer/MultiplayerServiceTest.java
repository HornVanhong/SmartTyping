package com.typemaster.multiplayer;

import com.typemaster.common.error.BadRequestException;
import com.typemaster.content.Passage;
import com.typemaster.content.PassageRepository;
import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MultiplayerServiceTest {

    @Mock
    private MultiplayerRoomRepository roomRepository;

    @Mock
    private RaceParticipantRepository participantRepository;

    @Mock
    private PassageRepository passageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MultiplayerService multiplayerService;

    @Test
    @DisplayName("Creates multiplayer room with unique 6-character code and host participant")
    void createsMultiplayerRoom() {
        UUID hostId = UUID.randomUUID();
        User host = new User("host@example.com", "hash", "HostPlayer", "en");
        host.setId(hostId);

        Passage passage = new Passage("en", "Test Title", "Quick typing passage content.", "BEGINNER", "GENERAL", "SENTENCES", "Src", "Lic", "PUBLISHED");
        passage.setId(UUID.randomUUID());

        when(userRepository.findById(hostId)).thenReturn(Optional.of(host));
        when(passageRepository.findRandomPublishedByLocale("en")).thenReturn(Optional.of(passage));
        when(roomRepository.save(any(MultiplayerRoom.class))).thenAnswer(inv -> {
            MultiplayerRoom r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        CreateRoomRequest req = new CreateRoomRequest("en", "BEGINNER", true, 5);
        RoomResponse room = multiplayerService.createRoom(req, hostId);

        assertThat(room.roomCode()).isNotBlank();
        assertThat(room.roomCode()).hasSize(6);
        assertThat(room.status()).isEqualTo("WAITING");
        assertThat(room.hostUserId()).isEqualTo(hostId);
        assertThat(room.participants()).hasSize(1);
        assertThat(room.participants().get(0).displayName()).isEqualTo("HostPlayer");
    }

    @Test
    @DisplayName("Transitions room to RACING when all players mark ready")
    void startsRaceWhenReady() {
        UUID hostId = UUID.randomUUID();
        User host = new User("host@example.com", "hash", "Host", "en");
        host.setId(hostId);

        MultiplayerRoom room = new MultiplayerRoom();
        room.setId(UUID.randomUUID());
        room.setRoomCode("AB12CD");
        room.setStatus("WAITING");

        RaceParticipant p1 = new RaceParticipant(room, host);
        room.getParticipants().add(p1);

        when(roomRepository.findByRoomCode("AB12CD")).thenReturn(Optional.of(room));
        when(participantRepository.findByRoomIdAndUserId(room.getId(), hostId)).thenReturn(Optional.of(p1));
        when(roomRepository.save(any(MultiplayerRoom.class))).thenAnswer(inv -> inv.getArgument(0));

        RoomResponse response = multiplayerService.markReady("AB12CD", hostId);

        assertThat(response.status()).isEqualTo("RACING");
        assertThat(response.startedAt()).isNotNull();
    }

    @Test
    @DisplayName("Rejects negative progress updates (monotonicity check)")
    void rejectsDecreasingProgress() {
        UUID userId = UUID.randomUUID();
        MultiplayerRoom room = new MultiplayerRoom();
        room.setId(UUID.randomUUID());
        room.setRoomCode("AB12CD");
        room.setStatus("RACING");

        Passage passage = new Passage("en", "T", "Passage content for racing", "BEGINNER", "G", "S", "S", "L", "PUBLISHED");
        room.setPassage(passage);

        RaceParticipant p = new RaceParticipant(room, new User("u@ex.com", "h", "U", "en"));
        p.setProgressCharacters(20); // Current progress is 20

        when(roomRepository.findByRoomCode("AB12CD")).thenReturn(Optional.of(room));
        when(participantRepository.findByRoomIdAndUserId(room.getId(), userId)).thenReturn(Optional.of(p));

        // Attempting to send progress of 15 (less than 20)
        RaceProgressPayload payload = new RaceProgressPayload("AB12CD", 15, 15, 0);

        assertThatThrownBy(() -> multiplayerService.updateProgress(payload, userId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot decrease");
    }
}

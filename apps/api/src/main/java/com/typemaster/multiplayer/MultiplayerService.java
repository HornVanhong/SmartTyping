package com.typemaster.multiplayer;

import com.typemaster.common.error.BadRequestException;
import com.typemaster.common.error.ResourceNotFoundException;
import com.typemaster.content.Passage;
import com.typemaster.content.PassageRepository;
import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MultiplayerService {

    private final MultiplayerRoomRepository roomRepository;
    private final RaceParticipantRepository participantRepository;
    private final PassageRepository passageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();

    public MultiplayerService(
            MultiplayerRoomRepository roomRepository,
            RaceParticipantRepository participantRepository,
            PassageRepository passageRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.roomRepository = roomRepository;
        this.participantRepository = participantRepository;
        this.passageRepository = passageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public RoomResponse createRoom(CreateRoomRequest req, UUID hostUserId) {
        User host = userRepository.findById(hostUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Host user not found."));

        String safeLocale = (req.locale() != null && req.locale().equalsIgnoreCase("km")) ? "km" : "en";
        Passage passage = null;

        if (req.difficulty() != null && !req.difficulty().isBlank()) {
            passage = passageRepository.findRandomPublishedByLocaleAndDifficulty(safeLocale, req.difficulty().toUpperCase())
                    .orElse(null);
        }
        if (passage == null) {
            passage = passageRepository.findRandomPublishedByLocale(safeLocale)
                    .orElseThrow(() -> new ResourceNotFoundException("No published passage available for locale: " + safeLocale));
        }

        String roomCode = generateUniqueRoomCode();

        MultiplayerRoom room = new MultiplayerRoom();
        room.setRoomCode(roomCode);
        room.setHostUserId(hostUserId);
        room.setPassage(passage);
        room.setLocale(safeLocale);
        room.setStatus("WAITING");
        room.setPrivate(req.isPrivate());
        room.setMaxPlayers(req.maxPlayers() > 0 ? req.maxPlayers() : 5);
        room.setCreatedAt(Instant.now());

        MultiplayerRoom savedRoom = roomRepository.save(room);

        RaceParticipant hostParticipant = new RaceParticipant(savedRoom, host);
        savedRoom.getParticipants().add(hostParticipant);
        participantRepository.save(hostParticipant);

        return RoomResponse.fromEntity(savedRoom);
    }

    public RoomResponse joinRoom(String roomCode, UUID userId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with code: " + roomCode));

        if (!"WAITING".equals(room.getStatus()) && !"READY".equals(room.getStatus())) {
            throw new BadRequestException("Room is not accepting new players (status: " + room.getStatus() + ").");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        boolean alreadyInRoom = room.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));

        if (!alreadyInRoom) {
            if (room.getParticipants().size() >= room.getMaxPlayers()) {
                throw new BadRequestException("Room is full.");
            }
            RaceParticipant newParticipant = new RaceParticipant(room, user);
            room.getParticipants().add(newParticipant);
            participantRepository.save(newParticipant);
        }

        RoomResponse snapshot = RoomResponse.fromEntity(room);
        broadcastToRoom(room.getRoomCode(), "ROOM_UPDATED", snapshot);
        return snapshot;
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomSnapshot(String roomCode) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with code: " + roomCode));
        return RoomResponse.fromEntity(room);
    }

    public RoomResponse markReady(String roomCode, UUID userId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with code: " + roomCode));

        RaceParticipant participant = participantRepository.findByRoomIdAndUserId(room.getId(), userId)
                .orElseThrow(() -> new BadRequestException("User is not in room."));

        participant.setStatus("READY");
        participantRepository.save(participant);

        // Check if all players are ready
        boolean allReady = room.getParticipants().stream()
                .allMatch(p -> "READY".equals(p.getStatus()));

        if (allReady && !room.getParticipants().isEmpty()) {
            room.setStatus("RACING");
            room.setStartedAt(Instant.now());
            room.getParticipants().forEach(p -> p.setStatus("RACING"));
            roomRepository.save(room);

            RoomResponse racingSnapshot = RoomResponse.fromEntity(room);
            broadcastToRoom(room.getRoomCode(), "RACE_STARTED", racingSnapshot);
            return racingSnapshot;
        }

        RoomResponse snapshot = RoomResponse.fromEntity(room);
        broadcastToRoom(room.getRoomCode(), "ROOM_UPDATED", snapshot);
        return snapshot;
    }

    public ParticipantResponse updateProgress(RaceProgressPayload payload, UUID userId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(payload.roomCode().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + payload.roomCode()));

        if (!"RACING".equals(room.getStatus())) {
            throw new BadRequestException("Race is not active.");
        }

        RaceParticipant participant = participantRepository.findByRoomIdAndUserId(room.getId(), userId)
                .orElseThrow(() -> new BadRequestException("User is not in room."));

        if ("FINISHED".equals(participant.getStatus())) {
            return ParticipantResponse.fromEntity(participant);
        }

        // Monotonicity check: progress cannot move backward
        if (payload.progressCharacters() < participant.getProgressCharacters()) {
            throw new BadRequestException("Progress cannot decrease.");
        }

        int targetLength = room.getPassage().getContent().length();
        int progress = Math.min(payload.progressCharacters(), targetLength);

        participant.setProgressCharacters(progress);
        participant.setCorrectCharacters(payload.correctCharacters());
        participant.setIncorrectCharacters(payload.incorrectCharacters());

        // Check if finished
        if (progress >= targetLength) {
            long elapsedMs = Math.max(Instant.now().toEpochMilli() - room.getStartedAt().toEpochMilli(), 1000);
            participant.setFinishElapsedMs(elapsedMs);

            double minutes = elapsedMs / 60000.0;
            double cpmVal = participant.getCorrectCharacters() / minutes;
            participant.setFinalCpm(BigDecimal.valueOf(cpmVal).setScale(2, RoundingMode.HALF_UP));

            if ("en".equalsIgnoreCase(room.getLocale())) {
                double wpmVal = (participant.getCorrectCharacters() / 5.0) / minutes;
                participant.setFinalWpm(BigDecimal.valueOf(wpmVal).setScale(2, RoundingMode.HALF_UP));
            }

            // Server-calculated placement
            long alreadyFinished = room.getParticipants().stream()
                    .filter(p -> "FINISHED".equals(p.getStatus()))
                    .count();
            participant.setPlacement((int) alreadyFinished + 1);
            participant.setStatus("FINISHED");

            // Check if all finished
            boolean allFinished = room.getParticipants().stream()
                    .allMatch(p -> "FINISHED".equals(p.getStatus()) || "DISCONNECTED".equals(p.getStatus()));

            if (allFinished) {
                room.setStatus("COMPLETED");
                room.setEndedAt(Instant.now());
                roomRepository.save(room);
            }
        }

        RaceParticipant saved = participantRepository.save(participant);
        ParticipantResponse response = ParticipantResponse.fromEntity(saved);

        broadcastToRoom(room.getRoomCode(), "PARTICIPANT_PROGRESS", response);

        if ("COMPLETED".equals(room.getStatus())) {
            broadcastToRoom(room.getRoomCode(), "RACE_FINISHED", RoomResponse.fromEntity(room));
        }

        return response;
    }

    public void leaveRoom(String roomCode, UUID userId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase()).orElse(null);
        if (room == null) return;

        participantRepository.findByRoomIdAndUserId(room.getId(), userId).ifPresent(p -> {
            p.setStatus("DISCONNECTED");
            participantRepository.save(p);
        });

        broadcastToRoom(roomCode, "ROOM_UPDATED", RoomResponse.fromEntity(room));
    }

    private void broadcastToRoom(String roomCode, String type, Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/rooms/" + roomCode, new RoomEvent(type, payload));
        } catch (Exception ignored) {}
    }

    private String generateUniqueRoomCode() {
        for (int i = 0; i < 20; i++) {
            StringBuilder sb = new StringBuilder(6);
            for (int j = 0; j < 6; j++) {
                sb.append(ROOM_CODE_CHARS.charAt(random.nextInt(ROOM_CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (!roomRepository.existsByRoomCode(code)) {
                return code;
            }
        }
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}

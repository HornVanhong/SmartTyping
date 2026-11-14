package com.typemaster.leaderboard;

import com.typemaster.typing.TypingSession;
import com.typemaster.typing.TypingSessionRepository;
import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class LeaderboardService {

    private final TypingSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public LeaderboardService(
            TypingSessionRepository sessionRepository,
            UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public LeaderboardPageResponse getLeaderboard(
            String period,
            String locale,
            String mode,
            int page,
            int size) {

        String safeLocale = (locale != null && locale.equalsIgnoreCase("km")) ? "km" : "en";
        String safePeriod = (period != null) ? period.toUpperCase() : "ALL_TIME";
        int boundedPage = Math.max(page, 0);
        int boundedSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize);

        Instant since = switch (safePeriod) {
            case "DAILY" -> Instant.now().minus(24, ChronoUnit.HOURS);
            case "WEEKLY" -> Instant.now().minus(7, ChronoUnit.DAYS);
            default -> Instant.EPOCH;
        };

        Page<TypingSession> sessionPage;
        if ("km".equals(safeLocale)) {
            sessionPage = sessionRepository.findRankedKhmerSessions(mode, since, pageable);
        } else {
            sessionPage = sessionRepository.findRankedEnglishSessions(mode, since, pageable);
        }

        // Fetch User profiles
        Set<UUID> userIds = sessionPage.getContent().stream()
                .map(TypingSession::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        int startRank = boundedPage * boundedSize + 1;
        List<LeaderboardItemResponse> items = new ArrayList<>();

        for (int i = 0; i < sessionPage.getContent().size(); i++) {
            TypingSession s = sessionPage.getContent().get(i);
            User u = s.getUserId() != null ? userMap.get(s.getUserId()) : null;
            String displayName = (u != null) ? u.getDisplayName() : "Anonymous Typist";
            String avatarColor = (u != null) ? u.getAvatarColor() : "#7C8CFF";

            items.add(new LeaderboardItemResponse(
                    startRank + i,
                    s.getUserId(),
                    displayName,
                    avatarColor,
                    s.getWpm(),
                    s.getCpm(),
                    s.getAccuracy(),
                    s.getCreatedAt()
            ));
        }

        return new LeaderboardPageResponse(
                safePeriod,
                safeLocale,
                mode,
                items,
                boundedPage,
                boundedSize,
                sessionPage.getTotalElements()
        );
    }
}

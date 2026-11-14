package com.typemaster.leaderboard;

import com.typemaster.typing.TypingSession;
import com.typemaster.typing.TypingSessionRepository;
import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock
    private TypingSessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    @Test
    @DisplayName("Returns ranked English leaderboard with correct rank numbering")
    void returnsRankedEnglishLeaderboard() {
        UUID u1 = UUID.randomUUID();
        UUID u2 = UUID.randomUUID();

        User user1 = new User("u1@example.com", "hash", "Speedy", "en");
        user1.setId(u1);

        User user2 = new User("u2@example.com", "hash", "Swift", "en");
        user2.setId(u2);

        TypingSession s1 = new TypingSession();
        s1.setId(UUID.randomUUID());
        s1.setUserId(u1);
        s1.setLocale("en");
        s1.setMode("TIME_30");
        s1.setWpm(BigDecimal.valueOf(95.5));
        s1.setCpm(BigDecimal.valueOf(477.5));
        s1.setAccuracy(BigDecimal.valueOf(99.0));
        s1.setCreatedAt(Instant.now());

        TypingSession s2 = new TypingSession();
        s2.setId(UUID.randomUUID());
        s2.setUserId(u2);
        s2.setLocale("en");
        s2.setMode("TIME_30");
        s2.setWpm(BigDecimal.valueOf(88.0));
        s2.setCpm(BigDecimal.valueOf(440.0));
        s2.setAccuracy(BigDecimal.valueOf(98.5));
        s2.setCreatedAt(Instant.now());

        when(sessionRepository.findRankedEnglishSessions(eq("TIME_30"), any(Instant.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(s1, s2)));

        when(userRepository.findAllById(any())).thenReturn(List.of(user1, user2));

        LeaderboardPageResponse res = leaderboardService.getLeaderboard("ALL_TIME", "en", "TIME_30", 0, 20);

        assertThat(res.items()).hasSize(2);
        assertThat(res.items().get(0).rank()).isEqualTo(1);
        assertThat(res.items().get(0).displayName()).isEqualTo("Speedy");
        assertThat(res.items().get(0).wpm()).isEqualByComparingTo("95.50");

        assertThat(res.items().get(1).rank()).isEqualTo(2);
        assertThat(res.items().get(1).displayName()).isEqualTo("Swift");
        assertThat(res.items().get(1).wpm()).isEqualByComparingTo("88.00");
    }

    @Test
    @DisplayName("Queries Khmer leaderboard by CPM without WPM requirement")
    void queriesKhmerLeaderboardByCpm() {
        UUID u1 = UUID.randomUUID();
        User kmUser = new User("km@example.com", "hash", "KhmerTypist", "km");
        kmUser.setId(u1);

        TypingSession kmSession = new TypingSession();
        kmSession.setId(UUID.randomUUID());
        kmSession.setUserId(u1);
        kmSession.setLocale("km");
        kmSession.setMode("TIME_30");
        kmSession.setCpm(BigDecimal.valueOf(320.0));
        kmSession.setWpm(null);
        kmSession.setAccuracy(BigDecimal.valueOf(99.5));
        kmSession.setCreatedAt(Instant.now());

        when(sessionRepository.findRankedKhmerSessions(eq("TIME_30"), any(Instant.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(kmSession)));

        when(userRepository.findAllById(any())).thenReturn(List.of(kmUser));

        LeaderboardPageResponse res = leaderboardService.getLeaderboard("ALL_TIME", "km", "TIME_30", 0, 20);

        assertThat(res.items()).hasSize(1);
        assertThat(res.items().get(0).displayName()).isEqualTo("KhmerTypist");
        assertThat(res.items().get(0).cpm()).isEqualByComparingTo("320.00");
        assertThat(res.items().get(0).wpm()).isNull();
    }
}

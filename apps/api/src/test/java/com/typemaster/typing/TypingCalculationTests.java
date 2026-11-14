package com.typemaster.typing;

import com.typemaster.common.error.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class TypingCalculationTests {

    @Mock
    private TypingSessionRepository repository;

    @Mock
    private com.typemaster.achievement.AchievementService achievementService;

    @InjectMocks
    private TypingSessionService service;

    @BeforeEach
    void setUp() {
        lenient().when(repository.save(any(TypingSession.class))).thenAnswer(invocation -> {
            TypingSession s = invocation.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });
    }

    @Test
    @DisplayName("Calculates English WPM and CPM deterministically")
    void calculatesEnglishWpmAndCpm() {
        // 300 correct characters in 60,000 ms (1 minute)
        // Expected CPM = 300.00
        // Expected English WPM = 300 / 5 = 60.00
        // Expected accuracy = 300 / 300 * 100 = 100.00%
        TypingSessionSubmitRequest req = new TypingSessionSubmitRequest(
                UUID.randomUUID(),
                "en",
                "TIME_60",
                60,
                60000L,
                300,
                0,
                300,
                BigDecimal.valueOf(300),
                BigDecimal.valueOf(60),
                BigDecimal.valueOf(100.0)
        );

        TypingSessionResponse response = service.processAndSaveSession(req, UUID.randomUUID());

        assertThat(response.cpm()).isEqualByComparingTo("300.00");
        assertThat(response.wpm()).isNotNull();
        assertThat(response.wpm()).isEqualByComparingTo("60.00");
        assertThat(response.accuracy()).isEqualByComparingTo("100.00");
        assertThat(response.rankedEligible()).isTrue();
    }

    @Test
    @DisplayName("Khmer typing calculates CPM and keeps WPM null")
    void calculatesKhmerCpmWithoutInventingWpm() {
        // In accordance with AGENTS.md rule 5:
        // "Do not label Khmer CPM as WPM. WPM is shown only where its calculation is meaningful and documented."
        TypingSessionSubmitRequest req = new TypingSessionSubmitRequest(
                UUID.randomUUID(),
                "km",
                "TIME_30",
                30,
                30000L,
                150,
                2,
                152,
                BigDecimal.valueOf(300),
                null,
                BigDecimal.valueOf(98.68)
        );

        TypingSessionResponse response = service.processAndSaveSession(req, UUID.randomUUID());

        // 150 characters in 0.5 minutes = 300 CPM
        assertThat(response.cpm()).isEqualByComparingTo("300.00");
        assertThat(response.wpm()).isNull();
        assertThat(response.locale()).isEqualTo("km");
        assertThat(response.rankedEligible()).isTrue();
    }

    @Test
    @DisplayName("Rejects inconsistent character counts where correct exceeds total")
    void rejectsImpossibleCharacterCounts() {
        TypingSessionSubmitRequest req = new TypingSessionSubmitRequest(
                UUID.randomUUID(),
                "en",
                "TIME_30",
                30,
                30000L,
                200,
                0,
                100, // Total less than correct!
                BigDecimal.valueOf(400),
                BigDecimal.valueOf(80),
                BigDecimal.valueOf(100.0)
        );

        assertThatThrownBy(() -> service.processAndSaveSession(req, UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Correct characters cannot exceed total characters");
    }

    @Test
    @DisplayName("Guards against zero elapsed time")
    void guardsAgainstZeroElapsedTime() {
        TypingSessionSubmitRequest req = new TypingSessionSubmitRequest(
                UUID.randomUUID(),
                "en",
                "TIME_30",
                30,
                0L,
                50,
                0,
                50,
                BigDecimal.valueOf(100),
                BigDecimal.valueOf(20),
                BigDecimal.valueOf(100.0)
        );

        assertThatThrownBy(() -> service.processAndSaveSession(req, UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("greater than zero");
    }

    @Test
    @DisplayName("Disqualifies ranked eligibility for superhuman or suspicious speeds")
    void marksSuspiciousSpeedAsNotRankedEligible() {
        // 1000 correct characters in 10,000 ms = 6000 CPM (equivalent to 1200 WPM, clearly bot/impossible)
        TypingSessionSubmitRequest req = new TypingSessionSubmitRequest(
                UUID.randomUUID(),
                "en",
                "TIME_60",
                60,
                10000L,
                1000,
                0,
                1000,
                BigDecimal.valueOf(6000),
                BigDecimal.valueOf(1200),
                BigDecimal.valueOf(100.0)
        );

        TypingSessionResponse response = service.processAndSaveSession(req, UUID.randomUUID());

        assertThat(response.rankedEligible()).isFalse();
    }
}

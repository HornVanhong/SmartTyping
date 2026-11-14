package com.typemaster.achievement;

import com.typemaster.typing.TypingSession;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AchievementServiceTest {

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private UserAchievementRepository userAchievementRepository;

    @InjectMocks
    private AchievementService achievementService;

    @Test
    @DisplayName("Awards FIRST_TEST and KHMER_TYPIST when criteria are met")
    void awardsAchievementsOnQualifyingSession() {
        UUID userId = UUID.randomUUID();

        Achievement firstTest = new Achievement();
        firstTest.setId(UUID.randomUUID());
        firstTest.setCode("FIRST_TEST");
        firstTest.setActive(true);

        Achievement kmTypist = new Achievement();
        kmTypist.setId(UUID.randomUUID());
        kmTypist.setCode("KHMER_TYPIST");
        kmTypist.setActive(true);

        when(achievementRepository.findByActiveTrueOrderByCodeAsc())
                .thenReturn(List.of(firstTest, kmTypist));

        when(userAchievementRepository.existsByIdUserIdAndIdAchievementId(eq(userId), any(UUID.class)))
                .thenReturn(false);

        TypingSession session = new TypingSession();
        session.setLocale("km");
        session.setAccuracy(BigDecimal.valueOf(95.5)); // >= 90%
        session.setCpm(BigDecimal.valueOf(180));

        achievementService.evaluateAndAwardAchievements(userId, session, 1L);

        // Both achievements should be awarded
        verify(userAchievementRepository, times(2)).save(any(UserAchievement.class));
    }

    @Test
    @DisplayName("Does not duplicate already earned achievements")
    void skipsAlreadyEarnedAchievements() {
        UUID userId = UUID.randomUUID();

        Achievement firstTest = new Achievement();
        firstTest.setId(UUID.randomUUID());
        firstTest.setCode("FIRST_TEST");
        firstTest.setActive(true);

        when(achievementRepository.findByActiveTrueOrderByCodeAsc())
                .thenReturn(List.of(firstTest));

        // Already earned!
        when(userAchievementRepository.existsByIdUserIdAndIdAchievementId(userId, firstTest.getId()))
                .thenReturn(true);

        TypingSession session = new TypingSession();
        session.setLocale("en");

        achievementService.evaluateAndAwardAchievements(userId, session, 5L);

        verify(userAchievementRepository, never()).save(any(UserAchievement.class));
    }
}

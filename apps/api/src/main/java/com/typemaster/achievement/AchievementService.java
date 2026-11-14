package com.typemaster.achievement;

import com.typemaster.typing.TypingSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    public AchievementService(
            AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
    }

    @Transactional(readOnly = true)
    public List<AchievementResponse> getAchievementsForUser(UUID userId) {
        List<Achievement> activeAchievements = achievementRepository.findByActiveTrueOrderByCodeAsc();

        Map<UUID, Instant> userEarnedMap = Collections.emptyMap();
        if (userId != null) {
            userEarnedMap = userAchievementRepository.findByIdUserId(userId).stream()
                    .collect(Collectors.toMap(
                            ua -> ua.getId().getAchievementId(),
                            UserAchievement::getEarnedAt,
                            (a, b) -> a
                    ));
        }

        final Map<UUID, Instant> finalEarned = userEarnedMap;
        return activeAchievements.stream().map(a -> {
            boolean unlocked = finalEarned.containsKey(a.getId());
            Instant earnedAt = finalEarned.get(a.getId());
            return new AchievementResponse(
                    a.getId(),
                    a.getCode(),
                    a.getNameEn(),
                    a.getNameKm(),
                    a.getDescriptionEn(),
                    a.getDescriptionKm(),
                    a.getIconKey(),
                    unlocked,
                    earnedAt
            );
        }).toList();
    }

    public void evaluateAndAwardAchievements(UUID userId, TypingSession session, long totalCompletedTests) {
        if (userId == null) return;

        List<Achievement> allActive = achievementRepository.findByActiveTrueOrderByCodeAsc();

        for (Achievement achievement : allActive) {
            if (userAchievementRepository.existsByIdUserIdAndIdAchievementId(userId, achievement.getId())) {
                continue; // Already earned
            }

            boolean earned = checkCriteria(achievement.getCode(), session, totalCompletedTests);
            if (earned) {
                UserAchievementId id = new UserAchievementId(userId, achievement.getId());
                UserAchievement userAchievement = new UserAchievement(id, achievement);
                userAchievementRepository.save(userAchievement);
            }
        }
    }

    private boolean checkCriteria(String code, TypingSession s, long totalCompleted) {
        return switch (code) {
            case "FIRST_TEST" -> totalCompleted >= 1;
            case "SPEED_50_WPM" -> s.getWpm() != null && s.getWpm().compareTo(BigDecimal.valueOf(50)) >= 0;
            case "SPEED_100_WPM" -> s.getWpm() != null && s.getWpm().compareTo(BigDecimal.valueOf(100)) >= 0;
            case "KHMER_TYPIST" -> "km".equalsIgnoreCase(s.getLocale()) && s.getAccuracy().compareTo(BigDecimal.valueOf(90)) >= 0;
            case "KHMER_MASTER" -> "km".equalsIgnoreCase(s.getLocale()) && s.getCpm().compareTo(BigDecimal.valueOf(200)) >= 0;
            case "ACCURACY_98" -> s.getAccuracy().compareTo(BigDecimal.valueOf(98)) >= 0;
            case "PRACTICE_10" -> totalCompleted >= 10;
            default -> false;
        };
    }
}

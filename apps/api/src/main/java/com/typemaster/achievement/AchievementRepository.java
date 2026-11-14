package com.typemaster.achievement;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {
    List<Achievement> findByActiveTrueOrderByCodeAsc();
    Optional<Achievement> findByCode(String code);
}

package com.typemaster.content;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PassageRepository extends JpaRepository<Passage, UUID> {

    Optional<Passage> findByIdAndStatus(UUID id, String status);

    @Query(value = "SELECT * FROM passages WHERE locale = :locale AND status = 'PUBLISHED' ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Passage> findRandomPublishedByLocale(@Param("locale") String locale);

    @Query(value = "SELECT * FROM passages WHERE locale = :locale AND difficulty = :difficulty AND status = 'PUBLISHED' ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Passage> findRandomPublishedByLocaleAndDifficulty(@Param("locale") String locale, @Param("difficulty") String difficulty);

    Page<Passage> findByLocaleAndStatus(String locale, String status, Pageable pageable);

    Page<Passage> findByLocaleAndDifficultyAndStatus(String locale, String difficulty, String status, Pageable pageable);

    Page<Passage> findByStatus(String status, Pageable pageable);
}

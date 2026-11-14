package com.typemaster.typing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TypingSessionRepository extends JpaRepository<TypingSession, UUID> {

    Page<TypingSession> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<TypingSession> findByIdAndUserId(UUID id, UUID userId);
}

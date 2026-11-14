package com.typemaster.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserReportRepository extends JpaRepository<UserReport, UUID> {
    Page<UserReport> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<UserReport> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
}

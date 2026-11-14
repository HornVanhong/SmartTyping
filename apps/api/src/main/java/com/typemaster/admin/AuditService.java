package com.typemaster.admin;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(UUID actorUserId, String action, String targetType, UUID targetId, String metadata) {
        AuditLog log = new AuditLog(actorUserId, action, targetType, targetId, metadata);
        auditLogRepository.save(log);
    }
}

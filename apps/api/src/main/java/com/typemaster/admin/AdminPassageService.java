package com.typemaster.admin;

import com.typemaster.common.error.ResourceNotFoundException;
import com.typemaster.content.Passage;
import com.typemaster.content.PassageRepository;
import com.typemaster.content.PassageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class AdminPassageService {

    private final PassageRepository passageRepository;
    private final AuditService auditService;

    public AdminPassageService(PassageRepository passageRepository, AuditService auditService) {
        this.passageRepository = passageRepository;
        this.auditService = auditService;
    }

    public PassageResponse createPassage(CreatePassageAdminRequest req, UUID adminUserId) {
        Passage passage = new Passage(
                req.locale(),
                req.title(),
                req.content(),
                req.difficulty(),
                req.category(),
                req.contentMode(),
                req.sourceName(),
                req.licenseName(),
                req.status() != null ? req.status() : "DRAFT"
        );
        passage.setCreatedBy(adminUserId);

        Passage saved = passageRepository.save(passage);

        auditService.logAction(
                adminUserId,
                "PASSAGE_CREATED",
                "PASSAGE",
                saved.getId(),
                "{\"title\":\"" + saved.getTitle() + "\",\"locale\":\"" + saved.getLocale() + "\",\"status\":\"" + saved.getStatus() + "\"}"
        );

        return PassageResponse.fromEntity(saved);
    }

    public PassageResponse updatePassage(UUID id, UpdatePassageAdminRequest req, UUID adminUserId) {
        Passage passage = passageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Passage not found: " + id));

        if (req.title() != null) passage.setTitle(req.title());
        if (req.content() != null) passage.setContent(req.content());
        if (req.difficulty() != null) passage.setDifficulty(req.difficulty());
        if (req.category() != null) passage.setCategory(req.category());
        if (req.contentMode() != null) passage.setContentMode(req.contentMode());
        if (req.status() != null) passage.setStatus(req.status());
        passage.setUpdatedAt(Instant.now());

        Passage saved = passageRepository.save(passage);

        auditService.logAction(
                adminUserId,
                "PASSAGE_UPDATED",
                "PASSAGE",
                saved.getId(),
                "{\"status\":\"" + saved.getStatus() + "\",\"difficulty\":\"" + saved.getDifficulty() + "\"}"
        );

        return PassageResponse.fromEntity(saved);
    }

    public PassageResponse publishPassage(UUID id, UUID adminUserId) {
        Passage passage = passageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Passage not found: " + id));

        passage.setStatus("PUBLISHED");
        passage.setUpdatedAt(Instant.now());
        Passage saved = passageRepository.save(passage);

        auditService.logAction(adminUserId, "PASSAGE_PUBLISHED", "PASSAGE", saved.getId(), "{}");
        return PassageResponse.fromEntity(saved);
    }

    public PassageResponse archivePassage(UUID id, UUID adminUserId) {
        Passage passage = passageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Passage not found: " + id));

        passage.setStatus("ARCHIVED");
        passage.setUpdatedAt(Instant.now());
        Passage saved = passageRepository.save(passage);

        auditService.logAction(adminUserId, "PASSAGE_ARCHIVED", "PASSAGE", saved.getId(), "{}");
        return PassageResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<PassageResponse> listPassages(String status, String locale, Pageable pageable) {
        Page<Passage> page;
        if (status != null && !status.isBlank() && locale != null && !locale.isBlank()) {
            page = passageRepository.findByLocaleAndStatus(locale, status, pageable);
        } else if (status != null && !status.isBlank()) {
            page = passageRepository.findByStatus(status, pageable);
        } else if (locale != null && !locale.isBlank()) {
            page = passageRepository.findByLocale(locale, pageable);
        } else {
            page = passageRepository.findAll(pageable);
        }
        return page.map(PassageResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PassageResponse getPassage(UUID id) {
        Passage passage = passageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Passage not found: " + id));
        return PassageResponse.fromEntity(passage);
    }
}

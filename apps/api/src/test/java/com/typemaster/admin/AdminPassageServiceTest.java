package com.typemaster.admin;

import com.typemaster.content.Passage;
import com.typemaster.content.PassageRepository;
import com.typemaster.content.PassageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminPassageServiceTest {

    @Mock
    private PassageRepository passageRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminPassageService adminPassageService;

    private UUID adminUserId;

    @BeforeEach
    void setUp() {
        adminUserId = UUID.randomUUID();
    }

    @Test
    void createPassage_createsDraftAndLogsAudit() {
        CreatePassageAdminRequest req = new CreatePassageAdminRequest(
                "km",
                "Khmer History",
                "ប្រវត្តិសាស្ត្រខ្មែរមានភាពសម្បូរបែបនិងចំណាស់។",
                "INTERMEDIATE",
                "HISTORY",
                "PARAGRAPH",
                "Ministry of Culture",
                "CC-BY-4.0",
                "DRAFT"
        );

        when(passageRepository.save(any(Passage.class))).thenAnswer(inv -> {
            Passage p = inv.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        PassageResponse response = adminPassageService.createPassage(req, adminUserId);

        assertThat(response).isNotNull();
        assertThat(response.title()).isEqualTo("Khmer History");
        assertThat(response.locale()).isEqualTo("km");
        assertThat(response.status()).isEqualTo("DRAFT");

        verify(auditService, times(1)).logAction(
                eq(adminUserId),
                eq("PASSAGE_CREATED"),
                eq("PASSAGE"),
                any(UUID.class),
                anyString()
        );
    }

    @Test
    void publishPassage_updatesStatusAndLogsAudit() {
        UUID passageId = UUID.randomUUID();
        Passage existing = new Passage("en", "Title", "Content here with enough characters.", "BEGINNER", "GENERAL", "PARAGRAPH", null, null, "DRAFT");
        existing.setId(passageId);

        when(passageRepository.findById(passageId)).thenReturn(Optional.of(existing));
        when(passageRepository.save(any(Passage.class))).thenAnswer(inv -> inv.getArgument(0));

        PassageResponse response = adminPassageService.publishPassage(passageId, adminUserId);

        assertThat(response.status()).isEqualTo("PUBLISHED");
        verify(auditService, times(1)).logAction(
                eq(adminUserId),
                eq("PASSAGE_PUBLISHED"),
                eq("PASSAGE"),
                eq(passageId),
                eq("{}")
        );
    }

    @Test
    void archivePassage_updatesStatusAndLogsAudit() {
        UUID passageId = UUID.randomUUID();
        Passage existing = new Passage("en", "Title", "Content here with enough characters.", "BEGINNER", "GENERAL", "PARAGRAPH", null, null, "PUBLISHED");
        existing.setId(passageId);

        when(passageRepository.findById(passageId)).thenReturn(Optional.of(existing));
        when(passageRepository.save(any(Passage.class))).thenAnswer(inv -> inv.getArgument(0));

        PassageResponse response = adminPassageService.archivePassage(passageId, adminUserId);

        assertThat(response.status()).isEqualTo("ARCHIVED");
        verify(auditService, times(1)).logAction(
                eq(adminUserId),
                eq("PASSAGE_ARCHIVED"),
                eq("PASSAGE"),
                eq(passageId),
                eq("{}")
        );
    }
}

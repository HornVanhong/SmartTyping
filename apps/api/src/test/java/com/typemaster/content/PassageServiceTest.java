package com.typemaster.content;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PassageServiceTest {

    @Mock
    private PassageRepository passageRepository;

    @InjectMocks
    private PassageService passageService;

    @Test
    @DisplayName("Returns published Khmer passage when requested")
    void returnsKhmerPassage() {
        Passage kmPassage = new Passage(
                "km",
                "ការរៀនវាយអក្សរ",
                "ការរៀនវាយអត្ថបទជួយឱ្យយើងធ្វើការងារបានលឿននិងមានប្រសិទ្ធភាពខ្ពស់។",
                "BEGINNER",
                "TUTORIAL",
                "SENTENCES",
                "TypeMaster",
                "CC-BY-4.0",
                "PUBLISHED"
        );
        kmPassage.setId(UUID.randomUUID());

        when(passageRepository.findRandomPublishedByLocaleAndDifficulty("km", "BEGINNER"))
                .thenReturn(Optional.of(kmPassage));

        PassageResponse response = passageService.getRandomPassage("km", "BEGINNER");

        assertThat(response.locale()).isEqualTo("km");
        assertThat(response.title()).isEqualTo("ការរៀនវាយអក្សរ");
        assertThat(response.content()).contains("ការរៀនវាយអត្ថបទ");
    }

    @Test
    @DisplayName("Falls back to English default if locale not specified")
    void fallsBackToEnglish() {
        Passage enPassage = new Passage(
                "en",
                "Quick Fox",
                "The quick brown fox jumps over the lazy dog.",
                "BEGINNER",
                "GENERAL",
                "SENTENCES",
                "Pangram",
                "Public Domain",
                "PUBLISHED"
        );
        enPassage.setId(UUID.randomUUID());

        when(passageRepository.findRandomPublishedByLocale("en"))
                .thenReturn(Optional.of(enPassage));

        PassageResponse response = passageService.getRandomPassage(null, null);

        assertThat(response.locale()).isEqualTo("en");
        assertThat(response.content()).contains("quick brown fox");
    }
}

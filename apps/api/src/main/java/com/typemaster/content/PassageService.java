package com.typemaster.content;

import com.typemaster.common.error.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PassageService {

    private final PassageRepository passageRepository;

    public PassageService(PassageRepository passageRepository) {
        this.passageRepository = passageRepository;
    }

    public PassageResponse getRandomPassage(String locale, String difficulty) {
        String safeLocale = (locale != null && locale.equalsIgnoreCase("km")) ? "km" : "en";
        Optional<Passage> passageOpt;

        if (difficulty != null && !difficulty.isBlank()) {
            passageOpt = passageRepository.findRandomPublishedByLocaleAndDifficulty(safeLocale, difficulty.toUpperCase());
            if (passageOpt.isEmpty()) {
                passageOpt = passageRepository.findRandomPublishedByLocale(safeLocale);
            }
        } else {
            passageOpt = passageRepository.findRandomPublishedByLocale(safeLocale);
        }

        Passage passage = passageOpt.orElseThrow(() ->
                new ResourceNotFoundException("No published passages found for locale: " + safeLocale));
        return PassageResponse.fromEntity(passage);
    }

    public PassageResponse getPassageById(UUID id) {
        Passage passage = passageRepository.findByIdAndStatus(id, "PUBLISHED")
                .orElseThrow(() -> new ResourceNotFoundException("Passage not found with ID: " + id));
        return PassageResponse.fromEntity(passage);
    }

    public Page<PassageResponse> listPublishedPassages(String locale, String difficulty, int page, int size) {
        int boundedSize = Math.min(Math.max(size, 1), 100);
        int boundedPage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize);

        Page<Passage> passages;
        if (locale != null && !locale.isBlank() && difficulty != null && !difficulty.isBlank()) {
            passages = passageRepository.findByLocaleAndDifficultyAndStatus(locale, difficulty.toUpperCase(), "PUBLISHED", pageable);
        } else if (locale != null && !locale.isBlank()) {
            passages = passageRepository.findByLocaleAndStatus(locale, "PUBLISHED", pageable);
        } else {
            passages = passageRepository.findByStatus("PUBLISHED", pageable);
        }

        return passages.map(PassageResponse::fromEntity);
    }
}

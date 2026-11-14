package com.typemaster.content;

import java.time.Instant;
import java.util.UUID;

public record PassageResponse(
        UUID id,
        String locale,
        String title,
        String content,
        String difficulty,
        String category,
        String contentMode,
        String sourceName,
        String licenseName,
        Instant createdAt
) {
    public static PassageResponse fromEntity(Passage passage) {
        return new PassageResponse(
                passage.getId(),
                passage.getLocale(),
                passage.getTitle(),
                passage.getContent(),
                passage.getDifficulty(),
                passage.getCategory(),
                passage.getContentMode(),
                passage.getSourceName(),
                passage.getLicenseName(),
                passage.getCreatedAt()
        );
    }
}

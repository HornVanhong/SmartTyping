package com.typemaster.content;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "passages")
public class Passage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 5)
    private String locale;

    @Column(length = 160)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(name = "content_mode", nullable = false, length = 20)
    private String contentMode;

    @Column(name = "source_name", length = 160)
    private String sourceName;

    @Column(name = "license_name", length = 120)
    private String licenseName;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Passage() {}

    public Passage(String locale, String title, String content, String difficulty,
                   String category, String contentMode, String sourceName,
                   String licenseName, String status) {
        this.locale = locale;
        this.title = title;
        this.content = content;
        this.difficulty = difficulty;
        this.category = category != null ? category : "GENERAL";
        this.contentMode = contentMode != null ? contentMode : "PARAGRAPH";
        this.sourceName = sourceName;
        this.licenseName = licenseName;
        this.status = status != null ? status : "PUBLISHED";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getContentMode() { return contentMode; }
    public void setContentMode(String contentMode) { this.contentMode = contentMode; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public String getLicenseName() { return licenseName; }
    public void setLicenseName(String licenseName) { this.licenseName = licenseName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

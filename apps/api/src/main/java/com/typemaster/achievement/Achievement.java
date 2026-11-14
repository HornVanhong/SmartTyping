package com.typemaster.achievement;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 60)
    private String code;

    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;

    @Column(name = "name_km", nullable = false, length = 100)
    private String nameKm;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "description_km", columnDefinition = "TEXT")
    private String descriptionKm;

    @Column(name = "icon_key", length = 60)
    private String iconKey;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String criteria = "{}";

    @Column(nullable = false)
    private boolean active = true;

    public Achievement() {}

    public Achievement(String code, String nameEn, String nameKm, String descriptionEn, String descriptionKm, String iconKey, String criteria, boolean active) {
        this.code = code;
        this.nameEn = nameEn;
        this.nameKm = nameKm;
        this.descriptionEn = descriptionEn;
        this.descriptionKm = descriptionKm;
        this.iconKey = iconKey;
        this.criteria = criteria != null ? criteria : "{}";
        this.active = active;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getNameEn() { return nameEn; }
    public void setNameEn(String nameEn) { this.nameEn = nameEn; }

    public String getNameKm() { return nameKm; }
    public void setNameKm(String nameKm) { this.nameKm = nameKm; }

    public String getDescriptionEn() { return descriptionEn; }
    public void setDescriptionEn(String descriptionEn) { this.descriptionEn = descriptionEn; }

    public String getDescriptionKm() { return descriptionKm; }
    public void setDescriptionKm(String descriptionKm) { this.descriptionKm = descriptionKm; }

    public String getIconKey() { return iconKey; }
    public void setIconKey(String iconKey) { this.iconKey = iconKey; }

    public String getCriteria() { return criteria; }
    public void setCriteria(String criteria) { this.criteria = criteria; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

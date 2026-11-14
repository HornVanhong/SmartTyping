package com.typemaster.migration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class FlywayScriptTest {

    @Test
    @DisplayName("V1 schema migration script contains all core tables")
    void v1SchemaContainsCoreTables() throws Exception {
        ClassPathResource resource = new ClassPathResource("db/migration/V1__init_schema.sql");
        assertThat(resource.exists()).isTrue();

        try (InputStream is = resource.getInputStream()) {
            String sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            assertThat(sql).contains("CREATE TABLE users");
            assertThat(sql).contains("CREATE TABLE refresh_tokens");
            assertThat(sql).contains("CREATE TABLE passages");
            assertThat(sql).contains("CREATE TABLE typing_sessions");
            assertThat(sql).contains("CREATE TABLE achievements");
            assertThat(sql).contains("CREATE TABLE user_achievements");
            assertThat(sql).contains("CREATE TABLE multiplayer_rooms");
            assertThat(sql).contains("CREATE TABLE race_participants");
            assertThat(sql).contains("CREATE TABLE user_reports");
            assertThat(sql).contains("CREATE TABLE audit_logs");
        }
    }

    @Test
    @DisplayName("V2 seed script contains bilingual passages for English and Khmer")
    void v2SeedContainsBilingualPassages() throws Exception {
        ClassPathResource resource = new ClassPathResource("db/migration/V2__seed_starter_passages.sql");
        assertThat(resource.exists()).isTrue();

        try (InputStream is = resource.getInputStream()) {
            String sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            assertThat(sql).contains("'en'");
            assertThat(sql).contains("'km'");
            assertThat(sql).contains("BEGINNER");
            assertThat(sql).contains("INTERMEDIATE");
            assertThat(sql).contains("ADVANCED");
            assertThat(sql).contains("PUBLISHED");
            // Check authentic Khmer text is present
            assertThat(sql).contains("ការរៀនវាយអត្ថបទ");
            assertThat(sql).contains("ប្រាសាទអង្គរវត្ត");
        }
    }
}

package com.typemaster.content;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/passages")
public class PassageController {

    private final PassageService passageService;

    public PassageController(PassageService passageService) {
        this.passageService = passageService;
    }

    @GetMapping("/random")
    public ResponseEntity<PassageResponse> getRandomPassage(
            @RequestParam(required = false, defaultValue = "en") String locale,
            @RequestParam(required = false) String difficulty) {
        return ResponseEntity.ok(passageService.getRandomPassage(locale, difficulty));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PassageResponse> getPassageById(@PathVariable UUID id) {
        return ResponseEntity.ok(passageService.getPassageById(id));
    }

    @GetMapping
    public ResponseEntity<Page<PassageResponse>> listPassages(
            @RequestParam(required = false) String locale,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(passageService.listPublishedPassages(locale, difficulty, page, size));
    }
}

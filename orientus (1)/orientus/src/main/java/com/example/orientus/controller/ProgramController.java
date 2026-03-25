package com.example.orientus.controller;

import com.example.orientus.entity.Program;
import com.example.orientus.enums.ProgramCategory;
import com.example.orientus.enums.ProgramDegree;
import com.example.orientus.service.ProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller pour gérer les programmes universitaires
 * Amélioré avec : /all, /filters, filtres combinés, stats optimisé
 */
@RestController
@RequestMapping("/api/programs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ProgramController {

    private final ProgramService programService;

    // ==========================================
    // AMÉLIORATION 1 : Endpoint /all — Tout en 1 requête (CRITIQUE)
    // Retourne TOUS les programmes + metadata des filtres en un seul appel
    // Le frontend l'utilise quand il y a < 200 programmes
    // ==========================================

    @GetMapping("/all")
    public ResponseEntity<?> getAllProgramsWithMetadata() {
        try {
            log.info("📦 GET /api/programs/all — chargement complet");
            Map<String, Object> response = programService.getAllProgramsWithMetadata();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur /all : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // AMÉLIORATION 2 : Endpoint /filters — Metadata seule (CRITIQUE)
    // Retourne pays, catégories, degrés, langues sans charger les programmes
    // ==========================================

    @GetMapping("/filters")
    public ResponseEntity<?> getFilterMetadata() {
        try {
            log.info("🔍 GET /api/programs/filters — metadata seule");
            Map<String, Object> filters = programService.getFilterMetadata();
            return ResponseEntity.ok(filters);
        } catch (Exception e) {
            log.error("❌ Erreur /filters : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // AMÉLIORATION 3 : GET /api/programs — Filtres combinés
    // Remplace les else if par une seule requête multi-filtres
    // Ajout du paramètre 'language' en bonus
    // Rétrocompatible : même params qu'avant + language en plus
    // ==========================================

    @GetMapping
    public ResponseEntity<?> getAllPrograms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) ProgramCategory category,
            @RequestParam(required = false) ProgramDegree degree,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String language
    ) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("ASC")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);

            // AMÉLIORATION : une seule requête combinant TOUS les filtres
            Page<Program> programsPage = programService.findWithFilters(
                    search, country, category, degree, language, pageable
            );

            Map<String, Object> response = new HashMap<>();
            response.put("programs", programsPage.getContent());
            response.put("currentPage", programsPage.getNumber());
            response.put("totalItems", programsPage.getTotalElements());
            response.put("totalPages", programsPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erreur GET /api/programs : {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * GET /api/programs/{id}
     * Récupérer un programme par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProgramById(@PathVariable Long id) {
        try {
            Program program = programService.getProgramById(id);
            return ResponseEntity.ok(program);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * POST /api/programs
     * Créer un nouveau programme (ADMIN/OWNER uniquement)
     */
    @PostMapping
    public ResponseEntity<?> createProgram(@RequestBody Program program) {
        try {
            Program createdProgram = programService.createProgram(program);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Program created successfully");
            response.put("program", createdProgram);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * PUT /api/programs/{id}
     * Mettre à jour un programme (ADMIN/OWNER uniquement)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgram(
            @PathVariable Long id,
            @RequestBody Program programDetails
    ) {
        try {
            Program updatedProgram = programService.updateProgram(id, programDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Program updated successfully");
            response.put("program", updatedProgram);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * DELETE /api/programs/{id}
     * Supprimer un programme (ADMIN/OWNER uniquement)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable Long id) {
        try {
            programService.deleteProgram(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Program deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * GET /api/programs/featured
     * Récupérer les programmes mis en avant
     */
    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedPrograms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Program> programsPage = programService.getFeaturedPrograms(pageable);

            return ResponseEntity.ok(programsPage.getContent());
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ==========================================
    // AMÉLIORATION 5 : Stats optimisé
    // Remplace Pageable.unpaged() par programRepository.count()
    // ==========================================

    @GetMapping("/stats")
    public ResponseEntity<?> getProgramStats() {
        try {
            Map<String, Object> stats = programService.getOptimizedStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
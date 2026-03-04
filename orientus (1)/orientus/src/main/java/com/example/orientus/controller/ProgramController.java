package com.example.orientus.controller;

import com.example.orientus.entity.Program;
import com.example.orientus.enums.ProgramCategory;
import com.example.orientus.enums.ProgramDegree;
import com.example.orientus.service.ProgramService;
import lombok.RequiredArgsConstructor;
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
 */
@RestController
@RequestMapping("/api/programs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    /**
     * GET /api/programs
     * Récupérer tous les programmes avec pagination et filtres
     */
    @GetMapping
    public ResponseEntity<?> getAllPrograms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) ProgramCategory category,
            @RequestParam(required = false) ProgramDegree degree,
            @RequestParam(required = false) String search
    ) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("ASC")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Program> programsPage;

            // Recherche
            if (search != null && !search.trim().isEmpty()) {
                programsPage = programService.searchPrograms(search, pageable);
            }
            // Filtres
            else if (country != null && !country.trim().isEmpty()) {
                programsPage = programService.getProgramsByCountry(country, pageable);
            } else if (category != null) {
                programsPage = programService.getProgramsByCategory(category, pageable);
            } else if (degree != null) {
                programsPage = programService.getProgramsByDegree(degree, pageable);
            }
            // Tous les programmes
            else {
                programsPage = programService.getAllPrograms(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("programs", programsPage.getContent());
            response.put("currentPage", programsPage.getNumber());
            response.put("totalItems", programsPage.getTotalElements());
            response.put("totalPages", programsPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
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

    /**
     * GET /api/programs/stats
     * Statistiques sur les programmes
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getProgramStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPrograms", programService.getAllPrograms(Pageable.unpaged()).getTotalElements());

            // Ajouter d'autres stats si nécessaire

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
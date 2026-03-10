package com.example.orientus.controller;

import com.example.orientus.entity.Application;
import com.example.orientus.enums.ApplicationStatus;
import com.example.orientus.service.ApplicationService;
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

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * POST /api/applications
     * Créer une nouvelle candidature (STUDENT)
     */
    @PostMapping
    public ResponseEntity<?> createApplication(
            @RequestBody Application application,
            @RequestParam Long studentId,
            @RequestParam Long programId
    ) {
        try {
            Application createdApplication = applicationService.createApplication(application, studentId, programId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Application submitted successfully");
            response.put("application", createdApplication);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * GET /api/applications
     * Récupérer toutes les candidatures avec pagination et filtres (ADMIN)
     */
    @GetMapping
    public ResponseEntity<?> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "applicationDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) ApplicationStatus status
    ) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("ASC")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Application> applicationsPage;

            // Filtrer par statut si fourni
            if (status != null) {
                applicationsPage = applicationService.getApplicationsByStatus(status, pageable);
            } else {
                applicationsPage = applicationService.getAllApplications(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("applications", applicationsPage.getContent());
            response.put("currentPage", applicationsPage.getNumber());
            response.put("totalItems", applicationsPage.getTotalElements());
            response.put("totalPages", applicationsPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * GET /api/applications/student/{studentId}
     * Récupérer les candidatures d'un étudiant (STUDENT)
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getApplicationsByStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("applicationDate").descending());
            Page<Application> applicationsPage = applicationService.getApplicationsByStudent(studentId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("applications", applicationsPage.getContent());
            response.put("currentPage", applicationsPage.getNumber());
            response.put("totalItems", applicationsPage.getTotalElements());
            response.put("totalPages", applicationsPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * GET /api/applications/{id}
     * Récupérer une candidature par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        try {
            Application application = applicationService.getApplicationById(id);
            return ResponseEntity.ok(application);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * PUT /api/applications/{id}/status
     * Changer le statut d'une candidature (ADMIN)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status
    ) {
        try {
            Application updatedApplication = applicationService.updateApplicationStatus(id, status);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Application status updated successfully");
            response.put("application", updatedApplication);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * DELETE /api/applications/{id}
     * Supprimer une candidature (ADMIN)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        try {
            applicationService.deleteApplication(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Application deleted successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * GET /api/applications/stats
     * Statistiques des candidatures (ADMIN)
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getApplicationStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", applicationService.getAllApplications(Pageable.unpaged()).getTotalElements());
            stats.put("nonRepondu", applicationService.countApplicationsByStatus(ApplicationStatus.NON_REPONDU));
            stats.put("enCours", applicationService.countApplicationsByStatus(ApplicationStatus.EN_COURS));
            stats.put("contacte", applicationService.countApplicationsByStatus(ApplicationStatus.CONTACTE));

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
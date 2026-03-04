package com.example.orientus.service;

import com.example.orientus.entity.Program;
import com.example.orientus.enums.ProgramCategory;
import com.example.orientus.enums.ProgramDegree;
import com.example.orientus.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgramService {

    private final ProgramRepository programRepository;

    /**
     * Récupérer tous les programmes avec pagination
     */
    public Page<Program> getAllPrograms(Pageable pageable) {
        return programRepository.findAll(pageable);
    }

    /**
     * Récupérer un programme par ID
     */
    public Program getProgramById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
    }

    /**
     * Créer un nouveau programme
     */
    public Program createProgram(Program program) {
        // Vérifier que le titre n'est pas vide
        if (program.getTitle() == null || program.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Program title is required");
        }
        return programRepository.save(program);
    }

    /**
     * Mettre à jour un programme
     */
    public Program updateProgram(Long id, Program programDetails) {
        Program program = getProgramById(id);

        program.setTitle(programDetails.getTitle());
        program.setUniversity(programDetails.getUniversity());
        program.setCountry(programDetails.getCountry());
        program.setCity(programDetails.getCity());
        program.setDegree(programDetails.getDegree());
        program.setCategory(programDetails.getCategory());
        program.setDuration(programDetails.getDuration());
        program.setLanguage(programDetails.getLanguage());
        program.setTuition(programDetails.getTuition());
        program.setDescription(programDetails.getDescription());
        program.setImage(programDetails.getImage());
        program.setUniversityLogo(programDetails.getUniversityLogo());
        program.setFeatured(programDetails.getFeatured());

        return programRepository.save(program);
    }

    /**
     * Supprimer un programme
     */
    public void deleteProgram(Long id) {
        Program program = getProgramById(id);
        programRepository.delete(program);
    }

    /**
     * Rechercher des programmes
     */
    public Page<Program> searchPrograms(String query, Pageable pageable) {
        return programRepository.searchPrograms(query, pageable);
    }

    /**
     * Filtrer par pays
     */
    public Page<Program> getProgramsByCountry(String country, Pageable pageable) {
        return programRepository.findByCountry(country, pageable);
    }

    /**
     * Filtrer par catégorie
     */
    public Page<Program> getProgramsByCategory(ProgramCategory category, Pageable pageable) {
        return programRepository.findByCategory(category, pageable);
    }

    /**
     * Filtrer par type de diplôme
     */
    public Page<Program> getProgramsByDegree(ProgramDegree degree, Pageable pageable) {
        return programRepository.findByDegree(degree, pageable);
    }

    /**
     * Programmes mis en avant (featured)
     */
    public Page<Program> getFeaturedPrograms(Pageable pageable) {
        return programRepository.findByFeaturedTrue(pageable);
    }

    /**
     * Compter les programmes par pays
     */
    public Long countProgramsByCountry(String country) {
        return programRepository.countByCountry(country);
    }

    /**
     * Compter les programmes par catégorie
     */
    public Long countProgramsByCategory(ProgramCategory category) {
        return programRepository.countByCategory(category);
    }

    /**
     * Compter les programmes par diplôme
     */
    public Long countProgramsByDegree(ProgramDegree degree) {
        return programRepository.countByDegree(degree);
    }
}
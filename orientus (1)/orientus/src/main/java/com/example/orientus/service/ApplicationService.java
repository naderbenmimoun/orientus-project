package com.example.orientus.service;

import com.example.orientus.entity.Application;
import com.example.orientus.entity.Program;
import com.example.orientus.entity.User;
import com.example.orientus.enums.ApplicationStatus;
import com.example.orientus.repository.ApplicationRepository;
import com.example.orientus.repository.ProgramRepository;
import com.example.orientus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ProgramRepository programRepository;

    /**
     * Créer une nouvelle candidature
     */
    public Application createApplication(Application application, Long studentId, Long programId) {
        // Vérifier que l'étudiant existe
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Vérifier que le programme existe
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + programId));

        // Vérifier si l'étudiant a déjà postulé pour ce programme
        if (applicationRepository.existsByStudentIdAndProgramId(studentId, programId)) {
            throw new RuntimeException("You have already applied to this program");
        }

        // Associer l'étudiant et le programme
        application.setStudent(student);
        application.setProgram(program);

        // Remplir les informations de l'étudiant depuis son profile
        application.setStudentFirstName(student.getFirstName());
        application.setStudentLastName(student.getLastName());
        application.setStudentEmail(student.getEmail());
        application.setStudentPhone(student.getPhone());
        application.setStudentNationality(student.getNationality());

        // Sauvegarder
        return applicationRepository.save(application);
    }

    /**
     * Récupérer toutes les candidatures (ADMIN)
     */
    public Page<Application> getAllApplications(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }

    /**
     * Récupérer les candidatures d'un étudiant
     */
    public Page<Application> getApplicationsByStudent(Long studentId, Pageable pageable) {
        return applicationRepository.findByStudentId(studentId, pageable);
    }

    /**
     * Récupérer une candidature par ID
     */
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
    }

    /**
     * Filtrer les candidatures par statut (ADMIN)
     */
    public Page<Application> getApplicationsByStatus(ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable);
    }

    /**
     * Récupérer les candidatures pour un programme spécifique
     */
    public Page<Application> getApplicationsByProgram(Long programId, Pageable pageable) {
        return applicationRepository.findByProgramId(programId, pageable);
    }

    /**
     * Changer le statut d'une candidature (ADMIN)
     */
    public Application updateApplicationStatus(Long id, ApplicationStatus newStatus) {
        Application application = getApplicationById(id);
        application.setStatus(newStatus);
        return applicationRepository.save(application);
    }

    /**
     * Supprimer une candidature (ADMIN)
     */
    public void deleteApplication(Long id) {
        Application application = getApplicationById(id);
        applicationRepository.delete(application);
    }

    /**
     * Compter les candidatures par statut (pour statistiques admin)
     */
    public Long countApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.countByStatus(status);
    }

    /**
     * Compter toutes les candidatures d'un étudiant
     */
    public Long countApplicationsByStudent(Long studentId) {
        return applicationRepository.countByStudentId(studentId);
    }
}
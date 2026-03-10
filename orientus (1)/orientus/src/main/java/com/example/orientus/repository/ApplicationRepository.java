package com.example.orientus.repository;

import com.example.orientus.entity.Application;
import com.example.orientus.entity.User;
import com.example.orientus.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Trouver toutes les candidatures d'un étudiant
    Page<Application> findByStudent(User student, Pageable pageable);

    // Trouver les candidatures d'un étudiant par ID
    Page<Application> findByStudentId(Long studentId, Pageable pageable);

    // Trouver les candidatures par statut
    Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);

    // Trouver les candidatures par programme
    Page<Application> findByProgramId(Long programId, Pageable pageable);

    // Compter les candidatures par statut
    Long countByStatus(ApplicationStatus status);

    // Compter toutes les candidatures d'un étudiant
    Long countByStudentId(Long studentId);

    // Vérifier si un étudiant a déjà postulé pour un programme
    boolean existsByStudentIdAndProgramId(Long studentId, Long programId);

    // Trouver les candidatures récentes (optionnel)
    List<Application> findTop10ByOrderByApplicationDateDesc();
}
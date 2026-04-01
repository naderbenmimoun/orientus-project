package com.example.orientus.repository;

import com.example.orientus.entity.Conversation;
import com.example.orientus.enums.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Conversations d'un étudiant
    List<Conversation> findByStudentIdOrderByLastMessageAtDesc(Long studentId);

    // Conversations assignées à un admin
    List<Conversation> findByAssignedAdminIdOrderByLastMessageAtDesc(Long adminId);

    // Conversations non assignées (file d'attente)
    List<Conversation> findByStatusAndAssignedAdminIsNullOrderByCreatedAtAsc(ConversationStatus status);

    // Toutes les conversations (pour OWNER/super admin)
    List<Conversation> findAllByOrderByLastMessageAtDesc();

    // Compter les PENDING d'un étudiant (limite à 1)
    Long countByStudentIdAndStatus(Long studentId, ConversationStatus status);

    // Compter les ACTIVE d'un étudiant (limite à 3)
    Long countByStudentIdAndStatusIn(Long studentId, List<ConversationStatus> statuses);
}


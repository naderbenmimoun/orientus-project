package com.example.orientus.repository;

import com.example.orientus.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Messages d'une conversation triés par date
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    // Compter les messages non lus pour un user dans une conversation
    Long countByConversationIdAndIsReadFalseAndSenderIdNot(Long conversationId, Long userId);

    // Compter TOUS les messages non lus pour un user (toutes conversations)
    @Query("SELECT COUNT(m) FROM Message m JOIN m.conversation c WHERE c.student.id = :userId AND m.isRead = false AND m.sender.id != :userId")
    Long countUnreadForStudent(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m JOIN m.conversation c WHERE c.assignedAdmin.id = :adminId AND m.isRead = false AND m.sender.id != :adminId")
    Long countUnreadForAdmin(@Param("adminId") Long adminId);

    // Marquer comme lus
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    void markAsRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}


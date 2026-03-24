package com.example.orientus.repository;

import com.example.orientus.entity.ChatFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Amélioration 7 : Repository pour les feedbacks du chatbot
 */
@Repository
public interface ChatFeedbackRepository extends JpaRepository<ChatFeedback, Long> {

    /** Trouver les feedbacks par messageId */
    List<ChatFeedback> findByMessageId(String messageId);

    /** Calculer la note moyenne de tous les feedbacks */
    @Query("SELECT AVG(f.rating) FROM ChatFeedback f")
    Double findAverageRating();

    /** Compter les feedbacks par note */
    Long countByRating(int rating);
}


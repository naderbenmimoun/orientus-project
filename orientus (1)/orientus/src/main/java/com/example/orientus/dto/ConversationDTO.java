package com.example.orientus.dto;

import com.example.orientus.entity.Conversation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private String subject;
    private String status;
    private String studentName;
    private Long studentId;
    private String adminName;
    private Long adminId;
    private Integer initialMessageCount;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private Long unreadCount;

    public static ConversationDTO fromEntity(Conversation c, Long unreadCount) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(c.getId());
        dto.setSubject(c.getSubject());
        dto.setStatus(c.getStatus().name());
        dto.setStudentName(c.getStudent().getFirstName() + " " + c.getStudent().getLastName());
        dto.setStudentId(c.getStudent().getId());
        if (c.getAssignedAdmin() != null) {
            dto.setAdminName(c.getAssignedAdmin().getFirstName() + " " + c.getAssignedAdmin().getLastName());
            dto.setAdminId(c.getAssignedAdmin().getId());
        }
        dto.setInitialMessageCount(c.getInitialMessageCount());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setLastMessageAt(c.getLastMessageAt());
        dto.setUnreadCount(unreadCount != null ? unreadCount : 0L);
        return dto;
    }
}


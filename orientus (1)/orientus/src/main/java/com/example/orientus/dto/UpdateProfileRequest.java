package com.example.orientus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la mise à jour du profil utilisateur
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Email(message = "Please provide a valid email address")
    private String email;

    @Size(min = 1, message = "First name is required")
    private String firstName;

    @Size(min = 1, message = "Last name is required")
    private String lastName;

    private String phone;          // Optionnel

    private String nationality;    // Optionnel

    // Le mot de passe est optionnel (seulement si l'utilisateur veut le changer)
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
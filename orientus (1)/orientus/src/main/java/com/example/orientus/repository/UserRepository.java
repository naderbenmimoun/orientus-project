package com.example.orientus.repository;

import com.example.orientus.entity.User;
import com.example.orientus.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByNationality(String nationality);
    boolean existsByEmail(String email);
}
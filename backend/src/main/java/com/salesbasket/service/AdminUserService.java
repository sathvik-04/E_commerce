package com.salesbasket.service;

import com.salesbasket.dto.*;
import com.salesbasket.entity.User;
import com.salesbasket.exception.ResourceNotFoundException;
import com.salesbasket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MessageResponse updateUsername(Long userId, UpdateUsernameRequest request) {
        User user = findUserById(userId);

        // Check if username is already taken by another user
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' is already taken");
        }

        user.setUsername(request.getUsername());
        userRepository.save(user);
        log.info("Admin updated username for user ID: {}", userId);

        return new MessageResponse("Username updated successfully");
    }

    @Transactional
    public MessageResponse updateEmail(Long userId, UpdateEmailRequest request) {
        User user = findUserById(userId);

        // Check if email is already taken by another user
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' is already in use");
        }

        user.setEmail(request.getEmail());
        userRepository.save(user);
        log.info("Admin updated email for user ID: {}", userId);

        return new MessageResponse("Email updated successfully");
    }

    @Transactional
    public MessageResponse changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUserById(userId);

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Admin changed password for user ID: {}", userId);

        return new MessageResponse("Password changed successfully");
    }

    @Transactional
    public MessageResponse updateRole(Long userId, UpdateRoleRequest request) {
        User user = findUserById(userId);

        // Map USER -> CUSTOMER for backward compatibility
        String roleStr = request.getRole().equalsIgnoreCase("USER") ? "CUSTOMER" : request.getRole();
        User.Role role = User.Role.valueOf(roleStr);

        user.setRole(role);
        userRepository.save(user);
        log.info("Admin updated role to {} for user ID: {}", role, userId);

        return new MessageResponse("User role updated to " + role.name() + " successfully");
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}

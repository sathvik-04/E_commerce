package com.salesbasket.service;

import com.salesbasket.dto.*;
import com.salesbasket.entity.BlacklistedToken;
import com.salesbasket.entity.User;
import com.salesbasket.repository.BlacklistedTokenRepository;
import com.salesbasket.repository.UserRepository;
import com.salesbasket.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }

        User.Role role = (request.getRole() != null && !request.getRole().isBlank())
                ? User.Role.valueOf(request.getRole())
                : User.Role.CUSTOMER;

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        return new MessageResponse("User registered successfully");
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public MessageResponse logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            throw new IllegalArgumentException("Token is invalid or expired");
        }

        if (blacklistedTokenRepository.existsByToken(token)) {
            return new MessageResponse("Already logged out");
        }

        Date expDate = jwtUtil.extractExpiration(token);
        LocalDateTime expiresAt = expDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        blacklistedTokenRepository.save(
                BlacklistedToken.builder()
                        .token(token)
                        .expiresAt(expiresAt)
                        .build()
        );

        return new MessageResponse("Logged out successfully");
    }
}

package com.quickstay.service;

import com.quickstay.dto.AuthResponse;
import com.quickstay.dto.LoginRequest;
import com.quickstay.dto.SignupRequest;
import com.quickstay.dto.UserResponse;
import com.quickstay.exception.ApiException;
import com.quickstay.model.User;
import com.quickstay.repository.UserRepository;
import com.quickstay.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(SignupRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(u -> {
            throw new ApiException(HttpStatus.CONFLICT, "An account with that email already exists.");
        });

        User newUser = new User(UUID.randomUUID(), request.email().trim(), request.name().trim(),
                passwordEncoder.encode(request.password()), Instant.now());
        userRepository.save(newUser);
        logger.info("User registered: {}", newUser.email());
        return new AuthResponse("Account created successfully.", jwtService.generateToken(newUser), mapUser(newUser));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));

        if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }
        logger.info("User logged in: {}", user.email());
        return new AuthResponse("Login successful.", jwtService.generateToken(user), mapUser(user));
    }

    public UserResponse me(String token) {
        String normalizedToken = token.replace("Bearer ", "").trim();
        var claims = jwtService.parseClaims(normalizedToken);
        return new UserResponse(UUID.fromString(claims.get("id", String.class)),
                claims.get("email", String.class),
                claims.get("name", String.class));
    }

    private UserResponse mapUser(User user) {
        return new UserResponse(user.id(), user.email(), user.name());
    }
}

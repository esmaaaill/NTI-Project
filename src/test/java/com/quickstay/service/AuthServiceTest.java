package com.quickstay.service;

import com.quickstay.dto.LoginRequest;
import com.quickstay.dto.SignupRequest;
import com.quickstay.exception.ApiException;
import com.quickstay.model.User;
import com.quickstay.repository.UserRepository;
import com.quickstay.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthServiceTest {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        jwtService = Mockito.mock(JwtService.class);
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void signupRejectsDuplicateEmail() {
        when(userRepository.findByEmail("test@mail.com")).thenReturn(Optional.of(new User(UUID.randomUUID(), "test@mail.com", "n", "h", Instant.now())));
        assertThrows(ApiException.class, () -> authService.signup(new SignupRequest("User", "test@mail.com", "password123")));
    }

    @Test
    void loginSuccessReturnsToken() {
        User user = new User(UUID.randomUUID(), "test@mail.com", "User", "hash", Instant.now());
        when(userRepository.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hash")).thenReturn(true);
        when(jwtService.generateToken(any())).thenReturn("token");
        var response = authService.login(new LoginRequest("test@mail.com", "password123"));
        assertEquals("token", response.token());
    }
}

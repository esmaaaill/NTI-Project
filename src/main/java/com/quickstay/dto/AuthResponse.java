package com.quickstay.dto;

public record AuthResponse(String message, String token, UserResponse user) {
}

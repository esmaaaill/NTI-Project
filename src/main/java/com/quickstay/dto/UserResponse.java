package com.quickstay.dto;

import java.util.UUID;

public record UserResponse(UUID id, String email, String name) {
}

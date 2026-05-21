package com.quickstay.model;

import java.time.Instant;
import java.util.UUID;

public record User(UUID id, String email, String name, String passwordHash, Instant createdAt) {
}

package com.quickstay.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank @Size(min = 2, max = 60) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 120) String password
) {
}

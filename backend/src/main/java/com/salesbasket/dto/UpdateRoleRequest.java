package com.salesbasket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateRoleRequest {

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "CUSTOMER|ADMIN|USER", message = "Role must be CUSTOMER, ADMIN, or USER")
    private String role;
}

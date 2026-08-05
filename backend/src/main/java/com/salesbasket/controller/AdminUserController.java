package com.salesbasket.controller;

import com.salesbasket.dto.*;
import com.salesbasket.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PutMapping("/{id}/username")
    public ResponseEntity<MessageResponse> updateUsername(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUsernameRequest request) {
        MessageResponse response = adminUserService.updateUsername(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/email")
    public ResponseEntity<MessageResponse> updateEmail(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEmailRequest request) {
        MessageResponse response = adminUserService.updateEmail(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<MessageResponse> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {
        MessageResponse response = adminUserService.changePassword(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<MessageResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        MessageResponse response = adminUserService.updateRole(id, request);
        return ResponseEntity.ok(response);
    }
}

package com.prestalink.api.user;

import com.prestalink.api.photo.PhotoUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PhotoUploadService photoUploadService;

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }


    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable UserRole role) {
        return userService.getUsersByRole(role);
    }

    @GetMapping("/providers/available")
    public List<User> getAvailableProviders() {
        return userService.getAvailableProviders();
    }

    @PutMapping("/{userId}/status")
    public User updateUserStatus(
            @PathVariable Long userId,
            @RequestParam UserStatus status
    ) {
        return userService.updateUserStatus(userId, status);
    }
    @GetMapping("/providers/feed")
    public List<UserResponse> getProvidersFeed() {
        return userService.getProvidersFeed();
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser
    ) {
        return userService.updateUser(id, updatedUser);
    }

    @PostMapping("/me/photo")
    public UserResponse uploadMyPhoto(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @RequestParam("image") MultipartFile image
    ) {
        return photoUploadService.uploadProfilePhoto(currentUserId, image);
    }
}


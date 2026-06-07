package com.prestalink.api.auth;

import com.prestalink.api.user.UserRole;
import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String country;
    private String streetAddress;
    private String postalCode;
}

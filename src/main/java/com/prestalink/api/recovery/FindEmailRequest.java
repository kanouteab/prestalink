package com.prestalink.api.recovery;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindEmailRequest {
    private String phone;
    private String fullName;
    private String username;
}


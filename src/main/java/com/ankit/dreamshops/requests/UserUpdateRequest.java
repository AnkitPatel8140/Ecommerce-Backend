package com.ankit.dreamshops.requests;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String profileImage;
    private AddressUpdateRequest address;
}

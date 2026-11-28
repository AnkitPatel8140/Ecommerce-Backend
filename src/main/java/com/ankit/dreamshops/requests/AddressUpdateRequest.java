package com.ankit.dreamshops.requests;

import lombok.Data;

@Data
public class AddressUpdateRequest {
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}

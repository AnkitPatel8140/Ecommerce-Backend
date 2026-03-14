package com.ankit.dreamshops.service.user;

import com.ankit.dreamshops.DTO.UserDto;
import com.ankit.dreamshops.model.User;
import com.ankit.dreamshops.requests.CreateUserRequest;
import com.ankit.dreamshops.requests.UserUpdateRequest;

public interface IUserService {
    User getUserById(Long userId);
    User createUser(CreateUserRequest request);
    User updateUser(UserUpdateRequest request, Long userId);
    void deleteUser(Long userId);

    UserDto convertUserToDto(User user);

    User getAuthenticatedUser();
}

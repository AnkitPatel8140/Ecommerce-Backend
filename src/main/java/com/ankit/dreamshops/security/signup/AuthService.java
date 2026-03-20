package com.ankit.dreamshops.security.signup;

import com.ankit.dreamshops.model.Role;
import com.ankit.dreamshops.model.User;
import com.ankit.dreamshops.repository.RoleRepository;
import com.ankit.dreamshops.repository.UserRepository;
import com.ankit.dreamshops.requests.SignupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public String registerUser(SignupRequest request) {

        // 1. Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists with this email");
        }

        // 2. Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());

        // 🔐 Encode password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // 3. Assign ROLE_USER
        Role role = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.getRoles().add(role);

        // 4. Save user
        userRepository.save(user);

        return "User registered successfully!";
    }
}
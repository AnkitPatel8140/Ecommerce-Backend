package com.ankit.dreamshops.data;

import com.ankit.dreamshops.model.Role;
import com.ankit.dreamshops.model.User;
import com.ankit.dreamshops.repository.RoleRepository;
import com.ankit.dreamshops.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Transactional
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationListener<ApplicationReadyEvent> {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        Set<String> defaultRoles = Set.of("ROLE_ADMIN", "ROLE_USER");
        createDefaultRoleIfNotExits(defaultRoles);
        createDefaultUserIfNotExist();
        createDefaultAdminIfNotExist();
    }


    private void createDefaultUserIfNotExist() {
        Role userRole = (Role) roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role not found"));;
        for(int i = 1; i <= 5; i++) {
            String defaultEmail = "user" + i + "@email.com";

            if(userRepository.existsByEmail(defaultEmail)) {
                continue;
            }

            User user = new User();
            user.setLastName("User" + i);
            user.setFirstName("The User");
            user.setEmail(defaultEmail);
            user.setPassword(passwordEncoder.encode("123456"));
            user.setRoles(Set.of(userRole));
            userRepository.save(user);
        }
    }


    private void createDefaultAdminIfNotExist() {
        Role adminRole = (Role) roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("Role not found"));;
        for(int i = 1; i <= 2; i++) {
            String defaultEmail = "admin" + i + "@email.com";

            if(userRepository.existsByEmail(defaultEmail)) {
                continue;
            }

            User user = new User();
            user.setLastName("Admin" + i);
            user.setFirstName("Admin");
            user.setEmail(defaultEmail);
            user.setRoles(Set.of(adminRole));
            user.setPassword(passwordEncoder.encode("123456"));
            userRepository.save(user);
        }
    }



    private void createDefaultRoleIfNotExits(Set<String> roles) {
        roles.stream()
                .filter(role -> roleRepository.findByName(role).isEmpty())
                .map(Role::new).forEach(roleRepository::save);

    }
}

package com.nextrisk.auth.repository;

import com.nextrisk.auth.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRoles_Name(String roleName);

    long countByEnabled(boolean enabled);

    /** [roleName, number of users holding it]. Roles nobody holds are absent. */
    @Query("select r.name, count(u) from User u join u.roles r group by r.name")
    List<Object[]> countUsersPerRole();

    /** Same as {@link #countUsersPerRole()} but only enabled accounts. */
    @Query("select r.name, count(u) from User u join u.roles r where u.enabled = true group by r.name")
    List<Object[]> countEnabledUsersPerRole();

    long countByEnabledTrueAndLastLoginAtIsNull();

    List<User> findTop5ByEnabledTrueAndLastLoginAtIsNullOrderByCreatedAtDesc();

    long countByEnabledTrueAndPasswordChangedAtIsNull();

    List<User> findTop5ByEnabledTrueAndPasswordChangedAtIsNullOrderByCreatedAtAsc();

    List<User> findTop5ByOrderByCreatedAtDesc();
}

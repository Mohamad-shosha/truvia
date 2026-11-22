package com.nextrisk.auth.repository;

import com.nextrisk.auth.entity.LoginEvent;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LoginEventRepository extends JpaRepository<LoginEvent, Long> {

    /** Most recent sign-ins of one user, newest first. */
    @Query("select e.createdAt from LoginEvent e where e.user.id = :userId order by e.createdAt desc")
    List<Instant> findRecentLoginTimes(@Param("userId") Long userId, Pageable page);

    /** Sign-in timestamps since a point in time (bucketed per day by the caller). */
    @Query("select e.createdAt from LoginEvent e where e.createdAt >= :from")
    List<Instant> findLoginTimesSince(@Param("from") Instant from);
}

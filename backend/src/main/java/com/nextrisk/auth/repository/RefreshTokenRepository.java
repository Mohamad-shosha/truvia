package com.nextrisk.auth.repository;

import com.nextrisk.auth.entity.RefreshToken;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** Row lock serializes concurrent use of the same token so rotation is race-free. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshToken t set t.revokedAt = :now where t.familyId = :familyId and t.revokedAt is null")
    int revokeFamily(@Param("familyId") String familyId, @Param("now") Instant now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshToken t set t.revokedAt = :now where t.user.id = :userId and t.revokedAt is null")
    int revokeAllForUser(@Param("userId") Long userId, @Param("now") Instant now);

    /** Revokes every session of a user except the given rotation family (e.g. the caller's own). */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshToken t set t.revokedAt = :now where t.user.id = :userId and t.revokedAt is null "
            + "and t.familyId <> :keepFamilyId")
    int revokeAllForUserExceptFamily(@Param("userId") Long userId, @Param("keepFamilyId") String keepFamilyId,
            @Param("now") Instant now);

    /** Non-locking lookup of the family a raw token (by digest) belongs to. */
    @Query("select t.familyId from RefreshToken t where t.tokenHash = :tokenHash")
    Optional<String> findFamilyIdByTokenHash(@Param("tokenHash") String tokenHash);

    /** The live head of each active session: not revoked and not expired. One row per active family. */
    @Query("select t from RefreshToken t where t.user.id = :userId and t.revokedAt is null and t.expiresAt > :now "
            + "order by t.createdAt desc")
    List<RefreshToken> findActiveForUser(@Param("userId") Long userId, @Param("now") Instant now);

    /** [familyId, first createdAt] for the given families: when each session started. */
    @Query("select t.familyId, min(t.createdAt) from RefreshToken t where t.familyId in :familyIds group by t.familyId")
    List<Object[]> findFamilyStartTimes(@Param("familyIds") Collection<String> familyIds);

    boolean existsByFamilyIdAndUser_Id(String familyId, Long userId);

    @Query("select count(t) from RefreshToken t where t.revokedAt is null and t.expiresAt > :now")
    long countActive(@Param("now") Instant now);

    @Query("select count(distinct t.user.id) from RefreshToken t where t.revokedAt is null and t.expiresAt > :now")
    long countUsersWithActiveSession(@Param("now") Instant now);

    @Query("select count(t) from RefreshToken t where t.user.id = :userId and t.revokedAt is null and t.expiresAt > :now")
    long countActiveForUser(@Param("userId") Long userId, @Param("now") Instant now);

    @Modifying
    @Query("delete from RefreshToken t where t.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") Instant cutoff);
}

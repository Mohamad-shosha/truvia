package com.nextrisk.risk.repository;

import com.nextrisk.risk.entity.RiskSnapshot;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskSnapshotRepository extends JpaRepository<RiskSnapshot, LocalDate> {

    List<RiskSnapshot> findByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);

    /** Latest snapshot on or before a day: the baseline for "vs N days ago" deltas. */
    Optional<RiskSnapshot> findFirstByDateLessThanEqualOrderByDateDesc(LocalDate day);
}

package com.nextrisk.risk.repository;

import com.nextrisk.risk.RiskEnums.Status;
import com.nextrisk.risk.entity.Risk;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskRepository extends JpaRepository<Risk, Long> {

    List<Risk> findAllByOrderByIdAsc();

    List<Risk> findByStatusNot(Status status);

    boolean existsBySampleTrue();
}

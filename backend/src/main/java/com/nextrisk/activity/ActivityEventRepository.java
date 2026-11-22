package com.nextrisk.activity;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityEventRepository extends JpaRepository<ActivityEvent, Long> {

    List<ActivityEvent> findAllByOrderByCreatedAtDescIdDesc(Pageable page);
}

package com.nextrisk.activity;

import com.nextrisk.auth.entity.User;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Records and lists activity-feed entries. Recording joins the caller's transaction. */
@Service
public class ActivityService {

    public static final String RISK_CREATED = "RISK_CREATED";
    public static final String RISK_UPDATED = "RISK_UPDATED";
    public static final String RISK_STATUS = "RISK_STATUS";
    public static final String RISK_DELETED = "RISK_DELETED";
    public static final String USER_CREATED = "USER_CREATED";
    public static final String USER_STATUS = "USER_STATUS";
    public static final String USER_PASSWORD_RESET = "USER_PASSWORD_RESET";

    private final ActivityEventRepository repository;

    public ActivityService(ActivityEventRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void record(User actor, String type, String title, String detail) {
        repository.save(new ActivityEvent(actor == null ? null : actor.getId(),
                actor == null ? null : actor.getFullName(), type, title, detail, false, Instant.now()));
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> recent(int limit) {
        return repository.findAllByOrderByCreatedAtDescIdDesc(PageRequest.of(0, Math.max(1, Math.min(limit, 50))))
                .stream().map(ActivityResponse::from).toList();
    }

    public record ActivityResponse(Long id, String type, String title, String detail, String actorName,
            boolean sample, Instant createdAt) {

        static ActivityResponse from(ActivityEvent e) {
            return new ActivityResponse(e.getId(), e.getType(), e.getTitle(), e.getDetail(), e.getActorName(),
                    e.isSample(), e.getCreatedAt());
        }
    }
}

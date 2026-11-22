package com.nextrisk.activity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** One entry of the activity feed. The actor's name is copied so the entry survives user deletion. */
@Entity
@Table(name = "activity_events")
public class ActivityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_name", length = 120)
    private String actorName;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 400)
    private String detail;

    @Column(nullable = false)
    private boolean sample;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ActivityEvent() {
    }

    public ActivityEvent(Long actorId, String actorName, String type, String title, String detail, boolean sample,
            Instant createdAt) {
        this.actorId = actorId;
        this.actorName = actorName;
        this.type = type;
        this.title = title;
        this.detail = detail;
        this.sample = sample;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getActorId() { return actorId; }
    public String getActorName() { return actorName; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getDetail() { return detail; }
    public boolean isSample() { return sample; }
    public Instant getCreatedAt() { return createdAt; }
}

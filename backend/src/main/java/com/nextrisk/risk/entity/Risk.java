package com.nextrisk.risk.entity;

import com.nextrisk.auth.entity.User;
import com.nextrisk.risk.RiskEnums.Level;
import com.nextrisk.risk.RiskEnums.Status;
import com.nextrisk.risk.RiskEnums.Treatment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "risks")
public class Risk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20, unique = true)
    private String code;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(name = "business_service", nullable = false, length = 120)
    private String businessService;

    @Column(nullable = false, length = 120)
    private String owner;

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Column(nullable = false)
    private int likelihood;

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Column(nullable = false)
    private int impact;

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Column(name = "residual_likelihood", nullable = false)
    private int residualLikelihood;

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Column(name = "residual_impact", nullable = false)
    private int residualImpact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Treatment treatment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(nullable = false)
    private boolean sample;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    protected Risk() {
    }

    public Risk(Instant createdAt) {
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public int inherentScore() {
        return likelihood * impact;
    }

    public int residualScore() {
        return residualLikelihood * residualImpact;
    }

    public Level inherentLevel() {
        return Level.of(inherentScore());
    }

    public Level residualLevel() {
        return Level.of(residualScore());
    }

    public boolean isActive() {
        return status != Status.CLOSED;
    }

    /** Sets the status and keeps closedAt consistent with it. */
    public void changeStatus(Status newStatus, Instant now) {
        if (newStatus == Status.CLOSED && status != Status.CLOSED) {
            closedAt = now;
        } else if (newStatus != Status.CLOSED) {
            closedAt = null;
        }
        status = newStatus;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getBusinessService() { return businessService; }
    public void setBusinessService(String businessService) { this.businessService = businessService; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public int getLikelihood() { return likelihood; }
    public void setLikelihood(int likelihood) { this.likelihood = likelihood; }
    public int getImpact() { return impact; }
    public void setImpact(int impact) { this.impact = impact; }
    public int getResidualLikelihood() { return residualLikelihood; }
    public void setResidualLikelihood(int v) { this.residualLikelihood = v; }
    public int getResidualImpact() { return residualImpact; }
    public void setResidualImpact(int v) { this.residualImpact = v; }
    public Treatment getTreatment() { return treatment; }
    public void setTreatment(Treatment treatment) { this.treatment = treatment; }
    public Status getStatus() { return status; }
    public boolean isSample() { return sample; }
    public void setSample(boolean sample) { this.sample = sample; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }

    @Override
    public String toString() {
        return "Risk[id=" + id + "]";
    }
}

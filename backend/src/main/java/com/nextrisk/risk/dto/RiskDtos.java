package com.nextrisk.risk.dto;

import com.nextrisk.risk.RiskEnums.Level;
import com.nextrisk.risk.RiskEnums.Status;
import com.nextrisk.risk.RiskEnums.Treatment;
import com.nextrisk.risk.entity.Risk;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public final class RiskDtos {

    private RiskDtos() {
    }

    @Schema(description = "Create or update a risk. Scores are 1 (lowest) to 5 (highest).")
    public record RiskRequest(
            @NotBlank(message = "Title is required") @Size(max = 200, message = "Title is at most 200 characters")
            String title,
            @Size(max = 2000, message = "Description is at most 2000 characters") String description,
            @NotBlank(message = "Category is required") @Size(max = 60) String category,
            @NotBlank(message = "Business service is required") @Size(max = 120) String businessService,
            @NotBlank(message = "Owner is required") @Size(max = 120) String owner,
            @NotNull @Min(1) @Max(5) Integer likelihood,
            @NotNull @Min(1) @Max(5) Integer impact,
            @NotNull @Min(1) @Max(5) Integer residualLikelihood,
            @NotNull @Min(1) @Max(5) Integer residualImpact,
            @NotNull(message = "Treatment is required") Treatment treatment,
            @NotNull(message = "Status is required") Status status) {
    }

    public record RiskResponse(
            Long id, String code, String title, String description, String category, String businessService,
            String owner, int likelihood, int impact, int inherentScore, Level inherentLevel,
            int residualLikelihood, int residualImpact, int residualScore, Level residualLevel,
            Treatment treatment, Status status, boolean sample, String createdBy,
            Instant createdAt, Instant updatedAt, Instant closedAt) {

        public static RiskResponse from(Risk r) {
            return new RiskResponse(r.getId(), r.getCode(), r.getTitle(), r.getDescription(), r.getCategory(),
                    r.getBusinessService(), r.getOwner(), r.getLikelihood(), r.getImpact(), r.inherentScore(),
                    r.inherentLevel(), r.getResidualLikelihood(), r.getResidualImpact(), r.residualScore(),
                    r.residualLevel(), r.getTreatment(), r.getStatus(), r.isSample(),
                    r.getCreatedBy() == null ? null : r.getCreatedBy().getFullName(),
                    r.getCreatedAt(), r.getUpdatedAt(), r.getClosedAt());
        }
    }

    public record TrendPoint(LocalDate date, BigDecimal riskScore, int activeRisks) {
    }

    @Schema(description = "Risk posture for the dashboard. *Previous* values are from the snapshot `days` ago "
            + "(null when no history exists yet).")
    public record RiskOverview(
            int days,
            @Schema(description = "True while demo/sample risks are present") boolean sampleData,
            int activeRisks, Integer activeRisksPrevious,
            @Schema(description = "Active risks whose residual level is HIGH or CRITICAL") int highRisks,
            Integer highRisksPrevious,
            @Schema(description = "Active risks whose residual level is CRITICAL") int criticalRisks,
            @Schema(description = "Average residual score of active risks, normalised to 0-100") BigDecimal riskScore,
            BigDecimal riskScorePrevious,
            List<TrendPoint> trend,
            @Schema(description = "heatmap[likelihood-1][impact-1] = number of active risks (residual position)")
            int[][] heatmap,
            Map<Status, Integer> byStatus,
            @Schema(description = "Active risks per inherent level") Map<Level, Integer> byInherentLevel,
            @Schema(description = "Five highest active risks by residual, then inherent score") List<RiskResponse> topRisks) {
    }
}

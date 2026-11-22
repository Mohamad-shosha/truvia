package com.nextrisk.risk.service;

import com.nextrisk.activity.ActivityService;
import com.nextrisk.auth.entity.User;
import com.nextrisk.auth.repository.UserRepository;
import com.nextrisk.auth.service.AuthService;
import com.nextrisk.common.ApiException;
import com.nextrisk.risk.RiskEnums.Level;
import com.nextrisk.risk.RiskEnums.Status;
import com.nextrisk.risk.dto.RiskDtos.RiskOverview;
import com.nextrisk.risk.dto.RiskDtos.RiskRequest;
import com.nextrisk.risk.dto.RiskDtos.RiskResponse;
import com.nextrisk.risk.dto.RiskDtos.TrendPoint;
import com.nextrisk.risk.entity.Risk;
import com.nextrisk.risk.entity.RiskSnapshot;
import com.nextrisk.risk.repository.RiskRepository;
import com.nextrisk.risk.repository.RiskSnapshotRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RiskService {

    /** Allowed look-back windows for the dashboard. */
    public static final List<Integer> PERIODS = List.of(7, 30, 90);

    private static final Comparator<Risk> BY_SEVERITY = Comparator
            .comparingInt(Risk::residualScore).reversed()
            .thenComparing(Comparator.comparingInt(Risk::inherentScore).reversed())
            .thenComparing(Risk::getId);

    private final RiskRepository risks;
    private final RiskSnapshotRepository snapshots;
    private final RiskSnapshotService snapshotService;
    private final UserRepository users;
    private final ActivityService activity;

    public RiskService(RiskRepository risks, RiskSnapshotRepository snapshots, RiskSnapshotService snapshotService,
            UserRepository users, ActivityService activity) {
        this.risks = risks;
        this.snapshots = snapshots;
        this.snapshotService = snapshotService;
        this.users = users;
        this.activity = activity;
    }

    @Transactional(readOnly = true)
    public List<RiskResponse> list() {
        return risks.findAllByOrderByIdAsc().stream().map(RiskResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RiskResponse get(long id) {
        return RiskResponse.from(find(id));
    }

    @Transactional
    public RiskResponse create(String actorSubject, RiskRequest req) {
        validate(req);
        User actor = actor(actorSubject);
        Instant now = Instant.now();
        Risk risk = new Risk(now);
        apply(risk, req, now);
        risk.setCreatedBy(actor);
        risks.saveAndFlush(risk);
        risk.setCode(String.format("RSK-%03d", risk.getId()));
        activity.record(actor, ActivityService.RISK_CREATED, risk.getCode() + " created",
                risk.getTitle() + " · " + risk.residualLevel() + " residual risk, owner " + risk.getOwner());
        snapshotService.recordToday();
        return RiskResponse.from(risk);
    }

    @Transactional
    public RiskResponse update(String actorSubject, long id, RiskRequest req) {
        validate(req);
        User actor = actor(actorSubject);
        Risk risk = find(id);
        Status before = risk.getStatus();
        Instant now = Instant.now();
        apply(risk, req, now);
        risk.setUpdatedAt(now);
        if (before != risk.getStatus()) {
            activity.record(actor, ActivityService.RISK_STATUS, risk.getCode() + " moved to " + label(risk.getStatus()),
                    risk.getTitle());
        } else {
            activity.record(actor, ActivityService.RISK_UPDATED, risk.getCode() + " updated",
                    risk.getTitle() + " · residual " + risk.residualScore() + " (" + risk.residualLevel() + ")");
        }
        snapshotService.recordToday();
        return RiskResponse.from(risk);
    }

    @Transactional
    public void delete(String actorSubject, long id) {
        User actor = actor(actorSubject);
        Risk risk = find(id);
        risks.delete(risk);
        activity.record(actor, ActivityService.RISK_DELETED, risk.getCode() + " deleted", risk.getTitle());
        risks.flush();
        snapshotService.recordToday();
    }

    @Transactional(readOnly = true)
    public RiskOverview overview(int days) {
        if (!PERIODS.contains(days)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "days must be one of " + PERIODS);
        }
        List<Risk> all = risks.findAll();
        List<Risk> active = all.stream().filter(Risk::isActive).toList();
        RiskPosture now = RiskPosture.of(active);

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        RiskSnapshot previous = snapshots.findFirstByDateLessThanEqualOrderByDateDesc(today.minusDays(days))
                .orElse(null);
        List<TrendPoint> trend = snapshots.findByDateBetweenOrderByDateAsc(today.minusDays(days), today.minusDays(1))
                .stream().map(s -> new TrendPoint(s.getDate(), s.getRiskScore(), s.getActiveRisks()))
                .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));
        trend.add(new TrendPoint(today, now.riskScore(), now.activeRisks()));

        int[][] heatmap = new int[5][5];
        Map<Level, Integer> byInherent = new EnumMap<>(Level.class);
        for (Level l : Level.values()) {
            byInherent.put(l, 0);
        }
        for (Risk r : active) {
            heatmap[r.getResidualLikelihood() - 1][r.getResidualImpact() - 1]++;
            byInherent.merge(r.inherentLevel(), 1, Integer::sum);
        }
        Map<Status, Integer> byStatus = new EnumMap<>(Status.class);
        for (Status s : Status.values()) {
            byStatus.put(s, 0);
        }
        all.forEach(r -> byStatus.merge(r.getStatus(), 1, Integer::sum));

        List<RiskResponse> top = active.stream().sorted(BY_SEVERITY).limit(5).map(RiskResponse::from).toList();

        return new RiskOverview(days, risks.existsBySampleTrue(),
                now.activeRisks(), previous == null ? null : previous.getActiveRisks(),
                now.highRisks(), previous == null ? null : previous.getHighRisks(),
                now.criticalRisks(),
                now.riskScore(), previous == null ? null : previous.getRiskScore(),
                trend, heatmap, byStatus, byInherent, top);
    }

    /** CSV export of the whole register (RFC 4180 quoting). */
    @Transactional(readOnly = true)
    public String exportCsv() {
        StringBuilder out = new StringBuilder(
                "Code,Title,Category,Business service,Owner,Likelihood,Impact,Inherent score,Inherent level,"
                        + "Residual likelihood,Residual impact,Residual score,Residual level,Treatment,Status,Sample,"
                        + "Created at,Updated at\r\n");
        for (Risk r : risks.findAllByOrderByIdAsc()) {
            out.append(String.join(",", csv(r.getCode()), csv(r.getTitle()), csv(r.getCategory()),
                    csv(r.getBusinessService()), csv(r.getOwner()), String.valueOf(r.getLikelihood()),
                    String.valueOf(r.getImpact()), String.valueOf(r.inherentScore()), r.inherentLevel().name(),
                    String.valueOf(r.getResidualLikelihood()), String.valueOf(r.getResidualImpact()),
                    String.valueOf(r.residualScore()), r.residualLevel().name(), r.getTreatment().name(),
                    r.getStatus().name(), String.valueOf(r.isSample()), r.getCreatedAt().toString(),
                    r.getUpdatedAt().toString())).append("\r\n");
        }
        return out.toString();
    }

    private static String csv(String value) {
        if (value == null) {
            return "";
        }
        // Neutralise spreadsheet formula injection, then quote.
        String v = value;
        if (!v.isEmpty() && "=+-@\t\r".indexOf(v.charAt(0)) >= 0) {
            v = "'" + v;
        }
        return "\"" + v.replace("\"", "\"\"") + "\"";
    }

    private static void validate(RiskRequest req) {
        if (req.residualLikelihood() * req.residualImpact() > req.likelihood() * req.impact()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Residual risk cannot be higher than inherent risk");
        }
    }

    private static void apply(Risk risk, RiskRequest req, Instant now) {
        risk.setTitle(req.title().trim());
        risk.setDescription(req.description() == null || req.description().isBlank() ? null : req.description().trim());
        risk.setCategory(req.category().trim());
        risk.setBusinessService(req.businessService().trim());
        risk.setOwner(req.owner().trim());
        risk.setLikelihood(req.likelihood());
        risk.setImpact(req.impact());
        risk.setResidualLikelihood(req.residualLikelihood());
        risk.setResidualImpact(req.residualImpact());
        risk.setTreatment(req.treatment());
        risk.changeStatus(req.status(), now);
    }

    private Risk find(long id) {
        return risks.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Risk not found"));
    }

    private User actor(String subject) {
        return users.findById(AuthService.userIdFrom(subject))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication is required"));
    }

    private static String label(Status s) {
        return switch (s) {
            case OPEN -> "Open";
            case IN_PROGRESS -> "In progress";
            case CLOSED -> "Closed";
        };
    }
}

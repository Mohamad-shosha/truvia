package com.nextrisk;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.nextrisk.activity.ActivityEventRepository;
import com.nextrisk.auth.entity.Role;
import com.nextrisk.demo.DemoDataSeeder;
import com.nextrisk.risk.repository.RiskRepository;
import com.nextrisk.risk.repository.RiskSnapshotRepository;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.test.web.servlet.MvcResult;

class RiskIntegrationTest extends AbstractIntegrationTest {

    @Autowired RiskRepository riskRepository;
    @Autowired RiskSnapshotRepository snapshotRepository;
    @Autowired ActivityEventRepository activityRepository;

    private String tokenFor(String email, String role) throws Exception {
        createUser(email, role);
        return accessToken(login(email, PASSWORD, false));
    }

    private static Map<String, Object> risk(String title, int l, int i, int rl, int ri, String status) {
        Map<String, Object> body = new HashMap<>();
        body.put("title", title);
        body.put("description", "Test risk");
        body.put("category", "Cloud Security");
        body.put("businessService", "AWS Production Workloads");
        body.put("owner", "Cloud Security Architect");
        body.put("likelihood", l);
        body.put("impact", i);
        body.put("residualLikelihood", rl);
        body.put("residualImpact", ri);
        body.put("treatment", "MITIGATE");
        body.put("status", status);
        return body;
    }

    private JsonNode create(String token, Map<String, Object> body) throws Exception {
        MvcResult r = mvc.perform(post("/api/risks").header("Authorization", bearer(token))
                        .contentType("application/json").content(json.writeValueAsString(body)))
                .andExpect(status().isCreated()).andReturn();
        return json.readTree(r.getResponse().getContentAsString());
    }

    @Test
    void readAndWritePermissionsFollowRoles() throws Exception {
        String pentester = tokenFor("pen@example.com", Role.PENTESTER);
        String soc = tokenFor("soc@example.com", Role.SOC_ANALYST);
        String admin = tokenFor("admin@example.com", Role.ADMIN);
        String body = json.writeValueAsString(risk("X", 3, 3, 2, 2, "OPEN"));

        mvc.perform(get("/api/risks")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/risks").header("Authorization", bearer(pentester))).andExpect(status().isForbidden());
        mvc.perform(get("/api/risks/overview").header("Authorization", bearer(pentester))).andExpect(status().isForbidden());
        mvc.perform(get("/api/risks").header("Authorization", bearer(soc))).andExpect(status().isOk());
        mvc.perform(get("/api/risks").header("Authorization", bearer(admin))).andExpect(status().isOk());
        mvc.perform(post("/api/risks").header("Authorization", bearer(soc)).contentType("application/json").content(body))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/risks").header("Authorization", bearer(admin)).contentType("application/json").content(body))
                .andExpect(status().isForbidden());
        assertThat(riskRepository.count()).isZero();
    }

    @Test
    void grcCreatesRiskWithCodeScoresLevelsActivityAndSnapshot() throws Exception {
        String grc = tokenFor("grc@example.com", Role.GRC_ANALYST);

        JsonNode created = create(grc, risk("  Exposed admin panel ", 4, 5, 3, 4, "OPEN"));

        assertThat(created.get("code").asText()).matches("RSK-\\d{3,}");
        assertThat(created.get("title").asText()).isEqualTo("Exposed admin panel");
        assertThat(created.get("inherentScore").asInt()).isEqualTo(20);
        assertThat(created.get("inherentLevel").asText()).isEqualTo("CRITICAL");
        assertThat(created.get("residualScore").asInt()).isEqualTo(12);
        assertThat(created.get("residualLevel").asText()).isEqualTo("HIGH");
        assertThat(created.get("createdBy").asText()).isEqualTo("Test User");
        assertThat(created.get("sample").asBoolean()).isFalse();

        assertThat(activityRepository.findAll()).anyMatch(e -> e.getType().equals("RISK_CREATED"));
        var today = snapshotRepository.findById(LocalDate.now(ZoneOffset.UTC)).orElseThrow();
        assertThat(today.getActiveRisks()).isEqualTo(1);
        assertThat(today.getHighRisks()).isEqualTo(1);
        assertThat(today.getRiskScore()).isEqualByComparingTo("48.0");
    }

    @Test
    void validationRejectsBadInput() throws Exception {
        String ciso = tokenFor("ciso@example.com", Role.CISO);
        Map<String, Object> residualTooHigh = risk("R", 2, 2, 3, 3, "OPEN");
        Map<String, Object> outOfRange = risk("R", 6, 2, 1, 1, "OPEN");
        Map<String, Object> noTitle = risk(" ", 2, 2, 1, 1, "OPEN");
        Map<String, Object> badStatus = risk("R", 2, 2, 1, 1, "DONE");

        for (Map<String, Object> body : new Map[] {residualTooHigh, outOfRange, noTitle, badStatus}) {
            mvc.perform(post("/api/risks").header("Authorization", bearer(ciso))
                            .contentType("application/json").content(json.writeValueAsString(body)))
                    .andExpect(status().isBadRequest());
        }
        assertThat(riskRepository.count()).isZero();
    }

    @Test
    void updateTracksStatusChangesAndDeleteRemoves() throws Exception {
        String grc = tokenFor("grc@example.com", Role.GRC_ANALYST);
        long id = create(grc, risk("Phishing", 4, 3, 2, 3, "OPEN")).get("id").asLong();

        mvc.perform(put("/api/risks/" + id).header("Authorization", bearer(grc)).contentType("application/json")
                        .content(json.writeValueAsString(risk("Phishing", 4, 3, 2, 2, "CLOSED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.closedAt").isNotEmpty())
                .andExpect(jsonPath("$.residualScore").value(4));
        assertThat(activityRepository.findAll()).anyMatch(e -> e.getType().equals("RISK_STATUS")
                && e.getTitle().endsWith("moved to Closed"));

        mvc.perform(put("/api/risks/" + id).header("Authorization", bearer(grc)).contentType("application/json")
                        .content(json.writeValueAsString(risk("Phishing", 4, 3, 2, 2, "OPEN"))))
                .andExpect(jsonPath("$.closedAt").isEmpty());

        mvc.perform(delete("/api/risks/" + id).header("Authorization", bearer(grc))).andExpect(status().isNoContent());
        mvc.perform(get("/api/risks/" + id).header("Authorization", bearer(grc))).andExpect(status().isNotFound());
    }

    @Test
    void overviewAggregatesPostureHeatmapBreakdownsTopRisksAndDeltas() throws Exception {
        String grc = tokenFor("grc@example.com", Role.GRC_ANALYST);
        create(grc, risk("Critical one", 5, 5, 4, 4, "IN_PROGRESS"));   // residual 16 CRITICAL, inherent CRITICAL
        create(grc, risk("High one", 4, 4, 3, 4, "OPEN"));              // residual 12 HIGH, inherent CRITICAL
        create(grc, risk("Medium one", 3, 3, 2, 3, "OPEN"));            // residual 6 MEDIUM, inherent MEDIUM
        create(grc, risk("Closed one", 5, 4, 1, 1, "CLOSED"));          // not active
        jdbc.update("INSERT INTO risk_snapshots (snapshot_date, active_risks, high_risks, critical_risks, risk_score) "
                + "VALUES (?, 2, 1, 0, 40.0)", LocalDate.now(ZoneOffset.UTC).minusDays(30));

        mvc.perform(get("/api/risks/overview?days=30").header("Authorization", bearer(grc)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days").value(30))
                .andExpect(jsonPath("$.sampleData").value(false))
                .andExpect(jsonPath("$.activeRisks").value(3))
                .andExpect(jsonPath("$.activeRisksPrevious").value(2))
                .andExpect(jsonPath("$.highRisks").value(2))
                .andExpect(jsonPath("$.highRisksPrevious").value(1))
                .andExpect(jsonPath("$.criticalRisks").value(1))
                .andExpect(jsonPath("$.riskScore").value(45.3))
                .andExpect(jsonPath("$.riskScorePrevious").value(40.0))
                .andExpect(jsonPath("$.heatmap[3][3]").value(1))
                .andExpect(jsonPath("$.heatmap[2][3]").value(1))
                .andExpect(jsonPath("$.heatmap[1][2]").value(1))
                .andExpect(jsonPath("$.byStatus.OPEN").value(2))
                .andExpect(jsonPath("$.byStatus.IN_PROGRESS").value(1))
                .andExpect(jsonPath("$.byStatus.CLOSED").value(1))
                .andExpect(jsonPath("$.byInherentLevel.CRITICAL").value(2))
                .andExpect(jsonPath("$.byInherentLevel.MEDIUM").value(1))
                .andExpect(jsonPath("$.byInherentLevel.LOW").value(0))
                .andExpect(jsonPath("$.topRisks.length()").value(3))
                .andExpect(jsonPath("$.topRisks[0].title").value("Critical one"))
                .andExpect(jsonPath("$.topRisks[1].title").value("High one"))
                .andExpect(jsonPath("$.trend[0].riskScore").value(40.0))
                .andExpect(jsonPath("$.trend[-1:].date").value(org.hamcrest.Matchers.hasItem(
                        LocalDate.now(ZoneOffset.UTC).toString())));

        mvc.perform(get("/api/risks/overview?days=31").header("Authorization", bearer(grc)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void overviewWithoutHistoryHasNullPreviousValues() throws Exception {
        String soc = tokenFor("soc@example.com", Role.SOC_ANALYST);
        mvc.perform(get("/api/risks/overview?days=7").header("Authorization", bearer(soc)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeRisks").value(0))
                .andExpect(jsonPath("$.activeRisksPrevious").isEmpty())
                .andExpect(jsonPath("$.riskScore").value(0.0))
                .andExpect(jsonPath("$.topRisks.length()").value(0));
    }

    @Test
    void csvExportQuotesValuesAndNeutralisesFormulas() throws Exception {
        String grc = tokenFor("grc@example.com", Role.GRC_ANALYST);
        create(grc, risk("=HYPERLINK(\"http://evil\")", 3, 3, 2, 2, "OPEN"));

        MvcResult r = mvc.perform(get("/api/risks/export").header("Authorization", bearer(grc)))
                .andExpect(status().isOk()).andReturn();
        String csv = r.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        assertThat(r.getResponse().getHeader("Content-Disposition")).contains("attachment").contains(".csv");
        assertThat(csv).contains("Code,Title,Category").contains("\"'=HYPERLINK(\"\"http://evil\"\")\"");
    }

    @Test
    void activityFeedListsRiskAndAdminActionsNewestFirst() throws Exception {
        String admin = tokenFor("admin@example.com", Role.ADMIN);
        mvc.perform(post("/api/admin/users").header("Authorization", bearer(admin)).contentType("application/json")
                        .content(json.writeValueAsString(Map.of("fullName", "Gina Grc", "email", "gina@example.com",
                                "password", PASSWORD, "role", Role.GRC_ANALYST))))
                .andExpect(status().isCreated());
        String grc = accessToken(login("gina@example.com", PASSWORD, false));
        create(grc, risk("Data leak", 3, 4, 2, 3, "OPEN"));

        mvc.perform(get("/api/activity?limit=5").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("RISK_CREATED"))
                .andExpect(jsonPath("$[0].actorName").value("Gina Grc"))
                .andExpect(jsonPath("$[1].type").value("USER_CREATED"))
                .andExpect(jsonPath("$[1].title").value("Account created for Gina Grc"));
    }

    @Test
    void demoSeederFillsOnlyAnEmptyRegisterAndFlagsEverythingAsSample() throws Exception {
        DemoDataSeeder seeder = new DemoDataSeeder(riskRepository, snapshotRepository, activityRepository);
        seeder.run(new DefaultApplicationArguments());

        long seeded = riskRepository.count();
        assertThat(seeded).isEqualTo(24);
        assertThat(riskRepository.findAll()).allMatch(r -> r.isSample() && r.getCode() != null);
        assertThat(snapshotRepository.count()).isEqualTo(90);
        assertThat(activityRepository.findAll()).allMatch(e -> e.isSample());

        seeder.run(new DefaultApplicationArguments());
        assertThat(riskRepository.count()).isEqualTo(seeded);

        String ciso = tokenFor("ciso@example.com", Role.CISO);
        mvc.perform(get("/api/risks/overview?days=30").header("Authorization", bearer(ciso)))
                .andExpect(jsonPath("$.sampleData").value(true))
                .andExpect(jsonPath("$.activeRisksPrevious").isNotEmpty())
                .andExpect(jsonPath("$.trend.length()").value(31))
                .andExpect(jsonPath("$.topRisks[0].title").value("AI-Driven Attacks & Deepfake Fraud"));
    }

    @Test
    void risksModuleIsAvailableOnTheDashboardForRiskRoles() throws Exception {
        String soc = tokenFor("soc@example.com", Role.SOC_ANALYST);
        mvc.perform(get("/api/dashboard/me").header("Authorization", bearer(soc)))
                .andExpect(jsonPath("$.modules[0].key").value("risks"))
                .andExpect(jsonPath("$.modules[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$.modules[0].path").value("/risks"));
    }
}

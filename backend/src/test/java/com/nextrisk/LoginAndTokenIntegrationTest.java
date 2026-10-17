package com.nextrisk;

import com.nextrisk.config.SecurityProperties;
import com.nextrisk.auth.entity.User;
import jakarta.servlet.http.Cookie;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import javax.crypto.spec.SecretKeySpec;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class LoginAndTokenIntegrationTest extends AbstractIntegrationTest {

    @Autowired SecurityProperties props;

    private String forge(String secret, String issuer, String audience, Instant exp, String sub) {
        NimbusJwtEncoder encoder = new NimbusJwtEncoder(new ImmutableSecret<>(
                new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256")));
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(issuer).audience(List.of(audience)).subject(sub)
                .issuedAt(exp.minus(Duration.ofMinutes(15))).expiresAt(exp).claim("roles", List.of("ROLE_ADMIN")).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    @Test
    void loginReturnsAccessTokenAndHttpOnlyStrictRefreshCookieWithoutLeakingRefreshInBody() throws Exception {
        createUser("jane@example.com", GRC);
        MvcResult result = login(" Jane@Example.com ", PASSWORD, false);

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String body = result.getResponse().getContentAsString();
        assertThat(body).contains("\"accessToken\"").contains("\"tokenType\":\"Bearer\"").contains("\"expiresIn\":900")
                .doesNotContain("refresh").doesNotContain("$2").doesNotContain("passwordHash");

        String setCookie = result.getResponse().getHeader("Set-Cookie");
        assertThat(setCookie).contains("nr_refresh=").contains("HttpOnly").contains("SameSite=Strict")
                .contains("Path=/api/auth").doesNotContain("Max-Age"); // session cookie
        assertThat(result.getResponse().getHeader("Cache-Control")).contains("no-store");
    }

    @Test
    void rememberMeProducesPersistentCookie() throws Exception {
        createUser("jane@example.com", GRC);
        String setCookie = login("jane@example.com", PASSWORD, true).getResponse().getHeader("Set-Cookie");
        assertThat(setCookie).contains("Max-Age=2592000"); // 30 days
    }

    @Test
    void refreshTokenIsStoredOnlyAsSha256Hash() throws Exception {
        createUser("jane@example.com", GRC);
        MvcResult result = login("jane@example.com", PASSWORD, false);
        String raw = refreshCookie(result).getValue();
        List<String> hashes = jdbc.queryForList("SELECT token_hash FROM refresh_tokens", String.class);
        assertThat(hashes).hasSize(1);
        assertThat(hashes.get(0)).hasSize(64).isNotEqualTo(raw).doesNotContain(raw);
    }

    @Test
    void wrongPasswordAndUnknownEmailLookIdentical() throws Exception {
        createUser("jane@example.com", GRC);
        MvcResult wrong = login("jane@example.com", "Wrong-Password-9", false);
        MvcResult unknown = login("nobody@example.com", PASSWORD, false);
        assertThat(wrong.getResponse().getStatus()).isEqualTo(401);
        assertThat(unknown.getResponse().getStatus()).isEqualTo(401);
        assertThat(json.readTree(wrong.getResponse().getContentAsString()).get("message").asText())
                .isEqualTo(json.readTree(unknown.getResponse().getContentAsString()).get("message").asText())
                .isEqualTo("Invalid email or password");
        assertThat(wrong.getResponse().getHeader("Set-Cookie")).isNull();
    }

    @Test
    void disabledUserCannotLogIn() throws Exception {
        createUser("off@example.com", GRC, false);
        MvcResult result = login("off@example.com", PASSWORD, false);
        assertThat(result.getResponse().getStatus()).isEqualTo(401);
        assertThat(result.getResponse().getContentAsString()).contains("Invalid email or password");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM refresh_tokens", Integer.class)).isZero();
    }

    @Test
    void loginValidatesRequestBody() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json").content("{\"email\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isArray());
        mvc.perform(post("/api/auth/login").contentType("application/json").content("not json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void meReturnsApprovedFieldsForValidToken() throws Exception {
        User user = createUser("jane@example.com", GRC);
        String token = accessToken(login("jane@example.com", PASSWORD, false));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.email").value("jane@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_GRC_ANALYST"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void protectedEndpointsRejectMissingMalformedExpiredAndForgedTokens() throws Exception {
        User user = createUser("jane@example.com", GRC);
        String sub = String.valueOf(user.getId());
        String secret = props.jwt().secret();
        Instant future = Instant.now().plus(Duration.ofMinutes(10));

        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer garbage.token.value"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", "Basic abc")).andExpect(status().isUnauthorized());
        // expired
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer "
                + forge(secret, "nextrisk-api", "nextrisk-web", Instant.now().minus(Duration.ofMinutes(5)), sub)))
                .andExpect(status().isUnauthorized());
        // wrong signing key
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer "
                + forge("another-secret-another-secret-another-secret!", "nextrisk-api", "nextrisk-web", future, sub)))
                .andExpect(status().isUnauthorized());
        // wrong issuer / audience
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer "
                + forge(secret, "evil-issuer", "nextrisk-web", future, sub))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer "
                + forge(secret, "nextrisk-api", "other-audience", future, sub))).andExpect(status().isUnauthorized());
        // control: correctly forged-with-real-key token is accepted, proving the rejections above are meaningful
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer "
                + forge(secret, "nextrisk-api", "nextrisk-web", future, sub))).andExpect(status().isOk());
    }

    @Test
    void tokenOfDisabledUserIsRejectedByMe() throws Exception {
        User user = createUser("jane@example.com", GRC);
        String token = accessToken(login("jane@example.com", PASSWORD, false));
        user.setEnabled(false);
        users.saveAndFlush(user);
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token)).andExpect(status().isUnauthorized());
    }

    @Test
    void corsAllowsConfiguredOriginAndRejectsOthers() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/auth/login")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/auth/login")
                        .header("Origin", "http://evil.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cookieNameIsExposedOnlyThroughConfiguration() {
        Cookie c = new Cookie("nr_refresh", "x");
        assertThat(c.getName()).isEqualTo(props.refresh().cookieName());
    }
}

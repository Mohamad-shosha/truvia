package com.nextrisk;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RefreshAndLogoutIntegrationTest extends AbstractIntegrationTest {

    private MockHttpServletRequestBuilder refresh(Cookie cookie) {
        MockHttpServletRequestBuilder b = post("/api/auth/refresh").header("X-Requested-With", "XMLHttpRequest");
        return cookie == null ? b : b.cookie(cookie);
    }

    private MockHttpServletRequestBuilder logout(Cookie cookie) {
        MockHttpServletRequestBuilder b = post("/api/auth/logout").header("X-Requested-With", "XMLHttpRequest");
        return cookie == null ? b : b.cookie(cookie);
    }

    @Test
    void refreshRotatesTokenAndIssuesNewAccessToken() throws Exception {
        createUser("jane@example.com", GRC);
        MvcResult first = login("jane@example.com", PASSWORD, true);
        Cookie c1 = refreshCookie(first);

        MvcResult second = mvc.perform(refresh(c1)).andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("jane@example.com"))
                .andReturn();
        Cookie c2 = refreshCookie(second);
        assertThat(c2.getValue()).isNotEqualTo(c1.getValue());
        // remember-me preference survives rotation
        assertThat(second.getResponse().getHeader("Set-Cookie")).contains("Max-Age=2592000").contains("HttpOnly");
        // new access token works
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + accessToken(second))).andExpect(status().isOk());
        // exactly one active token remains in the family
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM refresh_tokens WHERE revoked_at IS NULL", Integer.class)).isEqualTo(1);
    }

    @Test
    void reusingARotatedTokenRevokesTheWholeFamily() throws Exception {
        createUser("jane@example.com", GRC);
        Cookie c1 = refreshCookie(login("jane@example.com", PASSWORD, false));
        Cookie c2 = refreshCookie(mvc.perform(refresh(c1)).andExpect(status().isOk()).andReturn());

        // attacker replays the old token
        MvcResult replay = mvc.perform(refresh(c1)).andExpect(status().isUnauthorized()).andReturn();
        assertThat(replay.getResponse().getHeader("Set-Cookie")).contains("Max-Age=0");
        // the legitimate newest token is now dead too
        mvc.perform(refresh(c2)).andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM refresh_tokens WHERE revoked_at IS NULL", Integer.class)).isZero();
    }

    @Test
    void expiredRefreshTokenIsRejected() throws Exception {
        createUser("jane@example.com", GRC);
        Cookie c = refreshCookie(login("jane@example.com", PASSWORD, false));
        jdbc.update("UPDATE refresh_tokens SET expires_at = TIMESTAMPADD(MINUTE, -1, UTC_TIMESTAMP(6))");
        mvc.perform(refresh(c)).andExpect(status().isUnauthorized());
    }

    @Test
    void unknownOrMissingRefreshTokenIsRejected() throws Exception {
        mvc.perform(refresh(new Cookie("nr_refresh", "not-a-real-token"))).andExpect(status().isUnauthorized());
        mvc.perform(refresh(null)).andExpect(status().isUnauthorized());
    }

    @Test
    void refreshIsRejectedForDisabledUser() throws Exception {
        var user = createUser("jane@example.com", GRC);
        Cookie c = refreshCookie(login("jane@example.com", PASSWORD, false));
        user.setEnabled(false);
        users.saveAndFlush(user);
        mvc.perform(refresh(c)).andExpect(status().isUnauthorized());
    }

    @Test
    void refreshAndLogoutRequireTheAntiCsrfHeader() throws Exception {
        createUser("jane@example.com", GRC);
        Cookie c = refreshCookie(login("jane@example.com", PASSWORD, false));
        mvc.perform(post("/api/auth/refresh").cookie(c)).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/logout").cookie(c)).andExpect(status().isForbidden());
        // token untouched by the rejected attempts
        mvc.perform(refresh(c)).andExpect(status().isOk());
    }

    @Test
    void logoutRevokesServerSideSessionAndClearsCookie() throws Exception {
        createUser("jane@example.com", GRC);
        Cookie c = refreshCookie(login("jane@example.com", PASSWORD, false));

        MvcResult out = mvc.perform(logout(c)).andExpect(status().isNoContent()).andReturn();
        assertThat(out.getResponse().getHeader("Set-Cookie")).contains("nr_refresh=").contains("Max-Age=0");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM refresh_tokens WHERE revoked_at IS NULL", Integer.class)).isZero();
        mvc.perform(refresh(c)).andExpect(status().isUnauthorized());
    }

    @Test
    void logoutIsIdempotentWithoutCookie() throws Exception {
        mvc.perform(logout(null)).andExpect(status().isNoContent());
        mvc.perform(logout(new Cookie("nr_refresh", "junk"))).andExpect(status().isNoContent());
    }
}

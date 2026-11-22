package com.nextrisk.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Objects;

@Entity
@Table(name = "roles")
public class Role {

    public static final String ADMIN = "ROLE_ADMIN";
    public static final String CISO = "ROLE_CISO";
    public static final String GRC_ANALYST = "ROLE_GRC_ANALYST";
    public static final String SOC_ANALYST = "ROLE_SOC_ANALYST";
    public static final String PENTESTER = "ROLE_PENTESTER";

    /** All platform roles, in display order. */
    public static final java.util.List<String> ALL = java.util.List.of(ADMIN, CISO, GRC_ANALYST, SOC_ANALYST, PENTESTER);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    protected Role() {
    }

    public Role(String name) {
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Role other && Objects.equals(name, other.name);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(name);
    }
}

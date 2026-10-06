import { describe, expect, it } from "vitest";
import { ALL_PERMISSIONS, MODULES, SENSITIVE } from "@/lib/rbac/permissions";
import { STARTER_ROLES } from "@/lib/rbac/roles";

const allKeys = new Set<string>(ALL_PERMISSIONS.map((p) => p.key));
const role = (key: string) => STARTER_ROLES.find((r) => r.key === key)!;

describe("permission catalogue", () => {
  it("has unique keys in module:action form", () => {
    expect(allKeys.size).toBe(ALL_PERMISSIONS.length);
    for (const p of ALL_PERMISSIONS) {
      expect(p.key).toBe(`${p.module}:${p.action}`);
    }
  });

  it("gives every module at least one action", () => {
    for (const m of Object.values(MODULES)) {
      expect(m.actions.length).toBeGreaterThan(0);
    }
  });

  it("only marks real permissions as sensitive", () => {
    for (const key of SENSITIVE) {
      expect(allKeys.has(key)).toBe(true);
    }
  });
});

describe("starter roles", () => {
  it("has unique role keys", () => {
    const keys = STARTER_ROLES.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("only grants permissions that exist", () => {
    for (const r of STARTER_ROLES) {
      for (const key of r.permissions) {
        expect(allKeys.has(key), `${r.key} grants unknown ${key}`).toBe(true);
      }
    }
  });

  it("gives super_admin every permission", () => {
    expect(new Set(role("super_admin").permissions)).toEqual(allKeys);
  });

  it("stops admin from managing roles or deleting staff", () => {
    const perms = role("admin").permissions as string[];
    expect(perms.some((k) => k.startsWith("roles:"))).toBe(false);
    expect(perms).not.toContain("staff:delete");
  });

  it("keeps the read-only auditor to view permissions", () => {
    for (const key of role("read_only_auditor").permissions) {
      expect(key.endsWith(":view")).toBe(true);
    }
  });

  it("keeps role changes to super_admin", () => {
    const writes = ["roles:create", "roles:edit", "roles:delete"];
    for (const r of STARTER_ROLES) {
      if (r.key === "super_admin") continue;
      for (const perm of r.permissions as string[]) {
        expect(writes.includes(perm), `${r.key} holds ${perm}`).toBe(false);
      }
    }
  });

  it("keeps support and fulfilment from deleting or exporting", () => {
    for (const key of ["support_agent", "order_fulfilment"]) {
      for (const perm of role(key).permissions as string[]) {
        expect(perm.endsWith(":delete")).toBe(false);
        expect(perm.endsWith(":export")).toBe(false);
      }
    }
  });
});

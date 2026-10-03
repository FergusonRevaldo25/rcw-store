import { ALL_PERMISSIONS, type PermissionKey } from "./permissions";

export type RoleDef = {
  key: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
};

const every = ALL_PERMISSIONS.map((p) => p.key);

// Pick actions from a module. No actions given means every action in it.
const mod = (module: string, actions?: string[]): PermissionKey[] =>
  ALL_PERMISSIONS.filter(
    (p) => p.module === module && (!actions || actions.includes(p.action))
  ).map((p) => p.key);

const viewEverything = every.filter((k) => k.endsWith(":view"));

// Starting points only. Roles can be changed from the dashboard later.
// Note: the seed grants everything with scope "all". "own" scope comes later.
export const STARTER_ROLES: RoleDef[] = [
  {
    key: "super_admin",
    name: "Super Admin",
    description: "Everything, including roles and staff.",
    permissions: every,
  },
  {
    key: "admin",
    name: "Admin",
    description: "Everything except managing roles and deleting staff.",
    permissions: every.filter(
      (k) => !k.startsWith("roles:") && k !== "staff:delete"
    ),
  },
  {
    key: "catalogue_manager",
    name: "Catalogue Manager",
    description: "Products, categories and digital files.",
    permissions: [
      ...mod("dashboard"),
      ...mod("products"),
      ...mod("categories"),
      ...mod("digital_files"),
      ...mod("reviews", ["view"]),
    ],
  },
  {
    key: "inventory_clerk",
    name: "Inventory Clerk",
    description: "Stock levels and suppliers.",
    permissions: [
      ...mod("dashboard"),
      ...mod("inventory", ["view", "create", "edit"]),
      ...mod("products", ["view"]),
    ],
  },
  {
    key: "order_fulfilment",
    name: "Order Fulfilment",
    description: "Packing, shipping and order status.",
    permissions: [
      ...mod("dashboard"),
      ...mod("orders", ["view", "edit"]),
      ...mod("shipping", ["view", "create", "edit"]),
      ...mod("returns", ["view", "edit"]),
    ],
  },
  {
    key: "finance_manager",
    name: "Finance Manager",
    description: "Transactions, payouts, refunds and finance reports.",
    permissions: [
      ...mod("dashboard"),
      ...mod("transactions"),
      ...mod("finance"),
      ...mod("orders", ["view"]),
      ...mod("returns", ["view", "approve"]),
      ...mod("sellers", ["view"]),
      ...mod("reports"),
    ],
  },
  {
    key: "support_agent",
    name: "Support Agent",
    description: "Customer questions, orders lookups and return requests.",
    permissions: [
      ...mod("dashboard"),
      ...mod("support"),
      ...mod("customers", ["view"]),
      ...mod("orders", ["view"]),
      ...mod("returns", ["view", "create"]),
      ...mod("reviews", ["view"]),
    ],
  },
  {
    key: "marketing_manager",
    name: "Marketing Manager",
    description: "Deals, vouchers, banners and newsletters.",
    permissions: [
      ...mod("dashboard"),
      ...mod("marketing"),
      ...mod("content", ["view"]),
      ...mod("reviews", ["view"]),
      ...mod("reports", ["view"]),
    ],
  },
  {
    key: "content_editor",
    name: "Content Editor",
    description: "Homepage, brands, spotlight and pages.",
    permissions: [
      ...mod("dashboard"),
      ...mod("content"),
      ...mod("products", ["view"]),
    ],
  },
  {
    key: "partnerships_manager",
    name: "Partnerships Manager",
    description: "Partner applications and seller onboarding.",
    permissions: [
      ...mod("dashboard"),
      ...mod("partners", ["view", "edit", "approve"]),
      ...mod("sellers", ["view", "edit", "approve"]),
      ...mod("marketing", ["view"]),
    ],
  },
  {
    key: "read_only_auditor",
    name: "Read-only Auditor",
    description: "Can view everything and the audit log. Cannot change anything.",
    permissions: viewEverything,
  },
];

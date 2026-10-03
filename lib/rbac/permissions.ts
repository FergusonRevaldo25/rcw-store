// Single source of truth for what can be permitted.
// Keys look like "module:action". Add a module here, then run: npm run db:seed

export const MODULES = {
  dashboard: { label: "Dashboard", actions: ["view"] },
  products: { label: "Products", actions: ["view", "create", "edit", "delete", "export"] },
  categories: { label: "Categories", actions: ["view", "create", "edit", "delete"] },
  digital_files: { label: "Digital files", actions: ["view", "create", "edit", "delete"] },
  inventory: { label: "Inventory and suppliers", actions: ["view", "create", "edit", "approve", "export"] },
  orders: { label: "Orders", actions: ["view", "edit", "export"] },
  returns: { label: "Returns and refunds", actions: ["view", "create", "edit", "approve"] },
  shipping: { label: "Shipping", actions: ["view", "create", "edit"] },
  transactions: { label: "Transactions", actions: ["view", "export"] },
  finance: { label: "Finance", actions: ["view", "edit", "approve", "export"] },
  customers: { label: "Customers", actions: ["view", "edit", "delete", "export"] },
  sellers: { label: "Sellers", actions: ["view", "edit", "approve"] },
  partners: { label: "Partner applications", actions: ["view", "edit", "approve", "export"] },
  marketing: { label: "Marketing", actions: ["view", "create", "edit", "delete"] },
  content: { label: "Site content", actions: ["view", "create", "edit", "delete"] },
  reviews: { label: "Reviews", actions: ["view", "edit", "delete"] },
  support: { label: "Support", actions: ["view", "create", "edit"] },
  compliance: { label: "Compliance", actions: ["view", "edit", "export"] },
  risk: { label: "Fraud and risk", actions: ["view", "edit"] },
  reports: { label: "Reports", actions: ["view", "export"] },
  staff: { label: "Staff", actions: ["view", "create", "edit", "delete"] },
  roles: { label: "Roles and access", actions: ["view", "create", "edit", "delete"] },
  audit: { label: "Audit log", actions: ["view", "export"] },
  settings: { label: "Settings", actions: ["view", "edit"] },
} as const;

export type ModuleKey = keyof typeof MODULES;
export type PermissionKey = {
  [M in ModuleKey]: `${M}:${(typeof MODULES)[M]["actions"][number]}`;
}[ModuleKey];

// These need a fresh two-factor check before they run.
export const SENSITIVE: ReadonlySet<string> = new Set<PermissionKey>([
  "returns:approve",
  "finance:approve",
  "finance:export",
  "customers:export",
  "customers:delete",
  "transactions:export",
  "partners:export",
  "staff:create",
  "staff:edit",
  "staff:delete",
  "roles:create",
  "roles:edit",
  "roles:delete",
  "settings:edit",
  "audit:export",
]);

export type PermissionRow = {
  key: PermissionKey;
  module: ModuleKey;
  action: string;
  description: string;
  sensitive: boolean;
};

export const ALL_PERMISSIONS: PermissionRow[] = (
  Object.keys(MODULES) as ModuleKey[]
).flatMap((module) =>
  (MODULES[module].actions as readonly string[]).map((action) => {
    const key = `${module}:${action}` as PermissionKey;
    return {
      key,
      module,
      action,
      description: `${action[0].toUpperCase()}${action.slice(1)} ${MODULES[module].label.toLowerCase()}`,
      sensitive: SENSITIVE.has(key),
    };
  })
);

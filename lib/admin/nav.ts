import type { PermissionKey } from "@/lib/rbac/permissions";

export type NavItem = {
  label: string;
  href: string;
  permission: PermissionKey;
  built: boolean; // false hides the tab and blocks the sample page
};
export type NavGroup = { title: string; items: NavItem[] };

// Only flip `built` to true when the page shows REAL data.
export const ADMIN_NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", permission: "dashboard:view", built: true }],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products", permission: "products:view", built: true },
      { label: "Categories", href: "/admin/categories", permission: "categories:view", built: true },
      { label: "Digital files", href: "/admin/digital-files", permission: "digital_files:view", built: false },
      { label: "Inventory", href: "/admin/inventory", permission: "inventory:view", built: true },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Point of sale", href: "/admin/pos", permission: "pos:view", built: true },
      { label: "POS sales", href: "/admin/pos/sales", permission: "pos:view", built: true },
      { label: "Sales", href: "/admin/sales", permission: "sales:view", built: false },
      { label: "Orders", href: "/admin/orders", permission: "orders:view", built: true },
      { label: "Returns and refunds", href: "/admin/returns", permission: "returns:view", built: true },
      { label: "Shipping", href: "/admin/shipping", permission: "shipping:view", built: false },
      { label: "Customers", href: "/admin/customers", permission: "customers:view", built: false },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Operations", href: "/admin/operations", permission: "operations:view", built: false },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { label: "Sellers", href: "/admin/sellers", permission: "sellers:view", built: true },
      { label: "Partners", href: "/admin/partners", permission: "partners:view", built: false },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Transactions", href: "/admin/transactions", permission: "transactions:view", built: true },
      { label: "Finance", href: "/admin/finance", permission: "finance:view", built: false },
    ],
  },
  {
    title: "Data",
    items: [
      { label: "Analytics", href: "/admin/data", permission: "data:view", built: false },
      { label: "Reports", href: "/admin/reports", permission: "reports:view", built: false },
    ],
  },
  {
    title: "Content and marketing",
    items: [
      { label: "Site content", href: "/admin/content/homepage", permission: "content:view", built: false },
      { label: "Marketing", href: "/admin/marketing/deals", permission: "marketing:view", built: false },
      { label: "Reviews", href: "/admin/reviews", permission: "reviews:view", built: false },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Staff", href: "/admin/staff", permission: "staff:view", built: true },
      { label: "Roles and access", href: "/admin/staff/roles", permission: "roles:view", built: true },
      { label: "Human resources", href: "/admin/hr", permission: "hr:view", built: false },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Support", href: "/admin/support", permission: "support:view", built: false },
      { label: "Compliance", href: "/admin/compliance", permission: "compliance:view", built: false },
      { label: "Fraud and risk", href: "/admin/risk", permission: "risk:view", built: false },
      { label: "Audit log", href: "/admin/audit-log", permission: "audit:view", built: true },
      { label: "Settings", href: "/admin/settings", permission: "settings:view", built: false },
    ],
  },
];

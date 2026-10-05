import type { PermissionKey } from "@/lib/rbac/permissions";

export type NavItem = {
  label: string;
  href: string;
  permission: PermissionKey;
  built: boolean; // false shows a "Soon" tag and no link
};
export type NavGroup = { title: string; items: NavItem[] };

// Flip `built` to true as each section gets real pages.
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
      { label: "Digital files", href: "/admin/digital-files", permission: "digital_files:view", built: true },
      { label: "Inventory", href: "/admin/inventory", permission: "inventory:view", built: true },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Point of sale", href: "/admin/pos", permission: "pos:view", built: true },
      { label: "POS sales", href: "/admin/pos/sales", permission: "pos:view", built: true },
      { label: "Sales", href: "/admin/sales", permission: "sales:view", built: true },
      { label: "Orders", href: "/admin/orders", permission: "orders:view", built: true },
      { label: "Returns and refunds", href: "/admin/returns", permission: "returns:view", built: true },
      { label: "Shipping", href: "/admin/shipping", permission: "shipping:view", built: true },
      { label: "Customers", href: "/admin/customers", permission: "customers:view", built: true },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Operations", href: "/admin/operations", permission: "operations:view", built: true },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { label: "Sellers", href: "/admin/sellers", permission: "sellers:view", built: true },
      { label: "Partners", href: "/admin/partners", permission: "partners:view", built: true },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Transactions", href: "/admin/transactions", permission: "transactions:view", built: true },
      { label: "Finance", href: "/admin/finance", permission: "finance:view", built: true },
    ],
  },
  {
    title: "Data",
    items: [
      { label: "Analytics", href: "/admin/data", permission: "data:view", built: true },
      { label: "Reports", href: "/admin/reports", permission: "reports:view", built: true },
    ],
  },
  {
    title: "Content and marketing",
    items: [
      { label: "Site content", href: "/admin/content/homepage", permission: "content:view", built: true },
      { label: "Marketing", href: "/admin/marketing/deals", permission: "marketing:view", built: true },
      { label: "Reviews", href: "/admin/reviews", permission: "reviews:view", built: true },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Staff", href: "/admin/staff", permission: "staff:view", built: true },
      { label: "Roles and access", href: "/admin/staff/roles", permission: "roles:view", built: true },
      { label: "Human resources", href: "/admin/hr", permission: "hr:view", built: true },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Support", href: "/admin/support", permission: "support:view", built: true },
      { label: "Compliance", href: "/admin/compliance", permission: "compliance:view", built: true },
      { label: "Fraud and risk", href: "/admin/risk", permission: "risk:view", built: true },
      { label: "Audit log", href: "/admin/audit-log", permission: "audit:view", built: true },
      { label: "Settings", href: "/admin/settings", permission: "settings:view", built: true },
    ],
  },
];

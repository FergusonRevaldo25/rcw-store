// SAMPLE DATA ONLY. Every name, number and date here is made up so the
// admin screens have something to show. Replace each page with real data
// by creating a real route at the same path (it overrides the sample).

export type SampleStat = { label: string; value: string; hint?: string };

export type SamplePage = {
  title: string;
  description: string;
  stats: SampleStat[];
  tableTitle: string;
  columns: string[];
  rows: string[][];
};

const page = (
  title: string,
  description: string,
  stats: SampleStat[],
  tableTitle: string,
  columns: string[],
  rows: string[][]
): SamplePage => ({ title, description, stats, tableTitle, columns, rows });

export const SAMPLE_PAGES: Record<string, SamplePage> = {
  "/admin/categories": page(
    "Categories",
    "Group products so shoppers and staff can find them.",
    [
      { label: "Categories", value: "28" },
      { label: "Live on site", value: "12" },
      { label: "Not live yet", value: "16" },
      { label: "Products assigned", value: "4" },
    ],
    "All categories",
    ["Category", "Products", "Status", "Managed by"],
    [
      ["Clothes", "1", "Live", "Sample Team A"],
      ["Digital Products", "3", "Live", "Sample Team B"],
      ["Accessories", "0", "Not live", "Sample Team A"],
      ["Home and Living", "0", "Not live", "Unassigned"],
      ["Gifts", "0", "Not live", "Sample Team C"],
    ]
  ),
  "/admin/digital-files": page(
    "Digital files",
    "Downloads that customers receive after buying a digital product.",
    [
      { label: "Files stored", value: "7" },
      { label: "Total size", value: "184 MB" },
      { label: "Downloads this month", value: "52" },
      { label: "Failed downloads", value: "1" },
    ],
    "Recent files",
    ["File", "Product", "Size", "Downloads", "Uploaded"],
    [
      ["invoice-template.zip", "Invoice Template Pack", "12 MB", "21", "01 Oct 2026"],
      ["social-kit.zip", "Social Media Starter Kit", "48 MB", "17", "28 Sep 2026"],
      ["starter-guide.pdf", "Starter Guide", "6 MB", "9", "20 Sep 2026"],
      ["brand-fonts.zip", "Brand Font Bundle", "31 MB", "5", "15 Sep 2026"],
    ]
  ),
  "/admin/inventory": page(
    "Inventory",
    "Stock levels and recent stock movements.",
    [
      { label: "Tracked products", value: "3" },
      { label: "Units on hand", value: "86" },
      { label: "Low stock", value: "1", hint: "Below 10 units" },
      { label: "Out of stock", value: "0" },
    ],
    "Stock levels",
    ["Product", "On hand", "Reorder level", "Status"],
    [
      ["RCW Black Hoodie", "34", "10", "OK"],
      ["RCW White T-Shirt", "8", "10", "Low"],
      ["Sample Cap", "44", "10", "OK"],
      ["Sample Tote Bag", "0", "5", "Out of stock"],
    ]
  ),
  "/admin/sales": page(
    "Sales",
    "Revenue across the shop and online.",
    [
      { label: "Today", value: "R1 240" },
      { label: "This week", value: "R8 905" },
      { label: "This month", value: "R31 460" },
      { label: "Average sale", value: "R286" },
    ],
    "Sales by day",
    ["Day", "Orders", "Channel", "Revenue"],
    [
      ["Mon 05 Oct", "6", "POS", "R1 240"],
      ["Sun 04 Oct", "11", "Online", "R2 310"],
      ["Sat 03 Oct", "19", "POS", "R3 880"],
      ["Fri 02 Oct", "8", "Online", "R1 475"],
    ]
  ),
  "/admin/orders": page(
    "Orders",
    "Every order from the till and the website.",
    [
      { label: "New", value: "4" },
      { label: "Paid", value: "12" },
      { label: "Fulfilled", value: "31" },
      { label: "Cancelled", value: "2" },
    ],
    "Latest orders",
    ["Order", "Customer", "Channel", "Total", "Status"],
    [
      ["#1004", "Sample Customer A", "Online", "R549.00", "Paid"],
      ["#1003", "Walk-in", "POS", "R149.00", "Fulfilled"],
      ["#1002", "Sample Customer B", "Online", "R398.00", "New"],
      ["#1001", "Walk-in", "POS", "R149.00", "Fulfilled"],
    ]
  ),
  "/admin/shipping": page(
    "Shipping",
    "Parcels, couriers and delivery zones.",
    [
      { label: "To pack", value: "3" },
      { label: "In transit", value: "5" },
      { label: "Delivered", value: "27" },
      { label: "Problems", value: "1" },
    ],
    "Shipments",
    ["Order", "Destination", "Courier", "Status"],
    [
      ["#1004", "Sample City A", "Sample Courier", "To pack"],
      ["#0998", "Sample City B", "Sample Courier", "In transit"],
      ["#0991", "Sample City C", "Sample Courier", "Delivered"],
      ["#0987", "Sample City D", "Sample Courier", "Problem"],
    ]
  ),
  "/admin/customers": page(
    "Customers",
    "People who have bought from RCW.",
    [
      { label: "Customers", value: "64" },
      { label: "New this month", value: "9" },
      { label: "Repeat buyers", value: "18" },
      { label: "Marketing opt-ins", value: "41" },
    ],
    "Customers",
    ["Name", "Orders", "Spent", "Joined"],
    [
      ["Sample Customer A", "3", "R1 247", "12 Aug 2026"],
      ["Sample Customer B", "1", "R398", "30 Sep 2026"],
      ["Sample Customer C", "5", "R2 190", "02 Jun 2026"],
      ["Sample Customer D", "2", "R698", "19 Sep 2026"],
    ]
  ),
  "/admin/operations": page(
    "Operations",
    "Day-to-day tasks for the team.",
    [
      { label: "Open tasks", value: "8" },
      { label: "Due today", value: "3" },
      { label: "Overdue", value: "1" },
      { label: "Done this week", value: "14" },
    ],
    "Task list",
    ["Task", "Owner", "Due", "Status"],
    [
      ["Count till float", "Sample Staff A", "Today", "Open"],
      ["Restock hoodies", "Sample Staff B", "Today", "Open"],
      ["Pack online orders", "Sample Staff C", "Today", "In progress"],
      ["Clean stockroom", "Sample Staff A", "Yesterday", "Overdue"],
    ]
  ),
  "/admin/partners": page(
    "Partners",
    "Brands and businesses that work with RCW.",
    [
      { label: "Partners", value: "6" },
      { label: "Active", value: "4" },
      { label: "Pending", value: "2" },
      { label: "Products supplied", value: "23" },
    ],
    "Partners",
    ["Partner", "Type", "Products", "Status"],
    [
      ["Sample Brand A", "Supplier", "8", "Active"],
      ["Sample Brand B", "Affiliate", "0", "Active"],
      ["Sample Brand C", "Supplier", "15", "Pending"],
      ["Sample Brand D", "Event partner", "0", "Pending"],
    ]
  ),
  "/admin/transactions": page(
    "Transactions",
    "Every payment and refund that touched the till or the site.",
    [
      { label: "Today", value: "6" },
      { label: "Cash", value: "R640" },
      { label: "Card", value: "R600" },
      { label: "Refunds", value: "R0" },
    ],
    "Latest transactions",
    ["Reference", "Method", "Amount", "Time", "Status"],
    [
      ["TX-0001", "Cash", "R149.00", "07:34", "Complete"],
      ["TX-0002", "Card", "R549.00", "09:12", "Complete"],
      ["TX-0003", "EFT", "R199.00", "11:40", "Pending"],
      ["TX-0004", "Card", "R51.00", "13:05", "Refunded"],
    ]
  ),
  "/admin/finance": page(
    "Finance",
    "Money in, money out and what is owed.",
    [
      { label: "Revenue (month)", value: "R31 460" },
      { label: "Expenses (month)", value: "R12 300" },
      { label: "Net", value: "R19 160" },
      { label: "Unpaid invoices", value: "2" },
    ],
    "Recent entries",
    ["Date", "Description", "Type", "Amount"],
    [
      ["03 Oct 2026", "Sample stock purchase", "Expense", "R4 200"],
      ["03 Oct 2026", "Weekend sales", "Income", "R3 880"],
      ["01 Oct 2026", "Sample rent", "Expense", "R5 000"],
      ["30 Sep 2026", "Online sales", "Income", "R2 310"],
    ]
  ),
  "/admin/data": page(
    "Analytics",
    "Trends to help decide what to stock and promote.",
    [
      { label: "Visitors (week)", value: "1 820" },
      { label: "Conversion", value: "2.4%" },
      { label: "Top category", value: "Digital Products" },
      { label: "Returning buyers", value: "28%" },
    ],
    "Top products",
    ["Product", "Views", "Sales", "Conversion"],
    [
      ["RCW Black Hoodie", "640", "14", "2.2%"],
      ["Invoice Template Pack", "510", "19", "3.7%"],
      ["RCW White T-Shirt", "390", "9", "2.3%"],
      ["Social Media Starter Kit", "280", "6", "2.1%"],
    ]
  ),
  "/admin/reports": page(
    "Reports",
    "Saved reports the team can open and export.",
    [
      { label: "Saved reports", value: "5" },
      { label: "Scheduled", value: "2" },
      { label: "Run this month", value: "11" },
      { label: "Failed", value: "0" },
    ],
    "Reports",
    ["Report", "Owner", "Frequency", "Last run"],
    [
      ["Daily till summary", "Sample Finance", "Daily", "05 Oct 2026"],
      ["Weekly sales", "Sample Sales", "Weekly", "04 Oct 2026"],
      ["Stock on hand", "Sample Ops", "Manual", "01 Oct 2026"],
      ["Monthly profit", "Sample Finance", "Monthly", "01 Oct 2026"],
    ]
  ),
  "/admin/content/homepage": page(
    "Site content",
    "Homepage sections, brands, spotlight and pages.",
    [
      { label: "Sections", value: "9" },
      { label: "Published", value: "7" },
      { label: "Drafts", value: "2" },
      { label: "Pages", value: "6" },
    ],
    "Homepage sections",
    ["Section", "Last edited", "Editor", "Status"],
    [
      ["Hero banner", "02 Oct 2026", "Sample Editor", "Published"],
      ["Featured products", "30 Sep 2026", "Sample Editor", "Published"],
      ["Maker spotlight", "25 Sep 2026", "Sample Editor", "Draft"],
      ["Brands strip", "20 Sep 2026", "Sample Editor", "Draft"],
    ]
  ),
  "/admin/marketing/deals": page(
    "Marketing",
    "Deals, campaigns and promo codes.",
    [
      { label: "Active deals", value: "2" },
      { label: "Promo codes", value: "4" },
      { label: "Campaigns", value: "3" },
      { label: "Redemptions", value: "37" },
    ],
    "Deals and campaigns",
    ["Name", "Type", "Runs", "Status"],
    [
      ["Sample Spring Sale", "Discount", "01 to 15 Oct", "Active"],
      ["Sample Free Delivery", "Shipping", "All month", "Active"],
      ["Sample Newsletter Push", "Email", "10 Oct", "Scheduled"],
      ["Sample Black Friday", "Discount", "27 Nov", "Draft"],
    ]
  ),
  "/admin/reviews": page(
    "Reviews",
    "Customer reviews waiting for a decision.",
    [
      { label: "Waiting", value: "3" },
      { label: "Approved", value: "21" },
      { label: "Rejected", value: "2" },
      { label: "Average rating", value: "4.6" },
    ],
    "Latest reviews",
    ["Product", "Rating", "Reviewer", "Status"],
    [
      ["RCW Black Hoodie", "5", "Sample Customer A", "Waiting"],
      ["Invoice Template Pack", "4", "Sample Customer B", "Approved"],
      ["RCW White T-Shirt", "3", "Sample Customer C", "Waiting"],
      ["Social Media Starter Kit", "5", "Sample Customer D", "Approved"],
    ]
  ),
  "/admin/hr": page(
    "Human resources",
    "Staff records. Real data here is personal information and falls under POPIA.",
    [
      { label: "Staff", value: "7" },
      { label: "On leave", value: "1" },
      { label: "Open roles", value: "1" },
      { label: "Leave requests", value: "2" },
    ],
    "Staff overview",
    ["Name", "Role", "Start date", "Status"],
    [
      ["Sample Person A", "Cashier", "01 Mar 2026", "Active"],
      ["Sample Person B", "Category lead", "15 Apr 2026", "Active"],
      ["Sample Person C", "Packer", "10 Jun 2026", "On leave"],
      ["Sample Person D", "Marketing", "02 Aug 2026", "Active"],
    ]
  ),
  "/admin/support": page(
    "Support",
    "Questions and problems from customers.",
    [
      { label: "Open tickets", value: "5" },
      { label: "Waiting on customer", value: "2" },
      { label: "Solved this week", value: "13" },
      { label: "Average reply", value: "3 h" },
    ],
    "Tickets",
    ["Ticket", "Subject", "Customer", "Status"],
    [
      ["S-101", "Where is my order?", "Sample Customer A", "Open"],
      ["S-100", "Download link not working", "Sample Customer B", "Open"],
      ["S-099", "Change delivery address", "Sample Customer C", "Waiting"],
      ["S-098", "Refund request", "Sample Customer D", "Solved"],
    ]
  ),
  "/admin/compliance": page(
    "Compliance",
    "Legal and regulatory tasks the business must keep up with.",
    [
      { label: "Items tracked", value: "9" },
      { label: "Up to date", value: "6" },
      { label: "Due soon", value: "2" },
      { label: "Overdue", value: "1" },
    ],
    "Checklist",
    ["Item", "Owner", "Due", "Status"],
    [
      ["Privacy policy review", "Sample Legal", "31 Oct 2026", "Due soon"],
      ["Staff data handling check", "Sample HR", "15 Nov 2026", "Due soon"],
      ["Tax filing", "Sample Finance", "30 Sep 2026", "Overdue"],
      ["Terms of sale review", "Sample Legal", "31 Jan 2027", "Up to date"],
    ]
  ),
  "/admin/risk": page(
    "Fraud and risk",
    "Orders and accounts that look unusual.",
    [
      { label: "Flagged orders", value: "2" },
      { label: "Blocked", value: "0" },
      { label: "Chargebacks", value: "0" },
      { label: "Risk level", value: "Low" },
    ],
    "Flagged items",
    ["Item", "Reason", "Amount", "Status"],
    [
      ["Order #1002", "Many attempts in a row", "R398.00", "Review"],
      ["Order #0994", "Address mismatch", "R1 047.00", "Review"],
      ["Order #0981", "Cleared after check", "R249.00", "Cleared"],
    ]
  ),
  "/admin/audit-log": page(
    "Audit log",
    "Who did what, and when. Sample rows only; the real log is in the database.",
    [
      { label: "Entries today", value: "18" },
      { label: "This week", value: "96" },
      { label: "Self-approvals", value: "1" },
      { label: "Failed sign-ins", value: "0" },
    ],
    "Latest entries",
    ["Time", "Who", "Action", "Item"],
    [
      ["07:34", "Sample Staff A", "pos.sale", "Order #1001"],
      ["07:32", "Sample Staff A", "pos.open", "Till 1"],
      ["Yesterday", "Sample Admin", "product.self_publish", "Sample product"],
      ["Yesterday", "Sample Admin", "staff.role.add", "Sample Person B"],
    ]
  ),
  "/admin/settings": page(
    "Settings",
    "Business details and switches. Values are placeholders until confirmed.",
    [
      { label: "VAT", value: "Off", hint: "Confirm with your accountant" },
      { label: "Currency", value: "ZAR" },
      { label: "Tills", value: "1" },
      { label: "Pay in parts", value: "Off" },
    ],
    "Business details",
    ["Setting", "Value", "Status"],
    [
      ["Business name", "RCW", "Set"],
      ["Business address", "(placeholder)", "Needed"],
      ["VAT number", "(placeholder)", "Needed"],
      ["Delivery zones and fees", "(placeholder)", "Needed"],
    ]
  ),
};
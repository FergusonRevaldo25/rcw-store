import { categoryMeta } from "@/lib/categoryMeta";

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "checkboxes";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  maxLength?: number;
};

export type PartnerIconName =
  | "store"
  | "tag"
  | "megaphone"
  | "link"
  | "spotlight"
  | "download"
  | "wrench"
  | "live"
  | "spark";

export type PartnerType = {
  slug: string;
  name: string;
  short: string;
  blurb: string;
  icon: PartnerIconName;
  goodFor: string[];
  note?: string;
  fields: Field[];
};

// Recorded with a timestamp on the server. Have the final wording checked (POPIA).
export const CONSENT_TEXT =
  "I agree that RCW Store may store the details I have given and contact me about my application. I can ask for my details to be removed at any time.";

// PLACEHOLDER: no fees, commission or payout terms are decided yet.
export const TERMS_NOTE =
  "Fees, commission and payout terms are not published yet. We confirm them with you after we review your application.";

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const CATEGORIES = [...categoryMeta.map((c) => c.name), "Other"];

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "X",
  "WhatsApp Channel",
  "Snapchat",
  "LinkedIn",
  "Pinterest",
  "Threads",
  "Other",
];

const contact: Field[] = [
  { name: "contactName", label: "Your full name", type: "text", required: true },
  { name: "email", label: "Email address", type: "email", required: true },
  {
    name: "phone",
    label: "Phone or WhatsApp number",
    type: "tel",
    required: true,
    placeholder: "082 000 0000",
  },
  {
    name: "province",
    label: "Province",
    type: "select",
    required: true,
    options: PROVINCES,
  },
];

const link = (label: string, help?: string): Field => ({
  name: "link",
  label,
  type: "url",
  placeholder: "https://",
  help,
});

const about = (label: string, required = false): Field => ({
  name: "about",
  label,
  type: "textarea",
  required,
  maxLength: 2000,
});

export const partnerTypes: PartnerType[] = [
  {
    slug: "sell-products",
    name: "Sell your products",
    short: "Makers, small businesses and individual sellers",
    blurb:
      "Put your products in front of South African shoppers on RCW Store.",
    icon: "store",
    goodFor: [
      "Makers and small businesses",
      "Resellers with their own stock",
      "Anyone starting out with a few products",
    ],
    fields: [
      { name: "name", label: "Business or brand name", type: "text", required: true },
      ...contact,
      { name: "category", label: "Main category", type: "select", required: true, options: CATEGORIES },
      { name: "products", label: "What do you sell?", type: "textarea", required: true, maxLength: 2000 },
      { name: "catalogue", label: "How many products would you list?", type: "select", options: ["1 to 5", "6 to 20", "21 to 100", "More than 100"] },
      { name: "fulfilment", label: "How would you get orders to customers?", type: "select", options: ["I ship orders myself", "I need help with delivery", "Made to order", "Digital delivery"] },
      link("Website or social link"),
      about("Anything else we should know?"),
    ],
  },
  {
    slug: "list-brand",
    name: "List your brand",
    short: "Brands, distributors and wholesalers",
    blurb: "Get your brand listed with a profile and a full product range.",
    icon: "tag",
    goodFor: [
      "Brand owners",
      "Authorised distributors",
      "Wholesalers with a catalogue",
    ],
    fields: [
      { name: "name", label: "Brand name", type: "text", required: true },
      ...contact,
      { name: "role", label: "Your role", type: "select", required: true, options: ["I own the brand", "Authorised distributor", "Wholesaler"] },
      { name: "registration", label: "Business registration", type: "select", options: ["Registered company", "Sole proprietor", "Not registered yet"] },
      { name: "category", label: "Main category", type: "select", required: true, options: CATEGORIES },
      { name: "range", label: "Tell us about your product range", type: "textarea", required: true, maxLength: 2000 },
      link("Website or social link"),
      about("Anything else we should know?"),
    ],
  },
  {
    slug: "influencer",
    name: "Influencers and creators",
    short: "Gifting, commission and paid collaborations",
    blurb:
      "Work with RCW Store and the brands on it. Tell us where your audience is and how you like to collaborate.",
    icon: "megaphone",
    goodFor: [
      "Content creators on any platform",
      "Micro and nano influencers",
      "Brand ambassadors",
    ],
    note: "In South Africa, paid or gifted posts should be clearly labelled as ads. See the Advertising Regulatory Board guidance on influencer marketing.",
    fields: [
      { name: "name", label: "Creator name or main handle", type: "text", required: true },
      ...contact,
      { name: "platforms", label: "Platforms you post on", type: "checkboxes", required: true, options: PLATFORMS },
      { name: "audience", label: "Handles and follower counts", type: "textarea", required: true, placeholder: "One per line, for example: Instagram @yourname, 12k followers", maxLength: 2000 },
      { name: "niche", label: "Your niche", type: "select", required: true, options: ["Fashion", "Beauty", "Tech", "Food", "Fitness", "Lifestyle", "Gaming", "Business", "Parenting", "Comedy", "Education", "Other"] },
      { name: "audienceLocation", label: "Where is your audience?", type: "select", options: ["Mostly South Africa", "South Africa and abroad", "Mostly outside South Africa"] },
      { name: "content", label: "Content you make", type: "checkboxes", options: ["Short video or Reels", "Stories", "Photos", "Long-form video", "Live streams", "Blog or newsletter"] },
      { name: "collab", label: "How would you like to work with us?", type: "checkboxes", required: true, options: ["Gifting", "Commission", "Paid posts", "Brand ambassador", "Content for our channels"] },
      link("Media kit or main profile link"),
      about("Anything else we should know?"),
    ],
  },
  {
    slug: "affiliate",
    name: "Affiliates and resellers",
    short: "Referral and commission partners",
    blurb: "Share RCW Store products with your audience and earn on sales.",
    icon: "link",
    goodFor: [
      "Bloggers and deal pages",
      "Community and group admins",
      "Anyone with an audience that shops",
    ],
    fields: [
      { name: "name", label: "Your name or company", type: "text", required: true },
      ...contact,
      { name: "channels", label: "Where would you promote?", type: "checkboxes", required: true, options: ["Social media", "WhatsApp groups", "Website or blog", "Email list", "Communities or groups", "Other"] },
      { name: "audienceSize", label: "Audience size", type: "select", options: ["Under 1,000", "1,000 to 10,000", "10,000 to 100,000", "More than 100,000", "Not sure"] },
      { name: "audienceWho", label: "Who is your audience?", type: "textarea", required: true, maxLength: 2000 },
      link("Website or main profile link"),
      about("Anything else we should know?"),
    ],
  },
  {
    slug: "advertise",
    name: "Advertise with us",
    short: "Featured brand, spotlight and banner slots",
    blurb:
      "Get your brand in front of RCW Store shoppers with a sponsored placement.",
    icon: "spotlight",
    goodFor: [
      "Brands launching something new",
      "Local businesses that want reach",
      "Campaign and seasonal promotions",
    ],
    note: "Sponsored placements are always marked as ads on the site.",
    fields: [
      { name: "name", label: "Business or brand name", type: "text", required: true },
      ...contact,
      { name: "slots", label: "What are you interested in?", type: "checkboxes", required: true, options: ["Featured brand slot", "Maker spotlight", "Homepage banner", "Category sponsorship", "Social shoutout", "Not sure yet"] },
      { name: "budget", label: "Rough budget", type: "select", options: ["Under R1,000", "R1,000 to R5,000", "R5,000 to R20,000", "More than R20,000", "Not sure yet"] },
      { name: "dates", label: "When do you want to run it?", type: "text", maxLength: 200 },
      link("Website or social link"),
      about("What are you promoting?", true),
    ],
  },
  {
    slug: "digital-creator",
    name: "Digital creators",
    short: "Templates, kits, courses and downloads",
    blurb: "Sell digital products that customers download straight away.",
    icon: "download",
    goodFor: [
      "Designers and template makers",
      "Course and e-book authors",
      "Preset and tool creators",
    ],
    fields: [
      { name: "name", label: "Creator or studio name", type: "text", required: true },
      ...contact,
      { name: "kinds", label: "What do you make?", type: "checkboxes", required: true, options: ["Templates", "Social media kits", "Logos and branding", "E-books", "Courses", "Presets", "Software or tools", "Other"] },
      { name: "formats", label: "File formats you deliver", type: "text", placeholder: "For example: PDF, Canva, PSD", maxLength: 200 },
      { name: "rights", label: "Is the work yours to sell?", type: "select", required: true, options: ["Yes, all original work", "Yes, with licences", "Not sure"] },
      link("Portfolio link"),
      about("Tell us about your products", true),
    ],
  },
  {
    slug: "service-provider",
    name: "Service providers and suppliers",
    short: "Design, print, packaging, couriers and more",
    blurb: "Offer your services to the sellers and brands on RCW Store.",
    icon: "wrench",
    goodFor: [
      "Designers, photographers and video makers",
      "Print on demand and dropshipping suppliers",
      "Couriers and packaging suppliers",
    ],
    fields: [
      { name: "name", label: "Business name", type: "text", required: true },
      ...contact,
      { name: "service", label: "Type of service", type: "select", required: true, options: ["Design", "Photography and video", "Print on demand", "Dropshipping or supplier", "Courier or delivery", "Packaging", "Marketing agency", "Other"] },
      { name: "coverage", label: "Where do you operate?", type: "text", maxLength: 200 },
      link("Website or social link"),
      about("What can you offer?", true),
    ],
  },
  {
    slug: "social-seller",
    name: "Social and live sellers",
    short: "Instagram, TikTok and WhatsApp sellers",
    blurb:
      "Already selling through posts, lives or WhatsApp? Bring your shop here.",
    icon: "live",
    goodFor: [
      "Sellers on Instagram, TikTok or Facebook",
      "WhatsApp catalogue and group sellers",
      "Live sellers and collab partners",
    ],
    fields: [
      { name: "name", label: "Shop name or handle", type: "text", required: true },
      ...contact,
      { name: "platforms", label: "Where do you sell?", type: "checkboxes", required: true, options: ["Instagram", "TikTok", "WhatsApp", "Facebook", "Telegram", "Other"] },
      { name: "style", label: "How do you sell?", type: "checkboxes", options: ["Posts and stories", "Live selling", "WhatsApp catalogue", "Group sales"] },
      { name: "category", label: "Main category", type: "select", options: CATEGORIES },
      { name: "following", label: "Followers or group size", type: "text", maxLength: 100 },
      link("Link to your shop or profile"),
      about("Anything else we should know?"),
    ],
  },
  {
    slug: "other",
    name: "Something else",
    short: "A partnership we have not listed",
    blurb: "Have a different idea? Tell us and we will take a look.",
    icon: "spark",
    goodFor: ["Collaborations", "Events and pop-ups", "Anything new"],
    fields: [
      { name: "name", label: "Your name or business", type: "text", required: true },
      ...contact,
      link("Website or social link"),
      about("Tell us what you have in mind", true),
    ],
  },
];

export function getPartnerType(slug: string): PartnerType | undefined {
  return partnerTypes.find((p) => p.slug === slug);
}

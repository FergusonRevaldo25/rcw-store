// Settings used by the legal pages (privacy, terms, cookies).
// Business details such as your name and email live in lib/site.ts.

export const LEGAL = {
  // Set to true ONLY after a lawyer has read the Privacy, Terms and Cookie
  // pages. Until then every legal page shows a "draft" notice.
  reviewed: false,
  lastUpdated: "6 October 2026",
  // Are you registered for VAT? true or false. Leave null until your
  // accountant confirms. The Terms page shows a placeholder while it is null.
  vatRegistered: null as boolean | null,
  // Your payment provider(s), e.g. "PayFast". Leave null until you have signed up.
  paymentProviders: null as string | null,
};
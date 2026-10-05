// Business details and policies used by the information and legal pages.
// Fill these in yourself. Anything left as null shows as a visible
// placeholder on the page, so nothing is ever invented for you.

export type Site = {
  name: string;
  legalName: string | null; // registered company or trading name
  registrationNumber: string | null; // company registration number, if any
  vatNumber: string | null; // only if you are VAT registered
  address: string | null; // public business address, if you want one shown
  email: string | null; // customer support email
  phone: string | null;
  whatsapp: string | null;
  hours: string | null; // e.g. support hours
  informationOfficer: string | null; // POPIA information officer's name
  deliveryArea: string | null; // where you deliver
  courier: string | null;
  handlingTime: string | null; // time to pack an order
  freeDeliveryOver: number | null; // in Rand, or null if you have none
  returnDays: number | null; // days customers have to return an item
  returnConditions: string | null;
  returnAddress: string | null;
  refundTime: string | null; // how long refunds take after approval
  digitalRefundPolicy: string | null;
};

export const SITE: Site = {
  name: "RCW Store",
  legalName: null,
  registrationNumber: null,
  vatNumber: null,
  address: null,
  email: null,
  phone: null,
  whatsapp: null,
  hours: null,
  informationOfficer: null,
  deliveryArea: null,
  courier: null,
  handlingTime: null,
  freeDeliveryOver: null,
  returnDays: null,
  returnConditions: null,
  returnAddress: null,
  refundTime: null,
  digitalRefundPolicy: null,
};
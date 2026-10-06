import type { DraftError } from "@/lib/checkout/draft";
import type { FormErrors } from "@/lib/checkout/validation";

export type PlaceOrderResult =
  | { ok: true; token: string; number: number }
  | {
      ok: false;
      error: DraftError | "disabled" | "invalid_form" | "server";
      slug?: string;
      fieldErrors?: FormErrors;
    };

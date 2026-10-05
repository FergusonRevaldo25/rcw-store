import { redirect } from "next/navigation";

// Returns and refunds are one page.
export default function RefundsPage() {
  redirect("/returns");
}
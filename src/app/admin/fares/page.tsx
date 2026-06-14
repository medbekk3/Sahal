import { redirect } from "next/navigation";

export default function LegacyAdminFaresPage() {
  redirect("/admin/pricing-routes");
}

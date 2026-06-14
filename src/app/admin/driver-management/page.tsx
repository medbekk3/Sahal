import { redirect } from "next/navigation";

export default function DriverManagementRedirectPage() {
  redirect("/admin/drivers");
}

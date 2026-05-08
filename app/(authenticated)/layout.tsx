// app/(authenticated)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const cookieStore = await cookies();
  const isGuest = cookieStore.get("matchsats_guest")?.value === "true";

  if (!session.isLoggedIn && !isGuest) {
    redirect("/login");
  }

  return <>{children}</>;
}
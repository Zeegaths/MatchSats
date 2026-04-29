// app/(authenticated)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Guest mode — allow access without wallet
  // Guest cookie is set client-side so we can't read it here
  // We check the session instead — guests just won't have one

  if (!session.isLoggedIn || !session.pubkey) {
    redirect("/login");
  }

  return <>{children}</>;
}
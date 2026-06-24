import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import NotificationProvider from "@/components/NotificationProvider";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  return <NotificationProvider>{children}</NotificationProvider>;
}

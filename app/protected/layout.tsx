import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <AppSidebar userName={user.name} userEmail={user.email} />
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        {children}
      </div>
      <Toaster />
    </div>
  );
}

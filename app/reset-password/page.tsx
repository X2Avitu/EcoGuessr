import Link from "next/link";
import { redirect } from "next/navigation";
import { resetPasswordAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string; success?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token?.trim();
  if (!token) {
    redirect("/forgot-password");
  }

  const message: Message | undefined = sp.error
    ? { error: sp.error }
    : sp.success
      ? { success: sp.success }
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-6">
      <div className="w-full max-w-md rounded-3xl border border-[#333] bg-[#111]/90 p-10 backdrop-blur-xl">
        <p className="font-dmsans text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          Platz
        </p>
        <h1 className="font-bebas text-5xl text-white">New password</h1>
        <p className="mt-2 text-sm text-gray-400">
          Choose a new password for your account.
        </p>

        <form className="mt-8 space-y-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <Label htmlFor="password" className="text-gray-400">
              New password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 border-[#333] bg-[#1a1a1a] text-white"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-400">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 border-[#333] bg-[#1a1a1a] text-white"
            />
          </div>
          <SubmitButton
            formAction={resetPasswordAction}
            className="w-full bg-primary py-6 font-bebas text-xl text-black hover:bg-white"
          >
            Update password
          </SubmitButton>
          {message && <FormMessage message={message} />}
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/sign-in" className="text-primary hover:text-white">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

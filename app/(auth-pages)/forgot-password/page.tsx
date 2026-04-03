import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ForgotPassword(props: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const message: Message | undefined = searchParams.error
    ? { error: searchParams.error }
    : searchParams.success
      ? { success: searchParams.success }
      : undefined;

  return (
    <main className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[#333] bg-[#111]/90 p-10 backdrop-blur-xl">
        <h1 className="font-bebas text-5xl text-white">Reset password</h1>
        <p className="mt-2 text-sm text-gray-400">
          We&apos;ll email you a link to choose a new password. For local dev without email, check the success message for a
          direct link.
        </p>

        <form className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-400">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="mt-1 border-[#333] bg-[#1a1a1a] text-white"
            />
          </div>
          <SubmitButton
            formAction={forgotPasswordAction}
            className="w-full bg-primary py-6 font-bebas text-xl text-black hover:bg-white"
          >
            Send reset link
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

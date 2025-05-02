import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";


export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
 
  async function signInWithGoogle() {
    "use server";
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://uotdpqawjzssptncplfu.supabase.co/auth/v1/callback`,
      },
    });


    if (error) {
      return encodedRedirect("error", "/sign-in", error.message);
    }


    if (data.url) {
      return redirect(data.url);
    }
  }
 
  return (
    <main className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">□</span>
            </div>
            <span className="font-medium text-lg">Platz</span>
          </div>


          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">Start your journey</p>
              <h1 className="text-2xl font-semibold mt-1">Sign In to Platz</h1>
            </div>


            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    className="pr-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                </div>
              </div>


              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pr-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer">
                    <EyeOff size={16} />
                  </div>
                </div>
              </div>


              <SubmitButton
                pendingText="Signing In..."
                formAction={signInAction}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Sign In
              </SubmitButton>
             
              <FormMessage message={searchParams} />
            </form>


            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">or sign in with</span>
              </div>
            </div>


            <form action={signInWithGoogle}>
              <button type="submit" className="flex items-center justify-center gap-2 py-2 px-6 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 w-full">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm font-medium">Continue with Google</span>
              </button>
            </form>
           
            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account?</span>{" "}
              <Link href="/sign-up" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

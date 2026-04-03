"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";

function SignUpForm() {
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const success = searchParams.get("success");
  const message: Message | undefined = err
    ? { error: err }
    : success
      ? { success: success }
      : undefined;

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#0A0A0A]">
      <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay [background-image:url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />

      <div className="relative z-10 flex flex-1 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl border border-[#333] bg-[#111]/80 p-10 shadow-2xl backdrop-blur-xl"
        >
          <div className="absolute right-10 top-0 h-1 w-24 rounded-b-full bg-primary" />

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 font-dmsans text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Create account
              </p>
              <h1 className="font-bebas text-6xl leading-none text-white">SIGN UP</h1>
            </div>
            <Link href="/" className="group flex items-center">
              <span className="font-bebas text-3xl text-gray-600 transition-colors group-hover:text-white">PLATZ</span>
            </Link>
          </div>

          <form className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <label
                htmlFor="name"
                className="mb-2 block font-dmsans text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Your name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Alex Rivera"
                required
                autoComplete="name"
                className="h-12 rounded-xl border-[#333] bg-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-primary focus:ring-primary"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label
                htmlFor="email"
                className="mb-2 block font-dmsans text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="h-12 rounded-xl border-[#333] bg-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-primary focus:ring-primary"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label
                htmlFor="password"
                className="mb-2 block font-dmsans text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className="h-12 rounded-xl border-[#333] bg-[#1a1a1a] pr-12 text-white placeholder:text-gray-600 focus:border-primary focus:ring-primary"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                  <EyeOff size={18} />
                </div>
              </div>
            </motion.div>

            <p className="text-xs text-gray-500">
              Your account is stored in a local file on the server (<code className="text-gray-400">data/users.json</code>
              ). Do not commit that file; keep your machine secure.
            </p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <SubmitButton
                pendingText="CREATING..."
                formAction={signUpAction}
                className="w-full rounded-xl bg-primary py-6 font-bebas text-2xl text-black shadow-[0_0_20px_rgba(184,255,60,0.2)] transition-all hover:-translate-y-1 hover:bg-white"
              >
                CREATE ACCOUNT
              </SubmitButton>
            </motion.div>

            {message && <FormMessage message={message} />}
          </form>

          <p className="mt-8 text-center font-dmsans text-xs font-bold uppercase tracking-widest text-gray-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary transition-colors hover:text-white">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <SignUpForm />
    </Suspense>
  );
}

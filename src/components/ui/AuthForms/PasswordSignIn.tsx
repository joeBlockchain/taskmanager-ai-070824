"use client";

import Link from "next/link";
import { signInWithPassword } from "@/utils/auth-helpers/server";
import { handleRequest } from "@/utils/auth-helpers/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Input } from "../input";
import { Label } from "../label";
import { Button } from "../button";

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod,
}: PasswordSignInProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(
      e,
      signInWithPassword,
      redirectMethod === "client" ? router : null
    );
    setIsSubmitting(false);
  };

  return (
    <div className="">
      <form
        noValidate={true}
        // className="mb-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              // className="w-full p-3 rounded-md bg-zinc-800"
            />
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/signin/forgot_password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                placeholder="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                // className="w-full p-3 rounded-md bg-zinc-800"
              />{" "}
            </div>
          </div>
          <Button
            // variant="slim"
            type="submit"
            // className="mt-1"
            // loading={isSubmitting}
          >
            Sign in
          </Button>
        </div>
      </form>
      <div className="mt-4 space-y-4">
        {allowEmail && (
          <p>
            <Link href="/signin/email_signin" className="font-light text-sm">
              Sign in with <span className="underline">secure email link</span>
            </Link>
          </p>
        )}
        <p>
          <div className=" text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signin/signup" className="underline">
              Sign up
            </Link>
          </div>
        </p>
      </div>
    </div>
  );
}

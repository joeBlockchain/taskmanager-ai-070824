"use client";

import React from "react";
import Link from "next/link";
import { signUp } from "@/utils/auth-helpers/server";
import { handleRequest } from "@/utils/auth-helpers/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "../label";
import { Input } from "../input";
import { Button } from "../button";

// Define prop type with allowEmail boolean
interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function SignUp({ allowEmail, redirectMethod }: SignUpProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signUp, redirectMethod === "client" ? router : null);
    setIsSubmitting(false);
  };

  return (
    <div className="">
      <form noValidate={true} className="" onSubmit={(e) => handleSubmit(e)}>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              // className="w-full p-3 rounded-md bg-zinc-800"
            />
          </div>
          <Button
            // variant="slim"
            type="submit"
            // className="mt-1"
            // loading={isSubmitting}
          >
            Sign up
          </Button>
        </div>
      </form>
      <div className="mt-6 space-y-4">
        <p>Already have an account?</p>
        <div className="flex flex-col space-y-3">
          <p>
            <Link href="/signin/password_signin" className="font-light text-sm">
              Sign in with <span className="underline">email and password</span>
            </Link>
          </p>
          {allowEmail && (
            <p>
              <Link href="/signin/email_signin" className="font-light text-sm">
                Sign in with{" "}
                <span className="underline">secure email link</span>
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

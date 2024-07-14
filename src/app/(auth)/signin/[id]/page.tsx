import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod,
} from "@/utils/auth-helpers/settings";
import CardSupabase from "@/components/ui/CardSupabase/card-supabase";
import PasswordSignIn from "@/components/ui/AuthForms/PasswordSignIn";
import EmailSignIn from "@/components/ui/AuthForms/EmailSignIn";
import Separator from "@/components/ui/AuthForms/Separator";
import OauthSignIn from "@/components/ui/AuthForms/OauthSignIn";
import ForgotPassword from "@/components/ui/AuthForms/ForgotPassword";
import UpdatePassword from "@/components/ui/AuthForms/UpdatePassword";
import SignUp from "@/components/ui/AuthForms/Signup";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import Logo from "@/components/icons/Logo";

export default async function SignIn({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { disable_button: boolean };
}) {
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Declare 'viewProp' and initialize with the default value
  let viewProp: string;

  // Assign url id to 'viewProp' if it's a valid string and ViewTypes includes it
  if (typeof params.id === "string" && viewTypes.includes(params.id)) {
    viewProp = params.id;
  } else {
    const preferredSignInView =
      cookies().get("preferredSignInView")?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && viewProp !== "update_password") {
    return redirect("/");
  } else if (!user && viewProp === "update_password") {
    return redirect("/signin");
  }

  return (
    <div className="flex flx-col justify-center height-screen-helper">
      <div className="flex flex-col justify-between p-3 m-auto w-[26rem] ">
        <div className="flex justify-center py-8 ">
          <Link
            href="/"
            className="flex flex-row items-center gap-4"
            prefetch={false}
          >
            <MessagesSquare className="h-8 w-8" />
            <Logo className="text-3xl font-medium" />
          </Link>
        </div>
        <CardSupabase
          title={
            viewProp === "forgot_password"
              ? "Reset Password"
              : viewProp === "update_password"
              ? "Update Password"
              : viewProp === "signup"
              ? "Sign Up"
              : viewProp === "email_signin"
              ? "Email Sign-In Link"
              : "Sign In"
          }
          description={
            viewProp === "forgot_password"
              ? "We will send instructions to the email address below to reset your password."
              : viewProp === "update_password"
              ? "Update Password"
              : viewProp === "signup"
              ? "Enter your information to create an account                  "
              : viewProp === "email_signin"
              ? "Well email you a link for a password-free sign in."
              : "Enter your email and password below to sign in to your account."
          }
        >
          {viewProp === "password_signin" && (
            <PasswordSignIn
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
            />
          )}
          {viewProp === "email_signin" && (
            <EmailSignIn
              allowPassword={allowPassword}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
            />
          )}
          {viewProp === "forgot_password" && (
            <ForgotPassword
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
            />
          )}
          {viewProp === "update_password" && (
            <UpdatePassword redirectMethod={redirectMethod} />
          )}
          {viewProp === "signup" && (
            <SignUp allowEmail={allowEmail} redirectMethod={redirectMethod} />
          )}
          {/* {viewProp !== 'update_password' &&
            viewProp !== 'signup' && */}
          {/* allowOauth && ( */}
          <div className="mt-4 space-y-4">
            <Separator text="or" />
            <OauthSignIn />
          </div>
          {/* )} */}
        </CardSupabase>
      </div>
    </div>
  );
}

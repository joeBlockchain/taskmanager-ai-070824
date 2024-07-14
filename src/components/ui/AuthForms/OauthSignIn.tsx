"use client";

import { signInWithOAuth } from "@/utils/auth-helpers/client";
import { type Provider } from "@supabase/supabase-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/icons/Google";
import GitHub from "@/components/icons/GitHub";

type OAuthProviders = {
  name: Provider;
  displayName: string;
  icon: JSX.Element;
};

export default function OauthSignIn() {
  const oAuthProviders: OAuthProviders[] = [
    {
      name: "google",
      displayName: "Google",
      icon: <GoogleIcon />,
    },
    {
      name: "github",
      displayName: "GitHub",
      icon: <GitHub />,
    },
    // {
    //   name: 'azure',
    //   displayName: 'Microsoft',
    //   icon: <MicrosoftIcon />
    // }
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await signInWithOAuth(e);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-2">
      {oAuthProviders.map((provider) => (
        <form
          key={provider.name}
          className="pb-3"
          onSubmit={(e) => handleSubmit(e)}
        >
          <input type="hidden" name="provider" value={provider.name} />
          {/* <ButtonSupabase
            variant="slim"
            type="submit"
            className="w-full"
            loading={isSubmitting}
          >
            <span className="mr-2">{provider.icon}</span>
            <span>{provider.displayName}</span>
          </ButtonSupabase> */}
          <Button
            variant="outline"
            size="lg"
            type="submit"
            className="w-full"
            // loading={isSubmitting}
          >
            <div className="mr-4">{provider.icon}</div>
            <div>Sign in with {provider.displayName}</div>
          </Button>
        </form>
      ))}
    </div>
  );
}

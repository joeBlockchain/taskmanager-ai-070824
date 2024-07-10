// import { createClient } from "@/utils/supabase/server";

// export default async function Notes() {
//   const supabase = createClient();
//   const { data: notes } = await supabase.from("notes").select();

//   console.log(notes);

//   return <pre>{JSON.stringify(notes, null, 2)}</pre>;
// }

"use client";
import { createClient } from "@supabase/supabase-js";
import { useRef, useState } from "react";

// Add clerk to Window to avoid type errors
declare global {
  interface Window {
    Clerk: any;
  }
}

function createClerkSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Get the Supabase token with a custom fetch method
        fetch: async (url, options = {}) => {
          const clerkToken = await window.Clerk.session?.getToken({
            template: "supabase",
          });

          // Construct fetch headers
          const headers = new Headers(options?.headers);
          headers.set("Authorization", `Bearer ${clerkToken}`);

          // Now call the default fetch
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}

const client = createClerkSupabaseClient();

export default function Supabase() {
  const [addresses, setAddresses] = useState<any>();
  const listAddresses = async () => {
    // Fetches all addresses scoped to the user
    // Replace "Addresses" with your table name
    const { data, error } = await client.from("notes").select();
    if (!error) setAddresses(data);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const sendAddress = async () => {
    if (!inputRef.current?.value) return;
    await client.from("notes").insert({
      // Replace content with whatever field you want
      title: inputRef.current?.value,
    });
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <input onSubmit={sendAddress} type="text" ref={inputRef} />
        <button onClick={sendAddress}>Send Address</button>
        <button onClick={listAddresses}>Fetch Addresses</button>
      </div>
      <h2>Addresses</h2>
      {!addresses ? (
        <p>No addresses</p>
      ) : (
        <ul>
          {addresses.map((address: any) => (
            <li key={address.id}>{address.title}</li>
          ))}
        </ul>
      )}
    </>
  );
}

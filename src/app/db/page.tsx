"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { createClerkSupabaseClient } from "@/utils/supabase/clerk-supabase-client";

const client = createClerkSupabaseClient();

export default function Supabase() {
  const [notes, setNotes] = useState<any>();
  const listNotes = async () => {
    // Fetches all notes scoped to the user
    const { data, error } = await client.from("notes").select();
    if (!error) setNotes(data);
    if (error) console.error("Error fetching notes:", error);
    console.log("Notes:", notes);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const sendNotes = async () => {
    if (!inputRef.current?.value) return;
    await client.from("notes").insert({
      title: inputRef.current?.value,
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-[20rem] space-y-4">
        <Input onSubmit={sendNotes} type="text" ref={inputRef} />
        <div className="flex flex-row space-x-4">
          <Button onClick={sendNotes}>Send Notes</Button>
          <Button onClick={listNotes}>Fetch Notes</Button>
        </div>
      </div>
      <h2>Notes</h2>
      {!notes ? (
        <p>No notes</p>
      ) : (
        <ul>
          {notes.map((note: any) => (
            <li key={note.id}>{note.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

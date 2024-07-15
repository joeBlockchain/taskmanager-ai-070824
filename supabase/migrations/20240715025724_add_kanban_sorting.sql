-- Add the api_cost_chat column to the profiles table
ALTER TABLE profiles
ADD COLUMN api_cost_chat NUMERIC(20, 8) DEFAULT 0.0;

-- Update the handle_new_user function to initialize the new column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, api_cost_chat)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 0.0);
  RETURN new;
end;
$$ LANGUAGE plpgsql SECURITY DEFINER;
// @ts-nocheck
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || "");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const { email } = await req.json();
    if (!email) return new Response("Email required", { status: 400 });
    const { data, error } = await adminClient.auth.admin.getUserByEmail(email);
    if (error && error.message && !error.message.includes("User not found")) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }
    const exists = !!data?.user;
    return new Response(JSON.stringify({ exists }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
});


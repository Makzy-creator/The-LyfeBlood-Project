import { createClient } from "@supabase/supabase-js";

const getEnv = (key) => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  return import.meta.env[key];
};

const supabaseUrl = getEnv("VITE_SUPABASE_URL") ?? getEnv("SUPABASE_URL") ?? getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY") ?? getEnv("SUPABASE_ANON_KEY") ?? getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

let cachedClient = null;

function getClient() {
  if (cachedClient) return cachedClient;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase client configuration is missing. Please ensure VITE_SUPABASE_URL (or SUPABASE_URL) and VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY) are set in the environment."
    );
  }
  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return cachedClient;
}

export const supabase = new Proxy({}, {
  get(target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
  set(target, prop, value) {
    return Reflect.set(getClient(), prop, value);
  }
});


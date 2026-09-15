const required = ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] as const;
export function cloudConfigured(){ return required.every((key)=>Boolean(process.env[key]?.trim())); }
export function requireCloudEnv(){ const missing=required.filter((key)=>!process.env[key]?.trim()); if(missing.length) throw new Error(`Missing cloud environment: ${missing.join(', ')}`); return { supabaseUrl:process.env.NEXT_PUBLIC_SUPABASE_URL!, publishableKey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! }; }

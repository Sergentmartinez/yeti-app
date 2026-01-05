# Supabase (V2)

v0.5.2 tourne en **localStorage** pour itérer vite.
Pour passer en Supabase :
1) Crée un projet Supabase
2) Exécute `supabase/schema.sql`
3) Mets `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`
4) Remplace progressivement `lib/projects/local.ts` par un repository Supabase.

Important : la logique d’entitlements reste **par projet** (`purchases.project_id`).

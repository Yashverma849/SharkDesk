/**
 * Site + tab + Apple touch logo (Supabase Storage `logo` bucket by default).
 * Override via `NEXT_PUBLIC_LOGO_URL`. Wired in `src/app/layout.tsx` metadata.
 */
export const SHARKDESK_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ??
  "https://awwyhbvbuenlilwohxhm.supabase.co/storage/v1/object/public/logo/SharkDesk.png";

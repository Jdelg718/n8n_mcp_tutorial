import { createClient } from '@/lib/supabase/client';

export function getPublicUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from('meal-images')
    .getPublicUrl(path);
  return data.publicUrl;
}

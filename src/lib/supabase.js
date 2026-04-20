import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-aqui.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-aqui';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Variável VITE_SUPABASE_URL não encontrada! Verifique o arquivo .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

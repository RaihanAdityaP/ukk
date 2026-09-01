import { SupabaseClient } from '@supabase/supabase-js'

// "abstract class" artinya class ini gak boleh dipakai langsung (gak boleh di new BaseService()).
// Class ini cuma dipakai sebagai "cetakan dasar" buat class lain (ProductService, CartService, dst)
// yang nantinya "extends" (mewarisi) class ini.
export abstract class BaseService {
  // "protected" artinya: cuma class ini dan class turunannya yang boleh pakai this.supabase.
  // Kode di luar (misal di route.ts) gak bisa akses service.supabase langsung.
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
}

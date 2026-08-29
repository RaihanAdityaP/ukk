import { createServerSupabase } from '@/lib/supabase-server'
import CartClient from '@/components/CartClient'

export default async function CartPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: items } = user
    ? await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', user.id)
    : { data: [] }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-navy mb-5">Keranjang Belanja</h1>
      <CartClient initialItems={items ?? []} />
    </main>
  )
}

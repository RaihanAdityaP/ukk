import CartClient from '@/components/CartClient'

export default function CartPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-navy mb-5">Keranjang Belanja</h1>
      <CartClient />
    </main>
  )
}

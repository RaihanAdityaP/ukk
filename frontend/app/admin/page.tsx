'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getStoredUser, getToken } from '@/lib/api'
import {
  Package,
  ShoppingBag,
  Activity,
  Plus,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    if (!getToken()) {
      router.push('/login?redirect=/admin')
      return
    }
    const user = getStoredUser()
    if (user && user.role !== 'admin') {
      router.push('/')
      return
    }

    async function loadDashboardData() {
      try {
        const [prodData, orderData, logData] = await Promise.all([
          api.products.list(),
          api.orders.list(),
          api.logs.list(5),
        ])
        setProducts(prodData || [])
        setOrders(orderData || [])
        setLogs(logData || [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  // Calculations
  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'done' || o.status === 'shipped')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const paidOrders = orders.filter((o) => o.status === 'paid').length
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length
  const doneOrders = orders.filter((o) => o.status === 'done').length

  const lowStockProducts = products.filter((p) => p.stock <= 5)

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12 text-center text-ink/40">
        <Clock className="w-10 h-10 mx-auto mb-3 animate-pulse text-navy/40" />
        <p className="text-sm font-medium">Memuat Dashboard Admin...</p>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brick bg-brick/10 px-3 py-1 rounded-full">
            Admin Workspace
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-1">
            Dashboard Pengelola
          </h1>
          <p className="text-sm text-ink/60 mt-0.5">
            Ringkasan performa penjualan, stok produk, dan transaksi terbaru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-navy hover:bg-navy/90 px-4 py-2.5 rounded-xl shadow-sm transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Tambah Produk
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Pendapatan */}
        <div className="bg-white rounded-2xl p-5 border border-stone/60 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
              Total Omset
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Dari pesanan Lunas & Selesai
          </p>
        </div>

        {/* Total Pesanan */}
        <div className="bg-white rounded-2xl p-5 border border-stone/60 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy">{orders.length} Transaksi</p>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {pendingOrders} Menunggu Pembayaran
          </p>
        </div>

        {/* Total Produk */}
        <div className="bg-white rounded-2xl p-5 border border-stone/60 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
              Katalog Produk
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy">{products.length} Item</p>
          <p className="text-xs text-ink/50 font-medium mt-1">
            Aktif di katalog toko
          </p>
        </div>

        {/* Peringatan Stok Rendah */}
        <div className="bg-white rounded-2xl p-5 border border-stone/60 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
              Peringatan Stok
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy">{lowStockProducts.length} Produk</p>
          <p className="text-xs text-brick font-medium mt-1">Stok &le; 5 barang lagi</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <Link
          href="/admin/products"
          className="group bg-white p-5 rounded-2xl border border-stone/60 hover:border-navy/40 hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base group-hover:text-brick transition">
                Kelola Produk
              </h3>
              <p className="text-xs text-ink/50">Tambah, edit & hapus barang</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-ink/30 group-hover:text-navy group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/admin/orders"
          className="group bg-white p-5 rounded-2xl border border-stone/60 hover:border-navy/40 hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition relative">
              <ShoppingBag className="w-6 h-6" />
              {pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brick text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-navy text-base group-hover:text-brick transition">
                Kelola Pesanan
              </h3>
              <p className="text-xs text-ink/50">Verifikasi & status pengiriman</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-ink/30 group-hover:text-navy group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/admin/logs"
          className="group bg-white p-5 rounded-2xl border border-stone/60 hover:border-navy/40 hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base group-hover:text-brick transition">
                Audit Log Sistem
              </h3>
              <p className="text-xs text-ink/50">Rekam Jejak & Riwayat Aksi</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-ink/30 group-hover:text-navy group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* Main Grid: Low Stock Alert & Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Low Stock Warning Box */}
        <div className="bg-white rounded-2xl p-6 border border-stone/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-lg text-navy flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Stok Menipis (&le; 5)
            </h2>
            <span className="text-xs font-semibold text-ink/40">
              {lowStockProducts.length} barang
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-emerald-600 bg-emerald-50 p-4 rounded-xl font-medium text-center">
              ✓ Semua stok produk dalam kondisi aman.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone/20 hover:bg-stone/30 transition"
                >
                  <div className="truncate pr-2">
                    <p className="text-sm font-bold text-navy truncate">{p.name}</p>
                    <p className="text-xs text-ink/50">
                      Sisa Stok: <span className="font-bold text-brick">{p.stock} pcs</span>
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-xs font-bold text-navy hover:text-brick bg-white px-2.5 py-1.5 rounded-lg border border-stone/50 shrink-0 transition"
                  >
                    Tambah Stok
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-lg text-navy">Pesanan Terbaru</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-brick hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-ink/40 text-sm">Belum ada transaksi pesanan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-ink">
                <thead>
                  <tr className="border-b border-stone/40 text-ink/50 uppercase font-semibold">
                    <th className="py-2.5 px-3">Kode Order</th>
                    <th className="py-2.5 px-3">Pembeli</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/20">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-stone/10 transition">
                      <td className="py-3 px-3 font-mono font-bold text-navy">{o.order_code}</td>
                      <td className="py-3 px-3 font-medium">{o.customer_name}</td>
                      <td className="py-3 px-3 font-bold text-navy">
                        Rp {o.total?.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3">
                        {o.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {o.status === 'paid' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </span>
                        )}
                        {o.status === 'shipped' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            <Truck className="w-3 h-3" /> Shipped
                          </span>
                        )}
                        {o.status === 'done' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Done
                          </span>
                        )}
                        {o.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

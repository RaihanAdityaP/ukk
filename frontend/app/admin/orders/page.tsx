'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getStoredUser } from '@/lib/api'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Eye,
  X,
  RefreshCw,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  Search,
  FileSpreadsheet,
} from 'lucide-react'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  function showToast(text: string, type: 'success' | 'error' = 'success') {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function loadOrders() {
    try {
      const data = await api.orders.list()
      setOrders(data || [])
    } catch (err) {
      console.error('Gagal memuat pesanan', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const user = getStoredUser()
    if (!user) {
      router.push('/login?redirect=/admin/orders')
      return
    }
    if (user.role !== 'admin') {
      router.push('/')
      return
    }

    loadOrders()
  }, [router])

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    const targetOrder = orders.find((o) => o.id === orderId)
    const orderCode = targetOrder ? targetOrder.order_code : `#${orderId.slice(0, 8)}`

    try {
      await api.orders.updateStatus(orderId, newStatus)
      await api.logs.record(
        'UPDATE_ORDER_STATUS',
        `Admin mengubah status pesanan ${orderCode} menjadi ${newStatus.toUpperCase()}`
      )
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }))
      }
      showToast(`Status pesanan ${orderCode} berhasil diubah ke ${newStatus.toUpperCase()}`, 'success')
    } catch (err: any) {
      showToast(`Gagal memperbarui status: ${err.message}`, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // EXPORT LAPORAN EXCEL (.XLS) TERSTRUKTUR DENGAN 10 KOLOM LENGKAP & TOTAL OMSET
  function exportToExcel() {
    if (orders.length === 0) return alert('Tidak ada data pesanan untuk diexport.')

    const dateToday = new Date().toISOString().slice(0, 10)
    const totalOmset = orders
      .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'done')
      .reduce((sum, o) => sum + (o.total || 0), 0)

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Laporan Penjualan</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; }
          th { background-color: #1e293b; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #94a3b8; text-align: left; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 11pt; vertical-align: top; }
          .title { font-size: 16pt; font-weight: bold; color: #0f172a; margin-bottom: 5px; }
          .summary { background-color: #f8fafc; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="title">LAPORAN REKAPITULASI PENJUALAN - WIJAYA LIVING & ELEKTRONIK</div>
        <div>Dicetak pada: ${new Date().toLocaleString('id-ID')} | Total Transaksi: ${orders.length}</div>
        <br/>
        <table>
          <colgroup>
            <col style="width: 50px;" />
            <col style="width: 140px;" />
            <col style="width: 180px;" />
            <col style="width: 200px;" />
            <col style="width: 150px;" />
            <col style="width: 300px;" />
            <col style="width: 320px;" />
            <col style="width: 120px;" />
            <col style="width: 220px;" />
            <col style="width: 140px;" />
          </colgroup>
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">No</th>
              <th style="width: 140px;">Kode Order</th>
              <th style="width: 180px;">Tanggal & Waktu</th>
              <th style="width: 200px;">Nama Pembeli</th>
              <th style="width: 150px;">No. WhatsApp</th>
              <th style="width: 300px;">Alamat Pengiriman</th>
              <th style="width: 320px;">Rincian Produk Dipesan</th>
              <th style="width: 120px; text-align: center;">Metode</th>
              <th style="width: 220px; text-align: right;">Total Belanja</th>
              <th style="width: 140px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
    `

    orders.forEach((o, index) => {
      const itemsList = o.order_items && o.order_items.length > 0
        ? o.order_items.map((it: any) => `${it.product_name} (${it.quantity}x)`).join('; ')
        : 'Barang Wijaya Living'

      const cleanAddress = (o.customer_address || '').replace(/[\r\n]+/g, ' ').trim()
      const formattedDate = new Date(o.created_at).toLocaleString('id-ID')

      tableHtml += `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td><b>${o.order_code}</b></td>
          <td>${formattedDate}</td>
          <td>${o.customer_name}</td>
          <td style="mso-number-format:'\\@';">${o.customer_phone}</td>
          <td>${cleanAddress}</td>
          <td>${itemsList}</td>
          <td style="text-align: center; text-transform: uppercase;">${o.payment_method}</td>
          <td style="text-align: right; width: 220px; white-space: nowrap;">Rp ${(o.total || 0).toLocaleString('id-ID')}</td>
          <td style="text-align: center; font-weight: bold;">${o.status.toUpperCase()}</td>
        </tr>
      `
    })

    tableHtml += `
          <tr class="summary">
            <td colspan="8" style="text-align: right; padding: 12px;"><b>TOTAL PENDAPATAN (LUNAS / SELESAI):</b></td>
            <td style="text-align: right; font-size: 12pt; color: #15803d; padding: 12px; width: 220px; white-space: nowrap;"><b>Rp ${totalOmset.toLocaleString('id-ID')}</b></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      </body>
      </html>
    `

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Laporan_Penjualan_Wijaya_${dateToday}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function renderStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Menunggu Bayar
          </span>
        )
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Lunas (Paid)
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            Dikirim (Shipped)
          </span>
        )
      case 'done':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap">
            <PackageCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            Selesai (Done)
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap">
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            Dibatalkan
          </span>
        )
      default:
        return <span className="text-xs text-ink/50 whitespace-nowrap">{status}</span>
    }
  }

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' ? true : o.status === statusFilter
      const matchQuery =
        searchQuery === ''
          ? true
          : o.order_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer_phone?.includes(searchQuery)
      return matchStatus && matchQuery
    })
  }, [orders, statusFilter, searchQuery])

  // Counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      paid: orders.filter((o) => o.status === 'paid').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      done: orders.filter((o) => o.status === 'done').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }
  }, [orders])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Top */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-ink/50 hover:text-navy transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-xs text-ink/30">|</span>
            <span className="text-xs font-semibold text-brick">Pengelolaan Transaksi</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy">Manajemen Pesanan</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Export Laporan Excel (.XLS)
          </button>

          <button
            onClick={() => {
              setRefreshing(true)
              loadOrders()
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold text-navy bg-white border border-stone/60 hover:bg-stone/20 px-3.5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Panduan Mengubah Status Pesanan */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 leading-relaxed">
          <p className="font-bold text-sm mb-0.5">Panduan Mengubah Status Pesanan:</p>
          <p className="text-blue-900">
            Pilih status baru pada kolom <strong>Ubah Status (Aksi)</strong> di tabel (misal: pilih <em>Lunas</em>, <em>Dikirim</em>, atau <em>Selesai</em>) untuk memperbarui status pesanan secara langsung.
          </p>
        </div>
      </div>

      {/* Filter & Live Search Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-stone/60 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'Semua', count: counts.all },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'paid', label: 'Lunas', count: counts.paid },
            { id: 'shipped', label: 'Dikirim', count: counts.shipped },
            { id: 'done', label: 'Selesai', count: counts.done },
            { id: 'cancelled', label: 'Batal', count: counts.cancelled },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                statusFilter === f.id
                  ? 'bg-navy text-white shadow-xs'
                  : 'text-ink/60 hover:bg-stone/20 hover:text-navy'
              }`}
            >
              {f.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === f.id
                    ? 'bg-white/20 text-white'
                    : 'bg-stone/30 text-ink/60'
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode order, pembeli..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone/10 border border-stone/40 rounded-xl focus:bg-white focus:border-navy outline-none transition"
          />
        </div>
      </div>

      {/* Orders Table - 100% Rapi, Presisi & Sejajar */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-ink/40 border border-stone/50">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse text-navy/40" />
          <p className="text-sm">Memuat daftar pesanan...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-ink/40 border border-dashed border-stone">
          <p className="text-base font-bold text-navy mb-1">Tidak Ada Pesanan</p>
          <p className="text-xs text-ink/50">Belum ada pesanan yang sesuai dengan filter atau pencarian Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink whitespace-nowrap">
              <thead>
                <tr className="bg-stone/25 border-b border-stone/40 text-ink/60 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-44">Kode & Tanggal</th>
                  <th className="py-3.5 px-4 w-48">Pembeli & Kontak</th>
                  <th className="py-3.5 px-4 w-24 text-center">Metode</th>
                  <th className="py-3.5 px-4 w-32">Total Belanja</th>
                  <th className="py-3.5 px-4 w-44">Status Saat Ini</th>
                  <th className="py-3.5 px-4 w-48 text-center">Ubah Status (Aksi)</th>
                  <th className="py-3.5 px-4 w-24 text-center">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.created_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })

                  const isUpdating = updatingId === order.id

                  return (
                    <tr key={order.id} className="hover:bg-stone/10 transition">
                      {/* 1. Kode & Tanggal */}
                      <td className="py-4 px-4 align-middle">
                        <p className="font-mono font-bold text-navy text-sm">{order.order_code}</p>
                        <p className="text-[11px] text-ink/40 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 shrink-0" /> {dateStr}
                        </p>
                      </td>

                      {/* 2. Pembeli & Kontak */}
                      <td className="py-4 px-4 align-middle">
                        <p className="font-bold text-navy text-xs">{order.customer_name}</p>
                        <p className="text-[11px] text-ink/50 font-mono mt-0.5">{order.customer_phone}</p>
                      </td>

                      {/* 3. Metode Bayar */}
                      <td className="py-4 px-4 align-middle text-center">
                        <span className="inline-block bg-stone/20 font-semibold text-navy uppercase px-2.5 py-0.5 rounded text-[10px]">
                          {order.payment_method}
                        </span>
                      </td>

                      {/* 4. Total Belanja */}
                      <td className="py-4 px-4 align-middle font-bold text-navy text-xs">
                        Rp {order.total?.toLocaleString('id-ID')}
                      </td>

                      {/* 5. Status Saat Ini */}
                      <td className="py-4 px-4 align-middle">
                        {renderStatusBadge(order.status)}
                      </td>

                      {/* 6. UBAH STATUS (AKSI LANGSUNG) */}
                      <td className="py-4 px-4 align-middle text-center">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full text-xs font-semibold rounded-lg px-3 py-1.5 border border-stone/50 bg-white hover:border-navy text-navy transition cursor-pointer outline-none shadow-xs disabled:opacity-50"
                        >
                          <option value="pending">Menunggu Bayar (Pending)</option>
                          <option value="paid">Lunas (Paid)</option>
                          <option value="shipped">Dikirim (Shipped)</option>
                          <option value="done">Selesai (Done)</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>

                      {/* 7. Tombol Rincian / Detail */}
                      <td className="py-4 px-4 align-middle text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          title="Lihat Rincian Pesanan"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-navy bg-stone/20 hover:bg-stone/40 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Order */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-stone shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-ink/40 hover:text-navy p-1 rounded-lg hover:bg-stone/20 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-navy" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brick">
                Detail Transaksi #{selectedOrder.order_code}
              </span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-navy mb-4">
              Rincian Informasi Pesanan
            </h2>

            {/* Customer Details */}
            <div className="bg-stone/20 rounded-xl p-4 space-y-2 mb-4 text-xs text-ink">
              <p className="flex items-center gap-2">
                <span className="font-semibold w-24">Nama Pembeli:</span>
                <span className="font-bold text-navy">{selectedOrder.customer_name}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-ink/40" />
                <span className="font-semibold w-20">Telepon:</span>
                <span className="font-mono">{selectedOrder.customer_phone}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-ink/40 mt-0.5 shrink-0" />
                <span className="font-semibold w-20">Alamat:</span>
                <span className="flex-1 leading-relaxed">{selectedOrder.customer_address}</span>
              </p>
              <p className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-ink/40" />
                <span className="font-semibold w-20">Pembayaran:</span>
                <span className="font-bold uppercase text-navy">{selectedOrder.payment_method}</span>
              </p>
            </div>

            {/* Status Current & Status Switcher Dropdown in Modal */}
            <div className="p-3.5 rounded-xl bg-stone/10 border border-stone/30 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink/60">Status Saat Ini:</span>
                <div>{renderStatusBadge(selectedOrder.status)}</div>
              </div>
              <div className="pt-2 border-t border-stone/20 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink/60">Ubah Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-stone/50 bg-white text-navy outline-none shadow-xs"
                >
                  <option value="pending">Menunggu Bayar (Pending)</option>
                  <option value="paid">Lunas (Paid)</option>
                  <option value="shipped">Dikirim (Shipped)</option>
                  <option value="done">Selesai (Done)</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Ordered Items List */}
            <h3 className="font-bold text-navy text-xs uppercase tracking-wider mb-2">
              Daftar Barang Dipesan
            </h3>
            <div className="max-h-48 overflow-y-auto divide-y divide-stone/20 border border-stone/40 rounded-xl px-3 mb-4 text-xs">
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                selectedOrder.order_items.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-navy">{item.product_name}</p>
                      <p className="text-[11px] text-ink/50">
                        {item.quantity} pcs x Rp {item.price?.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-bold text-navy">
                      Rp {(item.quantity * item.price)?.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-center text-ink/40">Tidak ada rincian barang spesifik.</p>
              )}
            </div>

            {/* Total Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone/40">
              <span className="text-xs font-semibold text-ink/60">Total Pembayaran</span>
              <span className="text-xl font-bold text-navy">
                Rp {selectedOrder.total?.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : 'bg-rose-800 text-white border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-300" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </main>
  )
}

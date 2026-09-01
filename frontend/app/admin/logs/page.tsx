'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getStoredUser, getToken } from '@/lib/api'
import { ArrowLeft, Clock, RefreshCw, Shield, User, Activity, Package, ShoppingBag, LogIn } from 'lucide-react'

export default function AdminLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadLogs() {
    try {
      const data = await api.logs.list(100)
      setLogs(data)
    } catch (err) {
      console.error('Failed to load logs', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push('/login?redirect=/admin/logs')
      return
    }
    const user = getStoredUser()
    if (user && user.role !== 'admin') {
      router.push('/')
      return
    }

    loadLogs()
  }, [router])

  function handleRefresh() {
    setRefreshing(true)
    loadLogs()
  }

  function getActionBadge(action: string) {
    switch (action) {
      case 'CREATE_PRODUCT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            <Package className="w-3 h-3" /> Tambah Produk
          </span>
        )
      case 'UPDATE_PRODUCT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
            <Package className="w-3 h-3" /> Edit Produk
          </span>
        )
      case 'DELETE_PRODUCT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
            <Package className="w-3 h-3" /> Hapus Produk
          </span>
        )
      case 'CHECKOUT_ORDER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
            <ShoppingBag className="w-3 h-3" /> Checkout
          </span>
        )
      case 'UPDATE_ORDER_STATUS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
            <ShoppingBag className="w-3 h-3" /> Status Order
          </span>
        )
      case 'USER_LOGIN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-stone/50 text-ink/70 px-2.5 py-0.5 rounded-full">
            <LogIn className="w-3 h-3" /> Login
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-stone/40 text-ink/60 px-2.5 py-0.5 rounded-full">
            <Activity className="w-3 h-3" /> {action}
          </span>
        )
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/products" className="text-xs text-ink/50 hover:text-navy transition flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Kelola Produk
            </Link>
            <span className="text-xs text-ink/30">|</span>
            <span className="text-xs font-semibold text-brick">Admin Audit Log</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy">Log Aktivitas Sistem</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="text-sm font-medium text-ink/70 hover:text-navy px-3 py-2 rounded-lg border border-stone bg-white transition"
          >
            Daftar Produk
          </Link>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm font-medium text-navy px-3 py-2 rounded-lg border border-stone bg-white hover:bg-stone/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-ink/40">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse text-navy/40" />
          <p className="text-sm">Memuat riwayat log...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-ink/40">
          <Activity className="w-8 h-8 mx-auto mb-2 text-stone" />
          <p className="text-sm">Belum ada catatan aktivitas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const date = new Date(log.created_at)
            const formattedDate = date.toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })

            return (
              <div key={log.id} className="bg-white rounded-xl p-4 transition hover:shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="text-xs font-medium text-ink/50 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {log.profiles?.full_name ? (
                        <span>
                          {log.profiles.full_name}{' '}
                          <span className="text-[10px] text-ink/40">({log.profiles.role})</span>
                        </span>
                      ) : (
                        <span>Sistem / Pengelola</span>
                      )}
                    </span>
                  </div>

                  <span className="text-xs text-ink/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formattedDate}
                  </span>
                </div>

                <p className="text-sm text-ink leading-relaxed font-medium">{log.description}</p>

                {log.ip_address && (
                  <p className="text-[11px] text-ink/30 mt-1 font-mono">IP: {log.ip_address}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

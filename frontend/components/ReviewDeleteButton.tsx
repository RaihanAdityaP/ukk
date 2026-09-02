'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, getStoredUser } from '@/lib/api'
import { Trash2, Loader2 } from 'lucide-react'

export default function ReviewDeleteButton({
  reviewId,
  authorId,
  onDeleted,
}: {
  reviewId: string | number
  authorId?: string | number | null
  onDeleted?: () => void
}) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setCurrentUser(getStoredUser())

    const handleAuthChange = () => {
      setCurrentUser(getStoredUser())
    }

    window.addEventListener('auth-state-changed', handleAuthChange)
    return () => window.removeEventListener('auth-state-changed', handleAuthChange)
  }, [])

  if (!currentUser) return null

  const isAuthor = authorId != null && String(currentUser.id) === String(authorId)
  const isAdmin = currentUser.role === 'admin'

  // Hanya tampilkan jika user adalah pemilik ulasan itu sendiri ATAU admin
  if (!isAuthor && !isAdmin) {
    return null
  }

  async function handleDelete() {
    const confirmText = isAdmin && !isAuthor
      ? 'Hapus ulasan pembeli ini sebagai Admin?'
      : 'Apakah Anda yakin ingin menghapus ulasan Anda?'

    if (!confirm(confirmText)) return
    setDeleting(true)

    try {
      await api.reviews.delete(reviewId)
      if (onDeleted) {
        onDeleted()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus ulasan.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-1 rounded text-ink/30 hover:text-brick hover:bg-brick/10 transition disabled:opacity-40"
      title={isAdmin && !isAuthor ? 'Hapus ulasan (Admin)' : 'Hapus ulasan saya'}
      aria-label="Hapus ulasan"
    >
      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brick" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  )
}

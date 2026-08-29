'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'

export default function ReviewDeleteButton({ reviewId }: { reviewId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Hapus ulasan ini?')) return
    setDeleting(true)

    await supabase.from('reviews').delete().eq('id', reviewId)

    setDeleting(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-ink/30 hover:text-brick transition disabled:opacity-40"
      aria-label="Hapus ulasan"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}

import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata = {
  title: 'Wijaya Living & Elektronik',
  description: 'Belanja elektronik dan kebutuhan rumah tangga terpercaya sejak 2016.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-paper text-ink">
        <NavBar />
        {children}
      </body>
    </html>
  )
}

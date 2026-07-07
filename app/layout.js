import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata = {
  title: 'Nobre Consultas — Plataforma Premium',
  description: 'Consulte placa, CPF, CNPJ ou RENAVAM em uma única plataforma.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-background text-foreground min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}

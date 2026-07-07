'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import AuthShell from '@/components/nobre/AuthShell'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar')
      toast({ title: `Bem-vindo, ${data.user.name.split(' ')[0]}!`, description: 'Login realizado com sucesso.' })
      router.push('/')
      router.refresh()
    } catch (err) {
      toast({ title: 'Não foi possível entrar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Entrar na sua conta"
      subtitle="Acesse o painel Nobre Consultas."
      footer={<>Não tem uma conta? <Link href="/cadastro" className="text-primary hover:underline font-semibold">Cadastre-se</Link></>}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="voce@nobreconsultas.com"
              className="pl-10 h-11 bg-card border-border focus-visible:ring-primary/40" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Senha</Label>
            <button type="button" className="text-[11px] text-muted-foreground hover:text-primary">Esqueci a senha</button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10 h-11 bg-card border-border focus-visible:ring-primary/40" />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading}
          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gold-glow">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</> : <>Entrar <ArrowRight className="w-4 h-4 ml-1" /></>}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          Ao continuar, você concorda com nossos <span className="underline">Termos</span> e <span className="underline">Política de Privacidade</span>.
        </p>
      </form>
    </AuthShell>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import AuthShell from '@/components/nobre/AuthShell'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar')
      toast({
        title: 'Conta criada com sucesso!',
        description: data.user.role === 'admin'
          ? 'Você é o primeiro usuário e foi promovido a admin.'
          : 'Bem-vindo à Nobre Consultas.'
      })
      router.push('/')
      router.refresh()
    } catch (err) {
      toast({ title: 'Não foi possível cadastrar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const rules = [
    { ok: password.length >= 6, label: 'Pelo menos 6 caracteres' },
    { ok: /[A-Z]/.test(password) || /[0-9]/.test(password), label: 'Uma maiúscula ou número' },
  ]

  return (
    <AuthShell
      title="Crie sua conta"
      subtitle="Comece a consultar em segundos."
      footer={<>Já tem conta? <Link href="/login" className="text-primary hover:underline font-semibold">Entrar</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Nome completo</Label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" type="text" required autoComplete="name"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Francisco Nobre"
              className="pl-10 h-11 bg-card border-border focus-visible:ring-primary/40" />
          </div>
        </div>

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
          <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Senha</Label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type={showPwd ? 'text' : 'password'} required autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="pl-10 pr-10 h-11 bg-card border-border focus-visible:ring-primary/40" />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <ul className="space-y-1 pt-1">
            {rules.map(r => (
              <li key={r.label} className={`flex items-center gap-1.5 text-[11px] ${r.ok ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                <CheckCircle2 className={`w-3 h-3 ${r.ok ? 'opacity-100' : 'opacity-40'}`} />
                {r.label}
              </li>
            ))}
          </ul>
        </div>

        <Button type="submit" disabled={loading}
          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gold-glow">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando conta...</> : <>Criar conta <ArrowRight className="w-4 h-4 ml-1" /></>}
        </Button>
      </form>
    </AuthShell>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search, LayoutDashboard, Wallet, History, Users, Settings, LogOut,
  Bell, Crown, TrendingUp, TrendingDown, Car, CreditCard, Building2,
  FileText, ChevronRight, Sparkles, Menu, X, Plus, ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/* ---------- helpers ---------- */
const greet = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const BRL = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const detectQueryType = (raw) => {
  const s = (raw || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (!s) return { type: null, label: '—' }
  if (/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(s)) return { type: 'PLACA', label: 'Placa (Mercosul/Antiga)' }
  if (/^[0-9]{11}$/.test(s)) return { type: 'CPF', label: 'CPF' }
  if (/^[0-9]{14}$/.test(s)) return { type: 'CNPJ', label: 'CNPJ' }
  if (/^[0-9]{9,11}$/.test(s)) return { type: 'RENAVAM', label: 'RENAVAM' }
  return { type: 'DESCONHECIDO', label: 'Formato não identificado' }
}

const iconForType = (t) => ({
  PLACA: Car, CPF: CreditCard, CNPJ: Building2, RENAVAM: FileText
}[t] || Search)

/* ---------- sidebar ---------- */
const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { key: 'consultas', label: 'Consultas', icon: Search },
  { key: 'historico', label: 'Histórico', icon: History },
  { key: 'carteira', label: 'Carteira', icon: Wallet },
  { key: 'clientes', label: 'Clientes', icon: Users },
  { key: 'configuracoes', label: 'Configurações', icon: Settings },
]

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border',
        'transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center shadow-lg">
            <Crown className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-bold tracking-tight text-gold-gradient leading-none">Nobre</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Consultas</div>
          </div>
          <button className="lg:hidden text-muted-foreground" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">Menu</div>
          <nav className="space-y-1">
            {NAV.map(item => {
              const Icon = item.icon
              return (
                <button key={item.key}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    item.active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-primary/20'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                  )}>
                  <Icon className={cn('w-4 h-4', item.active && 'text-primary')} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold">Plano Premium</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              Consultas ilimitadas e API dedicada.
            </p>
            <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs font-semibold">
              Fazer Upgrade <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <button className="mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors">
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </div>
      </aside>
    </>
  )
}

/* ---------- navbar ---------- */
function Navbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-background/70 backdrop-blur-xl border-b border-border flex items-center px-4 lg:px-8 gap-4">
      <button className="lg:hidden" onClick={onMenu}>
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
        <span>Painel</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">Dashboard</span>
      </div>
      <div className="flex-1" />
      <Badge variant="outline" className="hidden sm:flex gap-1.5 border-primary/30 text-primary bg-primary/5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Sistemas online
      </Badge>
      <button className="relative w-9 h-9 rounded-lg border border-border hover:border-primary/40 flex items-center justify-center transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
      </button>
      <div className="flex items-center gap-3 pl-3 border-l border-border">
        <div className="hidden md:block text-right">
          <div className="text-xs font-semibold leading-none">Francisco Nobre</div>
          <div className="text-[10px] text-muted-foreground mt-1">Administrador</div>
        </div>
        <Avatar className="w-9 h-9 border border-primary/30">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">FN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

/* ---------- stat card ---------- */
function StatCard({ label, value, delta, deltaDir = 'up', accent = 'gold', icon: Icon }) {
  const positive = deltaDir === 'up'
  return (
    <Card className="card-hover bg-card border-border/60 overflow-hidden relative">
      <div className={cn(
        'absolute inset-x-0 top-0 h-[2px]',
        accent === 'gold' ? 'bg-gradient-to-r from-transparent via-primary to-transparent' : 'bg-gradient-to-r from-transparent via-secondary to-transparent'
      )} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="text-2xl font-bold mt-2 tracking-tight">{value}</div>
          </div>
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            accent === 'gold' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
          )}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {delta !== undefined && (
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            <span className={cn(
              'flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md',
              positive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
            )}>
              {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {delta}
            </span>
            <span className="text-muted-foreground">vs. ontem</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- main page ---------- */
export default function App() {
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState([])
  const [stats, setStats] = useState({ saldo: 0, consultasHoje: 0, receita: 0, clientes: 0 })
  const [detail, setDetail] = useState(null)

  const detect = useMemo(() => detectQueryType(query), [query])

  const loadData = async () => {
    try {
      const [rRecent, rStats] = await Promise.all([
        fetch('/api/queries?limit=8').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
      ])
      setRecent(rRecent.items || [])
      setStats(rStats || stats)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { loadData() }, [])

  const submit = async (e) => {
    e?.preventDefault?.()
    if (!query.trim()) return
    if (!detect.type || detect.type === 'DESCONHECIDO') {
      toast({ title: 'Formato não reconhecido', description: 'Digite uma placa, CPF, CNPJ ou RENAVAM válido.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: detect.type })
      })
      const data = await res.json()
      setDetail(data.item)
      setQuery('')
      toast({ title: 'Consulta realizada', description: `${detect.label} processada com sucesso.` })
      loadData()
    } catch (e) {
      toast({ title: 'Erro na consulta', description: 'Tente novamente em instantes.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenu={() => setSidebarOpen(true)} />

        {/* Hero + Search */}
        <section className="relative border-b border-border">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="relative px-4 lg:px-8 py-10 lg:py-14 max-w-6xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Sparkles className="w-3 h-3 mr-1" /> v0.1.0 — Sprint 1.1
              </Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {greet()}, <span className="text-gold-gradient">Francisco</span> 👋
            </h1>
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">O que deseja consultar hoje?</p>

            <form onSubmit={submit} className="mt-6 max-w-3xl">
              <div className={cn(
                'group flex items-center gap-2 h-14 rounded-2xl bg-card border-2 pl-5 pr-2 transition-all',
                detect.type && detect.type !== 'DESCONHECIDO' ? 'border-primary/50 gold-glow' : 'border-border focus-within:border-primary/40'
              )}>
                <Search className={cn('w-5 h-5 shrink-0', detect.type && detect.type !== 'DESCONHECIDO' ? 'text-primary' : 'text-muted-foreground')} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Pesquise placa, CPF, CNPJ ou RENAVAM..."
                  className="flex-1 bg-transparent outline-none text-sm lg:text-base placeholder:text-muted-foreground/60"
                />
                {detect.type && (
                  <Badge variant="outline" className={cn(
                    'hidden sm:inline-flex text-[10px] uppercase tracking-wider',
                    detect.type === 'DESCONHECIDO' ? 'border-red-400/40 text-red-400' : 'border-primary/40 text-primary'
                  )}>{detect.label}</Badge>
                )}
                <Button type="submit" disabled={loading || !query.trim()} className="h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  {loading ? 'Consultando...' : 'Consultar'}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
                <span className="opacity-70">Sugestões:</span>
                {['ABC1D23', '123.456.789-00', '12.345.678/0001-90', '00123456789'].map(sug => (
                  <button key={sug} type="button" onClick={() => setQuery(sug)}
                    className="px-2.5 py-1 rounded-md border border-border hover:border-primary/40 hover:text-foreground transition-colors bg-card/50">
                    {sug}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <StatCard label="Saldo" value={BRL(stats.saldo)} delta="+2,4%" deltaDir="up" accent="gold" icon={Wallet} />
            <StatCard label="Consultas Hoje" value={stats.consultasHoje} delta="+18%" deltaDir="up" accent="blue" icon={Search} />
            <StatCard label="Receita" value={BRL(stats.receita)} delta="+7,1%" deltaDir="up" accent="gold" icon={TrendingUp} />
            <StatCard label="Clientes" value={stats.clientes} delta="-1,2%" deltaDir="down" accent="blue" icon={Users} />
          </div>
        </section>

        {/* Recent */}
        <section className="px-4 lg:px-8 pb-10">
          <Card className="bg-card border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Últimas Consultas</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Histórico das consultas mais recentes na plataforma.</p>
              </div>
              <Button variant="outline" size="sm" className="border-border hover:border-primary/40 text-xs">
                Ver todas <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <Separator className="bg-border/60" />
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold">Nenhuma consulta ainda</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Use a barra de pesquisa acima para realizar sua primeira consulta.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[440px]">
                  <ul className="divide-y divide-border/60">
                    {recent.map((item) => {
                      const Icon = iconForType(item.type)
                      return (
                        <li key={item.id}
                          onClick={() => setDetail(item)}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 cursor-pointer transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate">{item.query}</span>
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-border/80 shrink-0">{item.type}</Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.summary}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="text-[10px] text-muted-foreground/70">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </li>
                      )
                    })}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    {(() => { const I = iconForType(detail.type); return <I className="w-5 h-5" /> })()}
                  </div>
                  <div>
                    <DialogTitle className="text-base">Resultado — {detail.type}</DialogTitle>
                    <DialogDescription className="text-xs">{detail.query}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-2 space-y-3">
                <div className="rounded-lg border border-border p-4 bg-muted/20">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Resumo</div>
                  <div className="text-sm">{detail.summary}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(detail.data || {}).map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border/60 p-3 bg-card">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                      <div className="text-sm font-medium mt-1 break-words">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetail(null)}>Fechar</Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-1" /> Salvar no cliente
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

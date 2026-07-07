'use client'

import { Crown, Sparkles, ShieldCheck, Zap } from 'lucide-react'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left — form */}
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-gold-gradient leading-none">Nobre</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Consultas</div>
            </div>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-sm text-muted-foreground text-center">{footer}</div>}
        </div>
      </div>

      {/* Right — branding */}
      <div className="hidden lg:flex relative items-center justify-center border-l border-border overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-primary/10 pointer-events-none" />
        <div className="relative z-10 max-w-md px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider text-primary mb-6">
            <Sparkles className="w-3 h-3" /> Plataforma Premium
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            Consulte <span className="text-gold-gradient">Placa, CPF, CNPJ e RENAVAM</span> em uma única interface.
          </h2>
          <p className="text-sm text-muted-foreground mt-4">
            Rápida, elegante e feita para quem exige precisão em cada consulta.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Zap, title: 'Consultas instantâneas', desc: 'Resposta em segundos, com formatação profissional.' },
              { icon: ShieldCheck, title: 'Segurança de nível bancário', desc: 'JWT + cookies HttpOnly. Seus dados estão protegidos.' },
              { icon: Sparkles, title: 'Design Premium', desc: 'Interface pensada para produtividade e beleza.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

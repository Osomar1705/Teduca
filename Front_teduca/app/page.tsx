import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/Navbar'
import { Logo } from '@/components/common/Logo'
import { FadeIn, Stagger, StaggerItem, HoverLift } from '@/components/common/Motion'
import Link from 'next/link'
import { APP_ROUTES } from '@/lib/constants'
import { BookOpen, Users, Award, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Cursos completos',
    description:
      'Accede a una amplia variedad de cursos diseñados por expertos, con seguimiento de progreso en tiempo real.',
  },
  {
    icon: Users,
    title: 'Comunidad activa',
    description:
      'Conecta con estudiantes y docentes en un espacio de aprendizaje colaborativo y humano.',
  },
  {
    icon: Award,
    title: 'Certificados',
    description:
      'Obtén certificados reconocidos al completar tus cursos y demuestra lo que sabés.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="aura pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <Badge variant="default" className="mb-6 px-3 py-1">
              Plataforma educativa de nueva generación
            </Badge>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Aprender nunca fue tan{' '}
              <span className="text-gradient-brand">resiliente</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
              La plataforma donde estudiantes y docentes aprenden, enseñan y
              crecen juntos. Inspirada en el organismo más resistente del planeta.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="brand" size="lg" className="w-full sm:w-auto">
                <Link href={APP_ROUTES.REGISTER}>
                  Crear cuenta
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href={APP_ROUTES.LOGIN}>Iniciar sesión</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <FadeIn className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Todo lo que necesitás para crecer
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Herramientas premium, diseño impecable y una experiencia pensada
              para durar.
            </p>
          </FadeIn>

          <Stagger className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <StaggerItem key={title}>
                <HoverLift>
                  <div className="group h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                    <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-brand px-8 py-14 text-center shadow-xl">
              <div className="bg-grid-light absolute inset-0" />
              <div className="relative">
                <Image
                  src="/teduca-mark-white.png"
                  alt=""
                  width={579}
                  height={398}
                  className="mx-auto mb-5 h-16 w-auto opacity-95"
                />
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Empezá tu camino hoy
                </h2>
                <p className="mx-auto mt-3 max-w-md text-white/80">
                  Sumate a TEDUCA y transformá la forma en que aprendés y enseñás.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-7 bg-white text-primary hover:bg-white/90"
                >
                  <Link href={APP_ROUTES.REGISTER}>
                    Crear cuenta gratis
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <Logo className="h-8 w-auto" />
          <p>&copy; {new Date().getFullYear()} TEDUCA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

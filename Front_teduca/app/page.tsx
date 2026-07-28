import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import { APP_ROUTES } from '@/lib/constants'
import { BookOpen, Users, Award } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Bienvenido a TEDUCA
          </h1>
          <p className="text-xl text-muted-foreground">
            La plataforma educativa moderna para estudiantes y docentes. Aprende,
            enseña y crece juntos.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={APP_ROUTES.REGISTER}>Crear cuenta</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href={APP_ROUTES.LOGIN}>Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Características principales
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <BookOpen className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Cursos completos
              </h3>
              <p className="text-muted-foreground">
                Accede a una amplia variedad de cursos diseñados por expertos
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Users className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Comunidad activa
              </h3>
              <p className="text-muted-foreground">
                Conecta con otros estudiantes y docentes en tu comunidad de aprendizaje
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Award className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Certificados
              </h3>
              <p className="text-muted-foreground">
                Obtén certificados reconocidos al completar tus cursos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 px-4 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          <p>&copy; 2024 TEDUCA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

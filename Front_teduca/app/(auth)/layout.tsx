import { Navbar } from '@/components/layout/Navbar'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="aura pointer-events-none absolute inset-x-0 top-0 h-[480px]" />
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_55%_45%_at_50%_0%,black,transparent)]" />
      <Navbar />
      <div className="relative flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}

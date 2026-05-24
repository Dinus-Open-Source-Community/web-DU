import { Lottie } from '../shared/Lottie'

interface AuthLayoutProps {
  children: React.ReactNode
  lottieUrl?: string
  heading?: string
  subheading?: string
}

export default function AuthLayout({ children, lottieUrl, heading, subheading }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#0a84dc_0%,#075e9c_100%)] lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-white/5 blur-2xl" aria-hidden />

        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          {lottieUrl && (
            <div className="w-72 aspect-square">
              <Lottie src={lottieUrl} className="size-full" />
            </div>
          )}

          {heading && <h2 className="text-2xl font-bold text-white">{heading}</h2>}
          {subheading && <p className="max-w-sm text-sm leading-relaxed text-white/70">{subheading}</p>}
        </div>
      </div>

      <div className="flex items-center justify-center overflow-y-auto bg-[#f9fafb] px-5 py-10 md:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  )
}

import AuthLayout from '@/components/layout/AuthLayout'
import FormRegister from './_components/FormRegister'

export default function RegisterPage() {
  return (
    <AuthLayout
      heading="Mulai Perjalanan Belajarmu"
      subheading="Buat akun gratis dan dapatkan akses ke ratusan kursus berkualitas di Doscom University."
    >
      <FormRegister />
    </AuthLayout>
  )
}

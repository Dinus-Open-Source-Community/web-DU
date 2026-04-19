import AuthLayout from '@/components/layout/AuthLayout'
import FormLogin from './_components/FormLogin'

export default function LoginPage() {
  return (
    <AuthLayout heading="Selamat Datang Kembali" subheading="Masuk ke akunmu dan lanjutkan perjalanan belajarmu bersama Doscom University.">
      <FormLogin />
    </AuthLayout>
  )
}

import AuthLayout from '@/components/layout/AuthLayout'
import { FormForgotPassword } from './_components/FormForgotPassword'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      heading="Lupa Password?"
      subheading="Jangan khawatir. Kami akan mengirimkan link reset password ke email kamu."
    >
      <FormForgotPassword />
    </AuthLayout>
  )
}

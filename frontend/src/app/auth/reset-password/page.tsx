import AuthLayout from '@/components/layout/AuthLayout'
import { FormResetPassword } from './_components/FormResetPassword'

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      heading="Reset Password"
      subheading="Buat password baru yang kuat untuk melindungi akunmu."
    >
      <FormResetPassword />
    </AuthLayout>
  )
}

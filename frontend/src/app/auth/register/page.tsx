import AuthLayout from "@/components/layout/AuthLayout";
import FormRegister from "./_components/FormRegister";

export default function RegisterPage() {
  return (
    <main className="relative h-screen w-full overflow-x-hidden bg-[#F2F2F2]">
      <AuthLayout>
        <FormRegister />
      </AuthLayout>
    </main>
  );
}

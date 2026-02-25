import Image from "next/image";
import { EyeOff } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import FormLogin from "./_components/FormLogin";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white p-6 md:p-10">
      <AuthLayout>
        <FormLogin />
      </AuthLayout>
    </main>
  );
}

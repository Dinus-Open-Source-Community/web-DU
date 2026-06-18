import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Message, resolveActionError } from "@/lib/Message";
import { Button } from "../../components/ui/button";
import { GlobalInput } from "../../components/shared/Input";
import AuthLayout from "../../components/layouts/AuthLayouts";
import OauthButton from "../../components/shared/OauthButton";
import { useAuth } from "../../providers/auth-provider";
import { parseLoginPayload } from "../../lib/validator/auth";
import { resolveSafeRedirectPath } from "@/lib/security/safe-redirect";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, startGoogleOAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = parseLoginPayload(
        { email, password },
        Message.common.validationFailed,
      );
      const { redirectPath } = await signIn(payload);
      navigate(resolveSafeRedirectPath(location.state?.from, redirectPath), {
        replace: true,
      });
      toast.success(Message.auth.loginSuccess);
    } catch (err) {
      toast.error(
        resolveActionError(
          err instanceof Error ? err : null,
          Message.auth.loginFailed,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heading="Selamat Datang Kembali"
      subheading="Masuk ke akunmu dan lanjutkan perjalanan belajarmu bersama Doscom University."
      lottieUrl="/logindvdvd.lottie"
    >
      <div className="flex flex-col space-y-8">
        {/* Mobile Header & Local Heading */}
        <div className="flex flex-col space-y-2">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Masuk
            </h1>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <GlobalInput
              label="Alamat Email"
              placeholder="nama@contoh.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus:border-primary focus:ring-primary h-12 rounded-xl border-slate-200"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-primary hover:text-primary/80 text-xs font-semibold transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <GlobalInput
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="focus:border-primary focus:ring-primary h-12 rounded-xl border-slate-200 pr-12"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      disabled={isSubmitting}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link
              to="/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>

          <Button
            type="submit"
            className="bg-primary h-12 w-full rounded-xl text-sm font-bold text-white shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Memproses...</span>
              </div>
            ) : (
              "Masuk ke Akun"
            )}
          </Button>
        </form>

        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm font-medium">
            <span className="bg-[#f9fafb] px-4 text-slate-400">
              Atau masuk dengan{" "}
            </span>
          </div>
        </div>

        {/* Social Logins */}
        <OauthButton
          isSubmitting={isSubmitting}
          onGoogleSignIn={startGoogleOAuth}
        />
      </div>
    </AuthLayout>
  );
}

import Image from "next/image";
import Link from "next/link";
import { EyeOff, Calendar, ChevronDown } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-white p-4 md:p-6">
      {/* --- BACKGROUND DECORATION --- */}

      {/* Bunder */}
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none select-none">
        <Image
          src="/bunder.png"
          alt="Circle Decoration"
          width={500}
          height={500}
          className="w-48 md:w-72 lg:w-125 object-contain opacity-90"
          priority
        />
      </div>

      {/* Kembang */}
      <div className="absolute top-0 -right-5 md:right-24 z-20 pointer-events-none select-none">
        <Image
          src="/kembang.png"
          alt="Flower Decoration"
          width={256}
          height={256}
          className="w-24 md:w-40 lg:w-64 object-contain opacity-90"
          priority
        />
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className="relative z-10 w-full max-w-360 flex items-center justify-center lg:justify-start lg:px-10">

        {/* --- GLASS FORM CONTAINER --- */}
        <div
          className="
                relative z-20 flex flex-col justify-center
                border border-white/20 bg-white/30 backdrop-blur-[50px] shadow-2xl shadow-blue-100/20
                
                /* RESPONSIVE SIZE */
                w-full max-w-md lg:max-w-none lg:w-173
                h-auto py-8 lg:py-0 lg:h-181.5
                
                /* RADIUS & PADDING */
                rounded-[20px] lg:rounded-[30px]
                p-6 lg:p-7.5
            "
        >
          {/* Inner Content Form */}
          <div className="flex w-full flex-col gap-5 h-full justify-center">

            {/* HEADER LOGO & TITLE */}
            <div className="flex flex-col gap-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <Image
                  src={"/logo.png"}
                  alt="Doscom Logo"
                  width={26.7}
                  height={25.35}
                  className="object-contain"
                />
                <h1 className="text-[18.13px] font-bold text-[#0A84DC]">
                  Doscom University
                </h1>
              </div>
              <p className="text-[14px] lg:text-[15px] font-normal text-black leading-relaxed">
                Doscom University is one of DOSCOM's open source intensive training programs (bootcamps).
              </p>
            </div>

            {/* FORM INPUTS */}
            <form className="flex flex-col gap-4">

              {/* ROW 1: Full Name & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] md:text-sm font-medium text-[#2D3748]">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="h-10 w-full rounded-[3.64px] border-[0.7px] border-gray-400 bg-white px-[14.57px] text-[12px] text-[#2D3748] outline-none placeholder:text-[#BFBFBF] focus:border-[#0A84DC]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] md:text-sm font-medium text-[#2D3748]">Gender</label>
                  <div className="relative h-10 w-full">
                    <select
                      className="h-full w-full appearance-none rounded-[3.64px] border-[0.7px] border-gray-400 bg-white px-[14.57px] text-[12px] text-[#BFBFBF] outline-none focus:border-[#0A84DC] cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>Male/Female</option>
                      <option value="male" className="text-black">Male</option>
                      <option value="female" className="text-black">Female</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2D3748] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ROW 2: Email & DOB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] md:text-sm font-medium text-[#2D3748]">Email</label>
                  <input
                    type="email"
                    placeholder="111223344@mhs.dinus.ac.id"
                    className="h-10 w-full rounded-[3.64px] border-[0.7px] border-gray-400 bg-white px-[14.57px] text-[12px] text-[#2D3748] outline-none placeholder:text-[#BFBFBF] focus:border-[#0A84DC]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1 text-[11.94px] font-normal text-[#2D3748]">
                    Date of birth <span className="text-[8.53px] text-[#2D3748]">(MM/DD/YY)</span>
                  </label>
                  <div className="relative h-10 w-full">
                    <input
                      type="text"
                      placeholder="15/02/2030"
                      className="h-full w-full rounded-[3.64px] border-[0.7px] border-gray-400 bg-white px-[14.57px] text-[12px] text-[#2D3748] outline-none placeholder:text-[#BFBFBF] focus:border-[#0A84DC]"
                    />
                    <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BFBFBF]" />
                  </div>
                </div>
              </div>

              {/* ROW 3: Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] md:text-sm font-medium text-[#2D3748]">Password</label>
                  <div className="relative h-10 w-full">
                    <input
                      type="password"
                      placeholder="Password"
                      className="h-full w-full rounded-[3.64px] border-[0.7px] border-gray-400 bg-white px-[14.57px] pr-10 text-[11.84px] text-[#2D3748] outline-none placeholder:text-[#BFBFBF] focus:border-[#0A84DC]"
                    />
                    <EyeOff className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-[#BFBFBF]" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11.94px] font-normal text-[#2D3748]">Confirm password</label>
                  <div className="relative h-10 w-full">
                    <input
                      type="password"
                      placeholder="****************"
                      className="h-full w-full rounded-[3.64px] border-[0.7px] border-gray-400 bg-white px-[14.57px] pr-10 text-[12px] text-[#2D3748] outline-none placeholder:text-[#BFBFBF] focus:border-[#0A84DC]"
                    />
                    <EyeOff className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-[#BFBFBF]" />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-[17.06px] w-[17.06px] rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF]"
                  />
                  <label htmlFor="remember" className="text-[12px] text-[#2D3748]">Remember me</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-[17.06px] w-[17.06px] rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF]"
                  />
                  <label htmlFor="terms" className="text-[12px] text-[#2D3748] leading-tight">
                    I agree to all the <Link href="#" className="text-[#007AFF]">Terms</Link> and <Link href="#" className="text-[#007AFF]">Privacy policy</Link>
                  </label>
                </div>
              </div>

              {/* Create Account Button */}
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  className="h-[40.94px] w-full md:max-w-[305.35px] rounded-[4.61px] bg-[#007AFF] text-[14px] font-medium text-white transition-colors hover:bg-blue-600 shadow-md"
                >
                  Create account
                </button>
              </div>

              {/* Divider */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-[12.09px] font-normal text-[#333333]">
                  Or Continue With
                </span>

                <div className="flex flex-col md:flex-row w-full justify-center gap-3 md:gap-4">
                  <button className="flex h-[54.86px] w-full md:max-w-[306.59px] items-center justify-center gap-3 rounded-[44.61px] bg-white border-[1.21px] border-[#A7A7A7] shadow-[0px_4.84px_4.84px_0px_#00000040] transition-transform hover:scale-105">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.489 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.439 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                      </g>
                    </svg>
                  </button>

                  <button className="flex h-[54.86px] w-full md:max-w-[306.59px] items-center justify-center gap-3 rounded-[44.61px] bg-white border-[1.21px] border-[#A7A7A7] shadow-[0px_4.84px_4.84px_0px_#00000040] transition-transform hover:scale-105">
                    <svg className="h-6 w-6" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f" />
                    </svg>
                  </button>
                </div>

                <div className="text-[11.94px] font-normal text-[#333333] text-center tracking-tight">
                  Don’t have an account? <Link href="/auth/login" className="text-[#007AFF] hover:underline">Log In</Link>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* --- RIGHT SIDE: MASKOT & SHURIKEN (HIDDEN ON MOBILE) --- */}

        {/* Shuriken */}
        <div
          className="absolute z-20 hidden lg:block"
          style={{
            width: "170px",
            height: "170px",
            top: "50px",
            left: "720px",
          }}
        >
          <Image
            src="/shuriken.png"
            alt="Shuriken Decoration"
            width={170}
            height={170}
            className="object-contain drop-shadow-[0_0_15px_rgba(37,130,225,0.6)]"
          />
        </div>

        {/* Penguin */}
        <div
          className="absolute z-10 hidden lg:block"
          style={{
            width: "577px",
            height: "668px",
            top: "103px",
            left: "747px",
          }}
        >
          <Image
            src="/pinguin.png"
            alt="Doscom Mascot"
            width={577}
            height={668}
            priority
            className="object-contain"
          />
        </div>

      </div>
    </main>
  );
}
import Image from "next/image";
import { Poppins } from "next/font/google";
import { EyeOff } from "lucide-react";
import bunderImg from "../../../../public/bunder.png";
import kembangImg from "../../../../public/kembang.png";
import pinguinImg from "../../../../public/pinguin.png";
import shurikenImg from "../../../../public/shuriken.png";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function LoginPage() {
  return (
    <main
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white p-6 md:p-10 ${poppins.variable} font-poppins`}
    >
      {/* --- BACKGROUND LAYERS --- */}

      {/* Bunder */}
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none select-none">
        <Image
          src={bunderImg}
          alt="Circle Decoration"
          className="w-72 object-contain opacity-90 md:w-[500px]"
          priority
        />
      </div>

      {/* Kembang */}
      <div className="absolute top-0 right-24 z-20 pointer-events-none select-none">
        <Image
          src={kembangImg}
          alt="Flower Decoration"
          className="w-40 object-contain opacity-90 md:w-64"
          priority
        />
      </div>

      {/* --- GLASS CARD CONTAINER --- */}
      <div className="relative z-10 grid min-h-[800px] w-full max-w-[1324px] grid-cols-1 items-center rounded-[60px] border border-white/20 bg-white/30 shadow-2xl shadow-blue-100/20 backdrop-blur-[50px] lg:grid-cols-2">
        
        {/* --- LEFT SIDE: LOGIN FORM --- */}
        <div className="flex h-full w-full flex-col justify-center px-10 py-10 lg:pl-[100px] lg:pr-10">
          
          {/* Form Container */}
          <div className="flex w-full max-w-[434.4px] flex-col gap-[38px]">
            
            {/* Header Section */}
            <div>
              <h1 className="text-[32px] font-bold leading-tight text-center text-black">
                Welcome to Doscom University
              </h1>
              <p className="mt-4 text-[16px] text-[#333333] opacity-80">
                Doscom University is one of DOSCOM's open source intensive
                training programs (bootcamps).
              </p>
            </div>

            {/* Inputs Section */}
            <form className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#333333]">Email</label>
                <input
                  type="email"
                  placeholder="username@gmail.com"
                  className="h-[51.87px] w-full rounded-[5.19px] border border-gray-300 bg-white px-4 text-sm text-[#333333] outline-none placeholder:text-gray-400 focus:border-[#2582E1] focus:ring-1 focus:ring-[#2582E1]"
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2" style={{ height: '82.99px' }}>
                <label className="text-sm font-medium text-[#333333]">Password</label>
                <div className="relative h-[51.87px] w-full">
                  <input
                    type="password"
                    placeholder="Password"
                    className="h-full w-full rounded-[5.19px] border border-gray-300 bg-white px-4 pr-10 text-sm text-[#333333] outline-none placeholder:text-gray-400 focus:border-[#2582E1] focus:ring-1 focus:ring-[#2582E1]"
                  />
                  <EyeOff className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-400" />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="button"
                className="h-[41.49px] w-full rounded-[4.61px] bg-[#2582E1] text-sm font-medium text-white transition-colors hover:bg-blue-600 shadow-md shadow-blue-200"
              >
                Sign In
              </button>
            </form>

            {/* Social Login */}
            <div className="flex flex-col items-center gap-6">
              <span className="text-[18.15px] font-normal text-[#333333]">
                Or Continue With
              </span>

              <div className="flex w-full justify-center gap-4">
                {/* Google Button */}
                <button className="flex h-[45.38px] w-full max-w-[151.71px] items-center justify-center rounded-[36.9px] bg-white shadow-sm ring-1 ring-gray-200 transition-transform hover:scale-105">
                  {/* SVG Google Logo */}
                  <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.489 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.439 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                    </g>
                  </svg>
                </button>

                {/* Github Button */}
                <button className="flex h-[45.38px] w-full max-w-[151.71px] items-center justify-center rounded-[36.9px] bg-white shadow-sm ring-1 ring-gray-200 transition-transform hover:scale-105">
                   {/* SVG Github Logo */}
                  <svg className="h-6 w-6" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/>
                  </svg>
                </button>
              </div>

              {/* Footer Register Link */}
              <div className="flex items-center gap-1">
                <span className="text-[18.15px] text-[#333333]">
                  Don’t have an account yet?
                </span>
                <a href="#" className="text-[18.15px] text-[#1F84E6] hover:underline">
                  Register for free
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: PINGUIN & SHURIKEN */}
        {/* 1. GAMBAR SHURIKEN */}
        <div 
            className="absolute z-20 hidden lg:block"
            style={{ 
                width: '200px', 
                height: '200px', 
                top: '60px', 
                left: '650px' 
            }}
        >
            <Image
                src={shurikenImg}
                alt="Shuriken Decoration"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(37,130,225,0.6)]"
            />
        </div>

        {/* 2. GAMBAR PINGUIN */}
        <div 
            className="absolute z-10 hidden lg:block"
            style={{ 
                width: '600px', 
                height: '691px', 
                top: '90px', 
                left: '705px' 
            }}
        >
            <Image
                src={pinguinImg}
                alt="Doscom Mascot"
                fill
                className="object-contain"
                priority
            />
        </div>
      </div>
    </main>
  );
}
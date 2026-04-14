"use client";

import { GitHubIcon, GoogleIcon, LogoDu } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { GlobalInput } from "@/components/ui/GlobalInput";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const FormLogin = () => {
  const [isShow, setIsShow] = useState<boolean>(false);

  return (
    <div className="relative z-10 w-full max-w-2xl rounded-[32px] bg-[#E5E5E54D]/30 p-24 text-gray-800 shadow-sm backdrop-blur-md">
      {/* Header */}
      <div className="mb-8 flex flex-row items-center justify-center">
        <h1 className="text-center text-3xl leading-[1.2] font-semibold tracking-tight">
          Welcome to Doscom <br /> University
        </h1>
      </div>

      <p className="mb-8 align-middle text-lg leading-[1.2] font-normal tracking-normal">
        Doscom University is one of DOSCOM&apos;s open source intensive training programs (bootcamps).
      </p>

      {/* Input Form*/}
      <form className="flex flex-col gap-6">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-7">
          {/*Menggunakan custom ui yang dimana agar lebih clean dan reusable*/}

          {/*Email*/}
          <GlobalInput
            label="Email"
            placeholder="111223344@mhs.dinus.ac.id"
            type="email"
          />

          {/*Password*/}
          <GlobalInput
            label="Password"
            placeholder="Password"
            type={isShow ? "text" : "password"}
            rightIcon={
              <button
                type="button"
                onClick={() => setIsShow(!isShow)}
                className="flex items-center justify-center transition-colors hover:text-gray-600 focus:outline-none"
              >
                {isShow ? (
                  <Eye className="h-5 w-5 cursor-pointer text-gray-400" />
                ) : (
                  <EyeOff className="h-5 w-5 cursor-pointer text-gray-400" />
                )}
              </button>
            }
          />
        </div>
        {/*Button Submit*/}
        <Button className="mt-4 h-12 w-full rounded-md bg-[#1E88E5] text-base leading-[1.3] font-semibold text-white hover:bg-blue-700">
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center justify-center py-8">
        <span className="text-lg font-normal text-[#333333]">
          Or Continue With
        </span>
      </div>

      {/* OAuth  */}
      <div className="grid w-full grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex h-16 w-full cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white hover:bg-gray-50"
        >
          <GoogleIcon className="" />
        </Button>

        <Button
          type="button"
          variant="outline"
          className="flex h-16 w-full cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white hover:bg-gray-50"
        >
          <GitHubIcon className="h-10 w-10" />
        </Button>
      </div>

      {/* Footer Link */}
      <div className="mt-8 text-center text-lg text-gray-600">
        Don’t have an account yet?{" "}
        <a href="/auth/register" className="font-normal text-[#1F84E6]">
          Register for free
        </a>
      </div>
    </div>
  );
};

export default FormLogin;

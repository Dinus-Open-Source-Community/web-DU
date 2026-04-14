"use client";

import { GitHubIcon, GoogleIcon, LogoDu } from "@/components/ui/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GlobalInput } from "@/components/ui/GlobalInput";
import { GlobalSelect } from "@/components/ui/GlobalSelect";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const FormRegister = () => {
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] =
    useState<boolean>(false);

  return (
    <div className="relative z-10 w-full max-w-4xl rounded-[32px] bg-[#E5E5E54D]/30 p-10 text-gray-800 shadow-sm backdrop-blur-md">
      {/* Header */}
      <div className="mb-6 flex flex-row items-center gap-2 px-3">
        <LogoDu className="h-8 w-8" />
        <h1 className="text-xl font-bold tracking-tight text-[#0A84DC]">
          Doscom University
        </h1>
      </div>

      <p className="mb-7 px-3 align-middle text-lg leading-[1.2] font-normal">
        Doscom University is one of DOSCOM&apos;s open source intensive training programs (bootcamps).
      </p>

      {/* Input Form*/}
      <form className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/*Menggunakan custom ui yang dimana agar lebih clean dan reusable*/}

          {/*Name*/}
          <GlobalInput label="Full Name" placeholder="Full Name" type="text" />

          {/*Gender*/}
          <GlobalSelect
            label="Gender"
            placeholder="Male/Female"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
          />

          {/*Email*/}
          <GlobalInput
            label="Email"
            placeholder="111223344@mhs.dinus.ac.id"
            type="email"
          />

          {/*Date or birth*/}
          <GlobalInput
            label="Date of birth"
            subLabel="(MM/DD/YY)"
            placeholder="15/02/2030"
            type="date"
            className="text-gray-500"
          />

          {/*Password*/}
          <GlobalInput
            label="Password"
            placeholder="Password"
            type={isShowPassword ? "text" : "password"}
            rightIcon={
              <button
                type="button"
                onClick={() => setIsShowPassword(!isShowPassword)}
                className="flex items-center justify-center transition-colors hover:text-gray-600 focus:outline-none"
              >
                {isShowPassword ? (
                  <Eye className="h-5 w-5 cursor-pointer text-gray-400" />
                ) : (
                  <EyeOff className="h-5 w-5 cursor-pointer text-gray-400" />
                )}
              </button>
            }
          />

          {/*Confirm Password*/}
          <GlobalInput
            label="Confirm password"
            placeholder="••••••••••••••"
            type={isShowConfirmPassword ? "text" : "password"}
            rightIcon={
              <button
                type="button"
                onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                className="flex items-center justify-center transition-colors hover:text-gray-600 focus:outline-none"
              >
                {isShowConfirmPassword ? (
                  <Eye className="h-5 w-5 cursor-pointer text-gray-400" />
                ) : (
                  <EyeOff className="h-5 w-5 cursor-pointer text-gray-400" />
                )}
              </button>
            }
          />
        </div>

        {/* Checkboxes */}
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="h-4 w-4 border-[#D1D1D1]" />
            <label
              htmlFor="remember"
              className="cursor-pointer text-base leading-[1.4] font-normal tracking-tight text-[#2D3748]"
            >
              Remember me
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" className="h-4 w-4 border-[#D1D1D1]" />
            <label
              htmlFor="terms"
              className="cursor-pointer text-base leading-[1.4] font-normal tracking-tight text-[#2D3748]"
            >
              I agree to all the{" "}
              <a href="#" className="text-blue-500 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-500 hover:underline">
                Privacy policy
              </a>
            </label>
          </div>
        </div>

        {/*Button Submit*/}
        <Button className="mt-4 h-12 w-full rounded-md bg-[#1E88E5] text-lg leading-[1.3] font-semibold text-white hover:bg-blue-700">
          Create account
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
        Don&apos;t have an account?{" "}
        <a href="/auth/login" className="font-normal text-[#1F84E6]">
          Log In
        </a>
      </div>
    </div>
  );
};

export default FormRegister;

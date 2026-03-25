import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      {/*side left */}
      <div className="flex h-full w-full items-center justify-center">
        {children}

        {/*Image Decoration*/}
        <Image
          src="/Decoration-auth.svg"
          alt="Decoration Auth"
          width={478}
          height={449}
          className="absolute bottom-0 left-0 select-none"
        />
      </div>

      {/*side right */}
      <div className="flex h-full w-full items-center justify-center">
        <Image
          src="/pinguin.png"
          alt="Pinguin Doscom"
          width={850}
          height={688}
          className=""
        />
      </div>
    </div>
  );
};

export default AuthLayout;

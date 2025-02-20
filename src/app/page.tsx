"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
  <h1 className="text-2xl font-bold">Welcome</h1>

  {/* Container for buttons */}
  <div className="flex space-x-4">
    {/* Button 1 */}
    <div className="relative flex h-[50px] w-60 items-center justify-center overflow-hidden rounded-xl p-10 bg-blue-600 font-medium text-white shadow-2xl transition-all duration-300 before:absolute before:inset-0 before:border-0 before:border-white before:duration-100 before:ease-linear hover:bg-white hover:text-blue-600 hover:shadow-blue-600 hover:before:border-[25px]" >
      <button
        className="relative z-10 w-full font-black text-x"
        onClick={() => router.push("/token-profiles")}
      >
        View Token Profiles
      </button>
    </div>

    {/* Button 2 */}
    <div className="relative flex h-[50px] w-60 items-center justify-center overflow-hidden rounded-xl p-10 bg-blue-600 font-medium text-white shadow-2xl transition-all duration-300 before:absolute before:inset-0 before:border-0 before:border-white before:duration-100 before:ease-linear hover:bg-white hover:text-blue-600 hover:shadow-blue-600 hover:before:border-[25px]">
      <button
        className="relative z-10 w-full font-bold text-xl px-6 py-3 rounded-xl"
        onClick={() => router.push("/uniswap-page")}
      >
        UNISWAP
      </button>
    </div>
  </div>
</div>
  );
}

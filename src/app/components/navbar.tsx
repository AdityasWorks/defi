"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-black text-white py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          DEFI INNOVATOR
        </Link>

        {/* Nav Links */}
        <div className="flex space-x-6">
          <Link href="/token-profiles" className="hover:text-gray-300">
            Token Profiles
          </Link>
          <Link href="/uniswap-page" className="hover:text-gray-300">
            Uniswap
          </Link>
        </div>
      </div>
    </nav>
  );
}

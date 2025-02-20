"use client";

import { useEffect, useState } from "react";

export default function TokenProfiles() {
  interface Token {
    header: string;
    chainId: string;
    description?: string;
    url: string;
  }

  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.dexscreener.com/token-profiles/latest/v1"
        );
        const data = await response.json();

        console.log("Fetched Data:", data);

        setTokens(data.tokens || data || []);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Latest Token Profiles
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tokens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tokens.map((token, index) => (
            <a key={index} href={token.url} target="_blank" rel="noopener noreferrer">
              <article className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-40 max-w-sm mx-auto shadow-lg hover:scale-105 transition-transform duration-300">
                <img
                  src={token.header}
                  alt="Token Header"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
                <h3 className="z-10 text-3xl font-bold text-white">{token.chainId}</h3>
                <p className="z-10 text-sm leading-6 text-gray-300 mt-2 min-h-[3rem] line-clamp-2">
  {token.description || "No description available."}
</p>
              </article>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No tokens found.</p>
      )}
    </div>
  );
}

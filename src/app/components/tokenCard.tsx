import Image from "next/image";

interface TokenCardProps {
  token: {
    url: string;
    chainId: string;
    tokenAddress: string;
    icon: string;
    header?: string;
    description?: string;
    links?: { type?: string; label?: string; url: string }[];
  };
}

export default function tokenCard({ token }: TokenCardProps) {
  return (
    <div className="border rounded-lg shadow-lg p-4 bg-white">
      {/* Token Header Image */}
      {token.header && (
        <Image
          src={token.header}
          alt="Token Header"
          width={300}
          height={100}
          className="rounded-md"
        />
      )}

      {/* Token Icon */}
      <div className="flex items-center space-x-3 mt-2">
        <Image
          src={token.icon}
          alt="Token Icon"
          width={50}
          height={50}
          className="rounded-full"
        />
        <h2 className="text-lg font-bold">{token.chainId.toUpperCase()}</h2>
      </div>

      {/* Token Address */}
      <p className="text-sm text-gray-500 mt-2">Address: {token.tokenAddress}</p>

      {/* Token Description */}
      {token.description && (
        <p className="text-sm text-gray-600 mt-2">{token.description}</p>
      )}

      {/* Links */}
      <div className="mt-4 space-x-3">
        {token.links &&
          token.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {link.label || link.type}
            </a>
          ))}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";

export default function PromoBanner() {
  return (
    <div className="flex flex-col select-none">
      {/* Welcome Title Block */}
      <div className="bg-white py-4 flex flex-col items-center justify-center border-b border-gray-100">
        <h2 className="text-[22px] font-black text-[#43A047] tracking-tight leading-none">
          Welcome Back
        </h2>
        <span className="text-[12px] font-semibold text-gray-400 mt-1.5 uppercase tracking-wider">
          Quality Guarantee
        </span>
      </div>

      {/* Static Banner Image */}
      <div className="w-full relative overflow-hidden" style={{ aspectRatio: "952 / 623" }}>
        <Image
          src="/images/home-banner.jpg"
          alt="Welcome Banner"
          fill
          sizes="(max-width: 480px) 100%, 480px"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/account" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Privacy Policy</span>
      </nav>

      <div className="p-4 bg-white m-0 text-[#333333] leading-relaxed text-[14px]">
        <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
        
        <h1 className="text-[18px] font-bold mt-4 mb-2 text-[#009688]">Interpretation and Definitions</h1>
        <h2 className="text-[16px] font-semibold mt-3 mb-1">Interpretation</h2>
        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions.</p>
        <p>The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
        
        <h2 className="text-[16px] font-semibold mt-3 mb-1">Definitions</h2>
        <p>For the purposes of this Privacy Policy:</p>
        <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
          <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
          <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Luvomall Games.</li>
          <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party.</li>
        </ul>
      </div>

      <BottomNav />
    </main>
  );
}

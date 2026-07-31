"use client";

import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function RiskAgreementPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/account" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Risk Disclosure Agreement</span>
      </nav>

      <div className="p-4 bg-white m-0 text-[#333333] leading-relaxed text-[14px]">
        <h3 className="text-[16px] font-bold text-center mb-3 text-[#009688]">Chapter 1. Booking/Collection Description</h3>
        <p className="mb-2">Prepayment Booking/Recycling Customer should read and understand the business content carefully before making prepayment bookings (prepayment lock price, payment settlement and shipment) /recovery or repurchase (prepayment lock price, shipping payment) before making prepayment bookings:</p>
        <p className="mb-2">1. Before making an appointment/restoring the prepayment business, the customer should complete the real name authentication in the mall and ensure that the name, ID number, bank account number, delivery address and other information filled in are true, accurate and valid; Otherwise, the user will be liable for the consequences of false information.</p>
        <p className="mb-2">2. Customers can order gold and silver products in advance at the shopping centre. Orders can be cancelled by 01:30 a.m. on the same Saturday. When the customer pays the end payment, the mall receives the final payment and ships the goods.</p>
      </div>

      <BottomNav />
    </main>
  );
}

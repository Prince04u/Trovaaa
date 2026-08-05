"use client";

import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333333] font-sans">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/account" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Cancellation and Refundable Policy</span>
      </nav>

      <div className="p-5 text-[13px] leading-relaxed text-[#333] select-text">
        <h2 className="text-[16px] font-bold text-[#009688] mb-3 border-b border-[#eee] pb-1">Cancellation and Refundable Policy</h2>
        
        <p className="mb-4">In case of any discrepancy we can cancel any of the orders placed by you. A few reasons for cancellation from our end usually include limitation of the product in the inventory, error in pricing, error in product information etc. We also have the right to check out for extra information for the purpose of accepting orders in a few cases. We make sure to notify you if in case your order is cancelled partially or completely or if in case any extra data is required for the purpose of accepting your order.</p>

        <p className="mb-4">Once you place the order, such order can be cancelled from your end before the shipping is undertaken to the destination. Once the request of cancellation for ready for shipping product is received by us, we make sure to refund the amount through the same mode of payment within 5 working days. Cancellation of the order of Gold coin(exchanged by integrals) shall not be accepted as under Company’s policies.</p>

        <p className="mb-4">We don’t accept Cancellation requests for Smart Buy orders or customized jewellery orders. In specific situations when the customer wants the money back or wants to exchange it with other products, making charges of the product and stone charges, if there is any stone on the product shall be deducted from the payment and balance will be refunded back to customer account within 5 working days.</p>

        <p className="mb-4">If in case the amount is deducted from your account and the transaction has failed, the same will be refunded back to your account within 72 hours.</p>
      </div>

      <BottomNav />
    </main>
  );
}

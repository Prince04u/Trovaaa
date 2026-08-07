"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { getWithdrawAccounts, deleteWithdrawAccount } from "@/lib/walletApi";
import PageLoader from "@/components/brand/PageLoader";
import { useToasts, ToastStack } from "@/components/ui/Toast";

export default function BankCardPage() {
  const router = useRouter();
  const { toasts, push } = useToasts();
  const [bankCards, setBankCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchCards = async () => {
    try {
      const res = await getWithdrawAccounts();
      if (res?.data?.bank) {
        setBankCards(res.data.bank);
      } else {
        setBankCards([]);
      }
    } catch (err) {
      console.error("Failed to load bank cards", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleEdit = async () => {
    if (!selectedCard) return;
    setSheetOpen(false);
    setLoading(true);
    try {
      // 1. Delete old card from server
      await deleteWithdrawAccount(selectedCard.id);
      // 2. Save card to session storage
      sessionStorage.setItem("edit_bank_card", JSON.stringify(selectedCard));
      // 3. Redirect to add bank card page with edit mode
      router.push("/addbankcard?edit=true");
    } catch (err) {
      push(
        err.response?.data?.message ||
          err.message ||
          "Failed to update account.",
      );
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f4] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222] font-sans">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Bank Card</span>
        </div>
        <Link href="/addbankcard" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">add</span>
        </Link>
      </nav>

      {/* Content */}
      <div className="w-full flex-grow flex flex-col">
        {loading ? (
          <PageLoader />
        ) : bankCards.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-[14px]">No bank card added</div>
        ) : (
          <div className="flex flex-col bg-white">
            {bankCards.map((card, idx) => (
              <div 
                key={card.id || idx} 
                className="flex items-center justify-between py-3.5 px-4 border-b border-[#f5f5f5] bg-white text-[#333]"
              >
                {/* Left Card Icon and Info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[#f5f5f5] text-[#888]">
                    <span className="material-icons-outlined text-[22px]">credit_card</span>
                  </div>
                  {/* Card Details */}
                  <div className="flex flex-col select-text">
                    <span className="text-[15px] font-normal text-[#333] leading-tight">{card.accountName}</span>
                    <span className="text-[13px] text-[#666] leading-none mt-1.5">{card.accountNumber}</span>
                  </div>
                </div>
                
                {/* Right Info Action Button */}
                <button 
                  type="button"
                  onClick={() => { setSelectedCard(card); setSheetOpen(true); }}
                  className="text-gray-400 hover:text-[#009688] bg-transparent border-none outline-none cursor-pointer p-1 flex items-center justify-center transition-colors"
                >
                  <span className="material-icons-outlined text-[22px]">info</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet Action Menu */}
      {sheetOpen && selectedCard && (
        <>
          {/* Overlay Mask */}
          <div 
            className="fixed inset-0 z-[200] bg-black/45 transition-opacity duration-300"
            onClick={() => setSheetOpen(false)}
          />
          {/* Action Sheet Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-[201] bg-white rounded-t-[16px] shadow-2xl overflow-hidden flex flex-col pb-6 animate-slide-up select-none">
            <div className="px-6 py-4 border-b border-[#f2f3f5]">
              <span className="text-[13px] text-gray-400 font-normal">Select</span>
            </div>
            
            {/* Edit Option */}
            <button 
              type="button"
              className="flex items-center gap-3 px-6 py-[14px] hover:bg-gray-50 border-none bg-transparent w-full text-left cursor-pointer outline-none transition-colors"
              onClick={handleEdit}
            >
              <span className="material-icons-outlined text-[20px] text-[#555]">edit</span>
              <span className="text-[15px] font-normal text-[#333]">Edit</span>
            </button>

            {/* Delete Option */}
            <button 
              type="button"
              className="flex items-center gap-3 px-6 py-[14px] hover:bg-gray-50 border-none bg-transparent w-full text-left cursor-pointer outline-none transition-colors"
              onClick={() => { setSheetOpen(false); setDeleteConfirmOpen(true); }}
            >
              <span className="material-icons-outlined text-[20px] text-[#555]">delete</span>
              <span className="text-[15px] font-normal text-[#333]">Delete</span>
            </button>
          </div>
        </>
      )}

      {/* Confirm Delete Dialog Modal */}
      {deleteConfirmOpen && selectedCard && (
        <div 
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 px-6 select-none animate-fade-in"
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-[500px] rounded-[3px] shadow-2xl flex flex-col p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[17px] font-medium text-black m-0 mb-4">Confirm</h3>
            <p className="text-[13px] text-[#555] m-0 mb-6 leading-relaxed">
              Do you want to delete this bank card? {selectedCard.accountName} {selectedCard.accountNumber}
            </p>
            <div className="flex justify-end gap-6 text-[14px] font-medium tracking-wide">
              <button 
                type="button" 
                onClick={() => setDeleteConfirmOpen(false)}
                className="text-[#888] hover:text-[#555] bg-transparent border-none outline-none cursor-pointer font-medium"
              >
                CANCEL
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  push("Bank card information cannot be deleted", "error");
                }}
                className="text-[#f44336] hover:text-[#d32f2f] bg-transparent border-none outline-none cursor-pointer font-medium"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      <ToastStack toasts={toasts} />
    </main>
  );
}

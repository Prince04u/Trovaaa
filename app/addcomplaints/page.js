"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { getToken } from "@/lib/auth";

const TYPE_OPTIONS = [
  "Suggestion",
  "Consult",
  "Recharge Problem",
  "Withdraw Problem",
  "Parity Problem",
  "Gift Receive Problem",
  "Other",
];

export default function AddComplaintsPage() {
  const router = useRouter();
  const [type, setType] = useState("Recharge Problem");
  const [tempType, setTempType] = useState("Recharge Problem");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [outId, setOutId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const openPicker = () => {
    setTempType(type);
    setShowTypePicker(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please enter description");
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/users/me/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify({
          formTitle: `${type} Complaint`,
          data: {
            type,
            outId: outId.trim(),
            whatsapp: whatsapp.trim(),
            description: description.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit complaint");

      alert("Complaint submitted successfully!");
      router.push("/complaints");
    } catch (err) {
      alert(err.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333333]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[48px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-none w-full">
        <Link href="/complaints" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[22px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white ml-1">Add Complaints & Suggestion</span>
      </nav>

      <form onSubmit={handleSubmit} className="px-6 pt-6 flex flex-col w-full max-w-2xl mx-auto bg-white">
        {/* Type Field - Opens Bottom Picker Sheet */}
        <div className="flex flex-col mb-8 relative">
          <label className="text-[13px] font-normal text-[#888888] mb-2">Type</label>
          <div
            onClick={openPicker}
            className="relative flex items-center justify-between w-full border-b border-[#e0e0e0] pb-2 cursor-pointer"
          >
            <span className="text-[14px] text-[#333333]">{type}</span>
            <span className="material-icons-outlined text-[#888888] text-[20px] pointer-events-none">
              arrow_drop_down
            </span>
          </div>
        </div>

        {/* Out Id Field */}
        <div className="flex flex-col mb-8">
          <label className="text-[13px] font-normal text-[#888888] mb-2">Out Id</label>
          <input
            type="text"
            value={outId}
            onChange={(e) => setOutId(e.target.value)}
            className="w-full text-[14px] text-[#333333] border-b border-[#e0e0e0] pb-2 outline-none bg-transparent"
          />
        </div>

        {/* WhatsApp Field */}
        <div className="flex flex-col mb-8">
          <label className="text-[13px] font-normal text-[#888888] mb-2">WhatsApp</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full text-[14px] text-[#333333] border-b border-[#e0e0e0] pb-2 outline-none bg-transparent"
          />
        </div>

        {/* Description Field */}
        <div className="flex flex-col mb-10">
          <label className="text-[13px] font-normal text-[#888888] mb-2">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-[14px] text-[#333333] border-b border-[#e0e0e0] pb-2 outline-none bg-transparent resize-y"
          />
        </div>

        {/* Service Note */}
        <div className="text-center text-[13px] font-normal text-[#666666] mb-6">
          Service: 10:00~17:00, Mon~Fri about 1~5 business days
        </div>

        {/* Submit Button */}
        <div className="flex justify-center w-full">
          <button
            type="submit"
            disabled={loading}
            className="w-[75%] max-w-[360px] py-2.5 bg-[#009688] text-white rounded-[4px] text-[15px] font-normal border-none cursor-pointer hover:bg-[#00897b] transition-colors shadow-none outline-none"
          >
            {loading ? "Submitting..." : "Continue"}
          </button>
        </div>
      </form>

      {/* Bottom Sheet Type Picker Modal */}
      {showTypePicker && (
        <>
          {/* Dark Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={() => setShowTypePicker(false)}
          />

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[16px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#f0f0f0]">
              <button
                type="button"
                onClick={() => setShowTypePicker(false)}
                className="text-[15px] font-normal text-[#888888] bg-transparent border-none cursor-pointer p-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setType(tempType);
                  setShowTypePicker(false);
                }}
                className="text-[15px] font-normal text-[#5c8ce6] bg-transparent border-none cursor-pointer p-0"
              >
                Confirm
              </button>
            </div>

            {/* Options List */}
            <div className="py-4 px-4 max-h-[300px] overflow-y-auto flex flex-col items-center select-none">
              <div className="w-full flex flex-col items-center gap-3.5 py-2">
                {TYPE_OPTIONS.map((opt) => {
                  const isSelected = opt === tempType;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTempType(opt)}
                      className={`w-full py-1.5 text-center transition-all border-none bg-transparent cursor-pointer ${
                        isSelected
                          ? "text-[16px] font-medium text-[#222222]"
                          : "text-[14px] font-normal text-[#c8c9cc]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </main>
  );
}

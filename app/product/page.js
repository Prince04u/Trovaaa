"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

const PRODUCTS_DATA = {
  1: {
    id: 1,
    title: "Joyalukkas 18k (750) Rose Gold and Solitaire Pendant for Girls",
    price: "38576.00",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"],
    specs: {
      "Brand": "Joyalukkas",
      "Collection": "Solitaire",
      "Material": "Rose Gold",
      "Metal Stamp": "18k (750)",
      "Metal": "Rose Gold",
      "Purity": "18k",
      "Model Number": "JOY-18K-ROSE-01",
      "Qty": "1",
      "Warranty Description": "1 Year Brand Warranty",
      "Warranty Type": "Manufacturer Warranty"
    }
  },
  2: {
    id: 2,
    title: "Ratnavali Jewels American Diamond Traditional Fashion Jewellery Green Necklace Pendant Set with Earring",
    price: "2899.00",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"],
    specs: {
      "Brand": "Ratnavali Jewels",
      "Collection": "Traditional",
      "Stone": "American Diamond",
      "Stone Shape": "Round",
      "Stone Colour": "Green",
      "Material": "Brass",
      "Model Number": "RJ-AD-GRN-02",
      "Qty": "1 Set",
      "Warranty Description": "6 Months Manufacturer Warranty"
    }
  }
};

export default function ProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goodsId = searchParams.get("goodsId") || "1";

  const product = PRODUCTS_DATA[goodsId] || {
    id: goodsId,
    title: "Fashion Jewellery Product",
    price: "1999.00",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"],
    specs: {
      "Brand": "Jewellery Brand",
      "Material": "Gold Plated",
      "Qty": "1",
      "Warranty Description": "Manufacturer Warranty"
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-transparent border-none text-white cursor-pointer p-0 flex items-center"
        >
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <span className="text-[17px] font-normal text-white">Product</span>
      </nav>

      {/* Product Image Carousel */}
      <div className="w-full aspect-square bg-[#f0f0f0] relative">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-2">
        <p className="text-[16px] text-gray-800 font-normal m-0 leading-snug">{product.title}</p>
        <p className="text-[20px] text-[#E65100] font-bold m-0">₹ {product.price}</p>
        <button
          type="button"
          disabled
          className="mt-2 bg-[#cccccc] text-white py-3 rounded font-medium text-[15px] border-none w-full cursor-not-allowed"
        >
          Sold Out
        </button>
      </div>

      {/* Specifications Table */}
      <div className="p-4 bg-white mt-3 border-t border-b border-gray-200">
        <h3 className="text-[16px] font-medium text-[#333333] m-0 mb-3 pb-2 border-b border-gray-100">
          Product Specifications
        </h3>
        <table className="w-full text-[14px]">
          <tbody>
            {Object.entries(product.specs).map(([key, val]) => (
              <tr key={key} className="border-b border-gray-100">
                <td className="py-2.5 text-gray-500 font-normal w-1/3">{key}</td>
                <td className="py-2.5 text-gray-800 font-normal">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BottomNav />
    </main>
  );
}

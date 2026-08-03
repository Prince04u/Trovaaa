"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";

const PRODUCTS_DATA = {
  1: {
    id: 1,
    title: "【 Now 】 Series White 18K Gold Pair Ring",
    price: "38570.00",
    images: ["https://art.apex-king.com/uploads/images/51iEBQzCL5L._UL1500_.jpg"],
    specs: {
      "Brand": "Now",
      "Material": "18K Gold",
      "Qty": "1",
      "Warranty Description": "1 Year Brand Warranty"
    }
  },
  2: {
    id: 2,
    title: "【Cute Pet】 Series Rose 18K Gold Pearl Pendant",
    price: "2899.00",
    images: ["https://art.apex-king.com/uploads/images/71JvL64Y3cL._UY695_.jpg"],
    specs: {
      "Brand": "Cute Pet",
      "Material": "Rose 18K Gold",
      "Stone": "Pearl",
      "Qty": "1",
      "Warranty Description": "6 Months Manufacturer Warranty"
    }
  },
  3: {
    id: 3,
    title: "18K Gold Diamond Ruby Deer Horn Collar Chain",
    price: "4559.00",
    images: ["https://art.apex-king.com/uploads/images/71YWzTc2omL._UY695_.jpg"],
    specs: {
      "Material": "18K Gold",
      "Stone": "Diamond, Ruby",
      "Qty": "1"
    }
  },
  4: {
    id: 4,
    title: "Enzo Jewelry 14k Gold Seven Colored Gemstone Pendant",
    price: "5599.00",
    images: ["https://art.apex-king.com/uploads/images/4.jpg"],
    specs: {
      "Brand": "Enzo",
      "Material": "14k Gold",
      "Stone": "Gemstone",
      "Qty": "1"
    }
  },
  5: {
    id: 5,
    title: "Sukkhi Gleaming Pearl Gold Plated Wedding Jewellery Kundan Peacock Meenakari Multi-String Necklace",
    price: "1745.00",
    images: ["https://art.apex-king.com/uploads/images/5.jpg"],
    specs: {
      "Brand": "Sukkhi",
      "Material": "Gold Plated",
      "Stone": "Pearl, Kundan",
      "Qty": "1",
      "Warranty Description": "6 Months Manufacturer Warranty"
    }
  },
  6: {
    id: 6,
    title: "Ananth Jewels 925 Sterling Silver BIS Hallmarked Heart Bracelet for Women",
    price: "9000.00",
    images: ["https://art.apex-king.com/uploads/images/6.jpg"],
    specs: {
      "Brand": "Ananth Jewels",
      "Material": "925 Sterling Silver",
      "Qty": "1"
    }
  },
  7: {
    id: 7,
    title: "Handicraft Kottage ® 1gm 22Ct Gold Plated Pendant and Chain for Men/Women/Girls",
    price: "999.00",
    images: ["https://art.apex-king.com/uploads/images/7.jpg"],
    specs: {
      "Brand": "Handicraft Kottage",
      "Material": "Gold Plated",
      "Qty": "1"
    }
  },
  8: {
    id: 8,
    title: "Mansiyaorange Combo of Two Party One Gram Gold Forming Long Haram and Choker Set",
    price: "3199.00",
    images: ["https://art.apex-king.com/uploads/images/8.jpg"],
    specs: {
      "Brand": "Mansiyaorange",
      "Material": "Gold Forming",
      "Qty": "2 Sets"
    }
  }
};

function ProductDetailsContent() {
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
          onClick={() => router.push('/wallet/deposit')}
          className="mt-2 bg-[#2196f3] text-white py-3 rounded font-medium text-[15px] border-none w-full cursor-pointer"
        >
          Buy Now
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

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-gray-400">Loading...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
}

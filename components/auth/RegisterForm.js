"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PhoneInput from "@/components/auth/PhoneInput";
import PasswordInput from "@/components/auth/PasswordInput";
import BottomNav from "@/components/home/BottomNav";
import { register as registerRequest } from "@/lib/authApi";
import { saveAuth } from "@/lib/auth";
import { CHAT_ICON_B64, GIFT_ICON_B64, BACK_ICON_B64 } from "@/components/auth/AuthIconsData";
import LoadingDialog from "@/components/auth/LoadingDialog";
import { useToasts, ToastStack } from "@/components/ui/Toast";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    mobile: "",
    verificationCode: "",
    password: "",
    inviteCode: searchParams.get("ref")?.trim().toUpperCase() || "",
  });

  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { toasts, push: pushToast } = useToasts();

  useEffect(() => {
    if (otpCountdown === 0) return;
    const interval = setInterval(() => {
      setOtpCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  // Clear form when user switches tabs or hides browser, and on mount
  useEffect(() => {
    // Force clear on initial mount to defeat bfcache/browser restore
    setForm({
      mobile: "",
      verificationCode: "",
      password: "",
      inviteCode: searchParams.get("ref")?.trim().toUpperCase() || "",
    });
    setOtpCountdown(0);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setForm({
          mobile: "",
          verificationCode: "",
          password: "",
          inviteCode: searchParams.get("ref")?.trim().toUpperCase() || "",
        });
        setOtpCountdown(0);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!form.mobile) {
      pushToast("Mobile Number is required");
      return;
    }
    if (!/^\+91\d{10}$/.test(form.mobile)) {
      pushToast("Mobile Number is false");
      return;
    }
    if (!form.password) {
      pushToast("Password is required");
      return;
    }
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message && (data.message.toLowerCase().includes("verification") || data.message.toLowerCase().includes("false"))) {
          pushToast("Verification Code is false");
        } else {
          pushToast(data.message || "Failed to send OTP");
        }
      } else {
        setTimeout(() => {
          pushToast("success");
          setOtpCountdown(180);
        }, 1000);
      }
    } catch (err) {
      pushToast("Failed to send OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.mobile) {
      pushToast("Mobile Number is required");
      return;
    }

    if (!/^\+91\d{10}$/.test(form.mobile)) {
      pushToast("Mobile Number is false");
      return;
    }

    if (!form.verificationCode) {
      pushToast("Verification Code is required");
      return;
    }
    
    if (!form.password) {
      pushToast("Password is required");
      return;
    }

    if (!form.inviteCode) {
      pushToast("Invalid parameters");
      return;
    }

    if (!agree) {
      pushToast("Please agree to the Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      await registerRequest({
        name: `Player${form.mobile.slice(-4) || "01"}`,
        mobile: form.mobile,
        password: form.password,
        referralCode: form.inviteCode.trim().toUpperCase() || undefined,
        code: form.verificationCode,
      });

      setLoading(false);
      
      pushToast("success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Registration failed";
      if (errMsg.toLowerCase().includes("verification") || errMsg.toLowerCase().includes("false")) {
        pushToast("Verification Code is false");
      } else {
        pushToast(errMsg);
      }
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-dvh flex flex-col bg-[#fafafa] pb-20 relative overflow-x-hidden">
      {/* Top Teal Navbar — exact luvomall.games reference */}
      <header className="w-full bg-[#009688] text-white px-[15px] h-[56px] flex items-center gap-[30px] sticky top-0 z-40 select-none box-border"
        style={{ boxShadow: '0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12)' }}>
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0"
          aria-label="Go back"
        >
          <img src={BACK_ICON_B64} alt="Back" width="20" height="20" style={{ display: 'block', width: '20px', height: '20px' }} />
        </button>
        <span className="text-[20px] font-medium tracking-[0.02em] text-white leading-[56px]">Register</span>
      </header>

      {/* Form Content — recharge_box from reference */}
      <div className="w-full flex-1 box-border" style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} className="w-full flex flex-col" autoComplete="off" noValidate>
          {/* Mobile Number Field — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />
          </div>

          {/* Verification Code + OTP Button Row — special_box from reference */}
          <div className="w-full flex flex-row justify-between items-center" style={{ marginBottom: '24px' }}>
            <div className="van-card-input" style={{ width: '72%' }}>
              <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
                <img 
                  src={CHAT_ICON_B64} 
                  alt="Verification Code" 
                  width="20" 
                  height="20" 
                  style={{ 
                    display: 'block', 
                    width: '20px', 
                    height: '20px',
                    filter: form.verificationCode ? "invert(24%) sepia(87%) saturate(2256%) hue-rotate(264deg) brightness(97%) contrast(92%)" : "none"
                  }} 
                />
              </div>
              <input
                name="verificationCode"
                type="text"
                value={form.verificationCode}
                onChange={handleChange}
                placeholder="Verification Code"
                className="flex-1 bg-transparent text-[16px] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
                style={{ color: 'rgba(0,0,0,.87)' }}
              />
            </div>
            
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpCountdown > 0}
              className="van-otp-btn shrink-0"
            >
              {otpCountdown > 0 ? `${otpCountdown}s` : "OTP"}
            </button>
          </div>

          {/* Password Field — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <PasswordInput
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>

          {/* Recommendation Code (Invite Code) — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <div className="van-card-input">
              <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
                <img src={GIFT_ICON_B64} alt="Recommendation Code" width="20" height="20" style={{ display: 'block', width: '20px', height: '20px' }} />
              </div>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                value={form.inviteCode}
                onChange={handleChange}
                placeholder="Recommendation Code"
                className="flex-1 bg-transparent text-[16px] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
                style={{ color: 'rgba(0,0,0,.87)' }}
              />
            </div>
          </div>

          {/* Privacy Policy Checkbox Row — agree_box from reference */}
          <div className="flex items-center gap-[8px] select-none" style={{ marginBottom: '15px' }}>
            <input
              type="checkbox"
              id="privacy-agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-[16px] h-[16px] accent-[#111111] cursor-pointer"
            />
            <label htmlFor="privacy-agree" className="cursor-pointer" style={{ fontSize: '14px', color: 'rgba(0,0,0,.54)' }}>
              I agree <button type="button" onClick={() => setShowPrivacyModal(true)} className="hover:underline bg-transparent border-none p-0 cursor-pointer outline-none align-baseline inline-block" style={{ color: '#009688', fontWeight: 400, fontSize: '14px' }}>Privacy Policy</button>
            </label>
          </div>

          {/* Register Action Button — 65% width from reference */}
          <div className="flex justify-center w-full" style={{ padding: '15px 0 0 0' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="van-btn-teal"
              style={{ width: '65%', maxWidth: '640px' }}
            >
              Register
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
      <LoadingDialog visible={loading} />
      <ToastStack toasts={toasts} />

      {/* Privacy Policy Modal Overlay */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-[480px] h-[80vh] flex flex-col shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#f5f5f5] px-5 py-4 border-b border-[#e5e5e5] shrink-0">
              <h3 className="text-[18px] font-medium text-[#222222] m-0">Privacy Policy</h3>
            </div>
            
            {/* Scrollable Legal Content */}
            <div className="flex-grow overflow-y-auto p-5 text-[13.5px] text-[#333333] leading-relaxed space-y-4 text-left">
              <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
              
              <h4 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">Interpretation and Definitions</h4>
              <h5 className="text-[14px] font-medium text-[#222] mt-3">Interpretation</h5>
              <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
              
              <h5 className="text-[14px] font-medium text-[#222] mt-3">Definitions</h5>
              <p>For the purposes of this Privacy Policy:</p>
              <ul className="list-decimal pl-5 space-y-2">
                <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
                <li><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to Coem Shop.</li>
                <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
                <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
                <li><strong>Website</strong> refers to Coem Shop, accessible from <a href="https://coem.in" target="_blank" rel="noopener noreferrer" className="text-[#009688] underline">https://coem.in</a></li>
                <li><strong>Service</strong> refers to the Website.</li>
                <li><strong>Country</strong> refers to: Uttar Pradesh, India</li>
                <li><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
                <li><strong>Third-party Social Media Service</strong> refers to any website or any social network website through which a User can log in or create an account to use the Service.</li>
                <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
                <li><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</li>
                <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                <li><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
              </ul>

              <h4 className="text-[15px] font-semibold text-[#111] mt-5 mb-2">Collecting and Using Your Personal Data</h4>
              <h5 className="text-[14px] font-medium text-[#222] mt-3">Types of Data Collected</h5>
              <h6 className="text-[13.5px] font-medium text-[#333] mt-2">Personal Data</h6>
              <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Address, State, Province, ZIP/Postal code, City, Usage Data.</p>

              <h6 className="text-[13.5px] font-medium text-[#333] mt-2">Usage Data</h6>
              <p>Usage Data is collected automatically when using the Service. It may include information such as Your Device's IP address, browser type, browser version, the pages visited, duration, and other diagnostic data.</p>

              <h6 className="text-[13.5px] font-medium text-[#333] mt-2">Tracking Technologies and Cookies</h6>
              <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. You can instruct Your browser to refuse all Cookies, however some parts of our Service may not function. We use Necessary, Cookies Policy Acceptance, and Functionality Cookies.</p>

              <h4 className="text-[15px] font-semibold text-[#111] mt-5 mb-2">Use of Your Personal Data</h4>
              <p>The Company may use Personal Data to maintain our Service, manage Your Account, perform a contract, contact You, provide news/special offers, or manage Your requests. We may share information with Service Providers, for business transfers, with Affiliates, with business partners, or other users when public interaction occurs.</p>

              <h4 className="text-[15px] font-semibold text-[#111] mt-5 mb-2">Retention and Transfer of Your Personal Data</h4>
              <p>We retain Your Personal Data only as long as necessary. Your information represents Your agreement to transfer outside Your state/country jurisdiction where data protection laws may differ.</p>

              <h4 className="text-[15px] font-semibold text-[#111] mt-5 mb-2">Security of Your Personal Data</h4>
              <p>No method of transmission is 100% secure. While We strive to use commercially acceptable means, We cannot guarantee its absolute security.</p>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end px-5 py-3 border-t border-[#e5e5e5] bg-[#f9f9f9] shrink-0">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="bg-transparent border-none text-[#009688] font-semibold text-[14px] cursor-pointer outline-none hover:opacity-80"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


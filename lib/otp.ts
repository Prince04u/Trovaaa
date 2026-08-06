const OTP_API_KEY = "otp_live_hKSqnAx1m1SOncmYZGxVLYt7nypGXaCW";
const BASE_URL = "https://otp.hyperapi.in/api/public/v1";

export async function sendOtp(phone: string): Promise<{ success: boolean; session_id?: string; message?: string }> {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, ""); // strip characters like + or spaces
    // Ensure 10 digits if it starts with 91
    const targetPhone = cleanPhone.length > 10 && cleanPhone.startsWith("91") ? cleanPhone.slice(2) : cleanPhone;

    const res = await fetch(`${BASE_URL}/send-otp`, {
      method: "POST",
      headers: {
        "x-api-key": OTP_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({ phone: targetPhone }),
    });

    const data = await res.json();
    if (res.ok && (data.status === "success" || data.session_id)) {
      return { success: true, session_id: data.session_id };
    }
    return { success: false, message: data.message || "Failed to send OTP via HyperAPI" };
  } catch (err: any) {
    console.error("HyperAPI Send OTP helper error:", err);
    return { success: false, message: err.message || "Failed to send OTP" };
  }
}

export async function verifyOtp(sessionId: string, code: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "x-api-key": OTP_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId, code }),
    });

    const data = await res.json();
    if (res.ok && (data.status === "success" || data.success)) {
      return { success: true };
    }
    return { success: false, message: data.message || "Invalid verification code." };
  } catch (err: any) {
    console.error("HyperAPI Verify OTP helper error:", err);
    return { success: false, message: err.message || "Failed to verify OTP" };
  }
}

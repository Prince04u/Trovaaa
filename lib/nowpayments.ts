function getNowpaymentsApiKey(): string {
  const apiKey = process.env.NOWPAYMENTS_API_KEY?.trim().replace(/^"|"$/g, '');
  if (!apiKey) {
    throw new Error("CRITICAL SECURITY ERROR: NOWPAYMENTS_API_KEY environment variable is not defined!");
  }
  return apiKey;
}
const NOWPAYMENTS_BASE_URL = "https://api.nowpayments.io/v1";

export interface CreatePaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  expiration_estimate_date: string;
}

export interface PaymentStatusResponse {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  created_at: string;
  updated_at: string;
}

export async function createNowPaymentsPayment(
  priceAmount: number,
  payCurrency: string,
  orderId: string,
  ipnCallbackUrl?: string
): Promise<CreatePaymentResponse> {
  const headers = {
    "x-api-key": getNowpaymentsApiKey(),
    "Content-Type": "application/json",
  };

  const body = {
    price_amount: priceAmount,
    price_currency: "inr",
    pay_currency: payCurrency,
    order_id: orderId,
    ipn_callback_url: ipnCallbackUrl || undefined,
    is_fee_paid_by_user: false,
  };

  const response = await fetch(`${NOWPAYMENTS_BASE_URL}/payment`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NOWPayments creation failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function createNowPaymentsInvoice(
  priceAmount: number,
  orderId: string,
  payCurrency: string,
  ipnCallbackUrl?: string
): Promise<{ invoice_url: string; id: string }> {
  const headers = {
    "x-api-key": getNowpaymentsApiKey(),
    "Content-Type": "application/json",
  };

  const body = {
    price_amount: priceAmount,
    price_currency: "inr",
    pay_currency: payCurrency,
    order_id: orderId,
    ipn_callback_url: ipnCallbackUrl || undefined,
  };

  const response = await fetch(`${NOWPAYMENTS_BASE_URL}/invoice`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NOWPayments invoice creation failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function getNowPaymentsPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  const headers = {
    "x-api-key": getNowpaymentsApiKey(),
  };

  const response = await fetch(`${NOWPAYMENTS_BASE_URL}/payment/${paymentId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NOWPayments status fetch failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

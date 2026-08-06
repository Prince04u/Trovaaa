"use client";

export default function PreSaleRulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4 select-none">
      <div className="bg-white w-full max-w-[500px] rounded-lg flex flex-col relative overflow-hidden shadow-2xl max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f2f3f5]">
          <h3 className="text-[17px] font-bold text-black m-0">Privacy Policy</h3>
        </div>
        
        {/* Scrollable Body */}
        <div className="px-6 py-4 text-[13px] text-[#333] leading-[1.6] overflow-y-auto max-h-[60vh] whitespace-pre-line font-sans scrollbar-thin">
          {`In order to protect the legitimate rights and interests of users participating in the presale and maintain the normal operation order of the presale, the rules are formulated in accordance with relevant agreements and rules of national laws and regulations.

Chapter 1 Definition

1.1   Presale definition: refers to a sales model in which a merchant provides a product or service plan, gathers consumer orders through presale product tools, and provides goods and / or services to consumers according to prior agreement.

1.2   The presale model is a "deposit" model. "Deposit" refers to a fixed amount of presale commodity price pre-delivered. “The deposit” can participate in small games and have the opportunity to win more deposits. The deposit can be directly exchanged for commodities. The deposit is not redeemable.

1.3   Presale products: refers to the products released by merchants using presale product tools. Only the presale words are marked on the product title or product details page, and the products that do not use the presale product tools are not presale products.

1.4   Presale system: Refers to the system product tools provided to support merchants for presale model sales.

1.5   Presale commodity price: refers to the selling price of presale commodity. The price of presale goods is composed of two parts: deposit and final payment.

1.6   Presale deposit: Refers to a certain amount of money that consumers pay in advance when purchasing presale goods, which is mainly used as a guarantee to purchase presale goods and determine the purchase quota.

1.7   Presale final payment: refers to the amount of money that the consumer still has to pay after the presale commodity price minus the deposit.

 

Chapter 2 Presale management specifications

2.1 Commodity management

2.1.1 Presale deposit time: up to 7 days can be set.

2.1.2 Presale final payment time: The start time of the final payment is within 7 days.

2.1.3 During the presale of commodities, the system does not support merchants to modify the price of pre-sold commodities (including deposits and balances), but the amount of remaining commodity inventory can be modified according to the actual situation of inventory.

2.1.4 To avoid unnecessary disputes, If the presale product is a customized product, the merchant should clearly inform the consumer on the product page of the production cycle and delivery time of the product, and contact the consumer to confirm the delivery standard, delivery time, etc.

2.1.5 For customized products, the merchant has not agreed with the consumer on the delivery time and delivery standard, the delivery standard proposed by the consumer is unclear or conflicts and after the merchant places an order, he(she) starts production and delivery without confirming with the consumer, if the consumer initiates a dispute as a result, the platform will treat it as a normal delivery time limit order fulfillment.

2.2 Transaction management

2.2.1 Consumers who use the pre-sale system will lock in the pre-sale quota after placing an order for goods. If the pre-sale order is overtime, the system will automatically cancel it.

2.2.2 During the presale period, the merchant shall not cancel the presale activities without reason. For presale activities that have generated orders, the merchant must not cancel the order without the consumer ’s consent. If the consumer agrees, the merchant should double return the deposit paid by the consumer; if the consumer does not agree to cancel the order, the merchant should perform the contract according to the order.

2.2.3 If the final payment of the presale order is not completed due to consumer reasons, the merchant can deduct the deposit paid by the consumer; if the merchant actively negotiates with the consumer to terminate the order before paying the final payment, the merchant shall double Return the deposit paid by the consumer.

2.3 Delivery Management

2.3.1 Delivery time limit setting

If the merchant sets the delivery time limit through the presale system, it should be shipped within the set time limit.

2.3.2 Shipping way

The third-party delivery the orders.

Customers need to provide your name, address and phone number to facilitate third-party delivery orders.

2.4 After-sales management

Presale products shall provide after-sales service in accordance with the "Regulations for After-sales Service of Platform Merchants".

 

Explanation

Mall transaction mode

There are two ways to buy in the mall, one is full purchase, and the other is deposit purchase.

In the mode of full purchase, you can place an order directly and purchase goods in full payment.

The deposit purchase mode will freeze the customer's deposit, and the customer will take delivery after completing the final payment within 7 days. Users who have paid a deposit will be given an extra point quiz game. According to the analysis of market fluctuations, they have the opportunity to win more points to deduct the payment or send red envelopes to friends.

 

The pre-order model has many benefits for customers. The deposit not only generates an order for the customer, but also gives the customer an equal amount of red envelopes, which can be withdrawn immediately. Although the deposit is not refundable, the red envelope converted from the deposit can be withdrawn without any loss to the customer.

 

一. After the customer pays the deposit and orders, a merchandise order is generated, and the mall began to prepare this order. This deposit cannot be returned. After the customer needs to make up the balance, the mall will ship the goods. If the customer does not make up the balance, the product order will always exist.

二. After paying the deposit, the customer will be given a red envelope account with the same amount of deposit.

1. The red envelope can be withdrawn directly, so that instead of losing money, the customer has added a commodity order generated by a deposit. And red envelopes can also be given to friends.

2. If the customer uses the red envelope account to participate in the game, you can earn more red envelopes, but if the game loses, the red envelope will be gone, but his merchandise order is still there.


Note: I have carefully read all contents of this presale management rule, Risk Disclosure Agreement and Risk Agreement and I am agreed to continue with my own risk.`}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-[#f2f3f5]">
          <button 
            type="button"
            onClick={onClose} 
            className="text-[#009688] hover:text-[#00796b] text-[14px] font-bold bg-transparent border-none outline-none cursor-pointer tracking-wider"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

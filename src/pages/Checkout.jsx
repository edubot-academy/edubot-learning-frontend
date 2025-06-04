import React from "react";
import CheckoutCards from "../components/CheckoutCards";
import CheckoutPaymentForm from "../components/CheckoutPaymentForm";

function Checkout() {
  return (
    <div className="max-w-[1500px] pt-12 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start gap-10 py-10">
        <CheckoutCards />
        <CheckoutPaymentForm />
      </div>
    </div>
  );
}

export default Checkout;

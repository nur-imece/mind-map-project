import PaymentService from "../services/api/payment";

function PaymentStatusChecker() { 

    var paymentInformation = JSON.parse(localStorage.getItem('ps5e6r6rq7'));
    if (paymentInformation) {
        if (paymentInformation.x4r6eeg99y == 2 && paymentInformation.f7r8e9w55s) {
            PaymentService.putPaymentStatus(paymentInformation.f7r8e9w55s,paymentInformation.x4r6eeg99y);
          }
    }
}

export default PaymentStatusChecker;
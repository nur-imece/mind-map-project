import request from './request';
import { PATHS } from './paths';

const paymentHistoryService = {
  updatePaymentHistory: async (
    customerOrderId: string,
    paymentStatus: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(
      `${PATHS.PAYMENT_HISTORY.UPDATE_PAYMENT_HISTORY}?customerOrderId=${encodeURIComponent(customerOrderId)}&paymentStatus=${paymentStatus}`
    );
    return response;
  }
};

export default paymentHistoryService; 
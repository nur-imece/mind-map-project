import request from './request';
import { PATHS } from './paths';

const paymentService = {
  createPayment: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.PAYMENT.CREATE_PAYMENT, data);
    return response;
  },

  createAiPayment: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.PAYMENT.CREATE_AI_PAYMENT, data);
    return response;
  },

  callback: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.PAYMENT.CALLBACK, data);
    return response;
  },

  checkPayment: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.PAYMENT.CHECK_PAYMENT, data);
    return response;
  },

  checkAiPayment: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.PAYMENT.CHECK_AI_PAYMENT, data);
    return response;
  }
};

export default paymentService; 
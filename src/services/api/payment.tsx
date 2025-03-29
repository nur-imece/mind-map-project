import request from './request';
import { PATHS } from './paths';
import axios from 'axios';

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
  },

  getUserIpInfo: async (): Promise<{ data?: any; error?: string }> => {
    try {
      const response = await axios.get("https://ipapi.co/json/?key=MbOOO7PBCKlAUHDuQzM8KHFErEeEN78e77YNMamfmSTDxGjSCw");
      return { data: response.data };
    } catch (error) {
      console.error("Error getting user IP info:", error);
      return { error: "Failed to fetch IP information" };
    }
  }
};

export default paymentService; 
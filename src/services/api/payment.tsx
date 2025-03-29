import request from './request';
import { PATHS } from './paths';
import axios from 'axios';
import PaymentModel from '../../models/Payment';
import { message } from 'antd';

interface RequestRepeater {
  repeater: (func: Function, args: any[], maxAttempts: number) => void;
}

const requestRepeater: RequestRepeater = {
  repeater: (func: Function, args: any[], maxAttempts: number) => {
    if (maxAttempts > 0) {
      setTimeout(() => {
        func(...args);
      }, 1000);
    }
  }
};

const paymentService = {
  // Show error modals
  openErrorModal: () => {
    message.error('Payment service is currently unavailable. Please try again later.');
  },

  openRepeaterWarningModal: () => {
    message.warning('Payment request is being retried. Please wait...');
  },

  openRepeaterErrorModal: () => {
    message.error('There was an error processing your payment. Retrying...');
  },

  // Request repeater for retry logic
  requestRepeater,

  // Track payment status when user cancels or clicks X
  trackPaymentStatus: (status: string, conversationId: string) => {
    if (status && conversationId) {
      PaymentModel.x4r6eeg99y = status;
      PaymentModel.f7r8e9w55s = conversationId;
      localStorage.setItem("ps5e6r6rq7", JSON.stringify(PaymentModel));
    }
  },

  // Monitor iyzico modal for close button clicks
  monitorIyzicoCloseClick: (conversationId: string) => {
    // Wait for iyzico iframe to load
    setTimeout(() => {
      const iyziFrame = document.querySelector('iframe[name="iyzico-checkout-form"]');
      if (iyziFrame) {
        // Track when user clicks the X button
        try {
          const frameDoc = (iyziFrame as HTMLIFrameElement).contentDocument || 
                          ((iyziFrame as HTMLIFrameElement).contentWindow?.document);
          
          if (frameDoc) {
            const closeButton = frameDoc.querySelector('.close-button') as HTMLElement;
            if (closeButton) {
              closeButton.addEventListener('click', () => {
                paymentService.trackPaymentStatus('CANCELLED', conversationId);
              });
            }
          }
        } catch (e) {
          console.error('Error accessing iframe content:', e);
        }
      }
    }, 2000); // Give time for iframe to load
  },

  createPayment: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    try {
      const response = await request.post(PATHS.PAYMENT.CREATE_PAYMENT, data);
      
      if (response.data) {
        // Store token and conversationId in PaymentModel
        PaymentModel.ss7ss8w9erp = response.data.token; 
        PaymentModel.f7r8e9w55s = response.data.conversationId;
        
        // Store payment information in localStorage
        localStorage.setItem("ps5e6r6rq7", JSON.stringify(PaymentModel));
        
        // Monitor for close button clicks
        paymentService.monitorIyzicoCloseClick(response.data.conversationId);
        
        return response;
      } else if (response.error) {
        // Handle error with retry logic
        requestRepeater.repeater(
          paymentService.createPayment,
          [data],
          3
        );
        paymentService.openRepeaterErrorModal();
        return { error: response.error };
      }
      
      return response;
    } catch (error) {
      paymentService.openErrorModal();
      return { error: "Payment service error" };
    } finally {
    }
  },

  createAiPayment: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {

    try {
      const response = await request.post(PATHS.PAYMENT.CREATE_AI_PAYMENT, data);
      
      if (response.data) {
        // Store token and conversationId in PaymentModel
        PaymentModel.ss7ss8w9erp = response.data.token;
        PaymentModel.f7r8e9w55s = response.data.conversationId;
        
        // Store payment information in localStorage
        localStorage.setItem("ps5e6r6rq7", JSON.stringify(PaymentModel));
        
        // Monitor for close button clicks
        paymentService.monitorIyzicoCloseClick(response.data.conversationId);
        
        return response;
      } else if (response.error) {
        // Handle error with retry logic
        requestRepeater.repeater(
          paymentService.createAiPayment,
          [data],
          3
        );
        paymentService.openRepeaterErrorModal();
        return { error: response.error };
      }
      
      return response;
    } catch (error) {
      paymentService.openErrorModal();
      return { error: "Payment service error" };
    } finally {
    }
  },

  callback: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    try {
      const response = await request.post(PATHS.PAYMENT.CALLBACK, data);
      
      if (response.data) {
        // Store callback response in PaymentModel
        PaymentModel.li4y1t0qq23w = response.data;
        localStorage.setItem("ps5e6r6rq7", JSON.stringify(PaymentModel));
      }
      
      return response;
    } catch (error) {
      console.error("Callback error:", error);
      return { error: "Callback service error" };
    }
  },

  checkPayment: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    try {
      const response = await request.post(PATHS.PAYMENT.CHECK_PAYMENT, data);
      return response;
    } catch (error) {
      console.error("Check payment error:", error);
      return { error: "Check payment service error" };
    }
  },

  checkAiPayment: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    try {
      const response = await request.post(PATHS.PAYMENT.CHECK_AI_PAYMENT, data);
      return response;
    } catch (error) {
      console.error("Check AI payment error:", error);
      return { error: "Check AI payment service error" };
    }
  },

  getUserIpInfo: async (): Promise<{ data?: any; error?: string }> => {
    try {
      const response = await axios.get("https://ipapi.co/json/?key=MbOOO7PBCKlAUHDuQzM8KHFErEeEN78e77YNMamfmSTDxGjSCw");
      localStorage.setItem("countryInfo", response?.data?.country_code);
      return { data: response.data };
    } catch (error) {
      console.error("Error getting user IP info:", error);
      return { error: "Failed to fetch IP information" };
    }
  }
};

export default paymentService; 
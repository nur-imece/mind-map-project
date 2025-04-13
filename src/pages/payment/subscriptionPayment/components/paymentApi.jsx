import accountService from '../../../../services/api/account';
import paymentService from '../../../../services/api/payment';
import paymentHistoryService from '../../../../services/api/paymenthistory';
import tokenService from '../../../../services/api/token';
import Utils from '../../../../utils';

const paymentApi = {
  getUserIpInfo: async () => {
    try {
      const { data, error } = await paymentService.getUserIpInfo();
      return { data, error };
    } catch (error) {
      console.error('Error getting user IP info:', error);
      return { error };
    }
  },
  
  getUserProfile: async () => {
    try {
      const { data, error } = await accountService.getDetail();
      return { data, error };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { error };
    }
  },
  
  updatePaymentStatus: async (conversationId, status) => {
    try {
      const result = await paymentHistoryService.updatePaymentHistory(conversationId, status);
      return { success: true, result };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error };
    }
  },
  
  refreshToken: async () => {
    try {
      const { data, error } = await tokenService.refresh({});
      return { data, error };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { error };
    }
  },
  
  createPayment: async (payment) => {
    try {
      Utils.loadingScreen('show');
      const { data, error } = await paymentService.createPayment(payment);
      
      if (!data) {
        Utils.loadingScreen('hide');
      }
      
      return { data, error };
    } catch (error) {
      Utils.loadingScreen('hide');
      console.error('Error creating payment:', error);
      return { error };
    }
  },
  
  // Fetch pricing data from API
  fetchPricingData: async (language) => {
    try {
      // This is a placeholder for the actual API call
      // In a real implementation, you would call an API endpoint
      // For now, we're mocking a response structure
      const productListApiUrl = '/Product/GetProductList';

      // Simulate API response until we have real implementation
      return {
        data: {
          isPublic: false,
          couponCode: '',
          productList: [
            { id: 1, productName: 'Monthly', price: '29.99', interval: 'month' },
            { id: 2, productName: 'Yearly', price: '299.99', interval: 'year' }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      return { error: 'Failed to fetch pricing data' };
    }
  },
  
  applyCouponCode: async (code) => {
    try {
      Utils.loadingScreen('show');
      
      // This would be replaced with an actual API call
      // Simulating a response structure
      const response = {
        result: true,
        data: {
          productDetailId: 1,
          currentPrice: '19.99'
        }
      };
      
      Utils.loadingScreen('hide');
      return response;
    } catch (error) {
      Utils.loadingScreen('hide');
      console.error('Error applying coupon:', error);
      return null;
    }
  }
};

export default paymentApi; 
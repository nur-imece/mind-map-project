import request from './request';
import { PATHS } from './paths';

const subscriptionService = {
  getCompanySubscriptionByUserId: async (
    userId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.SUBSCRIPTION.GET_COMPANY_SUBSCRIPTION_BY_USER_ID}?userId=${userId}`
    );
    return response;
  }
};

export default subscriptionService; 
import request from './request';
import { PATHS } from './paths';

const orderService = {
  createOrder: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.ORDER.CREATE_ORDER, data);
    return response;
  }
};

export default orderService; 
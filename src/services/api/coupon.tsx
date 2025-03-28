import request from './request';
import { PATHS } from './paths';

const couponService = {
  createCoupon: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.COUPON.CREATE_COUPON, data);
    return response;
  },

  updateCoupon: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(PATHS.COUPON.UPDATE_COUPON, data);
    return response;
  },

  deleteCoupon: async (
    couponId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.delete(
      `${PATHS.COUPON.DELETE_COUPON}?couponId=${couponId}`
    );
    return response;
  },

  changeCouponStatus: async (
    couponId: number,
    isActive: boolean
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(
      `${PATHS.COUPON.CHANGE_COUPON_STATUS}?couponId=${couponId}&isActive=${isActive}`
    );
    return response;
  },

  getCoupons: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.COUPON.GET_COUPONS);
    return response;
  },

  usePersonalCoupon: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.COUPON.USE_PERSONAL_COUPON, data);
    return response;
  },

  searchUserByName: async (
    username: string
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.COUPON.SEARCH_USER_BY_NAME}?username=${encodeURIComponent(username)}`
    );
    return response;
  },

  getCouponById: async (
    id: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.COUPON.GET_COUPON_BY_ID}?id=${id}`
    );
    return response;
  }
};

export default couponService; 
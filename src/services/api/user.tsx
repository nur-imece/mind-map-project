import request from './request';
import { PATHS } from './paths';

const userService = {
  userById: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.USER.USER_BY_ID, { headers: data });
    return response;
  },

  userByMail: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.USER.USER_BY_MAIL, { headers: data });
    return response;
  },

  users: async (
    recordSize?: number
  ): Promise<{ data?: any; error?: string }> => {
    const url = recordSize
      ? `${PATHS.USER.USERS}?recordSize=${recordSize}`
      : PATHS.USER.USERS;
    const response = await request.get(url);
    return response;
  },

  getAllUserTypes: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.USER.GET_ALL_USER_TYPES);
    return response;
  },

  getUserSubscriptions: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.USER.GET_USER_SUBSCRIPTIONS);
    return response;
  },

  updateTrialDayEndDate: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.USER.UPDATE_TRIAL_DAY_END_DATE, data);
    return response;
  }
};

export default userService; 
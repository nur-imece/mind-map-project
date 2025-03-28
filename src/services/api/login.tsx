import request from './request';
import { PATHS } from './paths';

const loginService = {
  login: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.LOGIN.LOGIN, data);
    return response;
  },

  register: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.LOGIN.REGISTER, data);
    return response;
  },

  createUser: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.LOGIN.CREATE_USER, data);
    return response;
  },

  updateUser: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.LOGIN.UPDATE_USER, data);
    return response;
  },

  changePassword: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.LOGIN.CHANGE_PASSWORD, data);
    return response;
  },

  makePassiveOrActiveUser: async (
    userId: number,
    isActive: boolean
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.LOGIN.MAKE_PASSIVE_OR_ACTIVE_USER}?userId=${userId}&isActive=${isActive}`
    );
    return response;
  },

  getUsers: async (
    companyId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.LOGIN.GET_USERS}?companyId=${companyId}`
    );
    return response;
  },

  getUserById: async (
    userId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.LOGIN.GET_USER_BY_ID}?userId=${userId}`
    );
    return response;
  },

  updateCompany: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.LOGIN.UPDATE_COMPANY, data);
    return response;
  },

  getCompanyById: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.LOGIN.GET_COMPANY_BY_ID, data);
    return response;
  }
};

export default loginService; 
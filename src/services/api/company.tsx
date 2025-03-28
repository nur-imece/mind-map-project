import request from './request';
import { PATHS } from './paths';
import { BaseResponse } from '@/types/account.ts';

const companyService = {
  createCompany: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.COMPANY.CREATE_COMPANY, data);
    return response;
  },

  createCompanyUser: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.COMPANY.CREATE_COMPANY_USER, data);
    return response;
  },

  updateCompany: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(PATHS.COMPANY.UPDATE_COMPANY, data);
    return response;
  },

  getAllCompany: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.COMPANY.GET_ALL_COMPANY);
    return response;
  },

  getCompanyById: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.COMPANY.GET_COMPANY_BY_ID, data);
    return response;
  },

  makeActivePassiveCompany: async (
    companyId: number,
    isActive: boolean
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.COMPANY.MAKE_ACTIVE_PASSIVE_COMPANY}?companyId=${companyId}&isActive=${isActive}`
    );
    return response;
  },

  createCompanySubscription: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.COMPANY.CREATE_COMPANY_SUBSCRIPTION, data);
    return response;
  },

  deleteCompanyAdmin: async (
    userId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.delete(
      `${PATHS.COMPANY.DELETE_COMPANY_ADMIN}?userId=${userId}`
    );
    return response;
  },

  getCompanyAdmins: async (
    companyId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.COMPANY.GET_COMPANY_ADMINS}?companyId=${companyId}`
    );
    return response;
  },

  addCompanyAdmin: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.COMPANY.ADD_COMPANY_ADMIN, data);
    return response;
  },

  updateCompanySubscription: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(PATHS.COMPANY.UPDATE_COMPANY_SUBSCRIPTION, data);
    return response;
  },

  getCompanySubscription: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.COMPANY.GET_COMPANY_SUBSCRIPTION);
    return response;
  }
};

export default companyService; 
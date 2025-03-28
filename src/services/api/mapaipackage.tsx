import request from './request';
import { PATHS } from './paths';

const mapAiPackageService = {
  updateMapAiPackage: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(PATHS.MAP_AI_PACKAGE.UPDATE_MAP_AI_PACKAGE, data);
    return response;
  },

  createMapAiPackage: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.MAP_AI_PACKAGE.CREATE_MAP_AI_PACKAGE, data);
    return response;
  },

  getRemainingMaps: async (
    userId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.MAP_AI_PACKAGE.GET_REMAINING_MAPS}?userId=${userId}`
    );
    return response;
  },

  assignAiMapToUser: async (
    email: string,
    mapPackageId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.MAP_AI_PACKAGE.ASSIGN_AI_MAP_TO_USER}?email=${encodeURIComponent(email)}&mapPackageId=${mapPackageId}`
    );
    return response;
  },

  assignAiMapToCompanyUser: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.MAP_AI_PACKAGE.ASSIGN_AI_MAP_TO_COMPANY_USER, data);
    return response;
  },

  getAiPackage: async (
    packageId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.MAP_AI_PACKAGE.GET_AI_PACKAGE}?packageId=${packageId}`
    );
    return response;
  },

  getAllUserAiPackage: async (
    currency: string
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.MAP_AI_PACKAGE.GET_ALL_USER_AI_PACKAGE}?currency=${encodeURIComponent(currency)}`
    );
    return response;
  },

  getAllAdminPanelAiPackage: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.MAP_AI_PACKAGE.GET_ALL_ADMIN_PANEL_AI_PACKAGE);
    return response;
  },

  getAiPackageHistory: async (
    userId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.MAP_AI_PACKAGE.GET_AI_PACKAGE_HISTORY}?userId=${userId}`
    );
    return response;
  }
};

export default mapAiPackageService; 
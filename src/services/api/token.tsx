import request from './request';
import { PATHS } from './paths';

const tokenService = {
  refresh: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.TOKEN.REFRESH, data);
    return response;
  }
};

export default tokenService; 
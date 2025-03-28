import request from './request';
import { PATHS } from './paths';

const mailService = {
  allinCyber: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.MAIL.ALLIN_CYBER, data);
    return response;
  }
};

export default mailService; 
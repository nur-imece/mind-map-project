import request from './request';
import { PATHS } from './paths';

const historyService = {
  getCountOfUsersAndTeachersAndMaps: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.HISTORY.GET_COUNT_OF_USERS_AND_TEACHERS_AND_MAPS);
    return response;
  }
};

export default historyService; 
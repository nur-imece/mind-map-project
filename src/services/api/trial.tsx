import request from './request';
import { PATHS } from './paths';

const trialService = {
  getTrialDay: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.TRIAL.GET_TRIAL_DAY);
    return response;
  },

  postTelemetryDataFromBody: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.TRIAL.POST_TELEMETRY_DATA_FROM_BODY, data);
    return response;
  }
};

export default trialService; 
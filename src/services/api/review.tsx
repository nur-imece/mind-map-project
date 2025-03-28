import request from './request';
import { PATHS } from './paths';

const reviewService = {
  create: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.REVIEW.CREATE, data);
    return response;
  },

  list: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.REVIEW.LIST);
    return response;
  },

  acceptApprovalOfReview: async (
    objectId: number,
    taskId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.REVIEW.ACCEPT_APPROVAL_OF_REVIEW}?ObjectId=${objectId}&TaskId=${taskId}`
    );
    return response;
  },

  rejectApprovalOfReview: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.REVIEW.REJECT_APPROVAL_OF_REVIEW, data);
    return response;
  }
};

export default reviewService; 
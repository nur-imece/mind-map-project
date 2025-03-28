import request from './request';
import { PATHS } from './paths';

const videoInfoService = {
  createVideoInfo: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.VIDEO_INFO.CREATE_VIDEO_INFO, data);
    return response;
  },

  updateVideoInfo: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(PATHS.VIDEO_INFO.UPDATE_VIDEO_INFO, data);
    return response;
  },

  deleteVideoInfo: async (
    videoInfoId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.delete(
      `${PATHS.VIDEO_INFO.DELETE_VIDEO_INFO}?videoInfoId=${videoInfoId}`
    );
    return response;
  },

  getVideoInfoById: async (
    videoInfoId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.VIDEO_INFO.GET_VIDEO_INFO_BY_ID}?videoInfoId=${videoInfoId}`
    );
    return response;
  },

  getActiveVideoInfoById: async (
    videoInfoId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.VIDEO_INFO.GET_ACTIVE_VIDEO_INFO_BY_ID}?videoInfoId=${videoInfoId}`
    );
    return response;
  },

  getVideoInfoList: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.VIDEO_INFO.GET_VIDEO_INFO_LIST);
    return response;
  },

  getActiveVideoInfoList: async (
    title?: string[]
  ): Promise<{ data?: any; error?: string }> => {
    let url = PATHS.VIDEO_INFO.GET_ACTIVE_VIDEO_INFO_LIST;
    
    if (title && title.length > 0) {
      const titleParams = title.map(t => `title=${encodeURIComponent(t)}`).join('&');
      url = `${url}?${titleParams}`;
    }
    
    const response = await request.get(url);
    return response;
  },

  updateVideoInfoActiveStatus: async (
    videoInfoId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.VIDEO_INFO.UPDATE_VIDEO_INFO_ACTIVE_STATUS}?videoInfoId=${videoInfoId}`
    );
    return response;
  }
};

export default videoInfoService; 
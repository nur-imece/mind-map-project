import request from './request';
import { PATHS } from './paths';

const tagService = {
  createTag: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(PATHS.TAG.CREATE_TAG, data);
    return response;
  },

  updateTag: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(PATHS.TAG.UPDATE_TAG, data);
    return response;
  },

  deleteTag: async (
    tagId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.TAG.DELETE_TAG}?tagId=${tagId}`
    );
    return response;
  },

  getTagListByAdmin: async (
    tagName?: string,
    recordSize?: number
  ): Promise<{ data?: any; error?: string }> => {
    let url = PATHS.TAG.GET_TAG_LIST_BY_ADMIN;
    const params: string[] = [];
    
    if (tagName) {
      params.push(`tagName=${encodeURIComponent(tagName)}`);
    }
    
    if (recordSize) {
      params.push(`recordSize=${recordSize}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await request.get(url);
    return response;
  },

  getTagList: async (
    tagName?: string,
    recordSize?: number
  ): Promise<{ data?: any; error?: string }> => {
    let url = PATHS.TAG.GET_TAG_LIST;
    const params: string[] = [];
    
    if (tagName) {
      params.push(`tagName=${encodeURIComponent(tagName)}`);
    }
    
    if (recordSize) {
      params.push(`recordSize=${recordSize}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await request.get(url);
    return response;
  }
};

export default tagService; 
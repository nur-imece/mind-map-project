import request from './request';
import { PATHS } from './paths';

const templateListService = {
  getTemplateList: async (recordSize, languageId, tags) => {
    try {
      const params = {};
      if (recordSize) params.recordSize = recordSize;
      if (languageId) params.languageId = languageId;
      if (tags && tags.length > 0) params.tags = tags.join(',');
      
      const response = await request.get(PATHS.TEMPLATE.GET_TEMPLATE_LIST, params);
      return response.data?.templateList || [];
    } catch (error) {
      console.error("Error fetching template list:", error);
      return [];
    }
  },
  
  deleteTemplateCategory: async (categoryId) => {
    try {
      const response = await request.delete(
        `${PATHS.TEMPLATE.DELETE_TEMPLATE}?id=${categoryId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting template category:", error);
      throw error;
    }
  },
  
  updateTemplateCategory: async (data) => {
    try {
      const response = await request.put(
        PATHS.TEMPLATE.UPDATE_TEMPLATE, data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating template category:", error);
      throw error;
    }
  },
  
  createTemplateCategory: async (data) => {
    try {
      const response = await request.post(
        PATHS.TEMPLATE.ADD_TEMPLATE, data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating template category:", error);
      throw error;
    }
  },
  
  getSubTemplateList: async (parentId) => {
    try {
      const response = await request.get(
        `${PATHS.TEMPLATE.GET_SUB_TEMPLATE_LIST}?parentId=${parentId}`
      );
      return response.data?.templateList || [];
    } catch (error) {
      console.error("Error fetching sub template list:", error);
      return [];
    }
  }
};

export default templateListService; 
import request from './request';
import {PATHS} from './paths';
import {
  CreateTemplateRequestModel,
  TemplateGetListResponse,
  TemplateResponseDto,
  UpdateTemplateRequestModel
} from '../../types/template';

const templateService = {
  createTemplate: async (
    data: CreateTemplateRequestModel
  ): Promise<{ data?: TemplateResponseDto; error?: string }> => {
    return await request.post(PATHS.TEMPLATE.ADD_TEMPLATE, data);
  },

  updateTemplate: async (
    data: UpdateTemplateRequestModel
  ): Promise<{ data?: TemplateResponseDto; error?: string }> => {
    return await request.put(PATHS.TEMPLATE.UPDATE_TEMPLATE, data);
  },

  getTemplate: async (
    id: string
  ): Promise<{ data?: TemplateResponseDto; error?: string }> => {
    return await request.get(`${PATHS.TEMPLATE.GET_TEMPLATE_LIST}?id=${id}`);
  },

  getTemplateList: async (
    languageId?: number,
    filterText?: string,
    tagId?: number,
    recordSize?: number,
    parentTemplateId?: string
  ): Promise<{ data?: TemplateGetListResponse; error?: string }> => {
    const params: Record<string, any> = {};
    if (languageId) params.languageId = languageId;
    if (filterText) params.filterText = filterText;
    if (tagId) params.tagId = tagId;
    if (recordSize) params.recordSize = recordSize;
    if (parentTemplateId) params.parentTemplateId = parentTemplateId;

    return await request.get(PATHS.TEMPLATE.GET_TEMPLATE_LIST, params);
  },

  getSubTemplateList: async (
    parentId: string
  ): Promise<{ data?: TemplateGetListResponse; error?: string }> => {
    return await request.get(`${PATHS.TEMPLATE.GET_SUB_TEMPLATE_LIST}?parentId=${parentId}`);
  },

  deleteTemplate: async (
    id: string
  ): Promise<{ data?: any; error?: string }> => {
    return await request.delete(`${PATHS.TEMPLATE.DELETE_TEMPLATE}?id=${id}`);
  }
};

export default templateService; 
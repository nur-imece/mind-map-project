import request from './request';
import { PATHS } from './paths';

const documentService = {
  uploadDocument: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.DOCUMENT.UPLOAD_DOCUMENT, data);
    return response;
  },

  getCompanyDocuments: async (
    companyId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.DOCUMENT.GET_COMPANY_DOCUMENTS}?companyId=${companyId}`
    );
    return response;
  },

  getCompanyDocumentsForUser: async (
    companyId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.DOCUMENT.GET_COMPANY_DOCUMENTS_FOR_USER}?companyId=${companyId}`
    );
    return response;
  },

  getRemainingSizeByCompanyId: async (
    companyId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.DOCUMENT.GET_REMAINING_SIZE_BY_COMPANY_ID}?companyId=${companyId}`
    );
    return response;
  },

  deleteDocument: async (
    documentId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.delete(
      `${PATHS.DOCUMENT.DELETE_DOCUMENT}?documentId=${documentId}`
    );
    return response;
  }
};

export default documentService; 
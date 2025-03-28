import request from './request';
import { PATHS } from './paths';

const contactService = {
  createContact: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.CONTACT.CREATE_CONTACT, data);
    return response;
  },

  getContactList: async (
    recordSize?: number
  ): Promise<{ data?: any; error?: string }> => {
    const url = recordSize 
      ? `${PATHS.CONTACT.GET_CONTACT_LIST}?recordSize=${recordSize}`
      : PATHS.CONTACT.GET_CONTACT_LIST;
    const response = await request.get(url);
    return response;
  }
};

export default contactService; 
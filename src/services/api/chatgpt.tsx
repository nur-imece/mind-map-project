import request from './request';
import { PATHS } from './paths';
import {
  ChatGptRequest,
  ChatGpt4ORequest,
  ChatGptEmbedingRequest
} from '../../types/chatgpt';

const chatGptService = {
  getChatResponse: async (
    data: ChatGptRequest
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.CHAT_GPT.GET_CHAT_RESPONSE, data);
    return response;
  },

  createMapWith4O: async (
    data: ChatGpt4ORequest
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.CHAT_GPT.CREATE_MAP_WITH_4O, data);
    return response;
  },

  testGpt: async (
    data: string
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.CHAT_GPT.TEST_GPT, data);
    return response;
  },

  getEmbedingChatResponse: async (
    data: ChatGptEmbedingRequest
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.CHAT_GPT.GET_EMBEDING_CHAT_RESPONSE, data);
    return response;
  }
};

export default chatGptService; 
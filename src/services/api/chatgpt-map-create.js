import request from './request';
import { PATHS } from './paths';

const chatGptMapCreateService = {
  createMap: async (data) => {
    try {
      const response = await request.post(PATHS.CHAT_GPT.CREATE_MAP, data);
      return response.data;
    } catch (error) {
      console.error("Error creating ChatGPT map:", error);
      throw error;
    }
  },
  
  redirectMap: async (mapId) => {
    if (!mapId) {
      console.error("Map ID is missing or invalid.");
      return;
    }
    
    try {
      window.location.href = `/mind-map/${mapId}`;
    } catch (error) {
      console.error("Error redirecting to map:", error);
      throw error;
    }
  }
};

export default chatGptMapCreateService; 
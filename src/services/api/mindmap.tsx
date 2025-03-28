import request from './request';
import { PATHS } from './paths';
import {
  CreateMindMapPresentationRequest,
  DeleteFileResponse,
  EmailResponse,
  GetFavoriteMapListRequestModel,
  GetFavoriteMapListResponseModel,
  MindMapCreateRequest,
  MindMapCreateResponse,
  MindMapDeleteResponse,
  MindMapGetListResponse,
  MindMapPublicShareRequest,
  MindMapResponseModel,
  MindMapShareRequest,
  MindMapUpdateRequest,
  MindMapUpdateResponse,
  PublicShareResponse,
  RemoveUserFromMapRequest,
  SaveACopyCreateRequest,
  SaveAsTemplateRequestModel,
  SaveFileRequest,
  SaveFileResponse,
  SetFavoriteMapStatusRequestModel,
  ShareMapToUsersRequest,
  UpdateMapPermissionRequest
} from '@/types/mindmap.ts';
import { BaseResponse } from '@/types/account.ts';

const mindMapService = {
  createMindMap: async (
    data: MindMapCreateRequest
  ): Promise<{ data?: MindMapCreateResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.CREATE_MIND_MAP, data);
    return response;
  },

  getMindMapListByUserId: async (
    recordSize?: number
  ): Promise<{ data?: MindMapGetListResponse; error?: string }> => {
    const params = recordSize ? { recordSize } : {};
    const response = await request.get(PATHS.MIND_MAP.GET_MIND_MAP_LIST_BY_USER_ID, params);
    return response;
  },

  getMindMapById: async (
    mindMapId: string
  ): Promise<{ data?: MindMapGetListResponse; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.GET_MIND_MAP_BY_ID}?mindMapId=${mindMapId}`
    );
    return response;
  },

  updateMindMap: async (
    data: MindMapUpdateRequest
  ): Promise<{ data?: MindMapUpdateResponse; error?: string }> => {
    const response = await request.put(PATHS.MIND_MAP.UPDATE_MIND_MAP, data);
    return response;
  },

  deleteMindMap: async (
    mindMapId: string
  ): Promise<{ data?: MindMapDeleteResponse; error?: string }> => {
    const response = await request.delete(
      `${PATHS.MIND_MAP.DELETE_MIND_MAP}?mindMapId=${mindMapId}`
    );
    return response;
  },

  updateMindMapSetting: async (
    mindMapId: string,
    name: string
  ): Promise<{ data?: MindMapUpdateResponse; error?: string }> => {
    const response = await request.put(
      `${PATHS.MIND_MAP.UPDATE_MIND_MAP_SETTING}?mindMapId=${mindMapId}&name=${encodeURIComponent(name)}`
    );
    return response;
  },

  uploadMindMapFile: async (
    referenceId: string,
    data: SaveFileRequest
  ): Promise<{ data?: SaveFileResponse; error?: string }> => {
    const response = await request.post(
      `${PATHS.MIND_MAP.UPLOAD_MIND_MAP_FILE}?referenceId=${referenceId}`,
      data
    );
    return response;
  },

  deleteMindMapFile: async (
    fileName: string
  ): Promise<{ data?: DeleteFileResponse; error?: string }> => {
    const response = await request.delete(
      `${PATHS.MIND_MAP.DELETE_MIND_MAP_FILE}?fileName=${encodeURIComponent(fileName)}`
    );
    return response;
  },

  getSharedAnonymousMindMap: async (
    privateKey: string,
    email: string,
    mindMapId: string
  ): Promise<{ data?: MindMapResponseModel; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.GET_SHARED_ANONYMOUS_MIND_MAP}?privateKey=${encodeURIComponent(privateKey)}&email=${encodeURIComponent(email)}&mindMapId=${mindMapId}`
    );
    return response;
  },

  shareMindMapByEmail: async (
    data: MindMapShareRequest
  ): Promise<{ data?: EmailResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.SHARE_MIND_MAP_BY_EMAIL, data);
    return response;
  },

  deleteSharedMindMapFile: async (
    mindMapId: string
  ): Promise<{ data?: MindMapDeleteResponse; error?: string }> => {
    const response = await request.delete(
      `${PATHS.MIND_MAP.DELETE_SHARED_MIND_MAP_FILE}?mindMapId=${mindMapId}`
    );
    return response;
  },

  createPublicShareLink: async (
    url: string
  ): Promise<{ data?: PublicShareResponse; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.CREATE_PUBLIC_SHARE_LINK}?url=${encodeURIComponent(url)}`
    );
    return response;
  },

  sharePublicMindMapByEmail: async (
    data: MindMapPublicShareRequest
  ): Promise<{ data?: EmailResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.SHARE_PUBLIC_MIND_MAP_BY_EMAIL, data);
    return response;
  },

  getPublicMindMapById: async (
    mindMapId: string
  ): Promise<{ data?: MindMapGetListResponse; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.GET_PUBLIC_MIND_MAP_BY_ID}?mindMapId=${mindMapId}`
    );
    return response;
  },

  addMindMapToMyAccount: async (
    data: MindMapCreateRequest
  ): Promise<{ data?: MindMapCreateResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.ADD_MIND_MAP_TO_MY_ACCOUNT, data);
    return response;
  },

  updateUserMapPermission: async (
    data: UpdateMapPermissionRequest
  ): Promise<{ data?: MindMapCreateResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.UPDATE_USER_MAP_PERMISSION, data);
    return response;
  },

  sharedMindMapList: async (
    mindMapId: string
  ): Promise<{ data?: MindMapGetListResponse; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.SHARED_MIND_MAP_LIST}?mindMapId=${mindMapId}`
    );
    return response;
  },

  shareMapToUsers: async (
    data: ShareMapToUsersRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.SHARE_MAP_TO_USERS, data);
    return response;
  },

  removeUserFromMap: async (
    data: RemoveUserFromMapRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.REMOVE_USER_FROM_MAP, data);
    return response;
  },

  updateMindMapByPermission: async (
    data: MindMapUpdateRequest
  ): Promise<{ data?: MindMapUpdateResponse; error?: string }> => {
    const response = await request.put(PATHS.MIND_MAP.UPDATE_MIND_MAP_BY_PERMISSION, data);
    return response;
  },

  hasMindMapPermisionForUser: async (
    mindMapId: string
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.HAS_MIND_MAP_PERMISION_FOR_USER}?mindMapId=${mindMapId}`
    );
    return response;
  },

  saveACopyOfMap: async (
    data: SaveACopyCreateRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.SAVE_A_COPY_OF_MAP, data);
    return response;
  },

  saveACopyOfPublicMap: async (
    data: SaveACopyCreateRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.SAVE_A_COPY_OF_PUBLIC_MAP, data);
    return response;
  },

  sharedWithMeMindList: async (
    id?: number,
    recordSize?: number
  ): Promise<{ data?: MindMapGetListResponse; error?: string }> => {
    const params: Record<string, any> = {};
    if (id) params.id = id;
    if (recordSize) params.recordSize = recordSize;
    const response = await request.get(PATHS.MIND_MAP.SHARED_WITH_ME_MIND_LIST, params);
    return response;
  },

  sharedWithMeMind: async (
    userId: number,
    mindMapId: string
  ): Promise<{ data?: MindMapResponseModel; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.SHARED_WITH_ME_MIND}?userId=${userId}&mindMapId=${mindMapId}`
    );
    return response;
  },

  favoriteMindMapList: async (
    data: GetFavoriteMapListRequestModel
  ): Promise<{ data?: GetFavoriteMapListResponseModel[]; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.FAVORITE_MIND_MAP_LIST, data);
    return response;
  },

  setFavoriteMapStatus: async (
    data: SetFavoriteMapStatusRequestModel
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.SET_FAVORITE_MAP_STATUS, data);
    return response;
  },

  saveAsTemplate: async (
    data: SaveAsTemplateRequestModel
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.SAVE_AS_TEMPLATE, data);
    return response;
  },

  setPublicOrPrivateMap: async (
    mindMapId: string,
    isPublicMap: boolean
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.MIND_MAP.SET_PUBLIC_OR_PRIVATE_MAP}?mindMapId=${mindMapId}&isPublicMap=${isPublicMap}`
    );
    return response;
  },

  updateUserType: async (
    userTypeId: number,
    branchName: string,
    className: string
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.MIND_MAP.UPDATE_USER_TYPE}?userTypeId=${userTypeId}&branchName=${encodeURIComponent(branchName)}&className=${encodeURIComponent(className)}`
    );
    return response;
  },

  userHasSetUserType: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.USER_HAS_SET_USER_TYPE);
    return response;
  },

  isMapDownloadable: async (
    mindMapId: string
  ): Promise<{ data?: MindMapGetListResponse; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.IS_MAP_DOWNLOADABLE}?mindMapId=${mindMapId}`
    );
    return response;
  },

  isPublicMapCopiable: async (
    mindMapId: string
  ): Promise<{ data?: MindMapGetListResponse; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.IS_PUBLIC_MAP_COPIABLE}?mindMapId=${mindMapId}`
    );
    return response;
  },

  duplicateMindMap: async (
    data: SaveACopyCreateRequest
  ): Promise<{ data?: MindMapGetListResponse; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.DUPLICATE_MIND_MAP, data);
    return response;
  },

  createMindMapPresentation: async (
    data: CreateMindMapPresentationRequest
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.MIND_MAP.CREATE_MIND_MAP_PRESENTATION, data);
    return response;
  },

  getPresentationByMindMapId: async (
    mindMapId: string
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.MIND_MAP.GET_PRESENTATION_BY_MIND_MAP_ID}?mindMapId=${mindMapId}`
    );
    return response;
  }
};

export default mindMapService; 
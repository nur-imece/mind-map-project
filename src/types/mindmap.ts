import { BaseResponse, SaveFileRequest, User } from './account';
import { Template } from './template';

export interface MindMap {
  id: string;
  name: string;
  content: string;
  createdDate: string;
  updatedDate: string;
  userId: number;
  isPublic: boolean;
  isDownloadable: boolean;
  isCopiable: boolean;
  companyId: number;
  isDeleted: boolean;
  isTemplate: boolean;
  isShareable: boolean;
  languageId: number;
  language?: any;
}

export interface MindMapModel {
  id?: string;
  name?: string;
  content?: string;
  createdBy?: number;
  creationDate: string;
  backgroundName?: string;
  modifiedBy?: number;
  modifiedDate?: string;
  isActive: boolean;
  isWrite: boolean;
  mapPermissionId: number;
  sharedUserNameSurname?: string;
  lastModifiedUserNameSurname?: string;
  isMapShared: boolean;
  isFavorite: boolean;
  isSharedWithMe: boolean;
  isCopyMap: boolean;
  parentMindMapId?: string;
  parentMapCreatedUserNameSurname?: string;
  isPublicMap: boolean;
  templateId?: number;
  isAiGenerated: boolean;
}

export interface MindMapCreateRequest {
  name: string;
  content: string;
  isPublic: boolean;
  isDownloadable: boolean;
  isCopiable: boolean;
  isShareable: boolean;
  languageId: number;
}

export interface MindMapCreateResponse {
  id: string;
  name: string;
  content: string;
  createdDate: string;
  updatedDate: string;
  userId: number;
  isPublic: boolean;
  isDownloadable: boolean;
  isCopiable: boolean;
  companyId: number;
  isDeleted: boolean;
  isTemplate: boolean;
  isShareable: boolean;
  languageId: number;
  language?: any;
  statusCode: number;
  message: string;
}

export interface MindMapUpdateRequest {
  id: string;
  name: string;
  content: string;
  isPublic: boolean;
  isDownloadable: boolean;
  isCopiable: boolean;
  isShareable: boolean;
  languageId: number;
}

export interface MindMapUpdateResponse {
  id: string;
  name: string;
  content: string;
  createdDate: string;
  updatedDate: string;
  userId: number;
  isPublic: boolean;
  isDownloadable: boolean;
  isCopiable: boolean;
  companyId: number;
  isDeleted: boolean;
  isTemplate: boolean;
  isShareable: boolean;
  languageId: number;
  language?: any;
  statusCode: number;
  message: string;
}

export interface MindMapDeleteResponse {
  statusCode: number;
  message: string;
}

export interface MindMapGetListResponse {
  mindMaps: MindMap[];
  statusCode: number;
  message: string;
}

export interface ShareMindMapMailResponse extends BaseResponse {
  id?: string;
  email?: string;
  mapPermissionId: number;
  mindMapId?: string;
  content?: string;
  backgroundName?: string;
  isFavorite: boolean;
  isAnonymous?: string;
  mindMapName?: string;
  userId?: number;
  templateId?: number;
}

export interface MindMapResponseModel {
  id: string;
  name: string;
  content: string;
  createdDate: string;
  updatedDate: string;
  userId: number;
  isPublic: boolean;
  isDownloadable: boolean;
  isCopiable: boolean;
  companyId: number;
  isDeleted: boolean;
  isTemplate: boolean;
  isShareable: boolean;
  languageId: number;
  language?: any;
  isMapActive: boolean;
  templateCount: number;
  statusCode: number;
  message: string;
}

export interface MindMapShareRequest {
  mindMapId: string;
  privateKey: string;
  toEmails: string[];
  message: string;
  subject: string;
}

export interface MindMapPublicShareRequest {
  mindMapId: string;
  toEmails: string[];
  message: string;
  subject: string;
}

export interface SaveFileRequest {
  base64String: string;
  fileName: string;
  fileExtension: string;
}

export interface SaveFileResponse {
  fileName: string;
  url: string;
  statusCode: number;
  message: string;
}

export interface DeleteFileResponse {
  fileName: string;
  statusCode: number;
  message: string;
}

export interface EmailResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
}

export interface PublicShareResponse {
  privateKey: string;
  key: string;
  statusCode: number;
  message: string;
}

export interface UpdateMapPermissionRequest {
  userId: number;
  mindMapId: string;
  isAllowToEdit: boolean;
}

export interface ShareMapToUsersRequest {
  mindMapId: string;
  usersIds: number[];
  isAllowToEdit: boolean;
}

export interface RemoveUserFromMapRequest {
  userId: number;
  mindMapId: string;
}

export interface SaveACopyCreateRequest {
  mindMapId: string;
  name: string;
}

export interface GetFavoriteMapListRequestModel {
  userId: number;
  recordSize?: number;
}

export interface GetFavoriteMapListResponseModel {
  id: string;
  userId: number;
  mindMapId: string;
  mindMap: MindMap;
  statusCode: number;
  message: string;
}

export interface SetFavoriteMapStatusRequestModel {
  userId: number;
  mindMapId: string;
  isFavorite: boolean;
}

export interface SaveAsTemplateRequestModel {
  mindMapId: string;
  name: string;
  parentTemplateId?: string;
  languageId: number;
  image?: string;
}

export interface CreateMindMapPresentationRequest {
  mindMapId: string;
  name: string;
  shortDescription: string;
  startNodeId: string;
} 
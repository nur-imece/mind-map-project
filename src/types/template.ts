import { Company } from './account';

export interface Template {
  name?: string;
  parentTemplateId?: number;
  content?: string;
  image?: string;
  languageId?: string;
  companyId?: number;
  company: Company;
  parentTemplate: Template;
  isDownloadable: boolean;
  createdBy?: number;
  creationDate: string;
  createdName?: string;
  isActive: boolean;
  id: number;
}

export interface TemplateResponseDto {
  id: number;
  name?: string;
  parentTemplateId?: number;
  content?: string;
  image?: string;
  languageId?: string;
  createdBy?: number;
  creationDate: string;
  isActive: boolean;
  createdName?: string;
  companyId?: number;
  company: Company;
  parentTemplate: Template;
  isDownloadable: boolean;
  generatedMapCount: number;
  tags?: string[];
}

export interface TemplateGetListResponse {
  statusCode?: string;
  result: boolean;
  errors?: string[];
  templateList?: TemplateResponseDto[];
}

export interface CreateTemplateRequestModel {
  name?: string;
  parentTemplateId?: number;
  content?: string;
  languageId?: string;
  isActive: boolean;
  companyId?: number;
  fileRequest: any; // Using SaveFileRequest from account.ts
  isDownloadable: boolean;
  tags?: string[];
}

export interface UpdateTemplateRequestModel {
  name?: string;
  parentTemplateId?: number;
  content?: string;
  languageId?: string;
  isActive: boolean;
  companyId?: number;
  fileRequest: any; // Using SaveFileRequest from account.ts
  isDownloadable: boolean;
  tags?: string[];
  id: number;
  selectedMindMapId?: string;
} 
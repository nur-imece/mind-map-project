import { BaseResponse } from './account';
import { SaveFileRequest } from './account';

export interface BlogModel {
  blogId: number;
  blogTitle?: string;
  blogContent?: string;
  blogUserFirstName?: string;
  blogUserLastName?: string;
  createdDate: string;
  blogUserImage?: string;
  isActive: boolean;
  blogFiles?: BlogFileModel[];
}

export interface BlogFileModel {
  filePath?: string;
  coverImagePath?: string;
}

export interface BlogFileRequest {
  fileName?: string;
  fileExtension?: string;
  fileType?: string;
  file?: string;
  videoCoverFile?: FileRequest;
}

export interface FileRequest {
  fileName?: string;
  fileExtension?: string;
  fileType?: string;
  file?: string;
}

export interface BlogUserRequest {
  firstName?: string;
  lastName?: string;
  profileImage?: SaveFileRequest;
}

export interface BlogListResponse extends BaseResponse {
  blogModel?: BlogModel[];
}

export interface CreateBlogRequest {
  blogTitle?: string;
  blogContent?: string;
  blogUser: BlogUserRequest;
  blogFiles?: BlogFileRequest[];
}

export interface UpdateBlogRequest {
  blogTitle?: string;
  blogContent?: string;
  blogUser: BlogUserRequest;
  blogFiles?: BlogFileRequest[];
  id: number;
  isActive: boolean;
} 
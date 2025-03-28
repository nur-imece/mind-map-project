import request from './request';
import { PATHS } from './paths';
import {
  BlogListResponse,
  BlogModel,
  CreateBlogRequest,
  UpdateBlogRequest
} from '../../types/blog';

const blogService = {
  createBlog: async (
    data: CreateBlogRequest
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.BLOG.CREATE_BLOG, data);
    return response;
  },

  getBlogList: async (): Promise<{ data?: BlogListResponse; error?: string }> => {
    const response = await request.get(PATHS.BLOG.GET_BLOG_LIST);
    return response;
  },

  getAirQuality: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.BLOG.GET_AIR_QUALITY);
    return response;
  },

  getActiveBlogList: async (): Promise<{ data?: BlogListResponse; error?: string }> => {
    const response = await request.get(PATHS.BLOG.GET_ACTIVE_BLOG_LIST);
    return response;
  },

  makeActivePassiveBlog: async (
    blogId: number,
    isActive: boolean
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(
      `${PATHS.BLOG.MAKE_ACTIVE_PASSIVE_BLOG}?blogId=${blogId}&isActive=${isActive}`
    );
    return response;
  },

  getBlogModelById: async (
    blogId: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.BLOG.GET_BLOG_MODEL_BY_ID}?blogId=${blogId}`
    );
    return response;
  },

  getBySlug: async (
    slug: string
  ): Promise<{ data?: BlogListResponse; error?: string }> => {
    const response = await request.get(`${PATHS.BLOG.GET_BY_SLUG}/${slug}`);
    return response;
  },

  updateBlog: async (
    data: UpdateBlogRequest
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.post(PATHS.BLOG.UPDATE_BLOG, data);
    return response;
  }
};

export default blogService; 
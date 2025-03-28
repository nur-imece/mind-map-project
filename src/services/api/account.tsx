import request from './request';
import { PATHS } from './paths';
import {
  BaseResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ConfirmTokenEmailRequest,
  EmailConfirmRequest,
  GetAccountDetailResponse,
  ResetPasswordRequest,
  ResetPasswordTokenEmailRequest,
  UpdateAccountDetailRequest,
  UpdateAccountDetailResponse,
  UserLoginRequest,
  UserLoginResponse,
  UserRegistrationRequest,
  UserSubscriptionDetailResponse
} from '../../types/account';

const accountService = {
  register: async (
    data: UserRegistrationRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.ACCOUNT.REGISTER, data);
    return response;
  },

  login: async (
    data: UserLoginRequest
  ): Promise<{ data?: UserLoginResponse; error?: string }> => {
    const response = await request.post(PATHS.ACCOUNT.LOGIN, data);
    return response;
  },

  adminLogin: async (
    data: UserLoginRequest
  ): Promise<{ data?: UserLoginResponse; error?: string }> => {
    const response = await request.post(PATHS.ACCOUNT.ADMIN_LOGIN, data);
    return response;
  },

  logout: async (): Promise<{ data?: UserLoginResponse; error?: string }> => {
    const response = await request.get(PATHS.ACCOUNT.LOGOUT);
    return response;
  },

  testGet: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.ACCOUNT.TEST_GET);
    return response;
  },

  getDetail: async (): Promise<{ data?: GetAccountDetailResponse; error?: string }> => {
    const response = await request.get(PATHS.ACCOUNT.DETAIL);
    return response;
  },

  updateDetail: async (
    data: UpdateAccountDetailRequest
  ): Promise<{ data?: UpdateAccountDetailResponse; error?: string }> => {
    const response = await request.put(PATHS.ACCOUNT.UPDATE_DETAIL, data);
    return response;
  },

  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<{ data?: ChangePasswordResponse; error?: string }> => {
    const response = await request.post(PATHS.ACCOUNT.CHANGE_PASSWORD, data);
    return response;
  },

  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.ACCOUNT.RESET_PASSWORD, data);
    return response;
  },

  resetPasswordTokenMail: async (
    data: ResetPasswordTokenEmailRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.ACCOUNT.RESET_PASSWORD_TOKEN_MAIL, data);
    return response;
  },

  confirmEmail: async (
    data: EmailConfirmRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.ACCOUNT.CONFIRM_EMAIL, data);
    return response;
  },

  confirmTokenEmail: async (
    data: ConfirmTokenEmailRequest
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(PATHS.ACCOUNT.CONFIRM_TOKEN_EMAIL, data);
    return response;
  },

  getUserSubscriptionDetail: async (): Promise<{ data?: UserSubscriptionDetailResponse; error?: string }> => {
    const response = await request.get(PATHS.ACCOUNT.USER_SUBSCRIPTION_DETAIL);
    return response;
  },

  confirmUser: async (
    email: string
  ): Promise<{ data?: UserSubscriptionDetailResponse; error?: string }> => {
    const response = await request.post(
      `${PATHS.ACCOUNT.CONFIRM_USER}?Email=${encodeURIComponent(email)}`
    );
    return response;
  },

  googleLogin: async (
    token: string
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(
      `${PATHS.ACCOUNT.GOOGLE_LOGIN}?token=${encodeURIComponent(token)}`
    );
    return response;
  },

  azureLogin: async (
    token: string
  ): Promise<{ data?: BaseResponse; error?: string }> => {
    const response = await request.post(
      `${PATHS.ACCOUNT.AZURE_LOGIN}?token=${encodeURIComponent(token)}`
    );
    return response;
  }
};

export default accountService; 
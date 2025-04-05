export interface BaseResponse {
  statusCode?: string;
  result: boolean;
  errors?: string[];
}

export interface User {
  id: number;
  userName?: string;
  normalizedUserName?: string;
  email?: string;
  normalizedEmail?: string;
  emailConfirmed: boolean;
  passwordHash?: string;
  securityStamp?: string;
  concurrencyStamp?: string;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd?: string;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  avatarImagePath?: string;
  hasProfileImage: boolean;
  avatarColorCode?: string;
  kvkkConfirmStatus: boolean;
  subscriptions?: Subscription[];
  loginType: number;
  companyId: number;
  schoolChain?: string;
  gradeName?: string;
  isActive: boolean;
  userTypeId: number;
  campusName?: string;
  metotboxUserRole?: string;
  branchName?: string;
  hasSetUserType: boolean;
  trialDayEndDate?: string;
  sendTrialDayEmail: number;
  isShowTrialDayPopup: boolean;
  companyGroupName?: string;
  createdBy?: number;
  creationDate: string;
  createdName?: string;
  modifiedBy?: number;
  modifiedDate?: string;
  modifiedName?: string;
  userAiSequence?: UserAiSequence[];
}

export interface Subscription {
  userId: number;
  expireDate: string;
  id: number;
}

export interface UserAiSequence {
  id: number;
  userId: number;
  numberOfMaps: number;
  mapAiPackageId: number;
  user: User;
  mapAiPackage: MapAiPackage;
}

export interface MapAiPackage {
  id: number;
  isActive: boolean;
  name?: string;
  numberOfMaps: number;
  price: number;
  currency?: string;
}

export interface Company {
  id: number;
  companyName?: string;
  companyId?: string;
  serviceUrl?: string;
  logo?: string;
  companyDomains?: CompanyDomain[];
  companyAdmin?: CompanyAdmin[];
  isActive: boolean;
}

export interface CompanyDomain {
  id: number;
  companyId: number;
  domain?: string;
}

export interface CompanyAdmin {
  id: number;
  companyId: number;
  userId: number;
}

export interface CompanySubscriptionModel {
  hasCompanySubscription: boolean;
  companyProductId: number;
  startDate: string;
  endDate: string;
  companyRemainingProductDays: number;
  isLimited: boolean;
  limitCount: number;
  isActive: boolean;
  isCompanyActive: boolean;
  documentLimit?: number;
}

export interface CompanySubscriptionInfo {
  hasCompanySubscription: boolean;
  companyProductId: number;
  startDate: string;
  endDate: string;
  companyRemainingProductDays: number;
  isLimited: boolean;
  isActive: boolean;
  documentLimit?: number;
}

export interface UserRegistrationRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  kvkkConfirmStatus?: boolean;
  avatarImagePath?: string;
}

export interface UserLoginRequest {
  email?: string;
  password?: string;
}

export interface UserLoginResponse extends BaseResponse {
  token?: string;
  refreshToken?: string;
  freeDays: number;
  productId: number;
  remainingProductDays: number;
  productDay: number;
  trialDay: number;
  roleIdList?: number[];
  companyId: number;
  id: number;
  email?: string;
  companyName?: string;
  companyLogo?: string;
  companySubscriptionInfo: CompanySubscriptionInfo;
  isShowTrialDayPopup: boolean;
}

export interface GetAccountDetailResponse extends BaseResponse {
  user: User;
  company: Company;
  isFreeUser: boolean;
  companySubscription: CompanySubscriptionModel;
}

export interface UpdateAccountDetailRequest {
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  phoneNumber?: string;
  email?: string;
  avatarImage?: SaveFileRequest;
  avatarColorCode?: string;
}

export interface SaveFileRequest {
  name?: string;
  extension?: string;
  type?: string;
  referenceId?: string;
  referenceIdType: number;
  file?: string;
}

export interface UpdateAccountDetailResponse extends BaseResponse {
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangePasswordResponse extends BaseResponse {}

export interface ResetPasswordRequest {
  userMail?: string;
  newPassword?: string;
  resetToken?: string;
}

export interface ResetPasswordTokenEmailRequest {
  email?: string;
}

export interface EmailConfirmRequest {
  userMail?: string;
  registerConfirmationToken?: string;
  userControl: boolean;
}

export interface ConfirmTokenEmailRequest {
  email?: string;
}

export interface UserSubscriptionDetailResponse extends BaseResponse {
  freeDays: number;
  remainingProductDays: number;
  trialDay: number;
  userCreationDate: string;
  subscriptionStartDate?: string;
  subscriptionExpireDate?: string;
  productModel: ProductModel;
}

export interface ProductModel {
  id: number;
  productDetailId: number;
  productName?: string;
  shortDesc?: string;
  longDesc?: string;
  price: number;
  currency?: string;
  newPublicPrice?: number;
  interval: number;
  createdBy?: number;
  creationDate: string;
  createdName?: string;
  isActive: boolean;
  intervalText?: string;
  languageCode?: string;
  features?: string;
}

export interface RefreshTokenRequest {
  token?: string;
  refreshToken?: string;
}

export interface GoogleLoginResponse extends BaseResponse {
  token?: string;
  refreshToken?: string;
  freeDays?: number;
  productId?: number;
  remainingProductDays?: number;
  productDay?: number;
  trialDay?: number;
  roleIdList?: number[];
  companyId?: number;
  id?: number;
  email?: string;
  companyName?: string;
  companyLogo?: string;
  companySubscriptionInfo?: CompanySubscriptionInfo;
  isShowTrialDayPopup?: boolean;
  statusCode?: string;
}

export interface AzureLoginResponse extends BaseResponse {
  token?: string;
  refreshToken?: string;
  freeDays?: number;
  productId?: number;
  remainingProductDays?: number;
  productDay?: number;
  trialDay?: number;
  roleIdList?: number[];
  companyId?: number;
  id?: number;
  email?: string;
  companyName?: string;
  companyLogo?: string;
  companySubscriptionInfo?: CompanySubscriptionInfo;
  isShowTrialDayPopup?: boolean;
  statusCode?: string;
} 
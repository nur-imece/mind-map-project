export const PATHS = {
  ACCOUNT: {
    REGISTER: '/api/Account/Register',
    LOGIN: '/api/Account/Login',
    ADMIN_LOGIN: '/api/Account/AdminLogin',
    LOGOUT: '/api/Account/Logout',
    TEST_GET: '/api/Account/TestGet',
    DETAIL: '/api/Account/Detail',
    UPDATE_DETAIL: '/api/Account/UpdateDetail',
    CHANGE_PASSWORD: '/api/Account/ChangePassword',
    RESET_PASSWORD: '/api/Account/ResetPassword',
    RESET_PASSWORD_TOKEN_MAIL: '/api/Account/ResetPasswordTokenMail',
    CONFIRM_EMAIL: '/api/Account/ConfirmEmail',
    CONFIRM_TOKEN_EMAIL: '/api/Account/ConfirmTokenEmail',
    USER_SUBSCRIPTION_DETAIL: '/api/Account/UserSubscriptionDetail',
    CONFIRM_USER: '/api/Account/ConfirmUserAsync',
    GOOGLE_LOGIN: '/api/Account/GoogleLogin',
    AZURE_LOGIN: '/api/Account/AzureLogin'
  },
  BLOG: {
    CREATE_BLOG: '/api/Blog/CreateBlog',
    GET_BLOG_LIST: '/api/Blog/GetBlogList',
    GET_AIR_QUALITY: '/api/Blog/GetAirQuality',
    GET_ACTIVE_BLOG_LIST: '/api/Blog/GetActiveBlogList',
    MAKE_ACTIVE_PASSIVE_BLOG: '/api/Blog/MakeActivePassiveBlog',
    GET_BLOG_MODEL_BY_ID: '/api/Blog/GetBlogModelById',
    GET_BY_SLUG: '/api/Blog',
    UPDATE_BLOG: '/api/Blog/UpdateBlog'
  },
  CHAT_GPT: {
    GET_CHAT_RESPONSE: '/api/ChatGpt/GetChatResponse',
    CREATE_MAP_WITH_4O: '/api/ChatGpt/CreateMapWith4O',
    TEST_GPT: '/api/ChatGpt/TestGpt',
    GET_EMBEDING_CHAT_RESPONSE: '/api/ChatGpt/GetEmbedingChatResponse'
  },
  COMPANY: {
    CREATE_COMPANY: '/api/Company/CreateCompany',
    CREATE_COMPANY_USER: '/api/Company/CreateCompanyUser',
    UPDATE_COMPANY: '/api/Company/UpdateCompany',
    GET_ALL_COMPANY: '/api/Company/GetAllCompany',
    GET_COMPANY_BY_ID: '/api/Company/GetCompanyById',
    MAKE_ACTIVE_PASSIVE_COMPANY: '/api/Company/MakeActivePassiveCompany',
    CREATE_COMPANY_SUBSCRIPTION: '/api/Company/CreateCompanySubscription',
    DELETE_COMPANY_ADMIN: '/api/Company/DeleteCompanyAdmin',
    GET_COMPANY_ADMINS: '/api/Company/GetCompanyAdmins',
    ADD_COMPANY_ADMIN: '/api/Company/AddCompanyAdmin',
    UPDATE_COMPANY_SUBSCRIPTION: '/api/Company/UpdateCompanySubscription',
    GET_COMPANY_SUBSCRIPTION: '/api/Company/GetCompanySubscription'
  },
  CONTACT: {
    CREATE_CONTACT: '/api/Contact/CreateContact',
    GET_CONTACT_LIST: '/api/Contact/GetContactList'
  },
  COUPON: {
    CREATE_COUPON: '/api/Coupon/CreateCoupon',
    UPDATE_COUPON: '/api/Coupon/UpdateCoupon',
    DELETE_COUPON: '/api/Coupon/DeleteCoupon',
    CHANGE_COUPON_STATUS: '/api/Coupon/ChangeCouponStatus',
    GET_COUPONS: '/api/Coupon/GetCoupons',
    USE_PERSONAL_COUPON: '/api/Coupon/UsePersonalCoupon',
    SEARCH_USER_BY_NAME: '/api/Coupon/SearchUserByName',
    GET_COUPON_BY_ID: '/api/Coupon/GetCouponByIdAsync'
  },
  DOCUMENT: {
    UPLOAD_DOCUMENT: '/api/Document/UploadDocument',
    GET_COMPANY_DOCUMENTS: '/api/Document/GetCompanyDocuments',
    GET_COMPANY_DOCUMENTS_FOR_USER: '/api/Document/GetCompanyDocumentsForUser',
    GET_REMAINING_SIZE_BY_COMPANY_ID: '/api/Document/GetRemainingSizeByCompanyId',
    DELETE_DOCUMENT: '/api/Document/DeleteDocument'
  },
  HISTORY: {
    GET_COUNT_OF_USERS_AND_TEACHERS_AND_MAPS: '/api/History/GetCountOfUsersAndTeachersAndMaps'
  },
  LOGIN: {
    LOGIN: '/api/Login/Login',
    REGISTER: '/api/Login/Register',
    CREATE_USER: '/api/Login/CreateUser',
    UPDATE_USER: '/api/Login/UpdateUser',
    CHANGE_PASSWORD: '/api/Login/ChangePassword',
    MAKE_PASSIVE_OR_ACTIVE_USER: '/api/Login/MakePassiveOrActiveUser',
    GET_USERS: '/api/Login/GetUsers',
    GET_USER_BY_ID: '/api/Login/GetUserById',
    UPDATE_COMPANY: '/api/Login/UpdateCompany',
    GET_COMPANY_BY_ID: '/api/Login/GetCompanyById'
  },
  MAIL: {
    ALLIN_CYBER: '/api/Mail/AllinCyber'
  },
  MAP_AI_PACKAGE: {
    UPDATE_MAP_AI_PACKAGE: '/api/MapAiPackage/UpdateMapAiPackage',
    CREATE_MAP_AI_PACKAGE: '/api/MapAiPackage/CreateMapAiPackage',
    GET_REMAINING_MAPS: '/api/MapAiPackage/GetRemainingMaps',
    ASSIGN_AI_MAP_TO_USER: '/api/MapAiPackage/AssignAiMapToUser',
    ASSIGN_AI_MAP_TO_COMPANY_USER: '/api/MapAiPackage/AssignAiMapToCompanyUser',
    GET_AI_PACKAGE: '/api/MapAiPackage/GetAiPackage',
    GET_ALL_USER_AI_PACKAGE: '/api/MapAiPackage/GetAllUserAiPackage',
    GET_ALL_ADMIN_PANEL_AI_PACKAGE: '/api/MapAiPackage/GetAllAdminPanelAiPackage',
    GET_AI_PACKAGE_HISTORY: '/api/MapAiPackage/GetAiPackageHistory'
  },
  MIND_MAP: {
    CREATE_MIND_MAP: '/api/MindMap/CreateMindMap',
    GET_MIND_MAP_LIST_BY_USER_ID: '/api/MindMap/GetMindMapListByUserId',
    GET_MIND_MAP_BY_ID: '/api/MindMap/GetMindMapById',
    UPDATE_MIND_MAP: '/api/MindMap/UpdateMindMap',
    DELETE_MIND_MAP: '/api/MindMap/DeleteMindMap',
    UPDATE_MIND_MAP_SETTING: '/api/MindMap/UpdateMindMapSetting',
    UPLOAD_MIND_MAP_FILE: '/api/MindMap/UploadMindMapFile',
    DELETE_MIND_MAP_FILE: '/api/MindMap/DeleteMindMapFile',
    GET_SHARED_ANONYMOUS_MIND_MAP: '/api/MindMap/GetSharedAnonymousMindMapAsync',
    SHARE_MIND_MAP_BY_EMAIL: '/api/MindMap/ShareMindMapByEmail',
    DELETE_SHARED_MIND_MAP_FILE: '/api/MindMap/DeleteSharedMindMapFile',
    CREATE_PUBLIC_SHARE_LINK: '/api/MindMap/CreatePublicShareLink',
    SHARE_PUBLIC_MIND_MAP_BY_EMAIL: '/api/MindMap/SharePublicMindMapByEmail',
    GET_PUBLIC_MIND_MAP_BY_ID: '/api/MindMap/GetPublicMindMapById',
    ADD_MIND_MAP_TO_MY_ACCOUNT: '/api/MindMap/AddMindMapToMyAccount',
    UPDATE_USER_MAP_PERMISSION: '/api/MindMap/UpdateUserMapPermission',
    SHARED_MIND_MAP_LIST: '/api/MindMap/SharedMindMapList',
    SHARE_MAP_TO_USERS: '/api/MindMap/ShareMapToUsers',
    REMOVE_USER_FROM_MAP: '/api/MindMap/RemoveUserFromMap',
    UPDATE_MIND_MAP_BY_PERMISSION: '/api/MindMap/UpdateMindMapByPermission',
    HAS_MIND_MAP_PERMISION_FOR_USER: '/api/MindMap/HasMindMapPermisionForUser',
    SAVE_A_COPY_OF_MAP: '/api/MindMap/SaveACopyOfMap',
    SAVE_A_COPY_OF_PUBLIC_MAP: '/api/MindMap/SaveACopyOfPublicMap',
    SHARED_WITH_ME_MIND_LIST: '/api/MindMap/SharedWithMeMindList',
    SHARED_WITH_ME_MIND: '/api/MindMap/SharedWithMeMind',
    FAVORITE_MIND_MAP_LIST: '/api/MindMap/FavoriteMindMapList',
    SET_FAVORITE_MAP_STATUS: '/api/MindMap/SetFavoriteMapStatus',
    SAVE_AS_TEMPLATE: '/api/MindMap/SaveAsTemplate',
    SET_PUBLIC_OR_PRIVATE_MAP: '/api/MindMap/SetPublicOrPrivateMap',
    UPDATE_USER_TYPE: '/api/MindMap/UpdateUserType',
    USER_HAS_SET_USER_TYPE: '/api/MindMap/UserHasSetUserType',
    IS_MAP_DOWNLOADABLE: '/api/MindMap/IsMapDownloadable',
    IS_PUBLIC_MAP_COPIABLE: '/api/MindMap/IsPublicMapCopiable',
    DUPLICATE_MIND_MAP: '/api/MindMap/DuplicateMindMap',
    CREATE_MIND_MAP_PRESENTATION: '/api/MindMap/CreateMindMapPresentation',
    GET_PRESENTATION_BY_MIND_MAP_ID: '/api/MindMap/GetPresentationByMindMapId'
  },
  ORDER: {
    CREATE_ORDER: '/api/Order/CreateOrder'
  },
  PAYMENT: {
    CREATE_PAYMENT: '/api/Payment/CreatePayment',
    CREATE_AI_PAYMENT: '/api/Payment/CreateAiPayment',
    CALLBACK: '/api/Payment/Callback',
    CHECK_PAYMENT: '/api/Payment/CheckPayment',
    CHECK_AI_PAYMENT: '/api/Payment/CheckAiPayment'
  },
  PAYMENT_HISTORY: {
    UPDATE_PAYMENT_HISTORY: '/api/PaymentHistory/UpdatePaymentHistory'
  },
  PRODUCT: {
    GET_PRODUCT_LIST: '/api/Product/GetProductList',
    GET_PRODUCTS: '/api/Product/GetProducts',
    GET_PRODUCT_DETAIL_BY_ID: '/api/Product/GetProductDetailById',
    UPDATE_PRODUCT_PRICE: '/api/Product/UpdateProductPrice'
  },
  REVIEW: {
    CREATE: '/api/Review/Create',
    LIST: '/api/Review/List',
    ACCEPT_APPROVAL_OF_REVIEW: '/api/Review/AcceptApprovalOfReview',
    REJECT_APPROVAL_OF_REVIEW: '/api/Review/RejectApprovalOfReview'
  },
  SUBSCRIPTION: {
    GET_COMPANY_SUBSCRIPTION_BY_USER_ID: '/api/Subscription/GetCompanySubscriptionByUserId'
  },
  TAG: {
    CREATE_TAG: '/api/Tag/CreateTag',
    UPDATE_TAG: '/api/Tag/UpdateTag',
    DELETE_TAG: '/api/Tag/DeleteTag',
    GET_TAG_LIST_BY_ADMIN: '/api/Tag/GetTagListByAdmin',
    GET_TAG_LIST: '/api/Tag/GetTagList'
  },
  TEMPLATE: {
    GET_TEMPLATE_LIST: '/api/Template/GetTemplateList',
    GET_SUB_TEMPLATE_LIST: '/api/Template/GetSubTemplateList',
    ADD_TEMPLATE: '/api/Template/AddTemplate',
    UPDATE_TEMPLATE: '/api/Template/UpdateTemplate',
    DELETE_TEMPLATE: '/api/Template/DeleteTemplate'
  },
  TOKEN: {
    REFRESH: '/api/Token/Refresh'
  },
  TRIAL: {
    GET_TRIAL_DAY: '/api/Trial/GetTrialDay',
    POST_TELEMETRY_DATA_FROM_BODY: '/api/Trial/PostTelemetryDataFromBody'
  },
  USER: {
    USER_BY_ID: '/api/User/UserById',
    USER_BY_MAIL: '/api/User/UserByMail',
    USERS: '/api/User/Users',
    GET_ALL_USER_TYPES: '/api/User/GetAllUserTypes',
    GET_USER_SUBSCRIPTIONS: '/api/User/GetUserSubscriptions',
    UPDATE_TRIAL_DAY_END_DATE: '/api/User/UpdateTrialDayEndDate'
  },
  VIDEO_INFO: {
    CREATE_VIDEO_INFO: '/api/VideoInfo/CreateVideoInfo',
    UPDATE_VIDEO_INFO: '/api/VideoInfo/UpdateVideoInfo',
    DELETE_VIDEO_INFO: '/api/VideoInfo/DeleteVideoInfo',
    GET_VIDEO_INFO_BY_ID: '/api/VideoInfo/GetVideoInfoById',
    GET_ACTIVE_VIDEO_INFO_BY_ID: '/api/VideoInfo/GetActiveVideoInfoById',
    GET_VIDEO_INFO_LIST: '/api/VideoInfo/GetVideoInfoList',
    GET_ACTIVE_VIDEO_INFO_LIST: '/api/VideoInfo/GetActiveVideoInfoList',
    UPDATE_VIDEO_INFO_ACTIVE_STATUS: '/api/VideoInfo/UpdateVideoInfoActiveStatus'
  }
};

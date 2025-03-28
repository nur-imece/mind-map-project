import request from './request';
import { PATHS } from './paths';

const productService = {
  getProductList: async (
    langId: string = 'tr'
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.PRODUCT.GET_PRODUCT_LIST}?langId=${langId}`
    );
    return response;
  },

  getProducts: async (): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(PATHS.PRODUCT.GET_PRODUCTS);
    return response;
  },

  getProductDetailById: async (
    id: number
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.get(
      `${PATHS.PRODUCT.GET_PRODUCT_DETAIL_BY_ID}/${id}`
    );
    return response;
  },

  updateProductPrice: async (
    data: any
  ): Promise<{ data?: any; error?: string }> => {
    const response = await request.put(PATHS.PRODUCT.UPDATE_PRODUCT_PRICE, data);
    return response;
  }
};

export default productService; 
import { message } from 'antd';

const paymentUtils = {
  parseTokenExpiration: (token) => {
    if (!token) return 0;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );

      const tokenDate = JSON.parse(jsonPayload).exp;
      const date = new Date(tokenDate * 1000);
      const hours = date.getHours();
      const today = new Date();
      const todayHours = today.getHours();
      const endHours = Math.abs(todayHours - hours);

      return endHours;
    } catch (error) {
      console.error("Error parsing token:", error);
      return 0;
    }
  },

  setupInputControls: () => {
    // Number input char control (8 for backspace && 48-57 for 0-9 numbers)
    document.querySelectorAll('.only-number-input').forEach(input => {
      input.addEventListener('keypress', (evt) => {
        if ((evt.which !== 8 && evt.which < 48) || evt.which > 57) {
          evt.preventDefault();
        }
      });
    });

    // Text input's char control (for only letters) -- city & state
    document.querySelectorAll('.only-letter-input').forEach(input => {
      input.addEventListener('keypress', (evt) => {
        const regex = new RegExp('^[a-zA-Z wığüşöçĞÜŞÖÇİ]+$');
        const key = String.fromCharCode(!evt.charCode ? evt.which : evt.charCode);
        if (!regex.test(key)) {
          evt.preventDefault();
          return false;
        }
      });
    });

    // Text input's char control (for only letters) -- country
    const countryInput = document.querySelector('.country-select input');
    if (countryInput) {
      countryInput.addEventListener('keypress', (evt) => {
        const regex = new RegExp('^[a-zA-Z wığüşöçĞÜŞÖÇİ]+$');
        const key = String.fromCharCode(!evt.charCode ? evt.which : evt.charCode);
        if (!regex.test(key)) {
          evt.preventDefault();
          return false;
        }
      });
    }

    // Phone number input control
    const phoneInput = document.querySelector('#phone');
    if (phoneInput) {
      phoneInput.addEventListener('keypress', (evt) => {
        if ((evt.which !== 8 && evt.which < 48) || evt.which > 57) {
          evt.preventDefault();
        }
      });
    }
  },

  handleFailedPayment: (form, billingAddress) => {
    if (!billingAddress) return;

    // Restore form values
    form.setFieldsValue({
      line1: billingAddress.line1,
      line2: billingAddress.line2,
      city: billingAddress.city,
      state: billingAddress.state,
      phone: billingAddress.phone,
      email: billingAddress.email,
      fullName: billingAddress.fullname,
    });

    // Restore active card
    if (billingAddress.active === 'month-card') {
      document.querySelector('.month-card')?.classList.add('activate');
      document.querySelector('.year-card')?.classList.add('deactivate');
      document.querySelector('.yellow-button').disabled = false;
    } else if (billingAddress.active === 'year-card') {
      document.querySelector('.month-card')?.classList.add('deactivate');
      document.querySelector('.year-card')?.classList.add('activate');
      document.querySelector('.yellow-button').disabled = false;
    }
  },

  saveBillingAddress: (form, userInfo, userCountryCode, t) => {
    const { userName, userSurname, email } = userInfo;
    return {
      line1: form.getFieldValue('line1'),
      line2: form.getFieldValue('line2'),
      city: form.getFieldValue('city'),
      state: form.getFieldValue('state'),
      zip: '11111',
      total: `${t('totalValueMsgTxt')}${document.querySelector('.activate .price .many-value').innerHTML}${userCountryCode === 'TR' ? '₺' : '$'}`,
      identityNumber: '11111111111',
      fullname: `${userName} ${userSurname}`,
      phone: form.getFieldValue('phone'),
      email: email,
      active: document.querySelectorAll('.activate')[0]?.classList[1],
    };
  },

  collectPaymentData: (form, userInfo, couponInfo, productInfo) => {
    const { userId, userName, userSurname, userIp, userCountryCode, isPublicCoupon, couponCode } = userInfo;
    const { currentPrice, currentPriceYearly, newPublicPriceMontly, newPublicPriceYearly } = couponInfo;
    
    const activeElement = document.querySelector('.activate .price .many-value');
    const productId = activeElement?.getAttribute('data-productid');
    const durationtype = activeElement?.getAttribute('data-durationtype');
    const interval = activeElement?.getAttribute('data-interval');

    const determineCouponCode = () => {
      if (isPublicCoupon) {
        if (productId === '1' && newPublicPriceMontly && couponCode) {
          return couponCode;
        } else if (productId === '2' && newPublicPriceYearly && couponCode) {
          return couponCode;
        } else if (newPublicPriceMontly === null && newPublicPriceYearly === null) {
          return null;
        } else if (productId === '2' && newPublicPriceMontly) {
          return null;
        } else if (productId === '1' && newPublicPriceYearly) {
          return null;
        } else {
          return couponCode;
        }
      } else {
        if (productId === '1' && currentPrice && couponCode) {
          return couponCode;
        } else if (productId === '2' && currentPriceYearly && couponCode) {
          return couponCode;
        } else if (currentPrice === null && currentPriceYearly === null) {
          return null;
        } else if (productId === '2' && currentPrice) {
          return null;
        } else if (productId === '1' && currentPriceYearly) {
          return null;
        } else {
          return couponCode;
        }
      }
    };

    return {
      checkoutFormRequest: {
        buyer: {
          id: String(userId),
          name: userName,
          surname: userSurname,
          identityNumber: '11111111111',
          email: form.getFieldValue('email'),
          gsmNumber: form.getFieldValue('phone'),
          registrationDate: '',
          lastLoginDate: '',
          registrationAddress: `${form.getFieldValue('line1')} ${form.getFieldValue('line2')}`,
          city: form.getFieldValue('city'),
          country: form.getFieldValue('country'),
          zipCode: '111111',
          ip: userIp || '',
        },
        shippingAddress: {
          Address: `${form.getFieldValue('line1')} ${form.getFieldValue('line2')}`,
          zipCode: '111111',
          contactName: `${userName} ${userSurname}`,
          city: form.getFieldValue('city'),
          country: form.getFieldValue('country'),
        },
        billingAddress: {
          Address: `${form.getFieldValue('line1')} ${form.getFieldValue('line2')}`,
          zipCode: '111111',
          contactName: form.getFieldValue('fullName'),
          city: form.getFieldValue('city'),
          country: form.getFieldValue('country'),
        },
        basketItem: {
          id: productId,
          price: '',
          name: durationtype,
          category1: 'subscription',
          category2: '',
          itemType: '',
          subMerchantKey: '',
          subMerchantPrice: '',
        },
        locale: localStorage.getItem('siteLanguage'),
        price: '',
        paidPrice: '',
        currency: '',
        conversationId: '',
        productId: productId,
        productInterval: interval,
        userIpAddress: userIp,
        userCountryCode: userCountryCode,
      },
      couponCode: determineCouponCode(),
    };
  },

  showMessages: {
    warning: (t) => message.warning(t('warningmodalMsgTxt')),
    error: (t) => message.error(t('reviewSendErrorMsgTxt')),
    success: (t) => message.success(t('reviewSendSuccessMsgTxt')),
    profileError: (t) => message.error(t('failedToLoadProfileError')),
    tokenError: (t) => message.error(t('failedToRefreshTokenError')),
    validationError: (t) => message.error(t('fillRequiredFieldsError')),
    productsError: (t) => message.error(t('failedToLoadProductsError')),
    noProducts: (t) => message.error(t('noProductsAvailable')),
    paymentError: (t) => message.error(t('paymentSubmissionFailedError')),
  },

  selectStyles: {
    option: (provided) => ({
      ...provided,
      color: 'black',
      padding: 0,
    }),
    menu: (provided) => ({
      ...provided,
      color: '#f2f2f2',
      backgroundColor: '#f2f2f2',
      padding: 0,
      width: '90%',
      borderRadius: 10,
    }),
    control: (styles) => ({
      ...styles,
      color: '#f2f2f2',
      background: '#f2f2f2',
      width: '100%',
      height: 40,
      fontSize: 14,
      marginLeft: 0,
      borderRadius: 130,
      top: '40%',
    }),
    singleValue: (provided) => ({
      ...provided,
      opacity: 1,
      transition: 'opacity 300ms',
    }),
  }
};

export default paymentUtils; 
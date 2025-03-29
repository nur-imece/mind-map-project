import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Modal, Form, Input, message, Checkbox, Button } from 'antd';
import IMask from 'imask';
// Services
import accountService from '../../../services/api/account';
import paymentService from '../../../services/api/payment';
import paymentHistoryService from '../../../services/api/paymenthistory';
import tokenService from '../../../services/api/token';

// Styles
import './index.scss';

// Components
import Header from '../../../components/header';
import DistantSalesContractAgreements from '../../../components/distant-sales-contract';

// Images
import silverBadgeImg from "../../../styles/img/free-badge.png";
import goldBadgeImg from "../../../styles/img/gold-badge.png";
import iyzicoLogo from "../../../styles/img/iyzico_logo_band_colored.png";

// Utils
import Utils from '../../../utils';

// i18n
import { useTranslation } from 'react-i18next';

const Payment = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Form
    const [form] = Form.useForm();

    // State
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userSurname, setUserSurname] = useState('');
    const [conversationId, setConversationId] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [value, setValue] = useState(JSON.parse(localStorage.getItem('x8s88')));
    const [userIp, setUserIp] = useState('');
    const [userCountryCode, setUserCountryCode] = useState('');
    const [isPublicCoupon, setIsPublicCoupon] = useState(false);
    const [monthProduct, setMonthProduct] = useState({});
    const [yearProduct, setYearProduct] = useState({});
    const [currentPrice, setCurrentPrice] = useState('');
    const [currentPriceYearly, setCurrentPriceYearly] = useState('');
    const [currentPriceOutOfTurkey, setCurrentPriceOutOfTurkey] = useState('');
    const [currentPriceOutOfTurkeyYearly, setCurrentPriceOutOfTurkeyYearly] = useState('');
    const [productDetailId, setProductDetailId] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [newPublicPriceYearly, setNewPublicPriceYearly] = useState('');
    const [newPublicPriceMontly, setNewPublicPriceMontly] = useState('');

    // Selected package from URL params
    const selectedPackageParam = Utils.getParameterByName('selectedPackage');

    useEffect(() => {
        // Set retrieval URL for redirection if needed
        localStorage.setItem('retrieveUrl', window.location.pathname);

        // Set page title
        document.title = `Foramind | ${t('paymentPageMsgTxt')}`;

        // Setup input controls
        inputsCharControl();

        // Define global payment function for external scripts
        window.payment = refreshToken;

        // Initial data loading
        setupListeners();

        // Setup payment status checker
        checkPaymentStatus();

        // Return cleanup function
        return () => {
            // Cleanup code here if needed
        };
    }, []);

    useEffect(() => {
        // Check for data changes
        const storedData = localStorage.getItem('veri');
        if (storedData) {
            // Update data if needed
        }
    }, []);

    // Input controls for field validation
    const inputsCharControl = () => {
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
    };

    // Phone number mask
    const phoneNumberMask = () => {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            IMask(phoneInput, {
                mask: '{+9\\0}(000)-000-00-00',
            });
        }
    };

    // Save billing address to localStorage
    const saveBillingAddress = () => {
        const billingAddress = {
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
        localStorage.setItem('bilingAdress', JSON.stringify(billingAddress));
    };

    // Check for failed payment and restore form data
    const handleFailedPayment = () => {
        const failedPayment = Utils.getParameterByName('failed');
        if (!failedPayment) return;

        const billingAddress = JSON.parse(localStorage.getItem('bilingAdress'));
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
    };

    // Get user IP and location info
    const getUserIpInfo = async () => {
        try {
            const { data, error } = await paymentService.getUserIpInfo();
            if (data) {
                setUserIp(data.ip);
                setUserCountryCode(data.country_code);
            }
        } catch (error) {
            console.error('Error getting user IP info:', error);
        }
    };

    // Get user profile info
    const getUserProfile = async () => {
        try {
            const { data, error } = await accountService.getDetail();
            if (data) {  // Check for data.data
                form.setFieldsValue({
                    fullName: `${data.user.firstName} ${data.user.lastName}`,
                    email: data.user.email,
                });

                setUserId(data.user.id);
                setUserName(data.user.firstName);
                setUserSurname(data.user.lastName);
                setPhone(data.user.phone);
                setEmail(data.user.email);
            } else if (error) {
                message.error(t('failedToLoadProfileError'));
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            message.error(t('failedToLoadProfileError'));
        }
    };

    // Initialize listeners and data loading
    const setupListeners = async () => {
        await getUserIpInfo();
        await getUserProfile();
        setupPacketPricing();
        setupPacketControl();
        handleFailedPayment();
        getProductPricing();
    };

    // Monitor iyzico payment modal close events
    const monitorIyzicoCloseClick = () => {
        document.addEventListener('click', (e) => {
            // When iyzico payment screen is closed
            if (
                (e.path && e.path[1] && e.path[1].nodeName !== 'svg' &&
                    e.path[1].className && e.path[1].className.includes('-Close') === true) ||
                (e.path && e.path[1] && e.path[1].nodeName === 'svg')
            ) {
                updatePaymentStatus(conversationId, 2);
                Utils.loadingScreen('hide');
                delete window.iyziInit;
            }
        });
    };

    // Update payment status
    const updatePaymentStatus = async (conversationId, status) => {
        try {
            await paymentHistoryService.updatePaymentHistory(conversationId, status);
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };

    // Refresh token if needed
    const refreshToken = async () => {
        if (parseTokenExpiration() < 1) {
            try {
                const { data, error } = await tokenService.refresh({});
                if (data) {
                    submitPaymentForm();
                } else {
                    message.error(t('failedToRefreshTokenError'));
                }
            } catch (error) {
                console.error('Error refreshing token:', error);
                message.error(t('failedToRefreshTokenError'));
            }
        } else {
            submitPaymentForm();
        }
    };

    // Parse token expiration time
    const parseTokenExpiration = () => {
        const token = localStorage.getItem('token');
        if (!token) return 0;

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
    };

    // Submit payment form
    const submitPaymentForm = async () => {
        try {
            // Validate form fields
            await form.validateFields();
            
            // Prepare payment data
            const payment = collectPaymentData();
            
            // Show loading screen
            Utils.loadingScreen('show');
            
            // Submit payment
            const { data, error } = await paymentService.createPayment(payment);
            
            if (data) {
                // Save billing address for recovery if needed
                saveBillingAddress();
                
                // Handle iyzico token
                const iyzicoToken = data.checkoutFormContent;
                const tokenParse = iyzicoToken
                  .replace('<script type="text/javascript">', '')
                  .replace('</script>', '');
                
                // Set conversation ID for tracking
                setConversationId(data.conversationId);
                
                // Execute iyzico token script
                window.eval(tokenParse);
                
                // Monitor for payment modal close
                monitorIyzicoCloseClick();
            } else if (error) {
                Utils.loadingScreen('hide');
                message.error(t('paymentSubmissionFailedError'));
            }
        } catch (validationError) {
            console.error('Validation error:', validationError);
            message.error(t('fillRequiredFieldsError'));
        }
    };

    // Collect payment data from form
    const collectPaymentData = () => {
        const activeElement = document.querySelector('.activate .price .many-value');
        const productId = activeElement?.getAttribute('data-productid');
        const durationtype = activeElement?.getAttribute('data-durationtype');
        const interval = activeElement?.getAttribute('data-interval');

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
                    ip: '',
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
            couponCode: determineCouponCode(productId),
        };
    };

    // Determine which coupon code to use based on product
    const determineCouponCode = (productId) => {
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

    // Initialize packet control based on selected package
    const setupPacketControl = () => {
        const packageValue = localStorage.getItem('x8s88');

        // Add appropriate classes based on the selected package
        switch (packageValue) {
            case '1':
                document.querySelector('.month-card')?.classList.add('activate');
                document.querySelector('.year-card')?.classList.add('deactivate');
                break;
            case '2':
                document.querySelector('.year-card')?.classList.add('activate');
                document.querySelector('.month-card')?.classList.add('deactivate');
                break;
            default:
                document.querySelector('.month-card')?.classList.add('deactivate');
                document.querySelector('.year-card')?.classList.add('deactivate');
                document.querySelector('.yellow-button').disabled = true;
                break;
        }
    };

    // Setup price selection behavior
    const setupPacketPricing = () => {
        const cardElements = document.querySelectorAll('.card');

        // Disable buy button if no package is selected
        if (!selectedPackageParam) {
            document.querySelector('.yellow-button').disabled = true;
        }

        // Add click handlers to cards
        cardElements.forEach(el => {
            el.addEventListener('click', () => {
                // Remove activate class from all cards
                cardElements.forEach(card => {
                    card.classList.remove('activate');
                });

                // Add activate class to clicked card
                el.classList.add('activate');

                // Handle button state based on selection
                if (document.querySelector('.trial-card.activate')) {
                    document.querySelector('.yellow-button').disabled = true;
                } else {
                    document.querySelector('.yellow-button').disabled = false;
                }
            });
        });
    };

    // Fetch product pricing
    const getProductPricing = async () => {
        try {
            const language = localStorage.getItem('countryInfo') === 'TR' ? 'tr' : 'en';
            const { data, error } = await fetchPricingData(language);

            if (data) {
                processProductData(data);
            } else if (error) {
                message.error(t('failedToLoadProductsError'));
            }
        } catch (error) {
            console.error('Error fetching product pricing:', error);
            message.error(t('failedToLoadProductsError'));
        }
    };

    // Fetch pricing data from API
    const fetchPricingData = async (language) => {
        try {
            // This is a placeholder for the actual API call
            // In a real implementation, you would call an API endpoint
            // For now, we're mocking a response structure
            const productListApiUrl = '/Product/GetProductList';

            // Simulate API response until we have real implementation
            return {
                data: {
                    isPublic: false,
                    couponCode: '',
                    productList: [
                        { id: 1, productName: 'Monthly', price: '29.99', interval: 'month' },
                        { id: 2, productName: 'Yearly', price: '299.99', interval: 'year' }
                    ]
                }
            };
        } catch (error) {
            console.error('Error fetching pricing data:', error);
            return { error: 'Failed to fetch pricing data' };
        }
    };

    // Process product data from API response
    const processProductData = (data) => {
        const isPublic = data.isPublic;
        const couponCode = data.couponCode;
        const productList = data.productList;

        if (!productList || productList.length < 2) {
            message.error(t('noProductsAvailable'));
            return;
        }

        const monthlyProduct = productList[0];
        const yearlyProduct = productList[1];

        setIsPublicCoupon(isPublic);
        setMonthProduct(monthlyProduct);
        setYearProduct(yearlyProduct);
        setCouponCode(couponCode);

        if (isPublic) {
            setNewPublicPriceYearly(yearlyProduct.newPublicPrice);
            setNewPublicPriceMontly(monthlyProduct.newPublicPrice);
        }

        // Set product data attributes
        updateProductDataAttributes(monthlyProduct, yearlyProduct);
    };

    // Update product data attributes in the DOM
    const updateProductDataAttributes = (monthlyProduct, yearlyProduct) => {
        // Monthly product
        const monthlyElement = document.querySelector('.month-card .price .many-value');
        if (monthlyElement) {
            monthlyElement.setAttribute('data-durationType', monthlyProduct.productName);
            monthlyElement.setAttribute('data-productId', monthlyProduct.id);
            monthlyElement.setAttribute('data-interval', monthlyProduct.interval);
        }

        // Yearly product
        const yearlyElement = document.querySelector('.year-card .price .many-value');
        if (yearlyElement) {
            yearlyElement.setAttribute('data-durationType', yearlyProduct.productName);
            yearlyElement.setAttribute('data-productId', yearlyProduct.id);
            yearlyElement.setAttribute('data-interval', yearlyProduct.interval);
        }
    };

    // Handle coupon code input
    const handleCouponCodeChange = (code) => {
        setCouponCode(code);
    };

    // Use coupon code
    const useCouponCode = async (code) => {
        if (!code) {
            message.warning(t('warningmodalMsgTxt'));
            return;
        }

        try {
            Utils.loadingScreen('show');

            // Call API to validate coupon code
            const response = await applyCouponCode(code);

            Utils.loadingScreen('hide');

            if (response && response.data) {
                const productDetailId = response.data.productDetailId;

                // Update state based on product ID
                switch (productDetailId) {
                    case 1:
                        setCurrentPrice(response.data.currentPrice);
                        setProductDetailId(productDetailId);
                        break;
                    case 2:
                        setCurrentPriceOutOfTurkey(response.data.currentPrice);
                        setProductDetailId(productDetailId);
                        break;
                    case 3:
                        setCurrentPriceYearly(response.data.currentPrice);
                        setProductDetailId(productDetailId);
                        break;
                    case 4:
                        setCurrentPriceOutOfTurkeyYearly(response.data.currentPrice);
                        setProductDetailId(productDetailId);
                        break;
                }

                // Show success modal
                showSuccessModal();
            } else {
                // Show warning modal for invalid coupon
                showWarningModal();
            }
        } catch (error) {
            Utils.loadingScreen('hide');
            console.error('Error applying coupon code:', error);
            showErrorModal();
        }
    };

    // API call to apply coupon code
    const applyCouponCode = async (code) => {
        try {
            // This would be replaced with an actual API call
            // Simulating a response structure
            return {
                result: true,
                data: {
                    productDetailId: 1,
                    currentPrice: '19.99'
                }
            };
        } catch (error) {
            console.error('Error applying coupon:', error);
            return null;
        }
    };

    // Show warning modal
    const showWarningModal = () => {
        Modal.warning({
            title: t('warningMsgTxt'),
            content: <p>{t('warningmodalMsgTxt')}</p>,
        });
    };

    // Show error modal
    const showErrorModal = () => {
        Modal.error({
            title: t('errorMsgTxt'),
            content: <p>{t('reviewSendErrorMsgTxt')}</p>,
            okText: t('okMsgTxt'),
            onOk: () => {
                const appBaseEnvURL = '/foramind';
                const redirectUrl = appBaseEnvURL === '/foramind' ? appBaseEnvURL + '/' : '/';
                navigate(redirectUrl);
            }
        });
    };

    // Show success modal
    const showSuccessModal = () => {
        Modal.success({
            title: t('successMsgTxt'),
            content: <p>{t('reviewSendSuccessMsgTxt')}</p>,
            okText: t('okMsgTxt'),
            onOk: () => {
                const appBaseEnvURL = '/foramind';
                const redirectUrl = appBaseEnvURL === '/foramind' ? appBaseEnvURL + '/' : '/';
                navigate(redirectUrl);
            }
        });
    };

    // Show buy agreement modal
    const showBuyAgreementModal = () => {
        Modal.info({
            title: t('distantSalesContractTitleMsgTxt'),
            className: 'membership-agreement',
            content: <div dangerouslySetInnerHTML={{ __html: DistantSalesContractAgreements() }} />,
            okText: t('okMsgTxt'),
            okButtonProps: { className: 'button yellow-button button confirm-button' }
        });
    };

    // Check payment status
    const checkPaymentStatus = () => {
        // This could be implemented to periodically check payment status
        // Similar to the old PaymentStatusChecker
    };

    // Build country options for select
    const getCountryOptions = () => {
        return [
            { label: t('arnavutlukMsgTxt'), value: 'AL' },
            { label: t('ermenistanMsgTxt'), value: 'AM' },
            { label: t('avustralyaMsgTxt'), value: 'AU' },
            { label: t('avusturyaMsgTxt'), value: 'AT' },
            { label: t('azerbaycanMsgTxt'), value: 'AZ' },
            { label: t('bahreynMsgTxt'), value: 'BH' },
            { label: t('belcikaMsgTxt'), value: 'BE' },
            { label: t('bosnaHersekMsgTxt'), value: 'BA' },
            { label: t('bulgaristanMsgTxt'), value: 'BG' },
            { label: t('kanadaMsgTxt'), value: 'CA' },
            { label: t('cinMsgTxt'), value: 'CN' },
            { label: t('hirvatistanMsgTxt'), value: 'HR' },
            { label: t('kibrisMsgTxt'), value: 'CY' },
            { label: t('cekCumhuriyetiMsgTxt'), value: 'CZ' },
            { label: t('danimarkaMsgTxt'), value: 'DK' },
            { label: t('misirMsgTxt'), value: 'EG' },
            { label: t('estonyaMsgTxt'), value: 'EE' },
            { label: t('finlandiyaMsgTxt'), value: 'FI' },
            { label: t('fransaMsgTxt'), value: 'FR' },
            { label: t('gurcistanMsgTxt'), value: 'GE' },
            { label: t('almanyaMsgTxt'), value: 'DE' },
            { label: t('yunanistanMsgTxt'), value: 'GR' },
            { label: t('hongKongMsgTxt'), value: 'HK' },
            { label: t('macaristanMsgTxt'), value: 'HU' },
            { label: t('hindistanMsgTxt'), value: 'IN' },
            { label: t('iranMsgTxt'), value: 'IR' },
            { label: t('irakMsgTxt'), value: 'IQ' },
            { label: t('irlandaMsgTxt'), value: 'IE' },
            { label: t('italyaMsgTxt'), value: 'IT' },
            { label: t('japonyaMsgTxt'), value: 'JP' },
            { label: t('kazakistanMsgTxt'), value: 'KZ' },
            { label: t('koreMsgTxt'), value: 'KR' },
            { label: t('kuveytMsgTxt'), value: 'KW' },
            { label: t('kirgizistanMsgTxt'), value: 'KG' },
            { label: t('letonyaMsgTxt'), value: 'LV' },
            { label: t('makedonyaMsgTxt'), value: 'MK' },
            { label: t('maltaMsgTxt'), value: 'MT' },
            { label: t('hollandaMsgTxt'), value: 'NL' },
            { label: t('yeniZelandaMsgTxt'), value: 'NZ' },
            { label: t('norvecMsgTxt'), value: 'NO' },
            { label: t('polonyaMsgTxt'), value: 'PL' },
            { label: t('portekizMsgTxt'), value: 'PT' },
            { label: t('katarMsgTxt'), value: 'QA' },
            { label: t('romanyaMsgTxt'), value: 'RO' },
            { label: t('rusyaMsgTxt'), value: 'RU' },
            { label: t('arabistanMsgTxt'), value: 'SA' },
            { label: t('sirbistanKaradagMsgTxt'), value: 'CS' },
            { label: t('ispanyaMsgTxt'), value: 'ES' },
            { label: t('isvecMsgTxt'), value: 'SE' },
            { label: t('isvicreMsgTxt'), value: 'CH' },
            { label: t('tacikistanMsgTxt'), value: 'TJ' },
            { label: t('taylandMsgTxt'), value: 'TH' },
            { label: t('turkiyeMsgTxt'), value: 'TR' },
            { label: t('turkmenistanMsgTxt'), value: 'TM' },
            { label: t('ukraynaMsgTxt'), value: 'UA' },
            { label: t('birlesikArapMsgTxt'), value: 'AE' },
            { label: t('birlesikKrallikMsgTxt'), value: 'GB' },
            { label: t('abdMsgTxt'), value: 'US' },
            { label: t('ozbekistanMsgTxt'), value: 'UZ' },
        ];
    };

    const selectStyles = {
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
    };

    return (
        <>
            <Header />
            <div className="payment-page mindmap-table wide">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 col-md-12 col-lg-12">
                            <div className="buy-form">
                                <div className="buy-header">
                                    <i className="icon-basket-icon"></i>
                                    {t('landingPageFeaturesPricingMsgTxt')}
                                </div>
                                <Form form={form} layout="vertical" onFinish={refreshToken}>
                                    <div className="form-wrap-top row">
                                        <div className="form-wrap col-md-5">
                                            <div className="row user-info">
                                                <div className="col-md-12">
                                                    <div className="many-show-text">
                                                        {t('personalInformationMsgTxt')}:
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <Form.Item name="fullName" rules={[{ required: true, message: t('fieldRequiredError') }]}>
                                                                <Input readOnly className="color-gray" />
                                                            </Form.Item>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <Form.Item
                                                                name="phone"
                                                                rules={[
                                                                    { required: true, message: t('phoneNumberRequiredError') },
                                                                    { pattern: /^\d+$/, message: t('phoneNumberDigitsOnlyError') }
                                                                ]}
                                                            >
                                                                <Input placeholder={t('phonenumberMsgTxt')} id="phone" />
                                                            </Form.Item>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <Form.Item name="email">
                                                                <Input readOnly className="color-gray" />
                                                            </Form.Item>
                                                        </div>
                                                    </div>

                                                    <div className="col-12">
                                                        <div className="buy-checkbox">
                                                            <Form.Item
                                                                name="agreementCheckbox"
                                                                valuePropName="checked"
                                                                rules={[
                                                                    {
                                                                        validator: (_, value) =>
                                                                            value ? Promise.resolve() : Promise.reject(new Error(t('agreementRequiredMessage')))
                                                                    }
                                                                ]}
                                                            >
                                                                <Checkbox className="register-checkbox container-checkbox buy-label">
                                                                    <a
                                                                        className="distant-sales-contract-color"
                                                                        onClick={showBuyAgreementModal}
                                                                    >
                                                                        {t('distantSalesContractMsgTxt')}
                                                                    </a>{' '}
                                                                    {t('iAgreeMsgTxt')}
                                                                </Checkbox>
                                                            </Form.Item>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-12 mt-4">
                                                    <div className="many-show-text">
                                                        {t('bilingAdressMsgTXT')}:
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <Form.Item
                                                                name="line1"
                                                                rules={[{ required: true, message: t('fieldRequiredError') }]}
                                                            >
                                                                <Input placeholder={t('line1MsgTxt')} maxLength={60} />
                                                            </Form.Item>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <Form.Item
                                                                name="line2"
                                                                rules={[{ required: true, message: t('fieldRequiredError') }]}
                                                            >
                                                                <Input placeholder={t('line2MsgTxt')} maxLength={60} />
                                                            </Form.Item>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <Form.Item
                                                                name="city"
                                                                rules={[
                                                                    { required: true, message: t('fieldRequiredError') },
                                                                    { pattern: /^[a-zA-Z ığüşöçĞÜŞÖÇİ]+$/, message: t('fieldLettersOnlyError') }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder={t('cityMsgTxt')}
                                                                    maxLength={50}
                                                                    className="only-letter-input"
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <Form.Item
                                                                name="state"
                                                                rules={[
                                                                    { required: true, message: t('fieldRequiredError') },
                                                                    { pattern: /^[a-zA-Z ığüşöçĞÜŞÖÇİ]+$/, message: t('fieldLettersOnlyError') }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder={t('state2MsgTxt')}
                                                                    maxLength={50}
                                                                    className="only-letter-input"
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <Form.Item
                                                                name="country"
                                                                rules={[{ required: true, message: t('fieldRequiredError') }]}
                                                            >
                                                                <Select
                                                                    id="country"
                                                                    className="country-select validate-react-select"
                                                                    styles={selectStyles}
                                                                    options={getCountryOptions()}
                                                                    placeholder={t('countryMsgTXT')}
                                                                    onChange={(value) => {
                                                                        const event = new Event('change');
                                                                        document.querySelector('.country-select input')?.dispatchEvent(event);
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="payment-cards-2 col-md-6 offset-md-1" id="pricing">
                                            <div className="row">
                                                <div className="col-md-11">
                                                    <div className="cards-wrap">
                                                        <div className={`card month-card${selectedPackageParam === 'monthly' ? ' activate' : ''}`}>
                                                            <div className="card-body">
                                                                <div className="title-wrap">
                                                                    <div className="card-title">
                                                                        {t('paymentPageMothlyTitleMsgTxt')}
                                                                    </div>
                                                                    <img
                                                                        src={silverBadgeImg}
                                                                        alt={t('paymentPageMothlyInfoTextMsgTxt')}
                                                                    />
                                                                </div>

                                                                <div className="price">
                                                                    <span className="kdv-info">
                                                                        ({t('kdvInfoForPackagesTextMsgTxt')})
                                                                    </span>

                                                                    <div className="price-area">
                                                                        <span className="many-value" data-durationType="Monthly" data-productId="1" data-interval="month">100₺</span>
                                                                    </div>

                                                                    <div className="monthly-period">
                                                                        {t('monthly')}
                                                                        <div className="days-info">({t('30Days')})</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={`card year-card${selectedPackageParam === 'yearly' ? ' activate' : ''}`}>
                                                            <div className="card-body">
                                                                <div className="title-wrap">
                                                                    <div className="card-title">
                                                                        {t('paymentPageYearlyTitleMsgTxt')}
                                                                    </div>
                                                                    <img
                                                                        src={goldBadgeImg}
                                                                        alt={t('paymentPageYearlyInfoTextMsgTxt')}
                                                                    />
                                                                </div>

                                                                <div className="price">
                                                                    <span className="kdv-info">
                                                                        ({t('kdvInfoForPackagesTextMsgTxt')})
                                                                    </span>

                                                                    <div className="price-area">
                                                                        <span className="many-value" data-durationType="Yearly" data-productId="2" data-interval="year">800₺</span>
                                                                    </div>

                                                                    <div className="yearly-period">
                                                                        {t('yearly')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="coupon-input-area">
                                                            <Input
                                                                placeholder={t('couponCode')}
                                                                onChange={(e) => handleCouponCodeChange(e.target.value)}
                                                                value={couponCode}
                                                                id="couponCode"
                                                            />
                                                            <Button
                                                                type="primary"
                                                                onClick={() => useCouponCode(couponCode)}
                                                                className="use-code-btn"
                                                            >
                                                                {t('useCodeMsgTxt')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buy button */}
                                    <div className="buy-button-container">
                                        <Button
                                            className="buy-button-right"
                                            type="primary"
                                            htmlType="submit"
                                        >
                                            {t('buyCapitalLetterMsgTxt')}
                                        </Button>
                                    </div>
                                </Form>

                                <div className="buy-footer text-center">
                                    <hr />
                                    <img src={iyzicoLogo} alt="Iyzico" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Payment;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, message } from 'antd';
import IMask from 'imask';

// Services & Utils
import Utils from '../../../utils';
import paymentApi from './components/paymentApi';
import paymentUtils from './components/paymentUtils';

// Styles
import './index.scss';

// Components
import Header from '../../../components/header';
import AgreementModal from './components/agreementModal';
import UserInfoForm from './components/userInfoForm';
import PackageCards from './components/packageCards';
import getCountryOptions from './components/countryOptions';

// Images
import iyzicoLogo from "../../../styles/img/iyzico_logo_band_colored.png";

// i18n
import { useTranslation } from 'react-i18next';

const Payment = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // State
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userSurname, setUserSurname] = useState('');
    const [conversationId, setConversationId] = useState('');
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
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Selected package from URL params
    const selectedPackageParam = Utils.getParameterByName('selectedPackage');

    useEffect(() => {
        // Set retrieval URL for redirection if needed
        localStorage.setItem('retrieveUrl', window.location.pathname);

        // Set page title
        document.title = `Foramind | ${t('paymentPageMsgTxt')}`;

        // Setup input controls
        paymentUtils.setupInputControls();

        // Define global payment function for external scripts
        window.payment = refreshToken;

        // Initial data loading
        setupListeners();

        return () => {
            // Cleanup code here if needed
        };
    }, []);

    // Initialize listeners and data loading
    const setupListeners = async () => {
        await getUserIpInfo();
        await getUserProfile();
        setupPacketPricing();
        setupPacketControl();
        handleFailedPayment();
        getProductPricing();
    };

    // Get user IP and location info
    const getUserIpInfo = async () => {
        const { data } = await paymentApi.getUserIpInfo();
        if (data) {
            setUserIp(data.ip);
            setUserCountryCode(data.country_code);
        }
    };

    // Get user profile info
    const getUserProfile = async () => {
        const { data, error } = await paymentApi.getUserProfile();
        if (data) {
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
            paymentUtils.showMessages.profileError(t);
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
        const billingAddress = paymentUtils.saveBillingAddress(
            form, 
            { userName, userSurname, email }, 
            userCountryCode, 
            t
        );
        localStorage.setItem('bilingAdress', JSON.stringify(billingAddress));
    };

    // Check for failed payment and restore form data
    const handleFailedPayment = () => {
        const failedPayment = Utils.getParameterByName('failed');
        if (!failedPayment) return;

        const billingAddress = JSON.parse(localStorage.getItem('bilingAdress'));
        paymentUtils.handleFailedPayment(form, billingAddress);
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
        await paymentApi.updatePaymentStatus(conversationId, status);
    };

    // Refresh token if needed
    const refreshToken = async () => {
        const tokenExpiration = paymentUtils.parseTokenExpiration(localStorage.getItem('token'));
        if (tokenExpiration < 1) {
            const { data, error } = await paymentApi.refreshToken();
            if (data) {
                submitPaymentForm();
            } else {
                paymentUtils.showMessages.tokenError(t);
            }
        } else {
            submitPaymentForm();
        }
    };

    // Submit payment form
    const submitPaymentForm = async () => {
        try {
            // Validate form fields
            await form.validateFields();
            
            // Prepare payment data
            const userInfo = {
                userId, userName, userSurname, userIp, userCountryCode, 
                isPublicCoupon, couponCode
            };
            
            const couponInfo = {
                currentPrice, currentPriceYearly, 
                newPublicPriceMontly, newPublicPriceYearly
            };
            
            const payment = paymentUtils.collectPaymentData(form, userInfo, couponInfo);
            
            // Show loading screen
            Utils.loadingScreen('show');
            
            // Submit payment
            const { data, error } = await paymentApi.createPayment(payment);
            
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
                paymentUtils.showMessages.paymentError(t);
            }
        } catch (validationError) {
            console.error('Validation error:', validationError);
            paymentUtils.showMessages.validationError(t);
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
            const { data, error } = await paymentApi.fetchPricingData(language);

            if (data) {
                processProductData(data);
            } else if (error) {
                paymentUtils.showMessages.productsError(t);
            }
        } catch (error) {
            console.error('Error fetching product pricing:', error);
            paymentUtils.showMessages.productsError(t);
        }
    };

    // Process product data from API response
    const processProductData = (data) => {
        const isPublic = data.isPublic;
        const couponCode = data.couponCode;
        const productList = data.productList;

        if (!productList || productList.length < 2) {
            paymentUtils.showMessages.noProducts(t);
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
            paymentUtils.showMessages.warning(t);
            return;
        }

        try {
            Utils.loadingScreen('show');

            // Call API to validate coupon code
            const response = await paymentApi.applyCouponCode(code);

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

                paymentUtils.showMessages.success(t);
            } else {
                paymentUtils.showMessages.warning(t);
            }
        } catch (error) {
            Utils.loadingScreen('hide');
            console.error('Error applying coupon code:', error);
            paymentUtils.showMessages.error(t);
        }
    };

    // Show buy agreement modal
    const showBuyAgreementModal = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Header />
            <AgreementModal isVisible={isModalVisible} onOk={handleModalOk} />
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
                                            <UserInfoForm 
                                                form={form} 
                                                onAgreementClick={showBuyAgreementModal} 
                                                getCountryOptions={getCountryOptions}
                                                selectStyles={paymentUtils.selectStyles}
                                            />
                                        </div>

                                        <div className="payment-cards-2 col-md-6 offset-md-1" id="pricing">
                                            <PackageCards 
                                                selectedPackageParam={selectedPackageParam} 
                                                couponCode={couponCode}
                                                handleCouponCodeChange={handleCouponCodeChange}
                                                useCouponCode={useCouponCode}
                                            />
                                        </div>
                                    </div>

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
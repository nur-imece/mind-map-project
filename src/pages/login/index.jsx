import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Space, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Utils from '../../utils';
import accountService from '../../services/api/account';
import loginRegisterLogo from '../../styles/img/foramind_logo.png';
import googleBtnImage from '../../styles/img/google-btn-image.png';
import microsoftBtnImage from '@/styles/img/microsoft-btn.svg';
import loginRegisterBg from '../../styles/img/form-bg.png';
import LanguageSelector from '../../components/languageSelector';
import './login.css';

const { Text } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Foramind | " + t("loginMsgTxt");

        // Handle redirect login
        if (Utils.getParameterByName("redirectLogin")) {
            localStorage.setItem("token", Utils.getParameterByName("token"));
            localStorage.setItem("refreshToken", Utils.getParameterByName("refreshToken"));
        }

        // Handle account activation
        const userMail = Utils.getParameterByName("userMail");
        const registerConfirmationToken = Utils.getParameterByName("registerConfirmationToken");
        const userControl = Utils.getParameterByName("userControl");

        if (registerConfirmationToken) {
            const accountactivation = {
                userMail,
                registerConfirmationToken,
                userControl: userControl === "1"
            };
        }

        // Handle remember me
        const rememberMe = localStorage.getItem("rememberMe");
        if (rememberMe) {
            form.setFieldsValue({
                email: localStorage.getItem("userMail"),
                rememberMe: true
            });
        }
    }, [t, form]);

    const getUserInformation = async () => {
        try {
            console.log("Getting user information...");
            console.log("Token:", localStorage.getItem("token"));
            console.log("AccessToken:", localStorage.getItem("accessToken"));
            
            // Log the authorization header that will be sent
            const authHeader = `Bearer ${localStorage.getItem("token") || localStorage.getItem("accessToken") || ""}`;
            console.log("Authorization header:", authHeader);
            
            // Explicitly set headers
            const headers = {
                Authorization: authHeader
            };
            
            const response = await accountService.getDetail();
            console.log("User detail response:", response);
            
            if (response.error) {
                console.error("Error fetching user details:", response.error);
                message.error(t("loginErrorMsgTxt"));
                return;
            }
            
            if (response.data && response.data.user) {
                // Store user and company information in localStorage
                localStorage.setItem("loginType", response.data.user.loginType);
                localStorage.setItem("userInformation", JSON.stringify(response.data.user));
                
                if (response.data.company) {
                    localStorage.setItem("userCompanyInformation", JSON.stringify(response.data.company));
                }
                
                if (response.data.companySubscription) {
                    localStorage.setItem("c65s1", JSON.stringify(response.data.companySubscription));
                }
                
                // Handle user role IDs
                let userRoleIdList = JSON.parse(localStorage.getItem("userRoleIdList")) || [];
                userRoleIdList.push(response.data.user.userTypeId);
                localStorage.setItem("userRoleIdList", JSON.stringify(userRoleIdList));
                
                // Navigate to mind map list
                navigate('/mind-map-list');
            } else {
                console.error("No user data in response");
                message.error(t("loginErrorMsgTxt"));
            }
        } catch (error) {
            console.error("Error fetching user information:", error);
            if (error.response) {
                console.error("Error status:", error.response.status);
                console.error("Error data:", error.response.data);
                console.error("Error headers:", error.response.headers);
            }
            message.error(t("loginErrorMsgTxt"));
        } finally {
        }
    };

    const handleSubmit = async (values) => {
        const { email, password, rememberMe } = values;

        if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("userMail", email);
        } else {
            localStorage.setItem("rememberMe", "");
            localStorage.setItem("userMail", "");
        }
        
        setLoading(true);
        try {
            const response = await accountService.login({
                email,
                password
            });
            
            if (response.error) {
                message.error(t("loginErrorMsgTxt"));
            } else if (response.data) {
                // Store token with both names for compatibility
                const token = response.data.token;
                localStorage.setItem("token", token);
                localStorage.setItem("accessToken", token); // Also set accessToken for compatibility
                localStorage.setItem("refreshToken", response.data.refreshToken);
                
                console.log("Login successful, token:", token);
                
                // Get user information after successful login
                await getUserInformation();
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error(t("loginErrorMsgTxt"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${loginRegisterBg})`, backgroundSize: 'auto', backgroundPosition: 'bottom' }}>
            <div className="login-container">
                <LanguageSelector />

                <div className="login-content">
                    <div className="illustration-left">
                        {/* Left side illustration will be added */}
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className="login-form"
                    >
                        <div className="form-logo">
                            <img src={loginRegisterLogo} alt="Foramind" />
                        </div>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: t("requiredMsgTxt") },
                                { type: 'email', message: t("validEmailMsgTxt") }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder={t("emailMsgTxt")}
                                size="large"
                                maxLength={50}
                                autoCapitalize="none"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: t("requiredMsgTxt") },
                                { min: 8, message: t("validPasswordMsgTxt") }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder={t("passwordMsgTxt")}
                                size="large"
                                maxLength={20}
                                iconRender={(visible) => (
                                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                )}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Space className="remember-forgot-wrapper">
                                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                                    <Checkbox>{t("rememberMeMsgTxt")}</Checkbox>
                                </Form.Item>
                                <Button type="link" href="/forgot-password" className="forgot-password-link">
                                    {t("forgotpasswordMsgTxt")}
                                </Button>
                            </Space>
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                className="login-button" 
                                loading={loading}
                            >
                                {t("loginMsgTxt")}
                            </Button>
                        </Form.Item>

                        <div className="social-login-buttons">
                            <Button
                                type="default"
                                block
                                className="google-login"
                                icon={<img src={googleBtnImage} alt="Google" className="social-icon" />}
                            >
                                {t("googleLoginMsgTxt")}
                            </Button>

                            <Button
                                type="default"
                                block
                                className="microsoft-login"
                                icon={<img src={microsoftBtnImage} alt="Microsoft" className="social-icon" />}
                            >
                                {t("azureLoginMsgTxt")}
                            </Button>
                        </div>
                    </Form>

                    <div className="illustration-right">
                        {/* Right side illustration will be added */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
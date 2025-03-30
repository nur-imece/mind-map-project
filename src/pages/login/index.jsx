import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Space, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Utils from '../../utils';
import loginRegisterLogo from '../../styles/img/foramind_logo.png';
import googleBtnImage from '../../styles/img/google-btn-image.png';
import microsoftBtnImage from '@/styles/img/microsoft-btn.svg';
import loginRegisterBg from '../../styles/img/form-bg.png';
import LanguageSelector from '../../components/languageSelector';
import { useAuth } from '../../context/authContext';
import './login.css';

const { Text } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();
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
            const result = await login({
                email,
                password
            });
            
            if (!result.success) {
                message.error(t("loginErrorMsgTxt"));
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
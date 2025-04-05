import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Modal, Checkbox, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import accountService from '../../services/api/account';
import MembershipAgreementText from '../../components/membership-agreement-text';
import RegisterClarifyingText from '../../components/register-clarifying-text';
import './index.scss';
import logo from '../../styles/img/foramind_logo.png';
import LanguageSelector from '../../components/languageSelector';
import loginRegisterBg from '../../styles/img/form-bg.png';
import SocialLogin from '../../components/socialLogin';

const Register = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [membershipAgreementVisible, setMembershipAgreementVisible] = useState(false);
  const [clarifyingTextVisible, setClarifyingTextVisible] = useState(false);

  useEffect(() => {
    document.title = "Foramind | " + t('Register');
    
    // Handle account activation from URL params if any
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token && email) {
      activateAccount(token, email);
    }
  }, [location, t]);
  
  const activateAccount = async (token, email) => {
    try {
      const response = await accountService.confirmTokenEmail({
        userMail: email,
        registerConfirmationToken: token,
        userControl: true
      });
      
      if (response.data) {
        message.success(t('Account successfully activated. You can now login.'));
        navigate('/login');
      }
    } catch (error) {
      message.error(t('Account activation failed.'));
    }
  };

  const showMembershipAgreement = () => {
    setMembershipAgreementVisible(true);
  };

  const showClarifyingText = () => {
    setClarifyingTextVisible(true);
  };

  const handleSubmit = async (values) => {
    if (!values.agreement) {
      message.error(t('You must accept the Membership Agreement to register'));
      return;
    }

    if (values.password !== values.confirmPassword) {
      message.error(t('Passwords do not match'));
      return;
    }

    setLoading(true);

    try {
      const response = await accountService.register({
        firstname: values.firstName,
        lastname: values.lastName,
        email: values.email,
        password: values.password,
        kvkkConfirmStatus: values.agreement
      });

      if (response.data) {
        message.success(t('Registration successful! Please check your email to activate your account.'));
        form.resetFields();
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.error || t('Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div className="register-page" style={{ backgroundImage: `url(${loginRegisterBg})`, backgroundSize: 'auto', backgroundPosition: 'bottom' }}>
      <div className="register-container">
        <LanguageSelector />

        <div className="register-content">
          <div className="illustration-left">
            {/* Left side illustration will be added */}
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="register-form"
            initialValues={{ agreement: false }}
          >
            <div className="form-logo">
              <img src={logo} alt="Foramind" />
            </div>

            <Form.Item
              name="firstName"
              rules={[{ required: true, message: t('Please enter your first name') }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder={t('First Name')} 
                size="large"
                maxLength={50}
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[{ required: true, message: t('Please enter your last name') }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder={t('Last Name')} 
                size="large"
                maxLength={50}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: t('Please enter your email') },
                { type: 'email', message: t('Please enter a valid email') }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder={t('Email')} 
                size="large"
                maxLength={50}
                autoCapitalize="none"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t('Please enter your password') },
                { min: 8, message: t('Password must be at least 8 characters') }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('Password')}
                size="large"
                maxLength={20}
                iconRender={(visible) => (
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                )}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: t('Please confirm your password') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('Passwords do not match')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('Confirm Password')}
                size="large"
                maxLength={20}
                iconRender={(visible) => (
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                )}
              />
            </Form.Item>

            <Form.Item name="agreement" valuePropName="checked" className="agreement-item">
              <Checkbox>
                {t('I have read and agree to the')} 
                <a onClick={showMembershipAgreement}> {t('Membership Agreement')}</a>
                {t(' and')} 
                <a onClick={showClarifyingText}> {t('Clarifying Text')}</a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                className="login-button" 
                loading={loading}
              >
                {t('Register')}
              </Button>
            </Form.Item>

            <div className="login-link-container">
              <a className="login-link" onClick={() => navigate('/login')}>
                {t('Already have an account? Login')}
              </a>
            </div>

            <div className="social-register-container">
              <SocialLogin onLoginSuccess={handleLoginSuccess} />
            </div>
          </Form>

          <div className="illustration-right">
            {/* Right side illustration will be added */}
          </div>
        </div>
      </div>
      
      <Modal
        title={t('Membership Agreement')}
        open={membershipAgreementVisible}
        onCancel={() => setMembershipAgreementVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setMembershipAgreementVisible(false)}>
            {t('I Understand')}
          </Button>
        ]}
        width={700}
        className="agreement-modal"
      >
        <div className="agreement-content">
          <MembershipAgreementText />
        </div>
      </Modal>
      
      <Modal
        title={t('Clarifying Text')}
        open={clarifyingTextVisible}
        onCancel={() => setClarifyingTextVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setClarifyingTextVisible(false)}>
            {t('I Understand')}
          </Button>
        ]}
        width={700}
        className="agreement-modal"
      >
        <div className="agreement-content">
          <RegisterClarifyingText />
        </div>
      </Modal>
    </div>
  );
};

export default Register;

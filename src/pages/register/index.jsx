import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Space, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Utils from '../../utils';
import env from '../../config/env.ts';
import loginRegisterLogo from '../../styles/img/foramind_logo.png';

const { Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    document.title = "Foramind | " + t("registerMsgTxt");

    // Handle redirect register
    if (Utils.getParameterByName("redirectRegister")) {
      localStorage.setItem("token", Utils.getParameterByName("token"));
      localStorage.setItem("refreshToken", Utils.getParameterByName("refreshToken"));
      // RegisterService.getUserInformation(); // Will be implemented later
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
      // AccountActivationService(JSON.stringify(accountactivation), RegisterService.accountAutoLogin); // Will be implemented later
    }
  }, [t]);

  const handleSubmit = (values) => {
    const { email, password, confirmPassword, firstName, lastName, acceptTerms } = values;

    if (password !== confirmPassword) {
      form.setFields([
        {
          name: 'confirmPassword',
          errors: [t("passwordMismatchMsgTxt")]
        }
      ]);
      return;
    }

    // RegisterService.register(email, password, firstName, lastName); // Will be implemented later
    console.log('Register data:', { email, firstName, lastName });
  };

  return (
    <div className="register-container">
      <div className="language-selector">
        {/* Language select will be added from context */}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="register-form"
      >
        <div className="form-logo text-center">
          <a href={env.appBaseEnvURL || '/'}>
            <img src={loginRegisterLogo} width="170" className="logo" alt="Foramind" />
          </a>
        </div>

        <Form.Item
          name="firstName"
          rules={[{ required: true, message: t("firstNameMsgTxt") }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t("firstNameMsgTxt")}
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[{ required: true, message: t("lastNameMsgTxt") }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t("lastNameMsgTxt")}
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: t("emailMsgTxt") },
            { type: 'email', message: t("invalidEmailMsgTxt") }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder={t("emailMsgTxt")}
            maxLength={50}
            autoCapitalize="none"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: t("passwordMsgTxt") },
            { min: 8, message: t("passwordLengthMsgTxt") }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t("passwordMsgTxt")}
            maxLength={20}
            iconRender={(visible) => (
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            )}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          rules={[
            { required: true, message: t("confirmPasswordMsgTxt") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("passwordMismatchMsgTxt")));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t("confirmPasswordMsgTxt")}
            maxLength={20}
            iconRender={(visible) => (
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            )}
          />
        </Form.Item>

        <Form.Item
          name="acceptTerms"
          valuePropName="checked"
          rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error(t("acceptTermsMsgTxt")))}]}
        >
          <Checkbox>
            {t("acceptTermsMsgTxt")}
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {t("registerMsgTxt")}
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={() => navigate('/login')} block>
            {t("loginMsgTxt")}
          </Button>
        </Form.Item>

        <Form.Item>
          <Button 
            type="default" 
            block
            icon={<img src="/google-icon.png" alt="Google" style={{ width: 20, marginRight: 8 }} />}
          >
            {t("googleRegisterMsgTxt")}
          </Button>
        </Form.Item>

        <Form.Item>
          <Button 
            type="default" 
            block
            icon={<img src="/azure-icon.png" alt="Azure" style={{ width: 20, marginRight: 8 }} />}
          >
            {t("azureRegisterMsgTxt")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;

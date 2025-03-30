import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
// Services
import accountService from "../../services/api/account";
// Components
import Header from "../../components/header";
// Styles
import "./index.scss";

const ChangePassword = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Set page title
        document.title = `Foramind | ${t("changepasswordMsgTxt")}`;
    }, [t]);

    // Password validation rules
    const validatePassword = (_, value) => {
        const password = form.getFieldValue('newPassword');
        if (!value) {
            return Promise.reject(new Error(t("fieldRequiredError")));
        }
        if (value !== password) {
            return Promise.reject(new Error(t("passwordMismatchMsgTxt")));
        }
        return Promise.resolve();
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const passwordData = {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            };

            const { data, error } = await accountService.changePassword(passwordData);
            
            if (data && data.result) {
                message.success(t("passwordChangedSuccessMsg"));
                form.resetFields();
            } else {
                message.error(error || t("errorMsgTxt"));
            }
        } catch (error) {
            console.error("Error changing password:", error);
            message.error(t("errorMsgTxt"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="mindmap-table wide">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="change-password-form form-centered">
                                <Form 
                                    form={form} 
                                    layout="vertical" 
                                    onFinish={handleSubmit}
                                >
                                    <div className="form-wrapper">
                                        <div className="row">
                                            <div className="col-8 col-sm-8 col-md-6 col-lg-6 col-xl-6 offset-2 offset-sm-2 offset-md-3 offset-lg-3 offset-xl-3 mb-4">
                                                <div className="form-group">
                                                    <h4>{t("changepasswordMsgTxt")}</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 offset-0 offset-sm-0 offset-md-3 offset-lg-3 offset-xl-3">
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item
                                                            name="currentPassword"
                                                            rules={[{ required: true, message: t("fieldRequiredError") }]}
                                                        >
                                                            <Input.Password
                                                                prefix={<LockOutlined />}
                                                                placeholder={t("currentpasswordMsgTxt")}
                                                                maxLength={50}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item
                                                            name="newPassword"
                                                            rules={[
                                                                { required: true, message: t("fieldRequiredError") },
                                                                { 
                                                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, 
                                                                    message: t("validPasswordMsgTxt") 
                                                                }
                                                            ]}
                                                        >
                                                            <Input.Password
                                                                prefix={<LockOutlined />}
                                                                placeholder={t("newpasswordMsgTxt")}
                                                                maxLength={50}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item
                                                            name="confirmPassword"
                                                            dependencies={['newPassword']}
                                                            rules={[
                                                                { required: true, message: t("fieldRequiredError") },
                                                                { validator: validatePassword }
                                                            ]}
                                                        >
                                                            <Input.Password
                                                                prefix={<LockOutlined />}
                                                                placeholder={t("confirmpasswordMsgTxt")}
                                                                maxLength={50}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item>
                                                            <Button
                                                                type="primary"
                                                                htmlType="submit"
                                                                className="yellow-button button submit-form-button float-right"
                                                                loading={loading}
                                                            >
                                                                {t("saveMsgTxt")}
                                                            </Button>
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChangePassword;

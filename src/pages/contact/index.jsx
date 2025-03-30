import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Button, Checkbox, message, Modal } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
// Services
import contactService from "../../services/api/contact";
import accountService from "../../services/api/account";
// Components
import Header from "../../components/header";
import ClarifyingText from "../../components/account-contact-clarifying-text";
// Styles
import "./index.scss";

const { TextArea } = Input;

const Contact = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [currentLength, setCurrentLength] = useState(0);
    const maxLength = 500;

    useEffect(() => {
        // Set page title
        document.title = `Foramind | ${t("contactMsgTxt")}`;
        
        // Load user profile data
        getUserProfile();
    }, []);

    // Get user profile from account service
    const getUserProfile = async () => {
        try {
            const { data, error } = await accountService.getDetail();
            
            if (data) {
                // Fill form with user data
                form.setFieldsValue({
                    name: data.user.firstName,
                    surname: data.user.lastName,
                    email: data.user.email
                });
            } else {
                message.error(t("failedToLoadProfileError"));
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            message.error(t("failedToLoadProfileError"));
        }
    };

    // Handle text area input for character count
    const handleTextAreaChange = (e) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setCurrentLength(value.length);
        }
    };

    // Show clarification text modal
    const showClarificationTextModal = () => {
        Modal.info({
            title: t("accountContactClarifyAgreementTitle"),
            content: <ClarifyingText />,
            okText: t("okMsgTxt"),
            width: 800,
            className: "privacy-modal"
        });
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            const contactData = {
                name: values.name,
                surname: values.surname,
                email: values.email,
                description: values.description
            };

            const { data, error } = await contactService.createContact(contactData);
            
            if (data) {
                message.success(t("successMsgTxt"));
                form.resetFields(['description']);
                setCurrentLength(0);
            } else {
                message.error(t("errorMsgTxt"));
            }
        } catch (error) {
            console.error("Error sending contact message:", error);
            message.error(t("errorMsgTxt"));
        }
    };

    return (
        <>
            <Header />
            <div className="mindmap-table wide">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="profile-form form-centered">
                                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-10 col-lg-8 col-xl-8 offset-0 offset-sm-0 offset-md-1 offset-lg-2 offset-xl-2">
                                                <div className="form-group">
                                                    <h4>{t("contactMsgTxt")}</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-10 col-lg-8 col-xl-8 offset-0 offset-sm-0 offset-md-1 offset-lg-2 offset-xl-2">
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item
                                                            name="name"
                                                            rules={[{ required: true, message: t("fieldRequiredError") }]}
                                                        >
                                                            <Input 
                                                                prefix={<UserOutlined />}
                                                                placeholder={t("firstnameMsgTxt")}
                                                                maxLength={50}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item
                                                            name="surname"
                                                            rules={[{ required: true, message: t("fieldRequiredError") }]}
                                                        >
                                                            <Input 
                                                                prefix={<UserOutlined />}
                                                                placeholder={t("lastnameMsgTxt")}
                                                                maxLength={50}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item
                                                            name="email"
                                                            rules={[
                                                                { required: true, message: t("fieldRequiredError") },
                                                                { type: 'email', message: t("validEmailMsgTxt") }
                                                            ]}
                                                        >
                                                            <Input 
                                                                prefix={<MailOutlined />}
                                                                placeholder={t("currentemailMsgTxt")}
                                                                maxLength={50}
                                                                readOnly
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item
                                                            name="description"
                                                            rules={[{ required: true, message: t("fieldRequiredError") }]}
                                                        >
                                                            <TextArea
                                                                rows={15}
                                                                placeholder={t("description")}
                                                                maxLength={maxLength}
                                                                onChange={handleTextAreaChange}
                                                            />
                                                        </Form.Item>
                                                        <div id="the-count">
                                                            <span id="current">{currentLength}</span>
                                                            <span id="maximum">/ {maxLength}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0 mt-3 mb-1">
                                                        <Form.Item
                                                            name="agreement"
                                                            valuePropName="checked"
                                                            rules={[
                                                                {
                                                                    validator: (_, value) =>
                                                                        value ? Promise.resolve() : Promise.reject(new Error(t("agreementRequiredMessage")))
                                                                }
                                                            ]}
                                                        >
                                                            <Checkbox className="register-checkbox container-checkbox register-label">
                                                                <a onClick={showClarificationTextModal}>
                                                                    {t("accountContactClarifyAgreement")}
                                                                </a>
                                                                {" " + t("registerMembershipAgreement")}
                                                            </Checkbox>
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                                <br />
                                                <div className="row">
                                                    <div className="col-10 col-sm-10 col-md-12 col-lg-12 col-xl-12 offset-1 offset-sm-1 offset-md-0 offset-lg-0 offset-xl-0">
                                                        <Form.Item>
                                                            <Button
                                                                type="primary"
                                                                htmlType="submit"
                                                                className="yellow-button button submit-form-button float-right"
                                                            >
                                                                {t("contactsendMsgTxt")}
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

export default Contact;

import React from "react";
import { Form, Input, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const profileForm = ({ form, loading, updateProfile }) => {
  const { t } = useTranslation();

  return (
    <>
      <Form.Item
        name="firstName"
        rules={[{ required: true, message: t("requiredMsgTxt") }]}
      >
        <Input 
          placeholder={t("firstnameMsgTxt")}
          maxLength={50}
          prefix={<UserOutlined />}
        />
      </Form.Item>

      <Form.Item
        name="lastName"
        rules={[{ required: true, message: t("requiredMsgTxt") }]}
      >
        <Input 
          placeholder={t("lastnameMsgTxt")}
          maxLength={50}
          prefix={<UserOutlined />}
        />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        rules={[{ required: true, message: t("requiredMsgTxt") }]}
      >
        <Input 
          id="phoneNumber"
          placeholder={'+90 ' + t("phonenumberMsgTxt")}
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: t("requiredMsgTxt") },
          { type: 'email', message: t("validEmailMsgTxt") }
        ]}
      >
        <Input 
          className="profile-email-input"
          placeholder={t("currentemailMsgTxt")}
          maxLength={50}
          readOnly
        />
      </Form.Item>

      <Form.Item
        name="company"
        rules={[{ required: true, message: t("requiredMsgTxt") }]}
      >
        <Input 
          placeholder={t("companyMsgTxt")}
          maxLength={50}
        />
      </Form.Item>

      <Form.Item
        name="jobTitle"
        rules={[{ required: true, message: t("requiredMsgTxt") }]}
      >
        <Input 
          placeholder={t("jobtitleMsgTxt")}
          maxLength={50}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          className="yellow-button"
          onClick={updateProfile}
          loading={loading}
          block
        >
          {t("saveMsgTxt")}
        </Button>
      </Form.Item>
    </>
  );
};

export default profileForm; 
import React from "react";
import { Form, Input, Checkbox, Row, Col, Select, Typography } from "antd";
import { useTranslation } from "react-i18next";
import getCountryOptions from "./countryOptions";

const { Title } = Typography;

const userInfoForm = ({ form, onAgreementClick, validatePhone, validateNameField }) => {
  const { t } = useTranslation();
  const countryOptions = getCountryOptions();

  return (
    <div className="form-section">
      <Title level={5} className="section-title">{t("personalInformationMsgTxt")}</Title>
      
      <Form.Item
        name="fullName"
        rules={[{ required: true, message: t('fieldRequiredError') }]}
      >
        <Input 
          id="fullName"
          className="form-input"
          readOnly
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: t('fieldRequiredError') },
              { validator: validatePhone }
            ]}
          >
            <Input
              placeholder={t("phonenumberMsgTxt")}
              id="phone"
              className="form-input"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('fieldRequiredError') },
              { type: 'email', message: t('validEmailMsgTxt') }
            ]}
          >
            <Input
              id="email"
              className="form-input"
              readOnly
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(new Error(t("agreementRequiredMessage"))),
          },
        ]}
      >
        <Checkbox className="agreement-checkbox">
          <a
            className="agreement-link"
            onClick={onAgreementClick}
          >
            {t("distantSalesContractMsgTxt")}
          </a>{" "}
          {t("iAgreeMsgTxt")}
        </Checkbox>
      </Form.Item>
      <p className="agreement-text">{t("chatGptAgreementTxt")}</p>
      
      <Title level={5} className="section-title">{t("bilingAdressMsgTXT")}</Title>
      
      <Form.Item
        name="line1"
        rules={[{ required: true, message: t('fieldRequiredError') }]}
      >
        <Input
          id="line1"
          placeholder={t("line1MsgTxt")}
          maxLength={60}
          className="form-input"
        />
      </Form.Item>
      
      <Form.Item
        name="line2"
        rules={[{ required: true, message: t('fieldRequiredError') }]}
      >
        <Input
          id="line2"
          placeholder={t("line2MsgTxt")}
          maxLength={60}
          className="form-input"
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="city"
            rules={[
              { required: true, message: t('fieldRequiredError') },
              { validator: validateNameField }
            ]}
          >
            <Input
              id="city"
              placeholder={t("cityMsgTxt")}
              maxLength={50}
              className="form-input"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="state"
            rules={[
              { required: true, message: t('fieldRequiredError') },
              { validator: validateNameField }
            ]}
          >
            <Input
              id="state"
              placeholder={t("state2MsgTxt")}
              maxLength={50}
              className="form-input"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="country"
        rules={[{ required: true, message: t('fieldRequiredError') }]}
      >
        <Select
          id="country"
          className="form-select"
          options={countryOptions}
          placeholder={t("countryMsgTXT")}
        />
      </Form.Item>
    </div>
  );
};

export default userInfoForm; 
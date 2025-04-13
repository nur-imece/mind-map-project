import React from 'react';
import { Form, Input, Checkbox, Row, Col, Select } from 'antd';
import { useTranslation } from 'react-i18next';

const userInfoForm = ({ form, onAgreementClick, getCountryOptions, selectStyles }) => {
  const { t } = useTranslation();

  return (
    <div className="row user-info">
      <div className="col-md-12">
        <div className="many-show-text">
          {t('personalInformationMsgTxt')}:
        </div>

        <div className="row">
          <div className="col-md-12">
            <Form.Item 
              name="fullName" 
              rules={[{ required: true, message: t('fieldRequiredError') }]}
            >
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
                  onClick={onAgreementClick}
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
  );
};

export default userInfoForm; 
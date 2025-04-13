import React from 'react';
import { Form, Input, Select, Row, Col, Divider, Checkbox } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import CountrySelect from '../../../../components/LocationSelect/CountrySelect';
import PhoneCode from '../../../../components/LocationSelect/PhoneCode';
import PhoneInput from 'react-phone-input-2';
import { selectStyles } from './paymentUtils';

export const FormSection = ({ title, children }) => (
  <>
    <Divider orientation="left">{title}</Divider>
    {children}
  </>
);

export const CardNumberInput = ({ handleChange }) => (
  <Form.Item
    label="Card Number"
    name="cardNumber"
    rules={[{ required: true, message: 'Please input your card number!' }]}
  >
    <Input
      placeholder="Card Number"
      onChange={handleChange}
      maxLength={19}
    />
  </Form.Item>
);

export const CardExpiryInput = ({ handleChange }) => (
  <Form.Item
    label="Expiry Date"
    name="expiry"
    rules={[{ required: true, message: 'Please input expiry date!' }]}
  >
    <Input
      placeholder="MM/YY"
      onChange={handleChange}
      maxLength={5}
    />
  </Form.Item>
);

export const CardCVCInput = ({ handleChange }) => (
  <Form.Item
    label="CVC"
    name="cvc"
    rules={[{ required: true, message: 'Please input CVC!' }]}
  >
    <Input
      placeholder="CVC"
      onChange={handleChange}
      maxLength={4}
    />
  </Form.Item>
);

export const NameOnCardInput = ({ handleChange }) => (
  <Form.Item
    label="Name on Card"
    name="nameOnCard"
    rules={[{ required: true, message: 'Please input name on card!' }]}
  >
    <Input
      placeholder="Name on Card"
      onChange={handleChange}
    />
  </Form.Item>
);

export const BillingAddressSection = ({ countryValue, onCountryChange, stateProvinceLabel }) => (
  <FormSection title="Billing Address">
    <Form.Item
      label="Country"
      name="country"
      rules={[{ required: true, message: 'Please select country!' }]}
    >
      <CountrySelect
        value={countryValue}
        onChange={onCountryChange}
        styles={selectStyles}
      />
    </Form.Item>
    
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="Address Line 1"
          name="address"
          rules={[{ required: true, message: 'Please input address!' }]}
        >
          <Input placeholder="Address Line 1" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label="Address Line 2"
          name="address2"
        >
          <Input placeholder="Address Line 2" />
        </Form.Item>
      </Col>
    </Row>
    
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="City"
          name="city"
          rules={[{ required: true, message: 'Please input city!' }]}
        >
          <Input placeholder="City" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={stateProvinceLabel || "State/Province"}
          name="state"
          rules={[{ required: true, message: `Please input ${stateProvinceLabel || "state/province"}!` }]}
        >
          <Input placeholder={stateProvinceLabel || "State/Province"} />
        </Form.Item>
      </Col>
    </Row>
    
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="Postal Code"
          name="postalCode"
          rules={[{ required: true, message: 'Please input postal code!' }]}
        >
          <Input placeholder="Postal Code" />
        </Form.Item>
      </Col>
    </Row>
  </FormSection>
);

export const ContactInfoSection = ({ phoneInputProps }) => (
  <FormSection title="Contact Information">
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label="Phone"
          name="phone"
        >
          <PhoneInput
            country={'us'}
            enableSearch={true}
            {...phoneInputProps}
          />
        </Form.Item>
      </Col>
    </Row>
  </FormSection>
);

export const SaveBillingAddressCheckbox = ({ checked, onChange }) => (
  <Form.Item name="saveBillingAddress" valuePropName="checked">
    <Checkbox checked={checked} onChange={onChange}>
      Save this billing address
    </Checkbox>
  </Form.Item>
);

export const PrivacyPolicyCheckbox = ({ checked, onChange }) => (
  <Form.Item
    name="privacyPolicy"
    valuePropName="checked"
    rules={[
      {
        validator: (_, value) =>
          value ? Promise.resolve() : Promise.reject(new Error('You must agree to the privacy policy')),
      },
    ]}
  >
    <Checkbox checked={checked} onChange={onChange}>
      I agree to the <a href="/privacy-policy" target="_blank">Privacy Policy</a>
    </Checkbox>
  </Form.Item>
);

export const InfoMessage = ({ message }) => (
  <div className="info-message">
    <InfoCircleOutlined /> {message}
  </div>
);

export const CouponCodeInput = ({ onApplyCoupon }) => (
  <Form.Item label="Coupon Code" name="couponCode">
    <Input.Search
      placeholder="Enter coupon code"
      enterButton="Apply"
      onSearch={onApplyCoupon}
    />
  </Form.Item>
); 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Checkbox, Input, Button, Row, Col, Divider, Modal, Form, message, Spin, Card, Typography, Radio } from "antd";
import { ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import accountService from "../../../services/api/account";
import mapAiPackageService from "../../../services/api/mapaipackage";
import paymentService from "../../../services/api/payment";
import tokenService from "../../../services/api/token";
import DistantSalesContractAgreements from "../../../components/distant-sales-contract";
import Header from "../../../components/header";
import iyzicoLogo from "../../../styles/img/iyzico_logo_band_colored.png";
import "./index.scss";

const { Title, Text } = Typography;

const ChatGptPayment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [state, setState] = useState({
    userId: "",
    userName: "",
    userSurname: "",
    conversationId: "",
    paymentStatus: "",
    phone: "",
    email: "",
    value: JSON.parse(localStorage.getItem("x8s88") || "null"),
    userIp: "",
    userCountryCode: "",
    products: [],
    selectedPackageName: "",
    selectedPackageId: "",
    selectedPackageParam: null,
  });

  useEffect(() => {
    localStorage.setItem("retrieveUrl", window.location.pathname);
    document.title = "Foramind | " + t("paymentPageMsgGptTxt");
    
    window.payment = refreshToken;
    listener();
  }, []);

  const updateState = (updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  const bilingAdress = () => {
    const formValues = form.getFieldsValue();
    const bilingAdress = {
      line1: formValues.line1 || "",
      line2: formValues.line2 || "",
      city: formValues.city || "",
      state: formValues.state || "",
      zip: "11111",
      total:
        t("totalValueMsgTxt") +
        document.querySelector(".activate .price .many-value")?.innerHTML +
        (state.userCountryCode === "TR" ? "₺" : "$"),
      identityNumber: "11111111111",
      fullname: state.userName + " " + state.userSurname,
      phone: formValues.phone || "",
      email: state.email,
      active: document.querySelectorAll(".activate")[0]?.classList[1],
    };
    localStorage.setItem("bilingAdress", JSON.stringify(bilingAdress));
  };

  const failedPayment = () => {
    const failedPayment = new URLSearchParams(window.location.search).get("failed");
    const bilingAdress = JSON.parse(localStorage.getItem("bilingAdress") || "null");

    if (failedPayment && bilingAdress) {
      form.setFieldsValue({
        line1: bilingAdress.line1,
        line2: bilingAdress.line2,
        city: bilingAdress.city,
        state: bilingAdress.state,
        fullName: bilingAdress.fullname,
        phone: bilingAdress.phone,
        email: bilingAdress.email,
      });
      
      if (bilingAdress.active == "month-card") {
        document.querySelector(".month-card")?.classList.add("activate");
        document.querySelector(".year-card")?.classList.add("deactivate");
        document.querySelector(".yellow-button").disabled = false;
      } else if (bilingAdress.active == "year-card") {
        document.querySelector(".month-card")?.classList.add("deactivate");
        document.querySelector(".year-card")?.classList.add("activate");
        document.querySelector(".yellow-button").disabled = false;
      }
    }
  };

  const getCountryIP = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getUserIpInfo();
      if (response && response.data) {
        updateState({
          userIp: response.data.ip,
          userCountryCode: response.data.country_code,
        });
        
        // Store country code in localStorage
        localStorage.setItem("countryInfo", response.data.country_code);
      }
    } catch (error) {
      console.error("Error getting country IP:", error);
      // Set default country code if fetch fails
      localStorage.setItem("countryInfo", "TR");
      updateState({
        userCountryCode: "TR"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await accountService.getDetail();
      if (response && response.data) {
        const userProfile = response.data;
        form.setFieldsValue({
          fullName: userProfile.user.firstName + " " + userProfile.user.lastName,
          email: userProfile.user.email,
        });

        updateState({
          userId: userProfile.user.id,
          userName: userProfile.user.firstName,
          userSurname: userProfile.user.lastName,
          phone: userProfile.user.phone,
          email: userProfile.user.email,
        });
      }
    } catch (error) {
      console.error("Error getting profile:", error);
      message.error(t("failedToLoadProfileError"));
    } finally {
      setLoading(false);
    }
  };

  const listener = () => {
    getCountryIP();
    getProfile();
    getProductUser();
    failedPayment();
  };

  const iyzicoCloseClick = () => {
    document.addEventListener("click", function (e) {
      // iyzico odeme ekrani kapatirken
      const path = e.composedPath ? e.composedPath() : e.path || [];
      if (
        (path[1]?.nodeName !== "svg" &&
         path[1]?.className?.includes("-Close") === true) ||
        path[1]?.nodeName === "svg"
      ) {
        const conversationId = state.conversationId;
        const paymentStatus = 2;
        paymentService.checkAiPayment(JSON.stringify({conversationId, paymentStatus}));
        message.loading({ content: "Processing...", key: "loading" });
        setTimeout(() => {
          message.destroy("loading");
        }, 1000);
        delete window.iyziInit;
      }
    });
  };

  const tokenParse = () => {
    var token = localStorage.getItem("token");
    if (!token) return 0;
    
    try {
      var base64Url = token.split(".")[1];
      var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      var jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      var tokenDate = JSON.parse(jsonPayload).exp;
      var date = new Date(tokenDate * 1000);
      var hours = date.getHours();
      var today = new Date();
      var todayHours = today.getHours();
      var endHours = Math.abs(todayHours - hours);
      return endHours;
    } catch (error) {
      console.error("Error parsing token:", error);
      return 0;
    }
  };

  const refreshToken = () => {
    form.validateFields()
      .then(values => {
        if (tokenParse() < 1) {
          tokenService.refresh()
            .then(() => {
              collectFormData();
            })
            .catch(error => {
              console.error("Token refresh error:", error);
              message.error(t("failedToRefreshTokenError"));
            });
        } else {
          collectFormData();
        }
      })
      .catch(errorInfo => {
        message.error(t("fillRequiredFieldsError"));
      });
  };

  const fillPayment = (response) => {
    if (response.data) {
      const iyzicoPayment = response.data;
      const iyzicoToken = iyzicoPayment.checkoutFormContent;
      const tokenParse = iyzicoToken
        .replace('<script type="text/javascript">', "")
        .replace("</script>", "");
      
      window.eval(tokenParse);
      
      updateState({
        conversationId: iyzicoPayment.conversationId,
      });
    }
  };

  const submitForm = async (payment) => {
    message.loading({ content: "Processing payment...", key: "paymentLoading" });
    try {
      const response = await paymentService.createAiPayment(payment);
      fillPayment(response);
      bilingAdress();
      iyzicoCloseClick();
      message.destroy("paymentLoading");
    } catch (error) {
      console.error("Payment submission error:", error);
      message.error(t("paymentSubmissionFailedError"));
      message.destroy("paymentLoading");
    }
  };

  const collectFormData = () => {
    const formValues = form.getFieldsValue();
    
    // Determine currency based on country info
    const currency = localStorage.getItem("countryInfo") === "TR" ? "TRY" : "USD";
    
    // Get the selected product info
    const selectedProduct = state.products[state.selectedPackageParam];
    
    const payment = {
      checkoutAiFormRequest: {
        buyer: {
          id: String(state.userId),
          name: state.userName,
          surname: state.userSurname,
          identityNumber: "11111111111",
          email: formValues.email,
          gsmNumber: formValues.phone,
          registrationDate: "",
          lastLoginDate: "",
          registrationAddress: (formValues.line1 || "") + (formValues.line2 || ""),
          city: formValues.city,
          country: formValues.country,
          zipCode: "111111",
          ip: state.userIp,
        },
        shippingAddress: {
          Address: (formValues.line1 || "") + (formValues.line2 || ""),
          zipCode: "111111",
          contactName: state.userName + " " + state.userSurname,
          city: formValues.city,
          country: formValues.country,
        },
        billingAddress: {
          Address: (formValues.line1 || "") + (formValues.line2 || ""),
          zipCode: "111111",
          contactName: formValues.fullName,
          city: formValues.city,
          country: formValues.country,
        },
        basketItem: {
          id: (state.selectedPackageId).toString(),
          price: selectedProduct?.price?.toString() || "",
          name: state.selectedPackageName,
          category1: "subscription",
          category2: "",
          itemType: "VIRTUAL",
          subMerchantKey: "",
          subMerchantPrice: "",
        },
        locale: localStorage.getItem("siteLanguage") || "tr-TR",
        price: selectedProduct?.price?.toString() || "",
        paidPrice: selectedProduct?.price?.toString() || "",
        currency: currency,
        conversationId: "",
        userIpAddress: state.userIp,
        userCountryCode: state.userCountryCode,
      },
      mapAiPackageId: (state.selectedPackageId).toString()
    };
    
    console.log("Payment data:", payment);
    submitForm(payment);
  };

  const selectPacketPricing = (index) => {
    const product = state.products[index];
    if (product) {
      setState(prevState => ({
        ...prevState,
        selectedPackageParam: prevState.selectedPackageParam === index ? null : index,
        selectedPackageName: product.name,
        selectedPackageId: product.id
      }));
    }
  };

  const getProductUser = async () => {
    setLoading(true);
    try {
      // Get country info from localStorage, default to TR if not set
      const countryInfo = localStorage.getItem("countryInfo") || "TR";
      const currency = countryInfo === "TR" ? "TRY" : "USD";
      
      const response = await mapAiPackageService.getAllUserAiPackage(currency);
      
      if (response && response.data) {
        // Ensure we're setting an array for products
        const productsArray = Array.isArray(response.data) ? response.data : [];
        
        // If not an array but has data property that's an array
        if (!Array.isArray(response.data) && response.data.data && Array.isArray(response.data.data)) {
          updateState({
            products: response.data.data
          });
        } else {
          updateState({
            products: productsArray
          });
        }
      } else {
        updateState({
          products: []
        });
      }
    } catch (error) {
      console.error("Error getting products:", error);
      message.error(t("failedToLoadProductsError"));
      updateState({
        products: []
      });
    } finally {
      setLoading(false);
    }
  };

  const BuyAgreementModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const countryOptions = [
    { label: t("turkiyeMsgTxt"), value: "TR" },
    { label: t("abdMsgTxt"), value: "US" },
    { label: t("arnavutlukMsgTxt"), value: "AL" },
    { label: t("ermenistanMsgTxt"), value: "AM" },
    { label: t("avustralyaMsgTxt"), value: "AU" },
    { label: t("avusturyaMsgTxt"), value: "AT" },
    { label: t("azerbaycanMsgTxt"), value: "AZ" },
    { label: t("bahreynMsgTxt"), value: "BH" },
    { label: t("belcikaMsgTxt"), value: "BE" },
    { label: t("bosnaHersekMsgTxt"), value: "BA" },
    { label: t("bulgaristanMsgTxt"), value: "BG" },
    { label: t("kanadaMsgTxt"), value: "CA" },
    { label: t("cinMsgTxt"), value: "CN" },
    { label: t("hirvatistanMsgTxt"), value: "HR" },
    { label: t("kibrisMsgTxt"), value: "CY" },
    { label: t("cekCumhuriyetiMsgTxt"), value: "CZ" },
    { label: t("danimarkaMsgTxt"), value: "DK" },
    { label: t("misirMsgTxt"), value: "EG" },
    { label: t("estonyaMsgTxt"), value: "EE" },
    { label: t("finlandiyaMsgTxt"), value: "FI" },
    { label: t("fransaMsgTxt"), value: "FR" },
    { label: t("gurcistanMsgTxt"), value: "GE" },
    { label: t("almanyaMsgTxt"), value: "DE" },
    { label: t("yunanistanMsgTxt"), value: "GR" },
    { label: t("hongKongMsgTxt"), value: "HK" },
    { label: t("macaristanMsgTxt"), value: "HU" },
    { label: t("hindistanMsgTxt"), value: "IN" },
    { label: t("iranMsgTxt"), value: "IR" },
    { label: t("irakMsgTxt"), value: "IQ" },
    { label: t("irlandaMsgTxt"), value: "IE" },
    { label: t("italyaMsgTxt"), value: "IT" },
    { label: t("japonyaMsgTxt"), value: "JP" },
    { label: t("kazakistanMsgTxt"), value: "KZ" },
    { label: t("koreMsgTxt"), value: "KR" },
    { label: t("kuveytMsgTxt"), value: "KW" },
    { label: t("kirgizistanMsgTxt"), value: "KG" },
    { label: t("letonyaMsgTxt"), value: "LV" },
    { label: t("makedonyaMsgTxt"), value: "MK" },
    { label: t("maltaMsgTxt"), value: "MT" },
    { label: t("hollandaMsgTxt"), value: "NL" },
    { label: t("yeniZelandaMsgTxt"), value: "NZ" },
    { label: t("norvecMsgTxt"), value: "NO" },
    { label: t("polonyaMsgTxt"), value: "PL" },
    { label: t("portekizMsgTxt"), value: "PT" },
    { label: t("katarMsgTxt"), value: "QA" },
    { label: t("romanyaMsgTxt"), value: "RO" },
    { label: t("rusyaMsgTxt"), value: "RU" },
    { label: t("arabistanMsgTxt"), value: "SA" },
    { label: t("sirbistanKaradagMsgTxt"), value: "CS" },
    { label: t("ispanyaMsgTxt"), value: "ES" },
    { label: t("isvecMsgTxt"), value: "SE" },
    { label: t("isvicreMsgTxt"), value: "CH" },
    { label: t("tacikistanMsgTxt"), value: "TJ" },
    { label: t("taylandMsgTxt"), value: "TH" },
    { label: t("turkmenistanMsgTxt"), value: "TM" },
    { label: t("ukraynaMsgTxt"), value: "UA" },
    { label: t("birlesikArapMsgTxt"), value: "AE" },
    { label: t("birlesikKrallikMsgTxt"), value: "GB" },
    { label: t("ozbekistanMsgTxt"), value: "UZ" }
  ];

  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(t('phoneNumberRequiredError')));
    }
    if (!/^\d+$/.test(value)) {
      return Promise.reject(new Error(t('phoneNumberDigitsOnlyError')));
    }
    return Promise.resolve();
  };

  const validateRequiredField = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(t('fieldRequiredError')));
    }
    return Promise.resolve();
  };

  const validateNameField = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(t('fieldRequiredError')));
    }
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value)) {
      return Promise.reject(new Error(t('fieldLettersOnlyError')));
    }
    return Promise.resolve();
  };

  return (
    <>
      <Header />
      <Modal
        title={t("distantSalesContractTitleMsgTxt")}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={[
          <Button key="ok" type="primary" className="yellow-button" onClick={handleModalOk}>
            {t("okMsgTxt")}
          </Button>
        ]}
        width={800}
      >
        <div className="membership-agreement" dangerouslySetInnerHTML={{ __html: DistantSalesContractAgreements() }} />
      </Modal>
      <div className="payment-container">
        <Card className="payment-card">
          <div className="payment-header">
            <ShoppingOutlined className="shopping-icon" />
            <Title level={3}>{t("chatGptPagePricingMsgTxt")}</Title>
          </div>
          
          <Form form={form} layout="vertical" requiredMark={false} className="payment-form">
            <Row gutter={24}>
              <Col xs={24} md={12}>
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
                        onClick={BuyAgreementModal}
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
              </Col>
              
              <Col xs={24} md={12}>
                <div className="package-section">
                  {loading ? (
                    <div className="loading-container">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Radio.Group 
                      className="package-options"
                      value={state.selectedPackageParam}
                      onChange={(e) => selectPacketPricing(e.target.value)}
                    >
                      <Row gutter={[16, 16]}>
                        {Array.isArray(state.products) && state.products.length > 0 ? (
                          state.products.map((item, index) => (
                            <Col xs={24} sm={12} key={item.id || index}>
                              <Radio.Button value={index} className="package-option">
                                <Card 
                                  className={`package-card ${state.selectedPackageParam === index ? 'selected-package' : ''}`}
                                  hoverable
                                >
                                  <div className="package-title">
                                    {item.numberOfMaps} {t("chatGptNumberOfMaps")}
                                  </div>
                                  <div className="package-price">
                                    {item.price}
                                    <span className="currency">
                                      {localStorage.getItem("countryInfo") === "TR" ? "₺" : "$"}
                                    </span>
                                  </div>
                                  <div className="package-name">{item.name}</div>
                                </Card>
                              </Radio.Button>
                            </Col>
                          ))
                        ) : (
                          <Col span={24}>
                            <div className="no-packages">{t("noProductsAvailable")}</div>
                          </Col>
                        )}
                      </Row>
                    </Radio.Group>
                  )}
                </div>
              </Col>
            </Row>
            
            <div className="form-actions">
              <Button
                type="primary"
                className="buy-button"
                onClick={refreshToken}
                loading={loading}
                disabled={state.selectedPackageParam === null || loading}
              >
                {t("buyCapitalLetterMsgTxt")}
              </Button>
            </div>
          </Form>
          
          <div className="payment-footer">
            <Divider />
            <img src={iyzicoLogo} alt="Iyzico" className="payment-logo" />
          </div>
        </Card>
      </div>
    </>
  );
};

export default ChatGptPayment;

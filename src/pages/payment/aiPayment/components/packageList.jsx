import React from "react";
import { Radio, Card, Row, Col, Spin } from "antd";
import { useTranslation } from "react-i18next";

const packageList = ({ loading, products, selectedPackageParam, onSelectPackage }) => {
  const { t } = useTranslation();

  return (
    <div className="package-section">
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <Radio.Group 
          className="package-options"
          value={selectedPackageParam}
          onChange={(e) => onSelectPackage(e.target.value)}
        >
          <Row gutter={[16, 16]}>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((item, index) => (
                <Col xs={24} sm={12} key={item.id || index}>
                  <Radio.Button value={index} className="package-option">
                    <Card 
                      className={`package-card ${selectedPackageParam === index ? 'selected-package' : ''}`}
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
  );
};

export default packageList; 
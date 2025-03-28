import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SubscriptionLink = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const shouldShowSubscriptionLink = () => {
    const userCompanyStr = localStorage.getItem("userCompanyInformation");
    if (!userCompanyStr) return false;
    
    try {
      const userCompany = JSON.parse(userCompanyStr);
      const companyStorage = JSON.parse(localStorage.getItem("c65s1") || "null");
      const trialDays = JSON.parse(localStorage.getItem("ab0c5") || "0");
      const remainingMaps = JSON.parse(localStorage.getItem("hw8w0") || "0");
      
      return (
        userCompany &&
        userCompany.id === 12 &&
        (companyStorage === null ||
          (companyStorage !== null &&
            companyStorage.companyRemainingProductDays === 0)) &&
        remainingMaps === 0 &&
        trialDays > 0
      );
    } catch (e) {
      console.error("Failed to parse localStorage items", e);
      return false;
    }
  };

  if (!shouldShowSubscriptionLink()) return null;

  return (
    <div className="subscription-link pull-left">
      <a onClick={() => navigate("/payment")}>
        {t("subscribeMsgTxt")}
      </a>
    </div>
  );
};

export default SubscriptionLink; 
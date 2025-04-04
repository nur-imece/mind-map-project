import React from "react";
import { useTranslation } from "react-i18next";
import RemainingMapsIcon from "@/styles/img/remaining-map-img.png";

const RemainingMaps = ({ gptMapNumbers }) => {
  const { t } = useTranslation();

  const renderRemainingMaps = () => {
    const isFreeUser = JSON.parse(localStorage.getItem("iFU0"));
    if (isFreeUser === true) {
      return (
        <div className="remaining-maps-container">
          <span className="remaining-maps-text">
            {t("remainingMapsTxt")} {gptMapNumbers}
          </span>
          <img
            src={RemainingMapsIcon}
            alt="Remaining maps"
            className="remaining-maps-icon"
          />
        </div>
      );
    } else if (isFreeUser === false) {
      const userCompanyInfo = JSON.parse(
        localStorage.getItem("userCompanyInformation")
      );
      if (userCompanyInfo && userCompanyInfo.id === 12) {
        if (JSON.parse(localStorage.getItem("hw8w0")) !== 0) {
          return (
            <div className="remaining-maps-container">
              <span className="remaining-maps-text">
                {t("remainingMapsTxt")} {gptMapNumbers}
              </span>
              <img
                src={RemainingMapsIcon}
                alt="Remaining maps"
                className="remaining-maps-icon"
              />
            </div>
          );
        }
        return null;
      } else {
        const companyInfo = JSON.parse(localStorage.getItem("c65s1"));
        if (
          companyInfo === null ||
          (companyInfo !== null && companyInfo.companyRemainingProductDays === 0)
        ) {
          return null;
        } else {
          return (
            <div className="remaining-maps-container">
              <span className="remaining-maps-text">
                {t("remainingMapsTxt")} {gptMapNumbers}
              </span>
              <img
                src={RemainingMapsIcon}
                alt="Remaining maps"
                className="remaining-maps-icon"
              />
            </div>
          );
        }
      }
    }
    return null;
  };

  return renderRemainingMaps();
};

export default RemainingMaps; 
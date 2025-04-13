import React from "react";
import { Card } from "antd";
import { useTranslation } from "react-i18next";

// images
import blankTemplateLogo from "../../../styles/img/plus-icon.png";

const AddTemplateCard = ({ setIsTemplateModalOpen }) => {
  const { t } = useTranslation();

  return (
    <Card 
      className="sub-template__add-card" 
      onClick={() => setIsTemplateModalOpen(true)}
    >
      <div className="sub-template__add-content">
        <img
          src={blankTemplateLogo}
          alt={t("createTemplateMsgTxt")}
          className="sub-template__add-icon"
        />
        <h3>{t("createTemplateMsgTxt")}</h3>
      </div>
    </Card>
  );
};

export default AddTemplateCard; 
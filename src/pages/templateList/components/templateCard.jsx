import React from "react";
import { Card, Button } from "antd";
import moreOptionsIcon from "@/styles/img/more-options-icon.png";

const TemplateCard = ({ 
  template, 
  onClick, 
  isUserHasPermissionForOptions, 
  onDeleteClick, 
  onEditClick,
  t 
}) => {
  const userInfo = JSON.parse(localStorage.getItem("userInformation") || "{}");
  const canEdit = isUserHasPermissionForOptions && userInfo.companyId === template.companyId;

  return (
    <Card 
      hoverable
      className="template-card"
      cover={
        <div 
          className="card-image-container" 
          onClick={onClick}
        >
          <img alt={template.name} src={template.image} />
          {canEdit && (
            <div className="more-options">
              <Button 
                type="text" 
                className="more-options-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle dropdown
                }}
              >
                <img src={moreOptionsIcon} alt="options" />
              </Button>
              <div className="options-dropdown">
                <Button 
                  type="text" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(template.id, template.name);
                  }}
                >
                  {t("deleteMsgTxt")}
                </Button>
                <Button 
                  type="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(template);
                  }}
                >
                  {t("editMsgTxt")}
                </Button>
              </div>
            </div>
          )}
        </div>
      }
    >
      <Card.Meta title={template.name} />
    </Card>
  );
};

export default TemplateCard; 
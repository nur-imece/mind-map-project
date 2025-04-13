import React from "react";
import { Card } from "antd";
import { ZoomInOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

// images
import moreOptionsIcon from "../../../styles/img/more-options-icon.png";
import blankTemplateLogo from "../../../styles/img/plus-icon.png";

const TemplateCard = ({ 
  template, 
  isUserHasPermissionForOptions, 
  isTeacherUserHasPermissionForOptions,
  showImagePreview,
  createMapWithTemplateEvent, 
  deleteTemplateWarning,
  setIsTemplateModalOpen,
  setIsUpdateProcess,
  setSelectedTemplate,
  setSelectedTemplateName
}) => {
  const { t } = useTranslation();
  
  // Check if current user has permission to edit/delete this template
  const hasEditPermission = (isUserHasPermissionForOptions &&
    JSON.parse(localStorage.getItem("userInformation")).companyId === template.companyId) ||
    (isTeacherUserHasPermissionForOptions &&
    JSON.parse(localStorage.getItem("userInformation")).id === template.createdBy);

  return (
    <Card className="sub-template__card">
      {hasEditPermission ? (
        <div className="sub-template__options">
          <img
            src={moreOptionsIcon}
            alt={t("optionsMsgTxt")}
            className="sub-template__options-icon"
          />
          <div className="sub-template__options-menu">
            <div
              className="sub-template__option-item"
              onClick={() => deleteTemplateWarning(template.id, template.name)}
            >
              {t("deleteMsgTxt")}
            </div>
            <div
              className="sub-template__option-item"
              onClick={() => {
                setIsTemplateModalOpen(true);
                setIsUpdateProcess(true);
                setSelectedTemplate(template);
                setSelectedTemplateName(template.name);
              }}
            >
              {t("editMsgTxt")}
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="sub-template__image-container">
        <img
          src={template.image}
          alt={template.name}
          className="sub-template__image"
          onClick={() => createMapWithTemplateEvent(
            template.id,
            template.content,
            template.name
          )}
        />
        <div className="sub-template__actions">
          <button 
            className="sub-template__zoom-btn"
            onClick={(e) => {
              e.stopPropagation();
              showImagePreview(template.image, template.name);
            }}
            title={t("previewImageMsgTxt")}
          >
            <ZoomInOutlined />
          </button>
          <button 
            className="sub-template__create-btn"
            onClick={() => createMapWithTemplateEvent(
              template.id,
              template.content,
              template.name
            )}
            title={t("createMsgTxt")}
          >
            <img
              src={blankTemplateLogo}
              alt={t("createMsgTxt")}
              className="sub-template__create-icon"
            />
          </button>
        </div>
      </div>
      
      <div className="sub-template__details">
        <h3 className="sub-template__name">{template.name}</h3>
        <p className="sub-template__count">
          {template.generatedMapCount} {t("createdMsgTxt")}
        </p>
      </div>
    </Card>
  );
};

export default TemplateCard; 
import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

const PreviewModal = ({ previewVisible, handleCancelPreview, previewImage }) => {
  const { t } = useTranslation();

  return (
    <Modal 
      visible={previewVisible} 
      footer={null} 
      onCancel={handleCancelPreview}
      width={800}
      centered
      className="sub-template__preview-modal"
    >
      {previewImage && (
        <img 
          src={previewImage} 
          alt={t("templatePreviewMsgTxt")} 
          style={{ width: '100%' }} 
        />
      )}
    </Modal>
  );
};

export default PreviewModal; 
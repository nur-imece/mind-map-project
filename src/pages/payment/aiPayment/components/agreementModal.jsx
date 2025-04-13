import React from "react";
import { Modal, Button } from "antd";
import { useTranslation } from "react-i18next";
import DistantSalesContractAgreements from "../../../../components/distant-sales-contract";

const agreementModal = ({ isVisible, onOk, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("distantSalesContractTitleMsgTxt")}
      open={isVisible}
      onOk={onOk}
      onCancel={onCancel}
      footer={[
        <Button key="ok" type="primary" className="yellow-button" onClick={onOk}>
          {t("okMsgTxt")}
        </Button>
      ]}
      width={800}
    >
      <div className="membership-agreement" dangerouslySetInnerHTML={{ __html: DistantSalesContractAgreements() }} />
    </Modal>
  );
};

export default agreementModal; 
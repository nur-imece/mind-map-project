import React from 'react';
import { Modal, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import DistantSalesContractAgreements from '../../../../components/distant-sales-contract';

const agreementModal = ({ isVisible, onOk }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('distantSalesContractTitleMsgTxt')}
      open={isVisible}
      onOk={onOk}
      className="membership-agreement"
      footer={[
        <Button 
          key="ok" 
          type="primary" 
          onClick={onOk}
          className="button yellow-button button confirm-button"
        >
          {t('okMsgTxt')}
        </Button>
      ]}
    >
      <div dangerouslySetInnerHTML={{ __html: DistantSalesContractAgreements() }} />
    </Modal>
  );
};

export default agreementModal; 
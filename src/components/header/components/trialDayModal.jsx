import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

const TrialDayModal = ({ isModalVisible, setIsModalVisible }) => {
  const { t } = useTranslation();

  const changePopupStatus = () => {
    setIsModalVisible(false);
    localStorage.setItem("isShowPopupForTrialDay", false);
  };

  return (
    <Modal
      title={t("informationModalTitleMsgTxt")}
      open={isModalVisible}
      onOk={changePopupStatus}
      onCancel={changePopupStatus}
      footer={[
        <button
          key="ok"
          className="button yellow-button"
          onClick={changePopupStatus}
        >
          {t("okMsgTxt")}
        </button>,
      ]}
    >
      <p>{t("startTrialDayInfoAndWelcomePopupContentMsgTxt")}</p>
    </Modal>
  );
};

export default TrialDayModal; 
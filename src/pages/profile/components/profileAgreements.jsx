import React from "react";
import { Checkbox, Modal } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ClarifyingText from "../../../components/profile-clarifying-text";
import ExplicitConsentText from "../../../components/profile-explicit-consent-text";

const profileAgreements = ({ isCheckboxRequired, checkboxCheckControl }) => {
  const { t } = useTranslation();

  const clarificationTextModal = () => {
    Modal.info({
      title: t("profileUpdateClarifyAgreementTitle"),
      content: <div className="membership-agreement" dangerouslySetInnerHTML={{ __html: ClarifyingText() }} />,
      okText: t("okMsgTxt"),
      width: 800,
    });
  };

  const explicitConsentTextModal = () => {
    Modal.info({
      title: t("profileUpdateExplicitConsentTextTitle"),
      content: <div className="membership-agreement" dangerouslySetInnerHTML={{ __html: ExplicitConsentText() }} />,
      okText: t("okMsgTxt"),
      width: 800,
    });
  };

  return (
    <>
      <div className="profile-agreement-info">
        <InfoCircleOutlined /> {' '}
        {t("profileAgreementsInfoMsgText")}
      </div>

      <div className="agreement-wrapper">
        <Checkbox 
          id="checkbox1-clarify"
          className={isCheckboxRequired ? 'validate-required' : ''}
          onChange={checkboxCheckControl}
        >
          <span className="text">
            <b>
              <u>
                <a onClick={clarificationTextModal}>{t("profileUpdateClarifyAgreement")}</a>
              </u>
            </b>
            {" " + t("registerMembershipAgreement") + " "}
          </span>
        </Checkbox>
      </div>

      <div className="agreement-wrapper">
        <Checkbox 
          id="checkbox2-explicit"
          className={isCheckboxRequired ? 'validate-required' : ''}
          onChange={checkboxCheckControl}
        >
          <span className="text">
            <b>
              <u>
                <a onClick={explicitConsentTextModal}>{t("profileUpdateExplicitConsentText")}</a>
              </u>
            </b>
            {" " + t("registerMembershipAgreement") + " "}
          </span>
        </Checkbox>
      </div>

      <div className="required-err none">
        <span>{t("profileUpdateAgreementReqiredInfoMsgTxt")}</span>
      </div>
    </>
  );
};

export default profileAgreements; 
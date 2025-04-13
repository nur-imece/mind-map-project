import React from "react";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Text, Paragraph } = Typography;

const linksSection = ({ openInfosOnPopup }) => {
    const { t } = useTranslation();
    
    return (
        <div style={{ marginBottom: 20 }}>
            <Paragraph>
                <Text strong>{t("forSubscriptionHistoryMsgTxt")}</Text>{" "}
                <a href="/subscription-history">{t("clickMsgTxt")}.</a>
            </Paragraph>
            
            <Paragraph>
                <Text strong>{t("forCancellationOfMembershipMsgTxt")}</Text>{" "}
                <a 
                    onClick={(e) => openInfosOnPopup(e)}
                    data-id="cancelMembership"
                >
                    {t("clickMsgTxt")}.
                </a>
            </Paragraph>
            
            <Paragraph>
                <Text strong>{t("forReturnPolicyMsgTxt")}</Text>{" "}
                <a 
                    onClick={(e) => openInfosOnPopup(e)}
                    data-id="returnConditions"
                >
                    {t("clickMsgTxt")}.
                </a>
            </Paragraph>
            
            <Paragraph>
                <Text strong>{t("forHelpMsgTxt")}</Text>{" "}
                <a 
                    onClick={(e) => openInfosOnPopup(e)}
                    data-id="helpCenter"
                >
                    {t("clickMsgTxt")}.
                </a>
            </Paragraph>
        </div>
    );
};

export default linksSection; 
import React from "react";
import { Typography, Divider } from "antd";
import { useTranslation } from "react-i18next";
import Utils from "../../../utils";

const { Text, Paragraph } = Typography;

const membershipInfoSection = ({ subscriptionData }) => {
    const { t } = useTranslation();
    
    return (
        <div style={{ marginBottom: 20 }}>
            <Paragraph>
                <Text strong>{t("membershipInfoMsgTxt")}:</Text>{" "}
                <Text type="secondary">{subscriptionData?.productModel?.id === 2 ? t("yearlyPackageMsgTxt") : t("paymentPageMothlyTitleMsgTxt")}</Text>
            </Paragraph>
            
            <Paragraph>
                <Text strong>{t("membershipStartDateMsgTxt")}:</Text>{" "}
                <Text type="secondary">
                    {subscriptionData && Utils.formatDateTimeWithoutTime(subscriptionData.userCreationDate)}
                </Text>
            </Paragraph>

            {subscriptionData && subscriptionData.productModel !== null && (
                <>
                    <Paragraph>
                        <Text strong>{t("subscriptionStartDateMsgTxt")}:</Text>{" "}
                        <Text type="secondary">
                            {Utils.formatDateTimeWithoutTime(subscriptionData.subscriptionStartDate)}
                        </Text>
                    </Paragraph>
                    
                    <Paragraph>
                        <Text strong>{t("subscriptionEndDateMsgTxt")}:</Text>{" "}
                        <Text type="secondary">
                            {Utils.formatDateTimeWithoutTime(subscriptionData.subscriptionExpireDate)}
                        </Text>
                    </Paragraph>
                </>
            )}
        </div>
    );
};

export default membershipInfoSection; 
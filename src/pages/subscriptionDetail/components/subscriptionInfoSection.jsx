import React from "react";
import { Typography, Divider } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Text, Paragraph } = Typography;

const subscriptionInfoSection = ({ subscriptionData }) => {
    const { t } = useTranslation();
    
    return (
        <div>
            {subscriptionData && (
                <>
                    {subscriptionData.productModel === null ? (
                        <Paragraph>
                            Foramind {t("subscriptionPageBasicPackageNameMsgTxt")};{" "}
                            {t("subscriptionPageYourPackageTextMsgTxt")}{" "}
                            <a href="/payment">{t("subscribeMsgTxt")}</a>
                        </Paragraph>
                    ) : (
                        <>
                            <Paragraph>
                                {t("yearlyPackageInfoMsgTxt")}{" "}
                                <a href="/payment">{t("clickMsgTxt")}.</a>
                            </Paragraph>

                            <Divider />
                            
                            <Paragraph>
                                <RobotOutlined style={{ marginRight: 8, fontSize: 18 }} />
                                {t("toAccessYourAIPackageMsgTxt")}{" "}
                                <a href="/ai-subscription-detail">{t("clickMsgTxt")}.</a>
                            </Paragraph>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default subscriptionInfoSection; 
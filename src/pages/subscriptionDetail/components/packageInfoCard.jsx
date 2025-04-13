import React from "react";
import { Card, Typography, List, Avatar } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

// images
import silverBadgeImg from "../../../styles/img/free-badge.png";
import goldBadgeImg from "../../../styles/img/gold-badge.png";

const { Title, Text } = Typography;

const packageInfoCard = ({ subscriptionData, getFeatureList }) => {
    const { t } = useTranslation();
    
    return (
        <Card>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Title level={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    {subscriptionData && 
                        (subscriptionData.productModel === null
                            ? t("subscriptionPageBasicPackageNameMsgTxt")
                            : subscriptionData.productModel.id === 1
                                ? t("paymentPageMothlyTitleMsgTxt")
                                : t("yearlyPackageMsgTxt"))}
                        
                    {subscriptionData && subscriptionData.productModel !== null && (
                        <Avatar 
                            size={48} 
                            src={subscriptionData.productModel.id === 1 ? silverBadgeImg : goldBadgeImg}
                            style={{ marginLeft: '8px' }}
                        />
                    )}
                </Title>
            </div>
            
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Text type="secondary">({t("vatIncludedMsgTxt")})</Text>
                
                {subscriptionData && subscriptionData.productModel !== null && (
                    <div style={{ margin: "16px 0" }}>
                        <Title level={2} style={{ color: "#1890ff", margin: 0 }}>
                            {subscriptionData.productModel.currency === "USD" && "$"}
                            {subscriptionData.productModel.price}
                            {subscriptionData.productModel.currency === "TRY" && "₺"}
                        </Title>
                        <Text>{t("yearly")}</Text>
                    </div>
                )}
            </div>
            
            <List
                itemLayout="horizontal"
                dataSource={getFeatureList()}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={item.icon}
                            title={item.title}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default packageInfoCard; 
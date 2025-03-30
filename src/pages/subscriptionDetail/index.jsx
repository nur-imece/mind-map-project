import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Card, Typography, Row, Col, Divider, List, Avatar, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { CheckCircleOutlined, RobotOutlined } from "@ant-design/icons";
import Utils from "../../utils";
import Header from "../../components/header";
import accountService from "../../services/api/account";
import paymentService from "../../services/api/payment";
import SubscriptionInformationModal from "../../helpers/subscription-information-modal";

// images
import silverBadgeImg from "../../styles/img/free-badge.png";
import goldBadgeImg from "../../styles/img/gold-badge.png";

const { Title, Text, Paragraph } = Typography;

const SubscriptionDetail = () => {
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [isSubscriptionInformationModal, setIsSubscriptionInformationModal] = useState(
        JSON.parse(localStorage.getItem("isCustomModalOpen") || "false")
    );
    const [informationPopupContent, setInformationPopupContent] = useState({});
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        // Redirect if user has remaining product days
        const companyData = JSON.parse(localStorage.getItem("c65s1"));
        if (companyData !== null && companyData.companyRemainingProductDays > 0) {
            navigate("/mind-map-list");
            return;
        }

        localStorage.setItem("isCustomModalOpen", "false");
        
        // Set document title
        document.title = "Foramind | " + t("subscriptionDetailMsgTxt");
        
        // Fetch subscription information
        getSubscriptionInformations();

        // Check payment if token exists
        if (localStorage.getItem("wq0wdbr9aq01xxky05h1l8")) {
            setTimeout(() => {
                checkPayment();
            }, 1000);
        }

        // Cleanup when component unmounts
        return () => {
            localStorage.removeItem("918171");
        };
    }, []);

    const getSubscriptionInformations = async () => {
        try {
            const response = await accountService.getUserSubscriptionDetail();
            if (response.data) {
                setSubscriptionData(response.data);
                
                if (localStorage.getItem("wq0wdbr9aq01xxky05h1l8")) {
                    checkPayment();
                }
            }
        } catch (error) {
            console.error("Error fetching subscription details:", error);
            message.error(t("errorFetchingSubscriptionDetails"));
        }
    };

    const sharedClick = (isOpen) => {
        setIsSubscriptionInformationModal(isOpen);
    };

    const openInfosOnPopup = (e) => {
        localStorage.setItem("isCustomModalOpen", "true");
        setIsSubscriptionInformationModal(true);

        switch (e.target.dataset.id) {
            case "cancelMembership":
                setInformationPopupContent({
                    title: t("subscriptionPageCancelMembershipMsgTxt"),
                    content: t("cancelMembershipContentMsgTxt"),
                });
                break;
            case "returnConditions":
                setInformationPopupContent({
                    title: t("subscriptionPageReturnConditionsMsgTxt"),
                    content: t("returnConditionsContentMsgTxt"),
                });
                break;
            case "helpCenter":
                setInformationPopupContent({
                    title: t("subscriptionPageHelpCenterMsgTxt"),
                    content: t("helpCenterContentMsgTxt"),
                });
                break;
        }
    };

    const checkPayment = async () => {
        const data = {
            token: localStorage.getItem("wq0wdbr9aq01xxky05h1l8"),
            locale: localStorage.getItem("siteLanguage"),
            conversationId: "",
        };

        try {
            let response;
            
            if (localStorage.getItem("918171")) {
                response = await paymentService.checkAiPayment(data);
            } else {
                response = await paymentService.checkPayment(data);
            }
            
            if (response.data) {
                const checkPayment = response.data;
                
                if (checkPayment.paymentStatus === "SUCCESS") {
                    message.success(t("successPaymentResultTextMsgTxt"));
                    getSubscriptionInformations();
                    localStorage.removeItem("bilingAdress");
                    localStorage.removeItem("wq0wdbr9aq01xxky05h1l8");
                    localStorage.removeItem("retrieveUrl");
                    localStorage.removeItem("ps5e6r6rq7");
                } else {
                    message.error(checkPayment.paymentStatus.errorMessage);
                    navigate("/payment?failed=true");
                    localStorage.removeItem("retrieveUrl");
                }
                
                localStorage.removeItem("918171");
            }
        } catch (error) {
            console.error("Error checking payment:", error);
            message.error(t("errorCheckingPayment"));
        }
    };

    const getFeatureList = () => {
        return [
            {
                title: t("unlimitedMindMapsMsgTxt"),
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />
            },
            {
                title: t("imageAttachmentMsgTxt"),
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />
            },
            {
                title: t("imageExportPdfExportMsgTxt"),
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />
            },
            {
                title: t("mindMapPrintingMsgTxt"),
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />
            },
            {
                title: t("customStylesAndBoundariesMsgTxt"),
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />
            },
            {
                title: t("presentationModeMsgTxt"),
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />
            }
        ];
    };

    return (
        <>
            <Header />
            {isSubscriptionInformationModal && (
                <SubscriptionInformationModal
                    sharedClick={sharedClick}
                    popupContent={informationPopupContent}
                />
            )}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
                <Card>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {t("subscriptionDetailMsgTxt")}
                        </Title>
                    </div>
                    
                    <Row gutter={24}>
                        <Col xs={24} md={16}>
                            {/* Membership Info Section */}
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
                            
                            <Divider />
                            
                            {/* Links Section */}
                            {subscriptionData && subscriptionData.productModel !== null && (
                                <>
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
                                    
                                    <Divider />
                                </>
                            )}
                            
                            {/* Subscription Info Section */}
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
                        </Col>
                        
                        {/* Package Info Card */}
                        <Col xs={24} md={8}>
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
                        </Col>
                    </Row>
                </Card>
            </div>
        </>
    );
};

export default SubscriptionDetail;

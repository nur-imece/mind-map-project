import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Card, Typography, Row, Col, Divider } from "antd";
import { useTranslation } from "react-i18next";
import { CheckCircleOutlined } from "@ant-design/icons";
import Utils from "../../utils";
import Header from "../../components/header";
import accountService from "../../services/api/account";
import paymentService from "../../services/api/payment";
import SubscriptionInformationModal from "../../helpers/subscription-information-modal";

// Custom components
import MembershipInfoSection from "./components/membershipInfoSection";
import LinksSection from "./components/linksSection";
import SubscriptionInfoSection from "./components/subscriptionInfoSection";
import PackageInfoCard from "./components/packageInfoCard";

const { Title } = Typography;

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
                            <MembershipInfoSection subscriptionData={subscriptionData} />
                            
                            <Divider />
                            
                            {/* Links Section */}
                            {subscriptionData && subscriptionData.productModel !== null && (
                                <>
                                    <LinksSection openInfosOnPopup={openInfosOnPopup} />
                                    <Divider />
                                </>
                            )}
                            
                            {/* Subscription Info Section */}
                            <SubscriptionInfoSection subscriptionData={subscriptionData} />
                        </Col>
                        
                        {/* Package Info Card */}
                        <Col xs={24} md={8}>
                            <PackageInfoCard 
                                subscriptionData={subscriptionData} 
                                getFeatureList={getFeatureList} 
                            />
                        </Col>
                    </Row>
                </Card>
            </div>
        </>
    );
};

export default SubscriptionDetail;

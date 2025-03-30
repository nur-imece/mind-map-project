import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "antd";
import { useTranslation } from "react-i18next";
import Header from "../../components/header";
import SubHeader from "../../components/subHeader";
import mapAiPackageService from "../../services/api/mapaipackage";
import SubscriptionInformationModal from "../../helpers/subscription-information-modal";
import "./index.scss";
import { FileTextOutlined } from "@ant-design/icons";

const SubscriptionAiDetail = () => {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isSubscriptionInformationModal, setIsSubscriptionInformationModal] = useState(
    JSON.parse(localStorage.getItem("isCustomModalOpen") || "false")
  );
  const [informationPopupContent, setInformationPopupContent] = useState({});
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user has remaining product days
    const userCompanyInfo = JSON.parse(localStorage.getItem("c65s1"));
    if (userCompanyInfo !== null && userCompanyInfo.companyRemainingProductDays > 0) {
      navigate("/mind-map-list");
      return;
    }

    document.title = `Foramind | ${t("subscriptionAiDetailMsgTxt")}`;
    getSubscriptionInformations();
  }, []);

  const getSubscriptionInformations = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInformation"));
      if (!userInfo?.id) return;

      const response = await mapAiPackageService.getAiPackageHistory(userInfo.id);
      if (response?.data) {
        setSubscriptionData(response.data);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    }
  };

  const handleSharedClick = (isOpen) => {
    setIsSubscriptionInformationModal(isOpen);
  };

  const openInfosOnPopup = () => {
    localStorage.setItem("isCustomModalOpen", true);
    setIsSubscriptionInformationModal(true);
  };

  const columns = [
    {
      title: t("packageName"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("packageMapNumbers"),
      dataIndex: "numberOfMaps",
      key: "numberOfMaps",
      render: (text) => (
        <span>
          {text} <span>{t("numberMaps")}</span>
        </span>
      ),
    },
    {
      title: t("packageBuyDate"),
      dataIndex: "buyDate",
      key: "buyDate",
      render: (date) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString();
      },
    },
    {
      title: t("packagePrice"),
      dataIndex: "price",
      key: "price",
      render: (price, record) => (
        <span>
          {record.currency === "USD" && <span className="currency">$</span>}
          {price}
          {record.currency === "TRY" && <span className="currency">₺</span>}
        </span>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Header />
      {isSubscriptionInformationModal && (
        <SubscriptionInformationModal
          sharedClick={handleSharedClick}
          popupContent={informationPopupContent}
        />
      )}
      <div className="dashboard-page mindmap-table wide">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-10">
              <div className="template-panel subscription-detail">
                <div className="file-box">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="infos">
                        <div className="ai-subscription-table">
                          <Table
                              title={() => (
                                  <div className="table-title">
                                    <FileTextOutlined style={{ marginRight: 8, color: "#3f51b5", fontSize: "20px" }} />
                                    <span>{t("subscriptionAiDetailMsgTxt")}</span>
                                  </div>
                              )}
                              dataSource={subscriptionData?.data || []}
                              columns={columns}
                              pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50'],
                              }}
                              locale={{
                                emptyText: t("noDataTextMsgTxt")
                              }}
                              rowKey="id"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SubscriptionAiDetail;

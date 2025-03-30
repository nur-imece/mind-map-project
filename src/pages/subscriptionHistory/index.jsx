import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Header from "../../components/header";
import SubHeader from "../../components/subHeader";
import userService from "../../services/api/user";
import Utils from "../../utils";

import "./index.scss";

const { Title } = Typography;

const SubscriptionHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Redirect if user has remaining product days
    const companyData = JSON.parse(localStorage.getItem("c65s1"));
    if (companyData !== null && companyData.companyRemainingProductDays > 0) {
      navigate("/mind-map-list");
      return;
    }

    // Set document title
    document.title = `Foramind | ${t("subscriptionHistoryPageTitleMsgTxt")}`;
    
    // Fetch subscription list
    getSubscriptionList();
  }, []);

  const getSubscriptionList = async () => {
    setLoading(true);
    try {
      const response = await userService.getUserSubscriptions();
      if (response.data) {
        const subscriptionList = response.data.userSubscriptionList || [];
        setData(subscriptionList);
      }
    } catch (error) {
      console.error("Error fetching subscription history:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t("actionDateMsgTxt"),
      dataIndex: "creationDate",
      key: "creationDate",
      render: (creationDate) => Utils.formatDateTimeWithoutTime(creationDate),
      className: "action-date-column",
    },
    {
      title: `${t("subscriptionStartDateMsgTxt")} - ${t("subscriptionEndDateMsgTxt")}`,
      key: "subscriptionPeriod",
      render: (record) => (
        <span>
          {Utils.formatDateTimeWithoutTime(record.startDate)} - {Utils.formatDateTimeWithoutTime(record.endDate)}
        </span>
      ),
      className: "subscription-date-column",
    },
    {
      title: t("totalMsgTxt"),
      dataIndex: "productPrice",
      key: "productPrice",
      render: (productPrice, record) => (
        <span>
          {record.currency === "TRY" ? `${productPrice}₺` : `$${productPrice}`}
        </span>
      ),
      className: "total-column",
    },
  ];

  return (
    <>
      <Header />
      <div className="mindmap-table wide">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-12 col-lg-12">
              <div className="template-panel subscription-history">
                <div className="title-wrapper">
                  <div className="d-flex justify-content-between align-items-center px-3 w-100">
                    <div>
                      <SubHeader title={t("subscriptionHistoryPageTitleMsgTxt")} />
                    </div>
                    <Button
                      type="link"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate("/subscription-detail")}
                      className="back-button"
                    >
                      {t("backToSubscriptionDetailMsgTxt")}
                    </Button>
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <Table
                    dataSource={data}
                    columns={columns}
                    rowKey={(record) => record.id || Math.random().toString()}
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50"],
                      showTotal: (total, range) => `${range[0]}-${range[1]} ${t("ofTextMsgTxt")} ${total}`,
                    }}
                    locale={{
                      filterTitle: t("filterMsgTxt"),
                      filterConfirm: t("okMsgTxt"),
                      filterReset: t("resetMsgTxt"),
                      emptyText: t("noDataTextMsgTxt"),
                      triggerDesc: t("triggerDescMsgTxt"),
                      triggerAsc: t("triggerAscMsgTxt"),
                      cancelSort: t("cancelSortMsgTxt"),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionHistory;

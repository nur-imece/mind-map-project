import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SettingOutlined,
  LogoutOutlined,
  MailOutlined,
  DownOutlined,
  UpOutlined
} from "@ant-design/icons";
import ProfileIcon from "@/styles/img/profile-icon.png";
import ChatGptIcon from "@/styles/img/gpt-icon.png";
import VerifiedIcon from "@/styles/img/verified-icon.webp";
import PasswordIcon from "@/styles/img/password-icon.webp";
import SubsrictionIcon from "@/styles/img/subs-package.png";
import { useAuth } from "../../../context/authContext";

const UserMenu = ({ isUserMenuOpen, isAccountMenuOpen, setIsAccountMenuOpen }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    isUserMenuOpen && (
      <div className="dropdown-menu-wrapper">
        <div className="dropdown-menu menu right-menu-toggle">
          <div className="arrow"></div>
          <ul className="user-menu-list">
            {/* Account Settings */}
            <li className="user-menu-item">
              <div
                className="menu-link"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAccountMenuOpen(!isAccountMenuOpen);
                }}
              >
                <SettingOutlined className="menu-icon" />
                <span className="menu-text">{t("accountsettingsMsgTxt")}</span>
                {isAccountMenuOpen ? 
                  <UpOutlined className="menu-arrow" /> : 
                  <DownOutlined className="menu-arrow" />
                }
              </div>

              {/* Account Settings submenu */}
              {isAccountMenuOpen && (
                <ul className="sub-menu">
                  <li className="sub-menu-item">
                    <div
                      className="sub-menu-link"
                      onClick={() => navigate("/profile")}
                    >
                      <div className="menu-icon-wrapper">
                        <img src={ProfileIcon} alt="Profile" className="sub-menu-icon" />
                      </div>
                      <span className="menu-text">{t("profileMsgTxt")}</span>
                    </div>
                  </li>

                  {JSON.parse(localStorage.getItem("iFU0") || "false") === false &&
                    JSON.parse(
                      localStorage.getItem("userCompanyInformation") || '{"id": 0}'
                    ).id === 12 &&
                    localStorage.getItem("hw8w0") !== "0" && (
                      <li className="sub-menu-item">
                        <div
                          className="sub-menu-link"
                          onClick={() => navigate("/ai-payment")}
                        >
                          <div className="menu-icon-wrapper">
                            <img src={ChatGptIcon} alt="ChatGPT" className="sub-menu-icon" />
                          </div>
                          <span className="menu-text">{t("chatGptPayment")}</span>
                        </div>
                      </li>
                    )}

                  {JSON.parse(localStorage.getItem("c65s1") || "null") !== null &&
                    JSON.parse(
                      localStorage.getItem("c65s1") || '{"companyRemainingProductDays": 0}'
                    ).companyRemainingProductDays > 0 ? null : (
                    <>
                      <li className="sub-menu-item">
                        <div
                          className="sub-menu-link"
                          onClick={() => navigate("/payment")}
                        >
                          <div className="menu-icon-wrapper">
                            <img src={SubsrictionIcon} alt="Subscription" className="sub-menu-icon" />
                          </div>
                          <span className="menu-text">{t("paymentPageMsgTxt")}</span>
                        </div>
                      </li>
                      <li className="sub-menu-item">
                        <div
                          className="sub-menu-link"
                          onClick={() => navigate("/subscription-detail")}
                        >
                          <div className="menu-icon-wrapper">
                            <img src={VerifiedIcon} alt="Verified" className="sub-menu-icon" />
                          </div>
                          <span className="menu-text">{t("subscriptionMenuTitleMsgTxt")}</span>
                        </div>
                      </li>
                    </>
                  )}

                  <li className="sub-menu-item">
                    <div
                      className="sub-menu-link"
                      onClick={() => navigate("/change-password")}
                    >
                      <div className="menu-icon-wrapper">
                        <img src={PasswordIcon} alt="Password" className="sub-menu-icon" />
                      </div>
                      <span className="menu-text">{t("passwordMsgTxt")}</span>
                    </div>
                  </li>
                </ul>
              )}
            </li>

            {/* Contact */}
            <li className="user-menu-item">
              <div
                className="menu-link"
                onClick={() => navigate("/contact")}
              >
                <MailOutlined className="menu-icon" />
                <span className="menu-text">{t("contactMsgTxt")}</span>
              </div>
            </li>

            {/* Logout */}
            <li className="user-menu-item">
              <div
                className="menu-link"
                onClick={handleLogout}
              >
                <LogoutOutlined className="menu-icon" />
                <span className="menu-text">{t("logoutMsgTxt")}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    )
  );
};

export default UserMenu; 
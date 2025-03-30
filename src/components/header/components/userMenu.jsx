import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SettingOutlined,
  LogoutOutlined,
  MailOutlined,
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
        <div
          className="dropdown-menu menu right-menu-toggle"
          aria-labelledby="navbarDropdown"
        >
          <ul className="">
            {/* Account Settings */}
            <li className="sub-menu-toggle">
              <a
                className="dropdown-item up-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAccountMenuOpen(!isAccountMenuOpen);
                }}
              >
                <SettingOutlined className="ant-icon" />
                {t("accountsettingsMsgTxt")}
                <i
                  className="animate-icon fa fa-chevron-up arrow-up arrow-size"
                  aria-hidden="true"
                ></i>
              </a>

              {/* Account Settings alt menüsü */}
              {isAccountMenuOpen && (
                <ul className="sub-menu">
                  <li>
                    <a
                      className="dropdown-item"
                      onClick={() => navigate("/profile")}
                    >
                      <i className="header-icons">
                        <img src={ProfileIcon} alt="Profile icon" />
                      </i>
                      {t("profileMsgTxt")}
                    </a>
                  </li>

                  {JSON.parse(localStorage.getItem("iFU0") || "false") ===
                    false &&
                    JSON.parse(
                      localStorage.getItem("userCompanyInformation") ||
                      '{"id": 0}'
                    ).id === 12 &&
                    localStorage.getItem("hw8w0") !== "0" && (
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => navigate("/ai-payment")}
                        >
                          <i className="header-icons">
                            <img
                              src={ChatGptIcon}
                              alt="ChatGPT icon"
                            />
                          </i>
                          {t("chatGptPayment")}
                        </a>
                      </li>
                    )}

                  {JSON.parse(localStorage.getItem("c65s1") || "null") !==
                    null &&
                    JSON.parse(
                      localStorage.getItem("c65s1") ||
                      '{"companyRemainingProductDays": 0}'
                    ).companyRemainingProductDays > 0 ? null : (
                    <>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => navigate("/payment")}
                        >
                          <i className="header-icons">
                            <img
                              src={SubsrictionIcon}
                              alt="Subscription icon"
                            />
                          </i>
                          {t("paymentPageMsgTxt")}
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() =>
                            navigate("/subscription-detail")
                          }
                        >
                          <i className="header-icons">
                            <img
                              src={VerifiedIcon}
                              alt="Verified icon"
                            />
                          </i>
                          {t("subscriptionMenuTitleMsgTxt")}
                        </a>
                      </li>
                    </>
                  )}

                  <li>
                    <a
                      className="dropdown-item change-password"
                      onClick={() => navigate("/change-password")}
                    >
                      <i className="header-icons">
                        <img
                          src={PasswordIcon}
                          alt="Password icon"
                        />
                      </i>
                      {t("passwordMsgTxt")}
                    </a>
                  </li>
                </ul>
              )}
            </li>

            {/* Contact */}
            <li>
              <a
                className="dropdown-item up-menu"
                onClick={() => navigate("/contact")}
              >
                <MailOutlined className="ant-icon" />
                {t("contactMsgTxt")}
              </a>
            </li>

            {/* Logout */}
            <li>
              <a
                className="dropdown-item up-menu"
                onClick={handleLogout}
              >
                <LogoutOutlined className="ant-icon" />
                {t("logoutMsgTxt")}
              </a>
            </li>
          </ul>
        </div>
      </div>
    )
  );
};

export default UserMenu; 
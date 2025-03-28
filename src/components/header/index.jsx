import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import foramindLogoBig from "../../styles/oldImage/img/foramind_logo.png";
import foramindLogoSmall from "../../styles/oldImage/img/foramind-beta-logo-small.png";
import accountService from "../../services/api/account";
import mapAiPackageService from "../../services/api/mapaipackage";
import LanguageSelector from "../languageSelector";
import ChatGptIcon from "../../styles/oldImage/img/gpt-icon.png";
import ProfileIcon from "../../styles/oldImage/img/profile-icon.png";
import VerifiedIcon from "../../styles/oldImage/img/verified-icon.webp";
import PasswordIcon from "../../styles/oldImage/img/password-icon.webp";
import RemainingMaps from "../../styles/oldImage/img/remaining-map-img.png";
import SubsrictionIcon from "../../styles/oldImage/img/subs-package.png";

const Header = () => {
  const [gptMapNumbers, setGptMapNumbers] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const changePopupStatus = () => {
    setIsModalVisible(false);
    localStorage.setItem("isShowPopupForTrialDay", false);
  };

  const infoPopupWhenUserTrialDayStart = () => {
    setIsModalVisible(true);
  };

  const setupMenuListeners = () => {
    // sub menu event
    const menu = document.getElementsByClassName("sub-menu-toggle");
    for (let i = 0; i < menu.length; i++) {
      menu[i].addEventListener("click", function () {
        const submenu = this.querySelector(".sub-menu");
        const icon = this.querySelector(".dropdown-item i.fa.fa-chevron-up");
        submenu.classList.toggle("none");
        icon.classList.toggle("rotate");
      });
    }

    // Right Menu Listener
    const rightMenu = document.querySelector(".right-menu");
    rightMenu.addEventListener("click", function (e) {
      const element = document.querySelector(".right-menu img");
      if (e.target !== element) {
        return;
      }
    });

    const headerMenu = document.querySelector(".navbar-toggleable-md.right-menu");
    const rightDropDownMenu = document.querySelector(".dropdown-menu.right-menu-toggle");

    window.addEventListener("click", function (e) {
      const target = e.target || e.srcElement || e.currentTarget;
      const dMenuWrapper = document.querySelector(".right-menu .dropdown-menu-wrapper");
      const dSubMenuWrapper = document.querySelector(".right-menu .dropdown-menu-wrapper .menu");
      
      if (headerMenu.contains(target)) {
        dMenuWrapper.classList.toggle("none");
        dSubMenuWrapper.classList.toggle("none");
      } else {
        dMenuWrapper.classList.add("none");
        dSubMenuWrapper.classList.add("none");
      }
      
      if (rightDropDownMenu.contains(target)) {
        dMenuWrapper.classList.remove("none");
        dSubMenuWrapper.classList.remove("none");
      }
    });
  };

  const getProfile = () => {
    accountService.getDetail().then(response => {
      if (response.data) {
        fillProfile(JSON.stringify(response.data));
      }
    });
  };

  const fillProfile = (response) => {
    const userProfil = JSON.parse(response);
    const isFreeUser = userProfil?.isFreeUser;
    localStorage.setItem("iFU0", isFreeUser);

    if (userProfil.user.avatarImagePath === null) {
      document.querySelector("#headerImage").style.display = "none";
    } else {
      if (userProfil.user.hasProfileImage) {
        document.querySelector("#headerImage").src = userProfil.user.avatarImagePath;
        document.querySelector("#nameLatter").style.display = "none";
      } else {
        document.querySelector("#nameLatter").innerHTML = userProfil.user.avatarImagePath;
        document.querySelector("#headerImage").style.display = "none";
      }
    }
  };

  const handleLogout = () => {
    accountService.logout();
  };

  const renderRemainingMaps = () => {
    const isFreeUser = JSON.parse(localStorage.getItem("iFU0"));
    
    if (isFreeUser === true) {
      return (
        <>
          <div className="remaining-maps">{t("remainingMapsTxt")} {gptMapNumbers}</div>
          <div className="circle">
            <img style={{ width: "40px", height: "40px", marginTop: "-1px" }} src={RemainingMaps} alt="Remaining maps" />
          </div>
        </>
      );
    } else if (isFreeUser === false) {
      const userCompanyInfo = JSON.parse(localStorage.getItem("userCompanyInformation"));
      
      if (userCompanyInfo.id === 12) {
        if (JSON.parse(localStorage.getItem('hw8w0')) !== 0) {
          return (
            <>
              <div className="remaining-maps">{t("remainingMapsTxt")} {gptMapNumbers}</div>
              <div className="circle">
                <img style={{ width: "40px", height: "40px", marginTop: "-1px" }} src={RemainingMaps} alt="Remaining maps" />
              </div>
            </>
          );
        }
        return null;
      } else {
        const companyInfo = JSON.parse(localStorage.getItem('c65s1'));
        if (companyInfo === null || (companyInfo !== null && companyInfo.companyRemainingProductDays === 0)) {
          return null;
        } else {
          return (
            <>
              <div className="remaining-maps">{t("remainingMapsTxt")} {gptMapNumbers}</div>
              <div className="circle">
                <img style={{ width: "40px", height: "40px", marginTop: "-1px" }} src={RemainingMaps} alt="Remaining maps" />
              </div>
            </>
          );
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userInformation")).id;
    setupMenuListeners();
    getProfile();

    mapAiPackageService.getRemainingMaps(userId)
      .then(response => {
        if (response.data) {
          setGptMapNumbers(JSON.stringify(response.data));
        }
      });

    // Trial day popup for existing users
    if (
      JSON.parse(localStorage.getItem("ab0c5")) > 0 &&
      JSON.parse(localStorage.getItem("isShowPopupForTrialDay")) === true
    ) {
      infoPopupWhenUserTrialDayStart();
    }

    // Don't show trial day popup if no trial period
    if (
      JSON.parse(localStorage.getItem("ab0c5")) === 0 &&
      JSON.parse(localStorage.getItem("isShowPopupForTrialDay")) === true
    ) {
      localStorage.setItem("isShowPopupForTrialDay", false);
    }

    if (localStorage.getItem("loginType") != 1) {
      document.querySelector(".change-password").classList.add("none");
    }

    document
      .querySelector("#leftMenu")
      .addEventListener("mouseover", function () {
        document.querySelector("#leftMenu").classList.add("wide");
      });
    document
      .querySelector("#leftMenu")
      .addEventListener("mouseout", function () {
        document.querySelector("#leftMenu").classList.remove("wide");
      });
  }, []);

  const urlSplit = window.location.pathname.split("/");
  const currentUrl = urlSplit.slice(-1).pop();

  const userCompany = JSON.parse(localStorage.getItem("userCompanyInformation"));
  let userCompanyName, userCompanyLogo;
  
  if (userCompany) {
    userCompanyName = userCompany.companyName;
    userCompanyLogo = userCompany.logo;
  }

  return (
    <>
      <Modal
        title={t("informationModalTitleMsgTxt")}
        open={isModalVisible}
        onOk={changePopupStatus}
        onCancel={changePopupStatus}
        footer={[
          <button 
            key="ok" 
            className="button yellow-button" 
            onClick={changePopupStatus}
          >
            {t("okMsgTxt")}
          </button>
        ]}
      >
        <p>{t("startTrialDayInfoAndWelcomePopupContentMsgTxt")}</p>
      </Modal>

      <header className="header">
        <div className="pull-right">
          {(
            JSON.parse(localStorage.getItem("userCompanyInformation")).id === 12
          ) && (
            JSON.parse(localStorage.getItem('c65s1')) === null ||
            (JSON.parse(localStorage.getItem('c65s1')) !== null && 
            JSON.parse(localStorage.getItem('c65s1')).companyRemainingProductDays === 0)
          ) && (
            (
              JSON.parse(localStorage.getItem('hw8w0')) === 0 &&
              JSON.parse(localStorage.getItem('ab0c5')) > 0
            ) && (
              <div className="subscription-link pull-left">
                <a onClick={() => navigate("/payment")}>
                  {t("subscribeMsgTxt")}
                </a>
              </div>
            )
          )}

          <div className="pull-left remaining-container">
            {renderRemainingMaps()}
          </div>

          <div className="language pull-left">
            <LanguageSelector />
          </div>
          
          <div className="navbar navbar-toggleable-md navbar-light right-menu">
            <a className="" role="button">
              <img id="headerImage" src="" alt="" />
              <div id="nameLatter" className="user-name-letters"></div>
            </a>
            <div className="dropdown-menu-wrapper none">
              <div className="dropdown-menu menu right-menu-toggle none" aria-labelledby="navbarDropdown">
                <div className="arrow"></div>
                <ul className="">
                  <li className="sub-menu-toggle">
                    <a className="dropdown-item up-menu">
                      <i className="icon-settings " aria-hidden="true"></i>
                      {t("accountsettingsMsgTxt")}
                      <i className="animate-icon fa fa-chevron-up arrow-up arrow-size" aria-hidden="true"></i>
                    </a>
                    <ul className="sub-menu none">
                      <li>
                        <a className="dropdown-item" onClick={() => navigate("/profile")}>
                          <i className="header-icons"><img src={ProfileIcon} alt="Profile icon" /></i>
                          {t("profileMsgTxt")}
                        </a>
                      </li>
                      
                      {JSON.parse(localStorage.getItem("iFU0")) === false && 
                       JSON.parse(localStorage.getItem("userCompanyInformation")).id === 12 && 
                       localStorage.getItem('hw8w0') !== "0" ? (
                        <li>
                          <a className="dropdown-item" onClick={() => navigate("/ai-payment")}>
                            <i className="header-icons"><img src={ChatGptIcon} alt="ChatGPT icon" /></i>
                            {t("chatGptPayment")}
                          </a>
                        </li>
                      ) : null}
                      
                      {JSON.parse(localStorage.getItem("c65s1")) !== null &&
                       JSON.parse(localStorage.getItem("c65s1")).companyRemainingProductDays > 0 ? null : (
                        <>
                          <li>
                            <a className="dropdown-item" onClick={() => navigate("/payment")}>
                              <i className="header-icons"><img src={SubsrictionIcon} alt="Subscription icon" /></i>
                              {t("paymentPageMsgTxt")}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" onClick={() => navigate("/subscription-detail")}>
                              <i className="header-icons"><img src={VerifiedIcon} alt="Verified icon" /></i>
                              {t("subscriptionMenuTitleMsgTxt")}
                            </a>
                          </li>
                        </>
                      )}
                      
                      <li>
                        <a className="dropdown-item change-password" onClick={() => navigate("/change-password")}>
                          <i className="header-icons"><img src={PasswordIcon} alt="Password icon" /></i>
                          {t("passwordMsgTxt")}
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a className="dropdown-item up-menu" onClick={() => navigate("/contact")}>
                      <i className="icon-mail" aria-hidden="true"></i>
                      {t("contactMsgTxt")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item up-menu" onClick={handleLogout}>
                      <i className="icon-logout" aria-hidden="true"></i>
                      {t("logoutMsgTxt")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="left-menu" id="leftMenu">
          <a href={"/"}>
            <img
              src={userCompanyLogo ? userCompanyLogo : foramindLogoBig}
              height={45}
              className="left-logo big"
              alt={`${userCompanyName ? userCompanyName : "Foramind"}`}
            />
            <img
              src={foramindLogoSmall}
              height={45}
              className="left-logo small"
              alt="Foramind"
            />
          </a>
          <div className="sub-left-menu">
            <div className="" aria-labelledby="navbarDropdown">
              <ul className="">
                <li className={`sub-bar${currentUrl === "template-list" ? " current-url" : ""}`}>
                  <a onClick={() => navigate("/template-list")}>
                    <i className="icon-create_new_map_icon"></i>
                  </a>
                  <a className="title" onClick={() => navigate("/template-list")}>
                    {t("createNewMapMsgTxt")}
                  </a>
                </li>
                <li className={`sub-bar${currentUrl === "mind-map-list" ? " current-url" : ""}`}>
                  <a onClick={() => navigate("/mind-map-list")}>
                    <i className="icon-map_list_icon"></i>
                  </a>
                  <a className="title" onClick={() => navigate("/mind-map-list")}>
                    {t("mindMapsMsgTxt")}
                  </a>
                </li>
                <li className={`sub-bar${currentUrl === "mind-map-share-list" ? " current-url" : ""}`}>
                  <a onClick={() => navigate("/mind-map-list")}>
                    <i className="icon-share_list_icon"></i>
                  </a>
                  <a className="title" onClick={() => navigate("/mind-map-share-list")}>
                    {t("mindMapsShareMsgTxt")}
                  </a>
                </li>
                <li className={`sub-bar${currentUrl === "help" ? " current-url" : ""}`}>
                  <a onClick={() => navigate("/help")}>
                    <i className="icon-help-outline"></i>
                  </a>
                  <a className="title" onClick={() => navigate("/help")}>
                    {t("helpMenuMsgTxt")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

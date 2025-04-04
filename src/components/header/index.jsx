import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Services
import accountService from "../../services/api/account";
import mapAiPackageService from "../../services/api/mapaipackage";

// Components
import LanguageSelector from "../languageSelector";
import UserMenu from "./components/userMenu";
import SidebarMenu from "./components/sidebarMenu";
import RemainingMaps from "./components/remainingMaps";
import TrialDayModal from "./components/trialDayModal";
import SubscriptionLink from "./components/subscriptionLink";

// Styles
import "./index.scss";

const Header = () => {
  const [gptMapNumbers, setGptMapNumbers] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { t } = useTranslation();

  const infoPopupWhenUserTrialDayStart = () => {
    setIsModalVisible(true);
  };

  const getProfile = () => {
    accountService.getDetail().then((response) => {
      if (response.data) {
        fillProfile(JSON.stringify(response.data));
      }
    });
  };

  const fillProfile = (response) => {
    const userProfil = JSON.parse(response);
    const isFreeUser = userProfil?.isFreeUser;
    localStorage.setItem("iFU0", isFreeUser);

    const headerImage = document.querySelector("#headerImage");
    const nameLatter = document.querySelector("#nameLatter");

    if (userProfil.user.avatarImagePath === null) {
      if (headerImage) headerImage.style.display = "none";
    } else {
      if (userProfil.user.hasProfileImage) {
        if (headerImage) {
          headerImage.src = userProfil.user.avatarImagePath;
          headerImage.style.display = "block";
        }
        if (nameLatter) nameLatter.style.display = "none";
      } else {
        if (nameLatter) {
          nameLatter.innerHTML = userProfil.user.avatarImagePath;
          nameLatter.style.display = "block";
        }
        if (headerImage) headerImage.style.display = "none";
      }
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("userInformation");
    if (userInfo) {
      const userId = JSON.parse(userInfo).id;
      getProfile();

      mapAiPackageService.getRemainingMaps(userId).then((response) => {
        if (response.data) {
          setGptMapNumbers(JSON.stringify(response.data.data));
        }
      });
    }

    // Trial day popup for existing users
    const trialDays = localStorage.getItem("ab0c5");
    const showPopup = localStorage.getItem("isShowPopupForTrialDay");
    if (trialDays && showPopup) {
      if (JSON.parse(trialDays) > 0 && JSON.parse(showPopup) === true) {
        infoPopupWhenUserTrialDayStart();
      }
      if (JSON.parse(trialDays) === 0 && JSON.parse(showPopup) === true) {
        localStorage.setItem("isShowPopupForTrialDay", false);
      }
    }

    if (localStorage.getItem("loginType") != 1) {
      const changePasswordEl = document.querySelector(".change-password");
      if (changePasswordEl) {
        changePasswordEl.classList.add("none");
      }
    }

    // Sidebar hover etkinlikleri
    const leftMenu = document.querySelector("#leftMenu");
    if (leftMenu) {
      leftMenu.addEventListener("mouseenter", function () {
        leftMenu.classList.add("wide");
      });
      leftMenu.addEventListener("mouseleave", function () {
        leftMenu.classList.remove("wide");
      });
    }

    return () => {
      const leftMenuEl = document.querySelector("#leftMenu");
      if (leftMenuEl) {
        leftMenuEl.removeEventListener("mouseenter", function () {
          leftMenuEl.classList.add("wide");
        });
        leftMenuEl.removeEventListener("mouseleave", function () {
          leftMenuEl.classList.remove("wide");
        });
      }
    };
  }, []);

  const urlSplit = window.location.pathname.split("/");
  const currentUrl = urlSplit.slice(-1).pop();

  let userCompanyName = "Foramind",
      userCompanyLogo = null;
  const userCompanyStr = localStorage.getItem("userCompanyInformation");
  if (userCompanyStr) {
    try {
      const userCompany = JSON.parse(userCompanyStr);
      if (userCompany) {
        userCompanyName = userCompany.companyName || "Foramind";
        userCompanyLogo = userCompany.logo;
      }
    } catch (e) {
      console.error("Failed to parse userCompanyInformation", e);
    }
  }

  return (
    <>
      <TrialDayModal 
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />

      <header className="header">
        <div className="pull-right">
          <SubscriptionLink />

          <div className="header-right-items">
            <RemainingMaps gptMapNumbers={gptMapNumbers} />

            <div className="language">
              <LanguageSelector />
            </div>

            {/* Sağ üst kullanıcı menüsü (Avatar'a tıklayınca aç/kapa) */}
            <div
              className="navbar navbar-toggleable-md navbar-light right-menu"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{ cursor: "pointer" }}
            >
              <a className="" role="button" onClick={(e) => e.preventDefault()}>
                <img id="headerImage" src="" alt="" />
                <div id="nameLatter" className="user-name-letters"></div>
              </a>

              <UserMenu
                isUserMenuOpen={isUserMenuOpen}
                isAccountMenuOpen={isAccountMenuOpen}
                setIsAccountMenuOpen={setIsAccountMenuOpen}
              />
            </div>
            {/* end of .navbar */}
          </div>
        </div>

        {/* Sol menü (sidebar) */}
        <SidebarMenu 
          currentUrl={currentUrl}
          userCompanyLogo={userCompanyLogo}
          userCompanyName={userCompanyName}
        />
      </header>
    </>
  );
};

export default Header;

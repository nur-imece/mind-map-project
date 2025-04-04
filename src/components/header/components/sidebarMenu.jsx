import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// SVG dosyalarını normal şekilde içe aktar
import createNewMapIcon from "@/icons/createNewMap.svg";
import mindMapsIcon from "@/icons/mindMaps.svg";
import sharedMapIcon from "@/icons/sharedMap.svg";
import helpIcon from "@/icons/help.svg";

import foramindLogoBig from "@/styles/img/foramind_logo.png";
import foramindLogoSmall from "@/styles/img/foramind-beta-logo-small.png";

const SidebarMenu = ({ currentUrl, userCompanyLogo, userCompanyName }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
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
            <li
              className={`sub-bar${
                currentUrl === "template-list" ? " current-url" : ""
              }`}
            >
              <a onClick={() => navigate("/template-list")}>
                <img src={createNewMapIcon} className="ant-sidebar-icon same-color" alt="Create New Map" />
              </a>
              <span
                className="title"
                onClick={() => navigate("/template-list")}
              >
                {t("createNewMapMsgTxt")}
              </span>
            </li>
            <li
              className={`sub-bar${
                currentUrl === "mind-map-list" ? " current-url" : ""
              }`}
            >
              <a onClick={() => navigate("/mind-map-list")}>
                <img src={mindMapsIcon} className="ant-sidebar-icon same-color" alt="Mind Maps" />
              </a>
              <span className="title" onClick={() => navigate("/mind-map-list")}>
                {t("mindMapsMsgTxt")}
              </span>
            </li>
            <li
              className={`sub-bar${
                currentUrl === "mind-map-share-list" ? " current-url" : ""
              }`}
            >
              <a onClick={() => navigate("/mind-map-share-list")}>
                <img src={sharedMapIcon} className="ant-sidebar-icon same-color" alt="Shared Maps" />
              </a>
              <span
                className="title"
                onClick={() => navigate("/mind-map-share-list")}
              >
                {t("mindMapsShareMsgTxt")}
              </span>
            </li>
            <li
              className={`sub-bar${
                currentUrl === "help" ? " current-url" : ""
              }`}
            >
              <a onClick={() => navigate("/help")}>
                <img src={helpIcon} className="ant-sidebar-icon same-color" alt="Help" />
              </a>
              <span className="title" onClick={() => navigate("/help")}>
                {t("helpMenuMsgTxt")}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu; 
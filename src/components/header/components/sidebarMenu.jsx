import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  PlusCircleOutlined,
  FileOutlined,
  ShareAltOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import foramindLogoBig from "../../../styles/oldImage/img/foramind_logo.png";
import foramindLogoSmall from "../../../styles/oldImage/img/foramind-beta-logo-small.png";

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
                <PlusCircleOutlined className="ant-sidebar-icon same-color" />
              </a>
              <a
                className="title"
                onClick={() => navigate("/template-list")}
              >
                {t("createNewMapMsgTxt")}
              </a>
            </li>
            <li
              className={`sub-bar${
                currentUrl === "mind-map-list" ? " current-url" : ""
              }`}
            >
              <a onClick={() => navigate("/mind-map-list")}>
                <FileOutlined className="ant-sidebar-icon same-color" />
              </a>
              <a className="title" onClick={() => navigate("/mind-map-list")}>
                {t("mindMapsMsgTxt")}
              </a>
            </li>
            <li
              className={`sub-bar${
                currentUrl === "mind-map-share-list" ? " current-url" : ""
              }`}
            >
              <a onClick={() => navigate("/mind-map-share-list")}>
                <ShareAltOutlined className="ant-sidebar-icon same-color" />
              </a>
              <a
                className="title"
                onClick={() => navigate("/mind-map-share-list")}
              >
                {t("mindMapsShareMsgTxt")}
              </a>
            </li>
            <li
              className={`sub-bar${
                currentUrl === "help" ? " current-url" : ""
              }`}
            >
              <a onClick={() => navigate("/help")}>
                <QuestionCircleOutlined className="ant-sidebar-icon same-color" />
              </a>
              <a className="title" onClick={() => navigate("/help")}>
                {t("helpMenuMsgTxt")}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu; 
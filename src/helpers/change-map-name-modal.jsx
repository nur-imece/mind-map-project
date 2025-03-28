import React, { useEffect } from "react";
import { Input, Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Utils from "../libraries/utils";
import MapService from "../services/api/map";

const ChangeMapNameModal = ({ sharedClick, handler }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const closeButton = document.querySelector(".close-modal");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        sharedClick(false);
        localStorage.setItem('isCustomModalOpen', false);
      });
    }
    
    inputTextHandle();
    
    return () => {
      if (closeButton) {
        closeButton.removeEventListener("click", () => {
          sharedClick(false);
          localStorage.setItem('isCustomModalOpen', false);
        });
      }
    };
  }, [sharedClick]);

  const warningModal = () => {
    Utils.modalm().open({
      exitButtonText: t("exitMsgTxt"),
      title: t("warningSendMailMsgTxt"),
      bodyContent: t("warningmodalMsgTxt"),
      buttons: [
        {
          text: t("okMsgTxt"),
          class: 'button yellow-button confirm-button',
          href: ''
        },
      ],
    });
  };

  const changeThisMapName = () => {
    if (document.querySelector(".shared-map-name").value !== "yeni") {
      document.querySelector('.update-btn').removeAttribute('disabled');
      const mapId = Utils.getParameterByName("mapId") || localStorage.getItem("openedMapId");
      const newMapName = document.querySelector(".shared-map-name").value;
      const updateName = "updateName";
      
      localStorage.setItem('openedMapName', newMapName);
      MapService.mapPageUpdateName(mapId, newMapName, this, updateName);
      
      const headerTools = document.querySelector(".editor-header-tools");
      if (headerTools) {
        headerTools.value = localStorage.getItem("openedMapName");
      }
      
      setTimeout(() => {
        const mapOwner = JSON.parse(localStorage.getItem("userIsOwner"));
        if (JSON.parse(localStorage.getItem("willGoToNewMapPage")) === true) {
          navigate("/template-list");
        } else {
          if (mapOwner) {
            navigate("/mind-map-list");
          } else {
            navigate("/mind-map-share-list");
          }
        }
      }, 500);
    } else {
      document.querySelector('.update-btn').setAttribute('disabled', '');
      return;
    }
  };

  const closeMapNameModal = () => {
    const mapOwner = JSON.parse(localStorage.getItem("userIsOwner"));
    if (JSON.parse(localStorage.getItem("willGoToNewMapPage")) === true) {
      navigate("/template-list");
    } else {
      if (mapOwner) {
        navigate("/mind-map-list");
      } else {
        navigate("/mind-map-share-list");
      }
    }
  };

  const inputTextHandle = () => {
    const input = document.querySelector(".shared-map-name");
    const button = document.querySelector('.mail-save-btn.update-btn');
    
    if (input && button) {
      if (input.value === "yeni" || input.value === "") {
        button.setAttribute('disabled', '');
      } else {
        button.removeAttribute('disabled');
      }
    }
  };

  return (
    <div className="overlay">
      <div className="popup change-map-name-modal">
        <div className="title">
          <span className="fa-stack fa-1x icon-wrap">
            <i className="fa fa-circle fa-stack-2x circle-icon"></i>
            <i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
          </span>
          <div className="text">
            {t("changeMapNameMsgText")} 
          </div>
        </div>
        <a className="close close-modal" onClick={handler}>&times;</a>
        <div className="select-shared">
          <ul>
            <li className="buttons shared-select">
              <div className="email-tab-contents">
                <div className="email-box active">
                  <div className="popup-input mail-input">
                    <p>
                      {t("changeMapNameModalInfoMsgTxt")} 
                      <br /> 
                      {t("wantToChangeMapNameMsgTxt")}
                    </p>
                  </div>
                  <div className="popup-input mail-input">
                    <input 
                      type="text" 
                      className="shared-map-name" 
                      onChange={inputTextHandle}
                      placeholder={t("blankMsgText")} 
                      defaultValue={localStorage.getItem("openedMapName")}
                    />
                  </div>
                  <div className="popup-input button-wrap">
                    <button className="mail-save-btn update-btn" onClick={changeThisMapName}>
                      {t("updateMsgTxt")}
                    </button>
                    <button className="mail-save-btn cancel-btn" onClick={closeMapNameModal}>
                      {t("goOnWithoutUpdateMsgTxt")}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangeMapNameModal;

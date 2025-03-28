import React, { useState, useEffect } from "react";
import { Input, Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MM from "../libraries/map";
import Utils from "../libraries/utils";
import SharedMapService from "../services/api/shared-map";

const SharedMapNameChangeModal = ({ sharedClick, handler }) => {
  const [sharedMapName, setSharedMapName] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const mapNameInput = document.querySelector(".shared-map-name");
    if (mapNameInput) {
      mapNameInput.value = localStorage.getItem('openedMapName');
    }
    
    const closeButton = document.querySelector(".close-modal");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        sharedClick(false);
        localStorage.setItem('isCustomModalOpen', false);
      });
    }
    
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

  const handleSharedMapNameInput = (e) => {
    setSharedMapName(e.target.value);
  };

  const saveACopyMap = () => {
    const newMapName = document.querySelector(".shared-map-name").value;
    const mindMapId = localStorage.getItem('openedMapId');
    
    if (newMapName !== '') {
      const sharedAnonymusData = {
        mindMapId,
        content: JSON.stringify(MM.App.map.toJSON()),
        mapName: newMapName
      };
      localStorage.setItem('openedMapName', newMapName);
      SharedMapService.saveACopyOfMap(sharedAnonymusData, newMapName);
    } else {
      Utils.modalm().open({
        exitButtonText: t("exitMsgTxt"),
        title: t("warningSendMailMsgTxt"),
        bodyContent: t("warningForEmptyMapNameMsgTxt"),
        buttons: [
          {
            text: t("okMsgTxt"),
            class: 'button yellow-button confirm-button',
            href: ''
          },
        ],
      });
    }
  };

  return (
    <div className="overlay">
      <div className="popup shared-map-name-modal">
        <div className="title">
          <span className="fa-stack fa-1x icon-wrap">
            <i className="fa fa-circle fa-stack-2x circle-icon"></i>
            <i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
          </span>
          <div className="text">
            {t("nameOfCopyMapMsgText")} 
          </div>
        </div>
        <a className="close close-modal" onClick={handler}>&times;</a>
        <div className="select-shared">
          <ul>
            <li className="buttons shared-select">
              <div className="email-tab-contents">
                <div className="email-box active">
                  <div className="popup-input mail-input">
                    <input
                      type="text"
                      className="shared-map-name" 
                      onChange={handleSharedMapNameInput}
                      placeholder={t("newMapNameMsgText")}
                    />
                    <button className="mail-save-btn" onClick={saveACopyMap}>
                      {t("saveSmallMsgTxt")}
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

export default SharedMapNameChangeModal;

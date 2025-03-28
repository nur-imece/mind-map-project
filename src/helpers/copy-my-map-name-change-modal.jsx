import React, { Component } from "react";
import Resources from "../libraries/resources";
import MM from "../libraries/map";
import Utils from "../libraries/utils";
import SharedMapService from "../services/api/shared-map";
import MapService from "../services/api/map";

class CopyMyMapNameChangeModalComponent extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.querySelector(".shared-map-name").value = Resources.getValue("copyTextMsgTxt") + " - " + localStorage.getItem('openedMapName');
    this.openModal();
  }

  warningModal() {
    Utils.modalm().open({
      exitButtonText: Resources.getValue("exitMsgTxt"),
      title: Resources.getValue("warningSendMailMsgTxt"),
      bodyContent: Resources.getValue("warningmodalMsgTxt"),
      buttons: [
        {
          text: Resources.getValue("okMsgTxt"),
          class: 'button yellow-button confirm-button',
          href: ''
        },
      ],
    });
  }

  openModal() {
    var _this = this;
    document.querySelector(".close-modal").addEventListener("click", function () {
      _this.props.sharedClick(false);
      localStorage.setItem('isCustomModalOpen', false);
    })
  }

  sharedMapNameInput(e) {
    var name = e.target.value;
    this.setState({
      sharedMapName: name
    });
  }

  saveACopyMap() {
    var newMapName = document.querySelector(".shared-map-name").value;
    var mindMapId = localStorage.getItem('openedMapId');
    if(newMapName !== '') {
      var Data = {
        mindMapId,
        content: null,
        mapName: newMapName
      }
      localStorage.setItem('openedMapName', newMapName);
      MapService.saveACopyOfMyMap(Data, newMapName);
    } else {
      Utils.modalm().open({
        exitButtonText: Resources.getValue("exitMsgTxt"),
        title: Resources.getValue("warningSendMailMsgTxt"),
        bodyContent: Resources.getValue("warningForEmptyMapNameMsgTxt"),
        buttons: [
          {
            text: Resources.getValue("okMsgTxt"),
            class: 'button yellow-button confirm-button',
            href: ''
          },
        ],
      });
    }
  }


  render() {
    return (
      <div className="overlay">
        <div className="popup shared-map-name-modal">
          <div className="title">
            <span className="fa-stack fa-1x icon-wrap">
              <i className="fa fa-circle fa-stack-2x circle-icon"></i>
              <i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
            </span>
            <div className="text">
              {Resources.getValue("nameOfCopyMapMsgText")} 
						</div>
          </div>
          <a className="close close-modal" onClick={this.props.handler}>&times;</a>
          <div className="select-shared">
            <ul>
              <li className="buttons shared-select">
                <div className="email-tab-contents">
                  <div className="email-box active">
                    <div className="popup-input mail-input">
                      <input type="text" className="shared-map-name" 
                        onChange={(e) => this.sharedMapNameInput(e)}
                        placeholder= {Resources.getValue("newMapNameMsgText")}
                      />
                      <button className="mail-save-btn" onClick={() => this.saveACopyMap()}>
                        {Resources.getValue("saveSmallMsgTxt")}
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
  }
}

export default CopyMyMapNameChangeModalComponent;

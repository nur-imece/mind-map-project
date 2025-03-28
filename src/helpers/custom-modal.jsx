import React, { Component } from "react";
import Resources from "../libraries/resources";
import MM from "../libraries/map";
import MapService from "../services/api/map";
import Utils from "../libraries/utils";
import { CopyToClipboard } from "react-copy-to-clipboard";

class CustomModal extends Component {
  constructor(props) {
    super(props);
    // localStorage.setItem("isMapPublicControl", false);
    this.state = {
      sharedUserList: [],
      copiedPublicURL: false,
      willCopyURL: "",
      isUserMakePublicThisMap: JSON.parse(
        localStorage.getItem("isMapPublicControl")
      ),
      openedMapId: localStorage.getItem("openedMapId"),
      anonymousSendEmail: "",
      anonymousSendMessage: "",
      anonymousSendEmailList: [],
      publicSendEmail: "",
      publicSendEmailList: [],
      publicUserPermission: "-1",
      publicUserPermissionText: Resources.getValue("pleaseSelectMsgTxt"),
    };
    this.emailList = [];
  }

  componentDidMount() {
    this.openModal();
    // this.selectShared();
    this.publicShareLink();
  }

  keydownHandler(e) {
    if (
      (e.shiftKey && e.keyCode == "223") ||
      (e.shiftKey && e.keyCode == "191") ||
      (e.ctrlKey && e.keyCode == "73") ||
      (e.ctrlKey && e.keyCode == "85") ||
      (e.ctrlKey && e.keyCode == "66") ||
      e.keyCode == "46"
    ) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  warningModal() {
    Utils.modalm().open({
      exitButtonText: Resources.getValue("exitMsgTxt"),
      title: Resources.getValue("warningSendMailMsgTxt"),
      bodyContent: Resources.getValue("warningmodalMsgTxt"),
      buttons: [
        {
          text: Resources.getValue("okMsgTxt"),
          class: "button yellow-button confirm-button",
          href: "",
        },
      ],
    });
  }

  warningForEmailRegexModal() {
    Utils.modalm().open({
      exitButtonText: Resources.getValue("exitMsgTxt"),
      title: Resources.getValue("warningSendMailMsgTxt"),
      bodyContent: Resources.getValue("warningmodalForEmailRegexMsgTxt"),
      buttons: [
        {
          text: Resources.getValue("okMsgTxt"),
          class: "button yellow-button confirm-button",
          href: "",
        },
      ],
    });
  }

  warningForEmptyUserArrayModal() {
    Utils.modalm().open({
      exitButtonText: Resources.getValue("exitMsgTxt"),
      title: Resources.getValue("warningSendMailMsgTxt"),
      bodyContent: Resources.getValue("warningAddUserListMsgTxt"),
      buttons: [
        {
          text: Resources.getValue("okMsgTxt"),
          class: "button yellow-button confirm-button",
          href: "",
        },
      ],
    });
  }

  openModal() {
    var _this = this;
    document.querySelector(".close").addEventListener("click", function () {
      _this.props.sharedClick(false);
      _this.props.callWhenModalClose(false);
    });

    document.querySelector(".cancel").addEventListener("click", function () {
      _this.props.sharedClick(false);
    });

    document.addEventListener("keydown", this.keydownHandler);
  }

  // selectShared() {
  // 	var button = document.querySelectorAll('.buttons');
  // 	var emailBox = document.querySelectorAll('.email-box');
  // 	button.forEach(function (item, e) {
  // 		item.addEventListener('click', function () {
  // 			// emailBox.forEach(function (c){c.classList.remove("active")})
  // 			button.forEach(function (b) { b.classList.remove("shared-select") })
  // 			emailBox[e].classList.add("active");
  // 			item.classList.add("shared-select")
  // 		})
  // 	});
  // }

  // Eski
  // sendEmail = () => {
  // 	var _this = this;
  // 	var sendInput = document.querySelector(".anonim-share-email").value;
  // 	var regexInput = /^([\w\.\+]{1,})([^\W])(@)([\w]{1,})(\.[\w]{1,})+$/.test(sendInput);
  // 	if (regexInput) {
  // 		var arrayEmail = [sendInput];
  // 		var message = document.querySelector(".email-message").value;
  // 		var mindMapId = Utils.getParameterByName('mapId') || sessionStorage.getItem('openedMapId');
  // 		var data = {
  // 			mailList: arrayEmail,
  // 			mindMapId: mindMapId,
  // 			massage: message
  // 		}
  // 		MapService.sharedMindMapById(JSON.stringify(data));
  // 		_this.props.sharedClick(false);
  // 		localStorage.setItem('isCustomModalOpen', false);
  // 		document.querySelector(".anonim-share-email").value = "";
  // 	} else {
  // 		this.warningModal();
  // 	}
  // };

  // yeni paylas
  sendEmail = () => {
    var _this = this;
    var message = document.querySelector(".email-message").value;
    var mindMapId =
      Utils.getParameterByName("mapId") ||
      sessionStorage.getItem("openedMapId");
    var data = {
      users: this.state.publicSendEmailList,
      mindMapId: mindMapId,
      message: message,
    };

    if (!this.state.publicSendEmailList.length) {
      this.warningForEmptyUserArrayModal();
    } else {
      MapService.shareMapToUsers(JSON.stringify(data));
      _this.props.sharedClick(false);
      localStorage.setItem("isCustomModalOpen", false);
      document.querySelector(".share-email").value = "";
    }
  };

  addUserToList = () => {
    var _this = this;
    var email = document.querySelector(".share-email").value;
    var trimSpaceEmail = email.split(" ").join("");
    var regexInput = /^([\w\.\-\+]{1,})([^\W])(@)([\w]{1,})(\.[\w]{1,})+$/.test(
      trimSpaceEmail
    );

    if (email) {
      if (regexInput) {
        if (!this.userExists(trimSpaceEmail)) {
          if (trimSpaceEmail === localStorage.getItem("userMail")) {
            alert(Resources.getValue("notShareWithYourselfMsgTxt"));
            document.querySelector(".share-email").value = "";
            return false;
          }
          if (_this.state.publicUserPermission !== "-1") {
            _this.emailList.push({
              email: trimSpaceEmail,
              mapPermissionId: _this.state.publicUserPermission,
              mapPermissionValue: _this.state.publicUserPermissionText,
            });
            _this.setState({
              publicSendEmailList: _this.emailList,
            });
            document.querySelector(".share-email").value = "";
            _this.setState({
              publicUserPermission: "-1",
            });
          } else {
            Utils.modalm().open({
              bodyContent:
                "<p>" +
                Resources.getValue("notSelectPermissionMsgText") +
                "</p>",
              buttons: [
                {
                  text: Resources.getValue("okMsgTxt"),
                  class: "button  yellow-button confirm-button",
                  href: "",
                },
              ],
              confirmCallback: null,
              rejectCallback: null,
            });
          }
        } else {
          alert(Resources.getValue("addedUserAlreadyMsgText"));
          document.querySelector(".share-email").value = "";
        }
      } else {
        this.warningForEmailRegexModal();
      }
    } else {
      Utils.modalm().open({
        bodyContent:
          "<p>" + Resources.getValue("notWriteEmailMsgText") + "</p>",
        buttons: [
          {
            text: Resources.getValue("okMsgTxt"),
            class: "button  yellow-button confirm-button",
            href: "",
          },
        ],
        confirmCallback: null,
        rejectCallback: null,
      });
    }
  };

  userExists(userEmail) {
    return this.emailList.some(function (el) {
      return el.email === userEmail;
    });
  }

  _handleEnterKeyDown = (e) => {
    if (e.key === "Enter") {
      this.addUserToList();
    }
  };

  _preventSpace = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  removeUserFromList(user) {
    this.emailList = this.emailList.filter(function (obj) {
      return obj.email !== user.email;
    });
    document.getElementById(user.email).classList.add("none");
    this.state.publicSendEmailList = this.emailList;
    document.querySelector(".share-email").value = "";
  }

  onChangeUserPermission(e) {
    var index = e.nativeEvent.target.selectedIndex;
    this.setState({
      publicUserPermission: e.target.value,
      publicUserPermissionText: e.nativeEvent.target[index].text,
    });
    document.querySelector(".share-email").focus();
  }

  shareSendEmail(e) {
    var email = e.target.value;
    this.setState({
      anonymousSendEmail: email,
    });
  }

  shareSendMessage(e) {
    var message = e.target.value;
    this.setState({
      anonymousSendMessage: message,
    });
  }

  messageKeyUpHandler(e) {
    var len = e.target.textLength;
    document.getElementById("email-messagebox").value = document
      .getElementById("email-messagebox")
      .value.substring(0, 1000);
    if (len >= 1000) {
      document.getElementById("current").innerHTML = 1000;
      document.getElementById("email-messagebox").maxLength = 1000;
      return false;
    } else {
      document.getElementById("current").innerHTML = len;
    }
  }

  selectTab(e) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
      }
    });
    e.target.classList.add("active");

    document.querySelectorAll(".buttons").forEach((content) => {
      if (content.classList.contains("active")) {
        content.classList.remove("active");
      }
    });
    if (
      document.querySelector("li[data-name=" + e.target.dataset.target + "]") &&
      document.querySelector("li[data-name=" + e.target.dataset.target + "]")
        .classList.length > 0
    ) {
      document
        .querySelector("li[data-name=" + e.target.dataset.target + "]")
        .classList.add("active");
    }
  }

  publicShareLink() {
    var _this = this;
    // var callback = this.fillShareLink;
    var mindMapId = localStorage.getItem("openedMapId");
    /*
    if (
      window.location.origin == "https://foramind.com" ||
      window.location.origin == "https://www.foramind.com" ||
      window.location.origin == "https://app.foramind.com"
    ) {
     */
      var url =
        window.location.origin +
        "/public-share-link?" +
        "mindMapId=" +
        mindMapId;
      // MapService.getPublicShareLink(url, callback, this);
      _this.setState({
        willCopyURL: url,
      });
      /*
      
    } else {
      var url =
        window.location.origin +
        "/foramind" +
        "/public-share-link?" +
        "mindMapId=" +
        mindMapId;
      // MapService.getPublicShareLink(url, callback, this);
      _this.setState({
        willCopyURL: url,
      });
    }
    */
  }

  // tiny url iptal
  // fillShareLink() {
  // 	var _this = this;
  // 	const publicShareLink = JSON.parse(this.response);
  // 	document.querySelector(".public-link").value = publicShareLink.url
  // 	_this.scope.setState({
  // 		willCopyURL: publicShareLink.url
  // 	})
  // }

  makePublicPrivate(mapId, isPublicStatus) {
    const data = {
      mindMapId: mapId,
      isPublicMap: isPublicStatus,
    };
    MapService.SetPublicOrPrivateMap(data, this.privatePublicCallback, this);
  }

  privatePublicCallback() {
    var _this = this;
    _this.scope.getMapInfo();
  }

  getMapInfo() {
    var mapId =
      Utils.getParameterByName("mapId") || localStorage.getItem("openedMapId");
    MapService.getMap(mapId, this.drawOpenedMap, this);
  }

  drawOpenedMap() {
    var _this = this;
    const data = JSON.parse(this.response).mindMap;
    const sharedData = JSON.parse(this.response).sharedMindMapMail;
    localStorage.setItem("mapJsonObj", JSON.stringify(data));
    var mapData = JSON.parse(this.response).mindMap.content;
    var mapBackgroundImage = JSON.parse(this.response).mindMap.backgroundName;
    var UserIsOwner = JSON.parse(this.response).userIsOwner;
    localStorage.setItem("userIsOwner", UserIsOwner);

    if (data.isPublicMap === true) {
      document.querySelector("#public-private-btn > i").className =
        "icon-lock-open-black";
    } else {
      document.querySelector("#public-private-btn > i").className =
        "icon-lock-black";
    }

    if (mapData) {
      MM.UI.Backend._loadDone(JSON.parse(mapData));
      var container = document.querySelector(".item");
      MM.App.scrollZoom(container, 1.92, 0.5);
      MM.App.buttonZoom(container, 1.92, 0.5);
    }

    if (mapBackgroundImage) {
      document.querySelector("#port").style.background = mapBackgroundImage;
    }
  }

  callPublicPrivatFunc(scope) {
    Utils.modalm().close();
    scope.makePublicPrivate(scope.state.openedMapId, true);
    scope.setState({
      isUserMakePublicThisMap: true,
    });
  }

  makePublicMapModal() {
    // if(JSON.parse(localStorage.getItem("isMapPublicControl")) === false) {
    if (this.state.isUserMakePublicThisMap === false) {
      Utils.modalm().open({
        title: Resources.getValue("makePublicQuestionMsgTxt"),
        bodyContent:
          "<p>" + Resources.getValue("youWantoMakePublicMsgTxt") + "</p>",
        buttons: [
          {
            text: Resources.getValue("noMsgTxt"),
            class: "button fresh-button reject-button",
            href: "",
          },
          {
            text: Resources.getValue("yesMsgTxt"),
            class: "button  yellow-button confirm-button",
            href: "",
          },
        ],
        confirmCallback: this.callPublicPrivatFunc,
        rejectCallback: null,
        scope: this,
      });
    }
  }

  getSharedUserList = () => {
    var mindMapId =
      Utils.getParameterByName("mapId") ||
      sessionStorage.getItem("openedMapId");
    MapService.getSharedUserList(mindMapId, this.getUsers, this);
  };

  getUsers() {
    var _this = this;
    var userData = JSON.parse(this.response).list;
    if (userData.length) {
      _this.scope.setState({
        sharedUserList: userData,
      });
    } else {
      if (
        !document.querySelector(".shared-users-list-wrapper").hasChildNodes()
      ) {
        var node = document.createElement("LI");
        node.classList.add("no-shared-user");
        var iconnode = document.createElement("I");
        iconnode.classList.add("fa");
        iconnode.classList.add("fa-exclamation-circle");
        var textnode = document.createTextNode(
          " " + Resources.getValue("noSharedPeopleInListMsgTxt")
        );
        node.appendChild(iconnode);
        node.appendChild(textnode);
        document.querySelector(".shared-users-list-wrapper").appendChild(node);
      }
    }
  }

  changeUserPermission(e, sharedMapId) {
    var data = {
      sharedMindMapMailId: sharedMapId,
      mapPermissionId: e.target.value,
    };
    MapService.updateUserMapPermission(JSON.stringify(data));
  }

  removeUserFromMap(mindMapId, sharedMapId) {
    var data = {
      sharedMindMapMailId: sharedMapId,
      mindMapId: mindMapId,
    };
    MapService.removeUserFromMap(JSON.stringify(data));

    if (this.state.sharedUserList.length === 1) {
      // sadece 1 emena varsa
      document.getElementById(sharedMapId).remove();
      setTimeout(() => {
        this.getSharedUserList();
      }, 50);
    } else if (this.state.sharedUserList.length > 1) {
      // yoksa / birden fazlaysa
      setTimeout(() => {
        this.getSharedUserList();
      }, 50);
    }
  }

  render() {
    return (
      <div className="overlay">
        <div className="popup share-modal">
          <div className="title">
            <span className="fa-stack fa-1x icon-wrap">
              <i className="fa fa-circle fa-stack-2x circle-icon"></i>
              <i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
            </span>
            <div className="text">
              {Resources.getValue("shareWithPeopleMsgTxt")}
            </div>
          </div>
          <a className="close">&times;</a>
          <div className="select-shared">
            <div className="email-tab-buttons">
              <a
                onClick={(e) => {
                  this.selectTab(e);
                }}
                data-target="shared-select"
                className={`tab-btn ${
                  this.props.isUserMakePublicThisMapWithButton === true
                    ? ""
                    : "active"
                }`}
              >
                <i className="icon-lock-black"></i>{" "}
                {Resources.getValue("shareAsPrivateMsgTxt")}
              </a>
              <a
                onClick={(e) => {
                  this.selectTab(e);
                  this.makePublicMapModal();
                }}
                data-target="public-share"
                className={`tab-btn ${
                  this.props.isUserMakePublicThisMapWithButton === true
                    ? "active"
                    : ""
                }`}
              >
                <i className="icon-lock-open-black"></i>{" "}
                {Resources.getValue("shareAsPublicMsgTxt")}
              </a>
              <a
                onClick={(e) => {
                  this.selectTab(e);
                  this.getSharedUserList();
                }}
                data-target="shared-users-list"
                className={`tab-btn`}
              >
                <i className="icon-list-black"></i>{" "}
                {Resources.getValue("allSharedUsersListMsgTxt")}
              </a>
            </div>
            <ul>
              <li
                className={`buttons shared-select ${
                  this.props.isUserMakePublicThisMapWithButton === true
                    ? ""
                    : "active"
                }`}
                data-name="shared-select"
              >
                <div className="email-tab-contents">
                  <div className="email-box active">
                    <div className="shared-email none"></div>
                    <div className="popup-input mail-input">
                      <div className="input-select-wrapper">
                        <input
                          type="text"
                          id="share-email-input"
                          className="share-email"
                          onChange={(e) => this.shareSendEmail(e)}
                          onKeyDown={this._handleEnterKeyDown}
                          onKeyPress={(e) => this._preventSpace(e)}
                          placeholder={Resources.getValue("emailMsgTxt")}
                          autoComplete="off"
                        />
                        <select
                          name="sharePermission"
                          id="sharePermission"
                          value={this.state.publicUserPermission}
                          onChange={(e) => {
                            this.onChangeUserPermission(e);
                          }}
                        >
                          <option value="-1">
                            {Resources.getValue("pleaseSelectMsgTxt")}
                          </option>
                          <option value="1">
                            {Resources.getValue("viewerMsgTxt")}
                          </option>
                          <option value="2">
                            {Resources.getValue("editorMsgTxt")}
                          </option>
                          <option value="3">
                            {Resources.getValue("sendCopyMsgTxt")}
                          </option>
                        </select>
                      </div>
                      <button
                        className="mail-save-btn"
                        onClick={this.addUserToList}
                      >
                        {Resources.getValue("addMsgTxt")}
                      </button>
                    </div>
                    <div className="popup-input info-box">
                      <i className="fa fa-check-circle"></i>{" "}
                      {Resources.getValue("informUSersMsgTxt")}
                    </div>
                    <div className="popup-input message-area">
                      <textarea
                        id="email-messagebox"
                        className="email-message"
                        cols="30"
                        rows="4"
                        onChange={(e) => this.shareSendMessage(e)}
                        placeholder={Resources.getValue("yourMessageMsgTxt")}
                        onKeyUp={this.messageKeyUpHandler}
                      ></textarea>
                    </div>
                    <div className="popup-input count-area">
                      <div id="message-count">
                        <span id="current">0</span>
                        <span id="maximum">/1000</span>
                      </div>
                    </div>
                    <div
                      className={`share-selected-user-wrapper ${
                        this.state.publicSendEmailList &&
                        this.state.publicSendEmailList.length > 0
                          ? ""
                          : "none"
                      }`}
                    >
                      <ul className="share-selected-user-list">
                        {this.state.publicSendEmailList.map((user) => {
                          return (
                            <li
                              className="share-selected-user-item"
                              key={user.email}
                              id={user.email}
                            >
                              <span className="share-selected-user-mail">
                                <span className="circle">
                                  <i className="fa fa-user"></i>
                                </span>
                                {user.email}
                              </span>
                              <span className="share-selected-user-permission">
                                {user.mapPermissionValue}
                              </span>
                              <div
                                className="share-selected-user-remove"
                                onClick={() => this.removeUserFromList(user)}
                              >
                                <i className="fa fa-times"></i>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="share-send-button">
                      <div className="share-map-name-wrap">
                        <div className="share-map-name">
                          {localStorage.getItem("openedMapName")}
                        </div>
                      </div>
                      <div className="right-button-wrap">
                        <a className="yellow-button cancel">
                          {Resources.getValue("cancelMsgTxt")}
                        </a>
                        <button
                          className="yellow-button button submit-form-button float-right"
                          type="button"
                          title={Resources.getValue("sendMsgTxt")}
                          data-submit-method="register"
                          onClick={this.sendEmail}
                        >
                          {Resources.getValue("sendMsgTxt")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li
                className={`buttons public-share ${
                  this.props.isUserMakePublicThisMapWithButton === true
                    ? "active"
                    : ""
                }`}
                data-name="public-share"
              >
                <div className="email-tab-contents">
                  <div className="email-box active">
                    <div className="shared-email">
                      <p className="mb-0">
                        {Resources.getValue("publicUrlInfoMsgTxt")}:
                      </p>
                    </div>
                    <div className="popup-input public-share-input-wrap">
                      <input
                        value={
                          this.props.isUserMakePublicThisMapWithButton ===
                            true || this.state.isUserMakePublicThisMap === true
                            ? this.state.willCopyURL
                            : Resources.getValue(
                                "youWillSeeURLAfterMakePublicMsgTxt"
                              )
                        }
                        type="text"
                        className="public-link"
                        readOnly="readOnly"
                        placeholder={Resources.getValue("linkMsgTxt")}
                      />
                      {this.props.isUserMakePublicThisMapWithButton === true ||
                      this.state.isUserMakePublicThisMap === true ? (
                        <CopyToClipboard
                          text={this.state.willCopyURL}
                          onCopy={() =>
                            this.setState({ copiedPublicURL: true })
                          }
                        >
                          <a className="copy-link-btn">
                            <i className="icon-copy-black"></i>
                            {Resources.getValue("copyMsgTxt")}
                          </a>
                        </CopyToClipboard>
                      ) : (
                        ""
                      )}
                    </div>
                    {this.state.copiedPublicURL ? (
                      <p className="copied-info">
                        URL {Resources.getValue("copiedMsgTxt")}!
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>

              <li
                className={`buttons public-share`}
                data-name="shared-users-list"
              >
                <div className="email-tab-contents">
                  <div className="email-box active">
                    <div className="share-selected-user-wrapper">
                      <ul className="share-selected-user-list shared-users-list-wrapper">
                        {this.state.sharedUserList.length > 0 &&
                          this.state.sharedUserList.map((user) => (
                            <li
                              className="share-selected-user-item"
                              key={user.sharedMindMapMailId}
                              id={user.sharedMindMapMailId}
                            >
                              <span className="share-selected-user-mail">
                                <span className="circle">
                                  <i className="fa fa-user"></i>
                                </span>
                                {user.firstnameLastName
                                  ? `${user.firstnameLastName} (${user.email})`
                                  : user.email}
                              </span>
                              <select
                                onChange={(e) => {
                                  this.changeUserPermission(
                                    e,
                                    user.sharedMindMapMailId
                                  );
                                }}
                                defaultValue={user.mapPermissionId}
                              >
                                <option value="1">
                                  {Resources.getValue("viewerMsgTxt")}
                                </option>
                                <option value="2">
                                  {Resources.getValue("editorMsgTxt")}
                                </option>
                              </select>
                              <div
                                className="remove-shared-user"
                                onClick={() => {
                                  this.removeUserFromMap(
                                    user.mindMapId,
                                    user.sharedMindMapMailId
                                  );
                                }}
                              >
                                <i className="fa fa-times"></i>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div className="share-send-button">
                      <div className="share-map-name-wrap">
                        <div className="share-map-name">
                          {localStorage.getItem("openedMapName")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* <li className="buttons none">
								<div className="email-tab-contents">
									<div className="email-box">
										<div className="shared-email">
											<span className="fa-stack fa-2x">
												<i className="fa fa-circle fa-stack-2x circle-icon"></i>
												<i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
											</span>
											<span className="sub-title">{Resources.getValue('linkSendEmail')}</span>
										</div>
										<div className="popup-input">
											<input type="text" className="public-email-link" onChange={(e) => this.publicSendMail(e)} placeholder={Resources.getValue("emailMsgTxt")} />
										</div>
										<div className="popup-input">
											<input type="text" className="public-link" readOnly="readOnly" placeholder={Resources.getValue("linkMsgTxt")} />
										</div>
										<div className="link-send-button">
											<button
												className="yellow-button button submit-form-button float-right"
												type="button"
												title={Resources.getValue("sendMsgTxt")}
												data-submit-method="register"
												onClick={this.publicSendEmail}
											>
												{Resources.getValue("sendMsgTxt")}
											</button>
										</div>
									</div>
								</div>
							</li> */}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default CustomModal;

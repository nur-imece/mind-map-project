import React, { Component } from "react";
import Header from "../components/header";
import SubHeader from "../components/sub-header";
import Resources from "../libraries/resources";
import TemplateListService from "../services/api/template-list";
import MindMapService from "../services/api/mind-map";
import SharedMapService from "../services/api/shared-map";
import Utils from "../libraries/utils";
import MapService from "../services/api/map";
import AddTemplateModal from "../helpers/add-template-modal";
import ModalImage, { Lightbox } from "react-modal-image";

// images
import blankTemplateLogo from "../styles/img/plus-icon.png";
import moreOptionsIcon from "../styles/img/more-options-icon.png";
import zoomPlusIcon from "../styles/img/zoom_in-24px.png";

class SubTemplateList extends Component {
    constructor(props) {
        super(props);

        localStorage.removeItem("deletedTemplateId");
        localStorage.setItem("isCustomModalOpen", false);
        this.state = {
            myMindMaps: [],
            sharedMindMaps: [],
            displayedMindMaps: [],
            subTemplateData: [],
            selectedTemplateName: localStorage.getItem("selectedTemplateName"),
            isAddTemplateModal: JSON.parse(localStorage.getItem("isCustomModalOpen")),
            isUpdateProcess: false,
            isUserHasPermissionForOptions: false,
            isTeacherUserHasPermissionForOptions: false,
            tags: [],
        };

        localStorage.setItem("retrieveUrl", window.location.pathname);
    }

    componentDidMount() {
        document.title = "Foramind | " + Resources.getValue("mindMapMsgTxt");
        this.getSubTemplateList();
        this.getMyMindMaps();
        this.getMySharedMindMaps();

        // if category id is not exist, go to category page
        if (localStorage.getItem("selectedTemplateId") === null) {
            window.location.href =
                Resources.getValue("appBaseEnvURL") + "/template-list";
        }

        // merge all maps in one array
        // setTimeout(() => {
        //   var allMaps = this.state.myMindMaps.concat(this.state.sharedMindMaps);
        //   this.setState({
        //     displayedMindMaps: allMaps
        //   });
        // }, 1500);

        // user role control for edilt/delete permission
        if (localStorage.getItem("userRoleIdList")) {
            JSON.parse(localStorage.getItem("userRoleIdList")).forEach((role) => {
                if (role === 3 || role === 1) {
                    // superadmin ya da kurum admin ise
                    this.setState({
                        isUserHasPermissionForOptions: true,
                        isTeacherUserHasPermissionForOptions: false,
                    });
                } else if (role === 4) {
                    // superadmin ya da kurum admin degilse ve rolu ogretmen ise
                    this.setState({
                        isUserHasPermissionForOptions: false,
                        isTeacherUserHasPermissionForOptions: true,
                    });
                } else {
                    this.setState({
                        isUserHasPermissionForOptions: false,
                        isTeacherUserHasPermissionForOptions: false,
                    });
                }
            });
        }
    }

    getSubTemplateList() {
        var recordSize = 1000;
        var languageId = Resources.siteLanguage;
        TemplateListService.getSubTemplateList(
            recordSize,
            this.fillUserSubTemplatelist,
            languageId,
            this.state.tags,
            this
        );
    }

    fillUserSubTemplatelist() {
        var _this = this;
        var userTemplatelist = JSON.parse(this.response).templateList;
        var listItemContainer = document.querySelector(".template-list-board");
        var listItemSample = document.querySelector(".template-item-list");

        if (userTemplatelist) {
            _this.scope.setState({
                subTemplateData: JSON.parse(JSON.stringify(userTemplatelist)),
            });
        }
    }

    sharedClick = (isOpen) => {
        this.setState({
            isAddTemplateModal: isOpen,
            isUpdateProcess: isOpen,
        });
    };

    // get all my mind map data
    getMyMindMaps = () => {
        var recordSize = 1000;
        var id = JSON.parse(localStorage.getItem("userInformation")).id;
        MindMapService.getMindMap(recordSize, this.getMindMaps, this, id);
    };
    getMindMaps() {
        var _this = this;
        const mindMapList = JSON.parse(this.response).mindMap;
        console.log(mindMapList);

        if (mindMapList) {
            for (var i = 0; i < mindMapList.length; i++) {
                if (mindMapList[i].modifiedDate)
                    mindMapList[i].modifiedDate = Utils.formatDateWithMonthName(
                        mindMapList[i].modifiedDate
                    );
                if (mindMapList[i].creationDate)
                    mindMapList[i].creationDate = Utils.formatDateWithMonthName(
                        mindMapList[i].creationDate
                    );
            }
            _this.scope.setState({
                myMindMaps: JSON.parse(JSON.stringify(mindMapList)),
            });
        }
    }

    // get all shared with me mind map data
    getMySharedMindMaps = () => {
        var recordSize = 1000;
        var id = JSON.parse(localStorage.getItem("userInformation")).id;
        SharedMapService.getMindMapSharedByUserIdAsync(
            id,
            recordSize,
            this.getSharedMindMaps,
            this
        );
    };
    getSharedMindMaps() {
        var _this = this;
        const mindMapList = JSON.parse(this.response).mindMap;

        if (mindMapList) {
            for (var i = 0; i < mindMapList.length; i++) {
                if (mindMapList[i].modifiedDate)
                    mindMapList[i].modifiedDate = Utils.formatDateWithMonthName(
                        mindMapList[i].modifiedDate
                    );
                if (mindMapList[i].creationDate)
                    mindMapList[i].creationDate = Utils.formatDateWithMonthName(
                        mindMapList[i].creationDate
                    );
            }
            _this.scope.setState({
                sharedMindMaps: JSON.parse(JSON.stringify(mindMapList)),
            });
        }
    }

    createMapWithTemplateEvent(id, content, name) {
        this.newMap(id, content, name);
    }

    newMap(id, templateData, templateName) {
        localStorage.setItem("mapPermission", 0);
        localStorage.removeItem("openedMapName");
        localStorage.removeItem("openedMapId");
        localStorage.setItem("mapTemplate", templateData);
        var data = {
            name: templateName,
            content: templateData,
            backgroundName: JSON.parse(templateData).backgroundName
                ? JSON.parse(templateData).backgroundName
                : "",
            // templateId: parseFloat(localStorage.getItem("selectedTemplateId"))
            templateId: id,
        };
        // create service
        MapService.create(JSON.stringify(data), templateName);
    }

    errorModal() {
        Utils.modalm().open({
            exitButtonText: Resources.getValue("exitMsgTxt"),
            title: Resources.getValue("errorMsgTxt"),
            bodyContent:
                "<p>" + Resources.getValue("templatelistmapnameMsgTxt") + "</p>",
            buttons: [
                {
                    text: Resources.getValue("okMsgTxt"),
                    class: "button yellow-button confirm-button",
                    href: "",
                },
            ],
        });
    }

    createMap() {
        document
            .querySelector("#create-map")
            .addEventListener("click", function () {
                document.querySelector(".new-map-wrapper").classList.remove("none");
            });
    }

    deleteTemplate(scope) {
        Utils.modalm().close();
        TemplateListService.deleteTemplateCategory(
            JSON.parse(localStorage.getItem("deletedTemplateId")),
            scope.getSubTemplateList,
            scope
        );
    }

    deleteTemplateWarning(id, name) {
        localStorage.setItem("deletedTemplateId", id);
        Utils.modalm().open({
            exitButtonText: Resources.getValue("exitMsgTxt"),
            title: Resources.getValue("warningMsgTxt"),
            bodyContent:
                "<b>" +
                name +
                "</b>: " +
                Resources.getValue("templateWillRemoveAreYouSureMsgTxt"),
            buttons: [
                {
                    text: Resources.getValue("yesMsgTxt"),
                    class: "button yellow-button confirm-button",
                    href: "",
                },
                {
                    text: Resources.getValue("noMsgTxt"),
                    class: "button fresh-button reject-button",
                    href: "",
                },
            ],
            confirmCallback: this.deleteTemplate,
            rejectCallback: null,
            scope: this,
        });
    }
    removeTag = (i) => {
        const newTags = [...this.state.tags];
        newTags.splice(i, 1);
        this.setState({ tags: newTags }, (tags) => this.getSubTemplateList());
        setTimeout(() => {
            var HeaderHeight =
                "calc(100% - " +
                document.querySelector(".template-list-header").offsetHeight +
                "px)";
            document.getElementById("file-box").style.maxHeight = HeaderHeight;
        }, 200);
    };

    inputKeyDown = (e) => {
        const val = e.target.value;
        if (e.key === "Enter" && val) {
            if (
                this.state.tags.find((tag) => tag.toLowerCase() === val.toLowerCase())
            ) {
                return;
            }
            this.setState({ tags: [...this.state.tags, val] }, (tags) =>
                this.getSubTemplateList()
            );
            this.tagInput.value = null;
            setTimeout(() => {
                var HeaderHeight =
                    "calc(100% - " +
                    document.querySelector(".sub-template-list-header").offsetHeight +
                    "px)";
                document.getElementById("file-box").style.maxHeight = HeaderHeight;
            }, 200);
        } else if (e.key === "Backspace" && !val && this.state.tags.length > 0) {
            this.removeTag(this.state.tags.length - 1);
        }
    };
    render() {
        const { tags } = this.state;
        return (
            <React.Fragment>
                <Header />
                <div className="dashboard-page mindmap-table category-tampleta-grid wide">
                    {this.state.isAddTemplateModal ? (
                        <AddTemplateModal
                            sharedClick={this.sharedClick}
                            isUpdateProcess={this.state.isUpdateProcess}
                            selectedTemplate={this.state.selectedTemplate}
                            selectedTemplateName={this.state.selectedTemplateName}
                            displayedMindMaps={this.state.myMindMaps.concat(
                                this.state.sharedMindMaps
                            )}
                        />
                    ) : null}
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-12 col-lg-12">
                                <div className="template-panel">
                                    <div className="d-flex justify-content-between align-items-center px-3 sub-template-list-header">
                                        <div className="template-list-header sub-header">
                                            <SubHeader
                                                title={
                                                    Resources.getValue("mindMapMsgTxt") +
                                                    " - " +
                                                    this.state.selectedTemplateName
                                                }
                                                iconName="icon-map_list_icon"
                                            />
                                            <div className="header-subcontainer">
                                                <div className="input-tag">
                                                    <ul className="input-tag__tags">
                                                        {tags.map((tag, i) => (
                                                            <li key={tag}>
                                                                {tag}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        this.removeTag(i);
                                                                    }}
                                                                >
                                                                    +
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li className="input-tag__tags__input">
                                                            <input
                                                                type="text"
                                                                onKeyDown={this.inputKeyDown}
                                                                ref={(c) => {
                                                                    this.tagInput = c;
                                                                }}
                                                                placeholder={Resources.getValue(
                                                                    "categoryFilterMsgTxt"
                                                                )}
                                                            />
                                                        </li>
                                                    </ul>
                                                </div>
                                                <a
                                                    className="back-to-template-list"
                                                    href={
                                                        Resources.getValue("appBaseEnvURL") +
                                                        "/template-list"
                                                    }
                                                >
                                                    {Resources.getValue("categoryListMsgTxt")}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="file-box" id="file-box">
                                        {/* sub template yoksa ve permission: 2 ise css grid iptal */}
                                        <div
                                            className="template-list-board row"
                                            style={
                                                !this.state.subTemplateData.length &&
                                                this.state.isUserHasPermissionForOptions === false &&
                                                !this.state.subTemplateData.length &&
                                                this.state.isTeacherUserHasPermissionForOptions ===
                                                false
                                                    ? { display: "block" }
                                                    : {}
                                            }
                                        >
                                            <div
                                                className={`list-item 
                        ${
                                                    this.state.isUserHasPermissionForOptions === false &&
                                                    this.state.isTeacherUserHasPermissionForOptions ===
                                                    false
                                                        ? " none"
                                                        : ""
                                                }`}
                                            >
                                                <div className="template-item-list-wrapper">
                                                    <a
                                                        className="template-blank"
                                                        title={Resources.getValue("addTemplateMsgTxt")}
                                                        onClick={() => {
                                                            localStorage.setItem("isCustomModalOpen", true);
                                                            this.setState({
                                                                isAddTemplateModal: JSON.parse(
                                                                    localStorage.getItem("isCustomModalOpen")
                                                                ),
                                                            });
                                                        }}
                                                    >
                                                        <img
                                                            alt="templateLogo"
                                                            className="template-image"
                                                            src={blankTemplateLogo}
                                                            alt={Resources.getValue("addTemplateMsgTxt")}
                                                        />
                                                    </a>
                                                </div>
                                                <p className="item-name">
                                                    {Resources.getValue("addTemplateMsgTxt")}
                                                </p>
                                            </div>
                                            {this.state.subTemplateData.length ? (
                                                <>
                                                    {this.state.subTemplateData.map((subTempItem) => {
                                                        return (
                                                            <div
                                                                key={subTempItem.id}
                                                                className="list-item-wrap"
                                                            >
                                                                <a
                                                                    className={`more-options-btn 
                                  ${
                                                                        (this.state
                                                                                .isUserHasPermissionForOptions === true &&
                                                                            JSON.parse(
                                                                                localStorage.getItem("userInformation")
                                                                            ).companyId === subTempItem.companyId) ||
                                                                        (this.state
                                                                                .isTeacherUserHasPermissionForOptions ===
                                                                            true &&
                                                                            JSON.parse(
                                                                                localStorage.getItem("userInformation")
                                                                            ).id === subTempItem.createdBy)
                                                                            ? ""
                                                                            : " none"
                                                                    }`}
                                                                >
                                                                    <img
                                                                        src={moreOptionsIcon}
                                                                        alt={Resources.getValue("optionsMsgTxt")}
                                                                    />
                                                                    <div className="options">
                                                                        <div
                                                                            onClick={() =>
                                                                                this.deleteTemplateWarning(
                                                                                    subTempItem.id,
                                                                                    subTempItem.name
                                                                                )
                                                                            }
                                                                        >
                                                                            {Resources.getValue("deleteMsgTxt")}
                                                                        </div>
                                                                        <div
                                                                            onClick={() => {
                                                                                localStorage.setItem(
                                                                                    "isCustomModalOpen",
                                                                                    true
                                                                                );
                                                                                this.setState({
                                                                                    isAddTemplateModal: JSON.parse(
                                                                                        localStorage.getItem(
                                                                                            "isCustomModalOpen"
                                                                                        )
                                                                                    ),
                                                                                    isUpdateProcess: true,
                                                                                    selectedTemplate: subTempItem,
                                                                                    selectedTemplateName:
                                                                                    subTempItem.name,
                                                                                });
                                                                            }}
                                                                        >
                                                                            {Resources.getValue("editMsgTxt")}
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                                <div
                                                                    className="list-item template-item-list"
                                                                    data-id={subTempItem.id}
                                                                >
                                                                    <div className="template-item-list-wrapper for-template">
                                                                        <a
                                                                            className="create-map-btn"
                                                                            data-name={subTempItem.name}
                                                                            data-id={subTempItem.id}
                                                                        >
                                                                            {/* <img src={blankTemplateLogo}  alt={Resources.getValue("createMsgTxt")} /> */}
                                                                            <ModalImage
                                                                                small={zoomPlusIcon}
                                                                                medium={subTempItem.image}
                                                                                large={subTempItem.image}
                                                                                hideDownload={true}
                                                                                hideZoom={true}
                                                                            />
                                                                        </a>
                                                                        <div
                                                                            className="zoom-plus-icon"
                                                                            onClick={() =>
                                                                                this.createMapWithTemplateEvent(
                                                                                    subTempItem.id,
                                                                                    subTempItem.content,
                                                                                    subTempItem.name
                                                                                )
                                                                            }
                                                                            title={Resources.getValue("createMsgTxt")}
                                                                        >
                                                                            <img
                                                                                src={blankTemplateLogo}
                                                                                alt={Resources.getValue("createMsgTxt")}
                                                                            />
                                                                            {/* <ModalImage
                                        small={zoomPlusIcon}
                                        medium={subTempItem.image}
                                        large={subTempItem.image}
                                        hideDownload={true}
                                        hideZoom={true}
                                      /> */}
                                                                        </div>
                                                                        <span
                                                                            className="item-image-click"
                                                                            onClick={() =>
                                                                                this.createMapWithTemplateEvent(
                                                                                    subTempItem.id,
                                                                                    subTempItem.content,
                                                                                    subTempItem.name
                                                                                )
                                                                            }
                                                                            title={Resources.getValue("createMsgTxt")}
                                                                        >
                                      <img
                                          src={subTempItem.image}
                                          alt="itemImage"
                                          className="item-image template-image"
                                      />
                                                                            {/* <ModalImage
                                        small={subTempItem.image}
                                        medium={subTempItem.image}
                                        large={subTempItem.image}
                                        hideDownload={true}
                                        hideZoom={true}
                                      /> */}
                                    </span>
                                                                    </div>
                                                                    <p
                                                                        className="item-name"
                                                                        title={subTempItem.name}
                                                                    >
                                                                        {subTempItem.name}
                                                                    </p>
                                                                    <div className="generated-map-count">
                                                                        {subTempItem.generatedMapCount +
                                                                            " " +
                                                                            Resources.getValue("createdMsgTxt")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            ) : (
                                                <p
                                                    className={`no-template-info ${
                                                        this.state.isUserHasPermissionForOptions ===
                                                        false &&
                                                        this.state.isTeacherUserHasPermissionForOptions ===
                                                        false
                                                            ? ""
                                                            : "none"
                                                    }`}
                                                >
                                                    {Resources.getValue("noTemplateFoundMsgTxt")}
                                                </p>
                                            )}

                                            {/* eski sablon item */}
                                            {/* <div className="list-item template-item-list none">
                        <div className="template-item-list-wrapper">
                          <a className="item-image-click">
                            <img alt="itemImage" className="item-image" />
                          </a>
                        </div>
                        <p className="item-name"></p>
                      </div> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default SubTemplateList;

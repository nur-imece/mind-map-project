import React, { Component } from "react";
import Resources from "../libraries/resources";
import TemplateListService from "../services/api/template-list";
import Utils from "../libraries/utils";
import Resizer from "react-image-file-resizer";
// image crop
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
// images
import imageIcon from "../styles/img/small-image-icon.png";
import iconShared from "../styles/img/shared-icon.png";
// service
import MapService from "../services/api/map";

import templateCoverImageJSONData from "../libraries/templateDefaultCoverImageData.json";

class AddTemplateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      categoryName: "",
      selectedMindMapInfo: null,
      imageSelectOption: "1",
      imageSelectOptionText: Resources.getValue("uploadFromComputerMsgTxt"),
      isDownloadableValue:
        props.isUpdateProcess === true
          ? props.selectedTemplate.isDownloadable === true
            ? "true"
            : "false"
          : "true",
      crop: {
        unit: "%",
        width: 30,
        aspect: 13 / 9,
      },
      coverImageFile: {
        name: "",
        extension: "",
        type: "",
        referenceId: "",
        referenceIdType: 0,
        file: "",
      },
      imagePreviewUrl: "",
      imagePreviewName: "",
      tags:
        props.selectedTemplate !== undefined &&
        props.selectedTemplate.tags !== null
          ? props.selectedTemplate.tags
          : [],
    };
  }

  componentDidMount() {
    this.openModal();
  }

  onCropChange = (crop) => {
    this.setState({ crop });
  };

  onCropComplete = (crop) => {
    this.makeClientCrop(crop);
  };

  onImageLoaded = (image) => {
    this.imageRef = image;
  };

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        "newFile.jpeg"
      );
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          // console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
        Resizer.imageFileResizer(
          blob, // file obj
          700, // New image max width (ratio is preserved)
          500, // New image max height (ratio is preserved)
          "png", // Can be either JPEG, PNG or WEBP.
          100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
          0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
          (blob) => {
            // blob or base64 url
            var optimizedFileObj = new File(
              [blob],
              new Date().getTime().toString() +
                (Math.floor(Math.random() * 10000000000000000) + 1).toString(),
              { type: blob.type }
            );
            // file read & tobase64 & setState
            var reader = new FileReader();
            reader.readAsDataURL(optimizedFileObj);
            reader.onload = () => {
              var image = reader.result.split(";base64,")[1];
              this.setState({
                coverImageFile: {
                  name: optimizedFileObj.name,
                  extension: "png",
                  type: optimizedFileObj.type,
                  referenceId: "",
                  referenceIdType: 0,
                  file: image,
                },
                imagePreviewName: this.state.selectedImageObj.name,
              });
            };
          },
          "blob", // blob or base64
          500,
          250
        );
      }, "image/png");
    });
  }

  openModal() {
    var _this = this;
    document.querySelector(".close").addEventListener("click", function () {
      _this.props.sharedClick(false);
    });
  }

  clearImageStateObject() {
    this.setState({
      coverImageFile: {
        name: "",
        extension: "",
        type: "",
        referenceId: "",
        referenceIdType: 0,
        file: "",
      },
      imagePreviewUrl: "",
      imagePreviewName: "",
    });
  }

  warningForMissingData() {
    Utils.modalm().open({
      exitButtonText: Resources.getValue("exitMsgTxt"),
      title: Resources.getValue("warningMsgTxt"),
      bodyContent: Resources.getValue("missingDataForAddTemplateMsgTxt"),
      buttons: [
        {
          text: Resources.getValue("okMsgTxt"),
          class: "button yellow-button confirm-button",
          href: "",
        },
      ],
    });
  }

  // yeni olusturma
  addNewTemplateFunc = () => {
    var _this = this;
    var templateName = document.querySelector(".template-name").value;
    var contenOfMap = localStorage.getItem("contentOfMap");

    if (templateName === "" || this.state.selectedMindMapInfo === null) {
      this.warningForMissingData();
    } else {
      var data = {
        mindMapId: _this.state.selectedMindMapInfo.id,
        name: templateName,
        parentTemplateId: JSON.parse(
          localStorage.getItem("selectedTemplateId")
        ),
        content:
          _this.state.selectedMindMapInfo.content === null
            ? String(contenOfMap)
            : _this.state.selectedMindMapInfo.content,
        languageId: Resources.siteLanguage,
        isActive: true,
        isDownloadable:
          this.state.isDownloadableValue === "true" ? true : false,
        companyId: JSON.parse(localStorage.getItem("userInformation"))
          .companyId,
        fileRequest:
          _this.state.coverImageFile.file !== ""
            ? _this.state.coverImageFile
            : JSON.parse(JSON.stringify(templateCoverImageJSONData))
                .templateDefaultCoverImages[0].coverImageFile,
        tags: _this.state.tags,
      };
      TemplateListService.addNewTemplate(JSON.stringify(data));
      _this.props.sharedClick(false);
      localStorage.setItem("isCustomModalOpen", false);
      document.querySelector(".template-name").value = "";
      this.clearImageStateObject();
    }
  };

  // guncelle
  updateTemplateFunc = () => {
    var _this = this;
    var templateName = document.querySelector(".template-name").value;
    var content =
      _this.state.selectedMindMapInfo.content === null
        ? localStorage.getItem("contentOfMap")
        : _this.state.selectedMindMapInfo.content;

    var data = {
      id: this.props.selectedTemplate.id,
      name: templateName,
      content: _this.state.selectedMindMapInfo
        ? content
        : this.props.selectedTemplate.content,
      selectedMindMapId: _this.state.selectedMindMapInfo
        ? _this.state.selectedMindMapInfo.id
        : null,
      parentTemplateId: JSON.parse(localStorage.getItem("selectedTemplateId")),
      languageId: Resources.siteLanguage,
      isActive: true,
      isDownloadable: this.state.isDownloadableValue === "true" ? true : false,
      companyId: JSON.parse(localStorage.getItem("userInformation")).companyId,
      fileRequest:
        _this.state.coverImageFile.file !== ""
          ? _this.state.coverImageFile
          : null,
      tags: _this.state.tags,
    };

    TemplateListService.updateTemplate(JSON.stringify(data));
    _this.props.sharedClick(false);
    localStorage.setItem("isCustomModalOpen", false);
    document.querySelector(".template-name").value = "";
    this.clearImageStateObject();
  };

  onChangeImageSelectOption(e) {
    var index = e.nativeEvent.target.selectedIndex;
    this.setState({
      imageSelectOption: e.target.value,
      imageSelectOptionText: e.nativeEvent.target[index].text,
    });

    switch (e.target.value) {
      case "-1":
        document.querySelector(".file-input-custom").classList.add("width-0");
        break;
      case "1":
        document
          .querySelector(".file-input-custom")
          .classList.remove("width-0");
        this.handleClickForLogoInput();
        break;
      default:
        break;
    }
  }

  addTemplateName(e) {
    var name = e.target.value;
    this.setState({
      templateName: name,
    });
  }

  handleClickForLogoInput = () => {
    document.getElementById("coverImageInput").click();
  };

  handleSelectCoverImage = (e) => {
    const _fileObj = e.target.files[0];
    this.setState({
      selectedImageObj: _fileObj,
    });
    const fileSizeLimit = 4194304; // byte for 4MB image file -- 5242880 KB for 5MB file
    if (e.target.files.length > 0) {
      if (_fileObj.size > fileSizeLimit) {
        Utils.modalm().open({
          exitButtonText: Resources.getValue("exitMsgTxt"),
          title: Resources.getValue("warningMsgTxt"),
          bodyContent: Resources.getValue("imageFileSizeMsgTxt").replace(
            "*_*_*",
            fileSizeLimit
          ),
          buttons: [
            {
              text: Resources.getValue("okMsgTxt"),
              class: "button yellow-button confirm-button",
              href: "",
            },
          ],
          confirmCallback: this.removeSelectedFileAndCloseModal,
        });
      } else {
        Resizer.imageFileResizer(
          _fileObj, // file obj
          700, // New image max width (ratio is preserved)
          500, // New image max height (ratio is preserved)
          "png", // Can be either JPEG, PNG or WEBP.
          100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
          0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
          (blob) => {
            // blob or base64 url
            var optimizedFileObj = new File(
              [blob],
              new Date().getTime().toString() +
                (Math.floor(Math.random() * 10000000000000000) + 1).toString(),
              { type: blob.type }
            );
            // file read & tobase64 & setState
            var reader = new FileReader();
            reader.readAsDataURL(optimizedFileObj);
            reader.onload = () => {
              var image = reader.result.split(";base64,")[1];
              this.setState({
                coverImageFile: {
                  name: optimizedFileObj.name,
                  extension: "png",
                  type: optimizedFileObj.type,
                  referenceId: "",
                  referenceIdType: 0,
                  file: image,
                },
                imagePreviewName: _fileObj.name,
              });
            };
          },
          "blob", // blob or base64
          100,
          80
        );

        // this is for image preview before upload, setState for imagePreviewUrl
        setTimeout(() => {
          Resizer.imageFileResizer(
            _fileObj, // file obj
            600, // New image max width (ratio is preserved)
            300, // New image max height (ratio is preserved)
            "png", // Can be either JPEG, PNG or WEBP.
            100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
            0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
            (uri) => {
              this.setState({ imagePreviewUrl: uri });
            },
            "base64"
          );
        }, 500);
      }
    }
  };

  removeSelectedFile = () => {
    this.clearImageStateObject();

    if (this.state.imageSelectOption === "1") {
      this.handleClickForLogoInput();
    }
  };

  removeSelectedFileAndCloseModal = () => {
    Utils.modalm().close();
    this.clearImageStateObject();

    if (this.state.imageSelectOption === "1") {
      this.handleClickForLogoInput();
    }
  };

  openCloseMapList = () => {
    document.querySelector(".map-list").classList.toggle("show");
  };

  selectMapFromList = (item) => {
    this.setState({
      selectedMindMapInfo: item,
    });
    document.querySelector(".map-list").classList.remove("show");
  };

  mapSearchfilterFunction = (mapItem) => {
    return (
      mapItem.name.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1
    );
  };

  onSearchInputChange = (e) => {
    this.setState({ search: e.target.value });
  };
  removeTag = (i) => {
    const newTags = [...this.state.tags];
    newTags.splice(i, 1);
    this.setState({ tags: newTags });
  };

  inputKeyDown = (e) => {
    const val = e.target.value;
    if (e.key === "Enter" && val) {
      if (
        this.state.tags.find((tag) => tag.toLowerCase() === val.toLowerCase())
      ) {
        return;
      }
      this.setState({ tags: [...this.state.tags, val] });
      this.tagInput.value = null;
    } else if (e.key === "Backspace" && !val) {
      this.removeTag(this.state.tags.length - 1);
    }
  };
  render() {
    const { tags } = this.state;
    return (
      <div className="overlay">
        <div className="popup share-modal">
          <div className="title">
            <span className="fa-stack fa-1x icon-wrap">
              <i className="fa fa-circle fa-stack-2x circle-icon"></i>
              <i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
            </span>
            <div className="text">
              {this.props.isUpdateProcess
                ? Resources.getValue("updateTemplateMsgTxt")
                : Resources.getValue("addTemplateMsgTxt")}
            </div>
          </div>
          <a className="close">&times;</a>
          <div className="select-shared">
            <ul>
              <li className="buttons shared-select">
                <div className="email-tab-contents">
                  <div className="email-box active">
                    <div className="shared-email none"></div>
                    <div className="popup-input cat-name-input">
                      <div className="input-select-wrapper">
                        <span className="current-category-name">
                          <b>
                            {Resources.getValue("categoryNameMsgTxt") + ":"}
                          </b>
                          &nbsp;
                          {localStorage.getItem("selectedTemplateName")}
                        </span>
                      </div>
                    </div>
                    <div className="popup-input cat-name-input">
                      {this.props.isUpdateProcess === true ? (
                        // guncelleme
                        <input
                          type="text"
                          id="share-email-input"
                          className="template-name"
                          maxLength={40}
                          onChange={(e) => this.addTemplateName(e)}
                          placeholder={Resources.getValue("templateNameMsgTxt")}
                          defaultValue={this.props.selectedTemplate.name}
                        />
                      ) : (
                        // ekleme
                        <input
                          type="text"
                          id="share-email-input"
                          className="template-name"
                          maxLength={40}
                          onChange={(e) => this.addTemplateName(e)}
                          placeholder={Resources.getValue("templateNameMsgTxt")}
                        />
                      )}
                    </div>
                    <div className="popup-input mind-map-select-wrapper">
                      <div className="input-select-wrapper">
                        <span
                          className={`selected-file-name ${
                            this.state.selectedMindMapInfo !== null
                              ? "file-name-exist"
                              : ""
                          }`}
                        >
                          <span>
                            {this.state.selectedMindMapInfo !== null
                              ? this.state.selectedMindMapInfo.name
                              : Resources.getValue("chooseMindMapMsgTxt")}
                          </span>
                          {this.state.selectedMindMapInfo ? (
                            <a
                              onClick={() => {
                                this.setState({
                                  selectedMindMapInfo: null,
                                });
                              }}
                            >
                              &times;
                            </a>
                          ) : (
                            ""
                          )}
                        </span>
                        <a
                          className="select-mind-map-btn"
                          onClick={() => {
                            this.openCloseMapList();
                          }}
                        >
                          {Resources.getValue("chooseMindMapMsgTxt")}
                          <i className="fa fa-chevron-down"></i>
                        </a>
                        <div className="map-list">
                          <div
                            className={`map-list--search ${
                              !this.props.displayedMindMaps.length && " none"
                            }`}
                          >
                            <input
                              type="text"
                              onChange={(e) => this.onSearchInputChange(e)}
                              placeholder={
                                Resources.getValue("searchMsgTxt") + ".."
                              }
                            />
                          </div>
                          <div className="map-list--items">
                            {this.props.displayedMindMaps.length ? (
                              <>
                                {this.props.displayedMindMaps
                                  .filter(this.mapSearchfilterFunction)
                                  .map((mapItem) => {
                                    return (
                                      <div
                                        className="map-list--item"
                                        key={mapItem.id}
                                        onClick={() => {
                                          MapService.getMapForContent(
                                            mapItem.id,
                                            this
                                          );

                                          this.selectMapFromList(mapItem);
                                        }}
                                      >
                                        <span className="map-name">
                                          {mapItem.name}
                                          <b>
                                            {mapItem.isSharedWithMe ? (
                                              <img
                                                src={iconShared}
                                                alt={Resources.getValue(
                                                  "sharedMapMsgTxt"
                                                )}
                                              />
                                            ) : (
                                              ""
                                            )}
                                          </b>
                                        </span>
                                        {mapItem.isSharedWithMe &&
                                        mapItem.sharedUserNameSurname ? (
                                          <span className="map-shared-user-name">
                                            (
                                            {mapItem.sharedUserNameSurname +
                                              Resources.getValue(
                                                "isSharedInfoMsgTxt"
                                              )}
                                            )
                                          </span>
                                        ) : (
                                          ""
                                        )}
                                        <span className="map-date">
                                          {mapItem.modifiedDate}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </>
                            ) : (
                              <div className="map-list--item">
                                <span className="map-name">
                                  <b>
                                    {Resources.getValue(
                                      "thereIsNoAnyMapMsgTxt"
                                    )}
                                  </b>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-radio">
                      <label className="form-radio-label-ask">
                        <span>{Resources.getValue("isDownloadMapMsgTxt")}</span>
                      </label>
                      <div className="radio-group">
                        <input
                          checked={this.state.isDownloadableValue === "true"}
                          className="form-radio-input active"
                          type="radio"
                          name="isDownloadableValue"
                          id="isDownloadable_yes"
                          value="true"
                          onChange={(e) =>
                            this.setState({
                              isDownloadableValue: e.currentTarget.value,
                            })
                          }
                        />
                        <label
                          className="form-radio-label"
                          htmlFor="isDownloadable_yes"
                        >
                          <span>{Resources.getValue("yesMsgTxt")}</span>
                        </label>
                        <input
                          checked={this.state.isDownloadableValue === "false"}
                          className="form-radio-input active"
                          type="radio"
                          name="isDownloadableValue"
                          id="isDownloadable_no"
                          value="false"
                          onChange={(e) =>
                            this.setState({
                              isDownloadableValue: e.currentTarget.value,
                            })
                          }
                        />
                        <label
                          className="form-radio-label"
                          htmlFor="isDownloadable_no"
                        >
                          <span>{Resources.getValue("noMsgTxt")}</span>
                        </label>
                      </div>
                    </div>
                    <div className="input-tag">
                      <ul className="input-tag__tags">
                        <li className="input-tag__tags__input">
                          <input
                            type="text"
                            onKeyDown={this.inputKeyDown}
                            ref={(c) => {
                              this.tagInput = c;
                            }}
                            placeholder={Resources.getValue(
                              "categoryTagsMsgTxt"
                            )}
                          />
                        </li>
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
                      </ul>
                    </div>
                    <div className="popup-input image-input">
                      <div className="input-select-wrapper">
                        <input
                          type="file"
                          id="coverImageInput"
                          name="coverImageInput"
                          className="file-input-custom width-0"
                          onChange={(e) => this.handleSelectCoverImage(e)}
                          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
                          placeholder={Resources.getValue(
                            "chooseCoverImageMsgTxt"
                          )}
                        />
                        <span
                          className={`selected-file-name ${
                            this.state.coverImageFile.file
                              ? "file-name-exist"
                              : ""
                          }`}
                        >
                          {this.state.coverImageFile.file ? (
                            <img src={imageIcon} alt="Icon" className="mr-2" />
                          ) : (
                            ""
                          )}
                          <span>
                            {this.state.coverImageFile.file
                              ? this.state.imagePreviewName
                              : Resources.getValue("chooseCoverImageMsgTxt")}
                          </span>
                          {this.state.coverImageFile.file ? (
                            <a onClick={() => this.removeSelectedFile()}>
                              &times;
                            </a>
                          ) : (
                            ""
                          )}
                        </span>
                        <select
                          name="sharePermission"
                          id="sharePermission"
                          defaultValue={"-1"}
                          onChange={(e) => {
                            this.onChangeImageSelectOption(e);
                          }}
                        >
                          <option value="-1">
                            {Resources.getValue("chooseCoverImageMsgTxt")}
                          </option>
                          <option value="1">
                            {Resources.getValue("uploadFromComputerMsgTxt")}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div
                      className={`popup-input image-preview ${
                        this.state.imagePreviewUrl ? "" : "none"
                      }`}
                    >
                      <ReactCrop
                        src={this.state.imagePreviewUrl}
                        crop={this.state.crop}
                        ruleOfThirds
                        onImageLoaded={this.onImageLoaded}
                        onComplete={this.onCropComplete}
                        onChange={this.onCropChange}
                      />
                      {this.state.croppedImageUrl && (
                        <div>
                          <div className="image-preview--title">
                            {Resources.getValue("previewImageMsgTxt")}
                          </div>
                          <img
                            style={{ maxWidth: "100%", height: "100px" }}
                            className="preview"
                            src={this.state.croppedImageUrl}
                            alt="Crop"
                          />
                        </div>
                      )}
                    </div>
                    {this.props.isUpdateProcess === true &&
                    !this.state.imagePreviewUrl ? (
                      <div className="popup-input selected-cover-image">
                        <img
                          src={this.props.selectedTemplate.image}
                          alt={this.props.selectedTemplate.name}
                        />
                      </div>
                    ) : null}
                    <div className="share-send-button">
                      <div className="right-button-wrap">
                        {}
                        {this.props.isUpdateProcess === false ? (
                          <button
                            className="yellow-button button submit-form-button float-right"
                            type="button"
                            title={Resources.getValue("saveSmallMsgTxt")}
                            data-submit-method="register"
                            onClick={this.addNewTemplateFunc}
                          >
                            {Resources.getValue("saveSmallMsgTxt")}
                          </button>
                        ) : (
                          <button
                            className="yellow-button button submit-form-button float-right"
                            type="button"
                            title={Resources.getValue("updateMsgTxt")}
                            data-submit-method="register"
                            onClick={this.updateTemplateFunc}
                          >
                            {Resources.getValue("updateMsgTxt")}
                          </button>
                        )}
                      </div>
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

export default AddTemplateModal;

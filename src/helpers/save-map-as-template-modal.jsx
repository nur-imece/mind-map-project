import React, { Component } from "react";
import Resources from "../libraries/resources";
import TemplateListService from "../services/api/template-list";
import Utils from "../libraries/utils";
import Resizer from 'react-image-file-resizer';
import * as htmlToImage from "html-to-image";
// image crop
import ReactCrop from 'react-image-crop';
import "react-image-crop/dist/ReactCrop.css";
// images
import imageIcon from "../styles/img/small-image-icon.png";

import templateCoverImageJSONData from '../libraries/templateDefaultCoverImageData.json';

class SaveMapAsTemplateModal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			search: '',
			categoryName: "",
			displayedCategories: [],
      selectedCategoryInfo: null,
      selectedImageObj: {
        name: ""
      },
			imageSelectOption: "1",
			imageSelectOptionText: Resources.getValue("uploadFromComputerMsgTxt"),
			isDownloadableValue: props.isUpdateProcess === true 
			? (props.selectedTemplate.isDownloadable === true ? "true" : "false") : "true",
			crop: {
				unit: "%",
				width: 30,
				aspect: 13 / 9
			},
      coverImageFile: {
				name: "",
				extension: "",
				type: "",
				referenceId: "",
				referenceIdType: 0,
				file: ""
      },
			imagePreviewUrl: "",
			imagePreviewName: "",
			tags: (props.selectedTemplate !== undefined && props.selectedTemplate.tags !== null)
			  ? props.selectedTemplate.tags : [],
		}
	}

	componentDidMount() {
		this.openModal();
		this.getTemplateList();
	}

	getTemplateList() {
    var recordSize = 100;
    var languageId = Resources.siteLanguage;
    TemplateListService.getTemplateList(recordSize, this.fillUserTemplatelist, languageId, [], this);
  };

  fillUserTemplatelist() {
    var _this = this;
    var userTemplatelist = JSON.parse(this.response).templateList;

    if(userTemplatelist) {
      _this.scope.setState({
        displayedCategories: JSON.parse(JSON.stringify(userTemplatelist))
      })
    }
  };

  mapHtmlToBlob() {
    var _this = this;
    document.querySelectorAll(".root > canvas").forEach(item => {
      item.style.zIndex = 0;
    });
    document.querySelectorAll(".item").forEach(item => {
      item.classList.remove('current');
    });

    document.querySelector('.download-options').classList.remove("show");

    setTimeout(() => {
      var projectName = localStorage.getItem("openedMapName") + ".jpg";
      var mapTransform = document.querySelector(".root").style.transform;
      document.querySelector(".toolbox").style.display = "none";
      document.querySelector(".zoom-in").style.display = "none";
      document.querySelector(".zoom-out").style.display = "none";
      document.querySelector(".zoom-ratio").style.display = "none";
      // document.querySelector("._hj_feedback_container").style.display = "none";
      document.querySelector(".item.root").classList.remove('current');
      // MM.App.map.center();
      Utils.loadingScreen("show");
      htmlToImage
        .toBlob(document.getElementById("port"))
        .then(function (blob) {
          // this is for image preview before upload, setState for imagePreviewUrl
          setTimeout(() => {
            Resizer.imageFileResizer(
              blob, // file obj
              410, // New image max width (ratio is preserved)
              300, // New image max height (ratio is preserved)
              'png', // Can be either JPEG, PNG or WEBP.
              100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
              0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
              uri => {
                _this.setState({ imagePreviewUrl: uri })
              },
              'base64'
            );
          }, 500);
          document.querySelector(".toolbox").style.display = "block";
          document.querySelector(".zoom-in").style.display = "inline-block";
          document.querySelector(".zoom-out").style.display = "inline-block";
          document.querySelector(".zoom-ratio").style.display = "inline-block";
          // document.querySelector("._hj_feedback_container").style.display = "block";
          document.querySelector(".root").style.transform = mapTransform;
          Utils.loadingScreen("hide");
          // MM.App.map.center();
          document.querySelector(".item.root").classList.add('current');
          document.querySelectorAll(".root > canvas").forEach(item => {
            item.style.zIndex = -15;
          });
        });
    }, 500);
  }

	onCropChange = (crop) => {
    this.setState({ crop })
  }

  onCropComplete = (crop) => {
		this.makeClientCrop(crop);
  }

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
          'png', // Can be either JPEG, PNG or WEBP.
          100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
          0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
          blob => { // blob or base64 url
            var optimizedFileObj = new File([blob], (new Date().getTime().toString()) + (Math.floor(Math.random() * 10000000000000000) + 1).toString(), { type: blob.type });
            // file read & tobase64 & setState
            var reader = new FileReader();
            reader.readAsDataURL(optimizedFileObj);
            reader.onload = () => {
              var image = reader.result.split(';base64,')[1];
              this.setState({
                coverImageFile: {
									name: optimizedFileObj.name,
									extension: 'png',
									type: optimizedFileObj.type,
									referenceId: "",
									referenceIdType: 0,
									file: image
                },
								imagePreviewName: this.state.selectedImageObj.name !== "" ? this.state.selectedImageObj.name : localStorage.getItem("openedMapName")
              });
            }
          },
          'blob', // blob or base64
					100,
					80
        );
      }, "image/png");
    });
  }

	openModal() {
		var _this = this;
		document.querySelector(".close").addEventListener("click", function () {
			_this.props.sharedClick(false);
		})
	}

	clearImageStateObject() {
		this.setState({
			coverImageFile: {
				name: "",
				extension: "",
				type: "",
				referenceId: "",
				referenceIdType: 0,
				file: ""
			},
			imagePreviewUrl: "",
			imagePreviewName: "",
			selectedImageObj: {
        name: ""
      },
		})
	}

	warningForMissingData() {
		Utils.modalm().open({
			exitButtonText: Resources.getValue("exitMsgTxt"),
			title: Resources.getValue("warningMsgTxt"),
			bodyContent: Resources.getValue("missingDataForSaveMapAsTemplateMsgTxt"),
			buttons: [
        {
					text: Resources.getValue("okMsgTxt"),
					class: 'button yellow-button confirm-button',
					href: ''
				},
			]
		});
	}

	saveMapAsTemplateFunc = () => {
		var _this = this;
		var templateName = document.querySelector(".template-name").value;

		if (templateName === "" || this.state.selectedCategoryInfo === null) {
			this.warningForMissingData();
		} else {
      var data = {
        mindMapId: localStorage.getItem("openedMapId"),
        name: templateName,
        parentTemplateId: this.state.selectedCategoryInfo.id,
        content:  localStorage.getItem("content"),
        languageId: Resources.siteLanguage,
        isActive: true,
		isDownloadable: this.state.isDownloadableValue === "true" ? true : false,
        companyId: JSON.parse(localStorage.getItem("userInformation")).companyId,
        fileRequest: (_this.state.coverImageFile.file !== "") 
                  ? _this.state.coverImageFile 
                  : JSON.parse(JSON.stringify(templateCoverImageJSONData)).templateDefaultCoverImages[0].coverImageFile,
				  tags: _this.state.tags
      };
			console.log(data.content);
			TemplateListService.addNewTemplate(JSON.stringify(data));
			_this.props.sharedClick(false);
			localStorage.setItem('isCustomModalOpen', false);
			document.querySelector(".template-name").value = "";
			this.clearImageStateObject();
		}
	};

  onChangeImageSelectOption(e) {
		var index = e.nativeEvent.target.selectedIndex;
		this.setState({
			imageSelectOption: e.target.value,
			imageSelectOptionText: e.nativeEvent.target[index].text
		});

		switch (e.target.value) {
			case '-1':
				document.querySelector('.file-input-custom').classList.add('width-0');
				break;
			case '1':
				document.querySelector('.file-input-custom').classList.remove('width-0');
				this.handleClickForLogoInput();
				break;
      case '2':
        document.querySelector('.file-input-custom').classList.remove('width-0');
        this.mapHtmlToBlob();
        break;
			default:
				break;
		}
	}

	addTemplateName(e) {
		var name = e.target.value;
		this.setState({
			templateName: name
		});
	}

  handleClickForLogoInput = () => {
    document.getElementById('coverImageInput').click();
  }

  handleSelectCoverImage = (e) => {
    const _fileObj = e.target.files[0];
		this.setState({
			selectedImageObj: _fileObj
		});
    const fileSizeLimit = 4194304; // byte for 4MB image file -- 5242880 KB for 5MB file
    if (e.target.files.length > 0) {
      if (_fileObj.size > fileSizeLimit) {
				Utils.modalm().open({
					exitButtonText: Resources.getValue("exitMsgTxt"),
					title: Resources.getValue("warningMsgTxt"),
					bodyContent: Resources.getValue("imageFileSizeMsgTxt").replace("*_*_*", fileSizeLimit),
					buttons: [
						{
							text: Resources.getValue("okMsgTxt"),
							class: 'button yellow-button confirm-button',
							href: ''
						},
					],
					confirmCallback: this.removeSelectedFileAndCloseModal
				});
      } else {
        Resizer.imageFileResizer(
          _fileObj, // file obj
          700, // New image max width (ratio is preserved)
          500, // New image max height (ratio is preserved)
          'png', // Can be either JPEG, PNG or WEBP.
          100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
          0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
          blob => { // blob or base64 url
            var optimizedFileObj = new File([blob], (new Date().getTime().toString()) + (Math.floor(Math.random() * 10000000000000000) + 1).toString(), { type: blob.type });
            // file read & tobase64 & setState
            var reader = new FileReader();
            reader.readAsDataURL(optimizedFileObj);
            reader.onload = () => {
              var image = reader.result.split(';base64,')[1];
              this.setState({
                coverImageFile: {
									name: optimizedFileObj.name,
									extension: 'png',
									type: optimizedFileObj.type,
									referenceId: "",
									referenceIdType: 0,
									file: image
                },
								imagePreviewName: _fileObj.name
              });
            }
          },
          'blob', // blob or base64
					100,
					80
        );

				// this is for image preview before upload, setState for imagePreviewUrl
				setTimeout(() => {
					Resizer.imageFileResizer(
						_fileObj, // file obj
						410, // New image max width (ratio is preserved)
						300, // New image max height (ratio is preserved)
						'png', // Can be either JPEG, PNG or WEBP.
						100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
						0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
						uri => {
							this.setState({ imagePreviewUrl: uri })
						},
						'base64'
					);
				}, 500);
      }
    }
  }

  removeSelectedFile = () => {
    this.clearImageStateObject();

		if(this.state.imageSelectOption === '1') {
			this.handleClickForLogoInput();
		}
  }

	removeSelectedFileAndCloseModal = () => {
		Utils.modalm().close();
    this.clearImageStateObject();

		if(this.state.imageSelectOption === '1') {
			this.handleClickForLogoInput();
		}
  }

  openCloseCategoryList = () => {
    document.querySelector('.category-list').classList.toggle('show');
  }

  selectCategoryFromList = (item) => {
    this.setState({
      selectedCategoryInfo: item
    });
		localStorage.setItem("selectedTemplateId", item.id);
    document.querySelector('.category-list').classList.remove('show')
  }

	categorySearchfilterFunction = (catItem) => {
		return catItem.name.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1
	}

	onSearchInputChange = (e) => {
		this.setState({ search: e.target.value })
	}
	removeTag = (i) => {
		const newTags = [ ...this.state.tags ];
		newTags.splice(i, 1);
		this.setState({ tags: newTags });
	  }
	
	  inputKeyDown = (e) => {
		const val = e.target.value;
		if (e.key === 'Enter' && val) {
		  if (this.state.tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
			return;
		  }
		  this.setState({ tags: [...this.state.tags, val]});
		  this.tagInput.value = null;
		} else if (e.key === 'Backspace' && !val) {
		  this.removeTag(this.state.tags.length - 1);
		}
	  }
	render() {
		const { tags } = this.state;
		return (
			<div className="overlay">
				<div className="popup save-as-template-modal">
					<div className="title">
						<span className="fa-stack fa-1x icon-wrap">
							<i className="fa fa-circle fa-stack-2x circle-icon"></i>
							<i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
						</span>
						<div className="text">
							{	Resources.getValue('saveMapAsTemplateMsgTxt')}
						</div>
					</div>
					<a className="close" >&times;</a>
					<div className="select-shared">
						<ul>
							<li className="buttons shared-select">
								<div className="email-tab-contents">
									<div className="email-box active">
										<div className="shared-email none">
										</div>
										<div className="popup-input map-info-input">
											<div className="input-select-wrapper">
                        <span className="current-map-name">
													<b>{Resources.getValue("mapNameMsgTxt") + ":"}</b>&nbsp;
													{localStorage.getItem("openedMapName")}
												</span>
											</div>
										</div>
										<div className="popup-input template-name-input">
                      <input type="text" id="share-email-input" className="template-name" maxLength={40}
                        onChange={(e) => this.addTemplateName(e)}
                        placeholder={Resources.getValue("templateNameMsgTxt")}
                      />
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
                          				 onChange={(e) => this.setState({ isDownloadableValue: e.currentTarget.value })}
                        				/>
										<label className="form-radio-label" htmlFor="isDownloadable_yes">
                         				<span>{Resources.getValue("yesMsgTxt")}</span>
                        				</label>
										<input
										checked={this.state.isDownloadableValue === "false"}
                          				className="form-radio-input active"
                          				type="radio"
                          				name="isDownloadableValue"
                          				id="isDownloadable_no"
                          				value="false"
                          				onChange={(e) =>  this.setState({ isDownloadableValue: e.currentTarget.value })}
                        				/>
										<label className="form-radio-label" htmlFor="isDownloadable_no">
                         				<span>{Resources.getValue("noMsgTxt")}</span>
                        				</label>
										</div>
                      					</div>
										<div className="input-tag">
        									<ul className="input-tag__tags">
											<li className="input-tag__tags__input">
			  										<input type="text" onKeyDown={this.inputKeyDown} ref={c => { this.tagInput = c; }} placeholder={Resources.getValue("categoryTagsMsgTxt")}/></li>
          										{ tags.map((tag, i) => (
            									<li key={tag}>
              										{tag}
              										<button type="button" onClick={() => { this.removeTag(i); }}>+</button>
            									</li>
          										))}
        									</ul>
      									</div>
                    <div className="popup-input category-input">
											<div className="input-select-wrapper">
												<span
                          className={`selected-file-name ${this.state.selectedCategoryInfo !== null ? 'file-name-exist' : ''}`}
                        >
                          <span>
														{
															(this.state.selectedCategoryInfo !== null) ?
															this.state.selectedCategoryInfo.name :
															Resources.getValue("chooseTemplateCategoryMsgTxt")
														}
													</span>
                          {this.state.selectedCategoryInfo ? (
                            <a onClick={() => {
                              this.setState({
                                selectedCategoryInfo: null
                              })
                            }}>&times;</a>
                          ) : ''}
                        </span>
                      	<a className="select-category-btn" onClick={() => {this.openCloseCategoryList()}}>
                          {Resources.getValue("chooseTemplateCategoryMsgTxt")}
                          <i className="fa fa-chevron-down"></i>
                        </a>
                        <div className="category-list">
													<div className={`category-list--search ${!this.state.displayedCategories.length && ' none'}`}>
														<input 
															type="text" 
															onChange={(e) => this.onSearchInputChange(e)} 
															placeholder={Resources.getValue("searchMsgTxt") + '..'} />
													</div>
													<div className="category-list--items">
														{this.state.displayedCategories.length ? (
															<>
																{this.state.displayedCategories.filter(this.categorySearchfilterFunction).map(item => {
																	return(
																		<div className="category-list--item" 
																			key={item.id} onClick={() => {this.selectCategoryFromList(item)}}
																		>
																			<span className="category-name">
																				{item.name}
																			</span>
																		</div>
																	)
																})}
															</>
														) : (
															<div className="category-list--item">
																<span className="category-name">
																	<b>
																		{Resources.getValue("thereIsNoAnyMapMsgTxt")}
																	</b>
																</span>
															</div>
														)}
													</div>
                        </div>
                      </div>
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
													placeholder={Resources.getValue("chooseCoverImageMsgTxt")}
												/>
                        <span
                          className={`selected-file-name ${this.state.coverImageFile.file ? 'file-name-exist' : ''}`}
                        >
                          {this.state.coverImageFile.file ? (
                            <img src={imageIcon} alt="Icon" className="mr-2" />
                          ) : ''}
                          <span>
														{
															this.state.coverImageFile.file ?
															this.state.imagePreviewName :
															Resources.getValue("chooseCoverImageMsgTxt")
														}
													</span>
                          {this.state.coverImageFile.file ? (
                            <a onClick={() => this.removeSelectedFile()}>&times;</a>
                          ) : ''}
                        </span>
												<select name="sharePermission" id="sharePermission" defaultValue={'-1'}
													onChange={(e) => { this.onChangeImageSelectOption(e) }}
                        >
                          <option value="-1">{Resources.getValue("chooseCoverImageMsgTxt")}</option>
                          <option value="1">{Resources.getValue("uploadFromComputerMsgTxt")}</option>
                          <option value="2">{Resources.getValue("getThisMapScreenshotMsgTxt")}</option>
												</select>
											</div>
										</div>
										<div className= {`popup-input image-preview ${this.state.imagePreviewUrl ? '' : 'none'}`}>
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
													<div className="image-preview--title">{Resources.getValue("previewImageMsgTxt")}</div>
													<img 
														style={{ maxWidth: "100%", height: "100px" }} 
														className="preview" 
														src={this.state.croppedImageUrl} 
														alt="Crop"
													/>
												</div>
											)}
										</div>
										<div className="share-send-button">
											<div className="right-button-wrap">
												<button
													className="yellow-button button submit-form-button float-right"
													type="button"
													title={Resources.getValue("saveSmallMsgTxt")}
													data-submit-method="register"
													onClick={this.saveMapAsTemplateFunc}
												>
													{Resources.getValue("saveSmallMsgTxt")}
												</button>
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

export default SaveMapAsTemplateModal;

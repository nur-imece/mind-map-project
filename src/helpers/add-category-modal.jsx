import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import TemplateListService from "../services/api/template-list";
import Utils from "../utils";
import Resizer from 'react-image-file-resizer';
// image crop
import ReactCrop from 'react-image-crop';
import "react-image-crop/dist/ReactCrop.css";
// images
import imageIcon from "../styles/img/small-image-icon.png";
import SampleCover1 from "../styles/img/sample-template-cover-1.png";
import SampleCover2 from "../styles/img/sample-template-cover-2.png";
import SampleCover3 from "../styles/img/sample-template-cover-3.png";
import SampleCover4 from "../styles/img/sample-template-cover-4.png";
import SampleCover5 from "../styles/img/sample-template-cover-5.png";
import SampleCover6 from "../styles/img/sample-template-cover-6.png";
import SampleCover7 from "../styles/img/sample-template-cover-7.png";
import SampleCover8 from "../styles/img/sample-template-cover-8.png";

import categoryCoverImageJSONData from '../libraries/templateCoverImageData.json';

const AddCategoryModal = ({ sharedClick, isUpdateProcess, selectedCategory, selectedCategoryName }) => {
	const { t, i18n } = useTranslation();
	const tagInput = useRef(null);
	const [imageRef, setImageRef] = useState(null);
	const [fileUrl, setFileUrl] = useState(null);
	const [selectedImageObj, setSelectedImageObj] = useState(null);
	
	const initialTags = (selectedCategory !== undefined && selectedCategory?.tags !== null)
		? selectedCategory.tags : [];
	
	const [state, setState] = useState({
		categoryName: "",
		imageSelectOption: "1",
		imageSelectOptionText: t("uploadFromComputerMsgTxt"),
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
		tags: initialTags,
		croppedImageUrl: null
	});

	useEffect(() => {
		const closeButton = document.querySelector(".close");
		if (closeButton) {
			closeButton.addEventListener("click", () => {
				sharedClick(false);
			});
		}
		
		return () => {
			if (closeButton) {
				closeButton.removeEventListener("click", () => {
					sharedClick(false);
				});
			}
		};
	}, [sharedClick]);

	const onCropChange = (crop) => {
		setState((prevState) => ({ ...prevState, crop }));
	};

	const onCropComplete = (crop) => {
		makeClientCrop(crop);
	};

	const onImageLoaded = (image) => {
		setImageRef(image);
	};

	const makeClientCrop = async (crop) => {
		if (imageRef && crop.width && crop.height) {
			const croppedImageUrl = await getCroppedImg(
				imageRef,
				crop,
				"newFile.jpeg"
			);
			setState(prevState => ({ ...prevState, croppedImageUrl }));
		}
	};

	const getCroppedImg = (image, crop, fileName) => {
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
					return;
				}
				blob.name = fileName;
				window.URL.revokeObjectURL(fileUrl);
				const newFileUrl = window.URL.createObjectURL(blob);
				setFileUrl(newFileUrl);
				resolve(newFileUrl);
				Resizer.imageFileResizer(
					blob, // file obj
					700, // New image max width (ratio is preserved)
					500, // New image max height (ratio is preserved)
					'png', // Can be either JPEG, PNG or WEBP.
					100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
					0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
					blob => { // blob or base64 url
						const optimizedFileObj = new File([blob], (new Date().getTime().toString()) + (Math.floor(Math.random() * 10000000000000000) + 1).toString(), { type: blob.type });
						// file read & tobase64 & setState
						const reader = new FileReader();
						reader.readAsDataURL(optimizedFileObj);
						reader.onload = () => {
							const image = reader.result.split(';base64,')[1];
							setState(prevState => ({
								...prevState,
								coverImageFile: {
									name: optimizedFileObj.name,
									extension: 'png',
									type: optimizedFileObj.type,
									referenceId: "",
									referenceIdType: 0,
									file: image
								},
								imagePreviewName: selectedImageObj?.name
							}));
						};
					},
					'blob', // blob or base64
					100,
					80
				);
			}, "image/png");
		});
	};

	const clearImageStateObject = () => {
		setState(prevState => ({
			...prevState,
			coverImageFile: {
				name: "",
				extension: "",
				type: "",
				referenceId: "",
				referenceIdType: 0,
				file: ""
			},
			imagePreviewUrl: "",
			imagePreviewName: ""
		}));
	};

	const warningForMissingData = () => {
		Utils.modalm().open({
			exitButtonText: t("exitMsgTxt"),
			title: t("warningMsgTxt"),
			bodyContent: t("missingDataForAddCategoryMsgTxt"),
			buttons: [
				{
					text: t("okMsgTxt"),
					class: 'button yellow-button confirm-button',
					href: ''
				},
			]
		});
	};

	// Create new category
	const addNewCategoryFunc = () => {
		const catName = document.querySelector(".category-name").value;
		const data = {
			name: catName,
			content: "",
			parentTemplateId: null,
			languageId: i18n.language,
			isActive: true,
			companyId: JSON.parse(localStorage.getItem("userInformation")).companyId,
			fileRequest: (state.coverImageFile.file !== "") ? state.coverImageFile : null,
			tags: state.tags
		};

		if (catName === "" || state.coverImageFile.file === "") {
			warningForMissingData();
		} else {
			TemplateListService.addNewTemplateCategory(JSON.stringify(data));
			sharedClick(false);
			localStorage.setItem('isCustomModalOpen', false);
			document.querySelector(".category-name").value = "";
			clearImageStateObject();
		}
	};

	// Update category
	const updateCategoryFunc = () => {
		const catName = document.querySelector(".category-name").value;
		const data = {
			id: selectedCategory.id,
			name: catName,
			content: "",
			parentTemplateId: null,
			languageId: i18n.language,
			isActive: true,
			companyId: JSON.parse(localStorage.getItem("userInformation")).companyId,
			fileRequest: (state.coverImageFile.file !== "") ? state.coverImageFile : null,
			tags: state.tags
		};

		TemplateListService.updateCategory(JSON.stringify(data));
		sharedClick(false);
		localStorage.setItem('isCustomModalOpen', false);
		document.querySelector(".category-name").value = "";
		clearImageStateObject();
	};

	const onChangeImageSelectOption = (e) => {
		const index = e.nativeEvent.target.selectedIndex;
		setState(prevState => ({
			...prevState,
			imageSelectOption: e.target.value,
			imageSelectOptionText: e.nativeEvent.target[index].text
		}));

		switch (e.target.value) {
			case '-1':
				document.querySelector('.file-input-custom').classList.add('width-0');
				clearImageStateObject();
				document.querySelectorAll('.image-wrap').forEach(node => {
					if(node.classList.contains('selected')) {
						node.classList.remove('selected');
					}
				});
				break;
			case '1':
				document.querySelector('.file-input-custom').classList.remove('width-0');
				handleClickForLogoInput();
				document.querySelectorAll('.image-wrap').forEach(node => {
					if(node.classList.contains('selected')) {
						node.classList.remove('selected');
					}
				});
				break;
			case '2':
				document.querySelector('.file-input-custom').classList.add('width-0');
				clearImageStateObject();
				document.querySelectorAll('.image-wrap').forEach(node => {
					if(node.classList.contains('selected')) {
						node.classList.remove('selected');
					}
				});
				break;
			default:
				break;
		}
	};

	const addCategoryName = (e) => {
		const name = e.target.value;
		setState(prevState => ({
			...prevState,
			categoryName: name
		}));
	};

	const handleClickForLogoInput = () => {
		document.getElementById('coverImageInput').click();
	};

	const handleSelectCoverImage = (e) => {
		const _fileObj = e.target.files[0];
		setSelectedImageObj(_fileObj);
		
		const fileSizeLimit = 4194304; // byte for 4MB image file -- 5242880 KB for 5MB file
		if (e.target.files.length > 0) {
			if (_fileObj.size > fileSizeLimit) {
				Utils.modalm().open({
					exitButtonText: t("exitMsgTxt"),
					title: t("warningMsgTxt"),
					bodyContent: t("imageFileSizeMsgTxt").replace("*_*_*", fileSizeLimit),
					buttons: [
						{
							text: t("okMsgTxt"),
							class: 'button yellow-button confirm-button',
							href: ''
						},
					],
					confirmCallback: removeSelectedFileAndCloseModal
				});
			} else {
				Resizer.imageFileResizer(
					_fileObj, // file obj
					600, // New image max width (ratio is preserved)
					500, // New image max height (ratio is preserved)
					'png', // Can be either JPEG, PNG or WEBP.
					100, // A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
					0, // Rotation to apply to the image. Rotation is limited to multiples of 90 degrees.(if no rotation is needed, just set it to 0) (0, 90, 180, 270, 360)
					blob => { // blob or base64 url
						const optimizedFileObj = new File([blob], (new Date().getTime().toString()) + (Math.floor(Math.random() * 10000000000000000) + 1).toString(), { type: blob.type });
						// file read & tobase64 & setState
						const reader = new FileReader();
						reader.readAsDataURL(optimizedFileObj);
						reader.onload = () => {
							const image = reader.result.split(';base64,')[1];
							setState(prevState => ({
								...prevState,
								coverImageFile: {
									name: optimizedFileObj.name,
									extension: 'png',
									type: optimizedFileObj.type,
									referenceId: "",
									referenceIdType: 0,
									file: image
								},
								imagePreviewName: _fileObj.name
							}));
						};
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
							setState(prevState => ({ ...prevState, imagePreviewUrl: uri }));
						},
						'base64'
					);
				}, 500);
			}
		}
	};

	const selectImageFromLibrary = (e) => {
		const defaultImages = JSON.parse(JSON.stringify(categoryCoverImageJSONData)).categoryDefaultCoverImages;
		defaultImages.forEach(imageObj => {
			if(imageObj.keyText === e.target.alt) {
				document.querySelectorAll('.image-wrap').forEach(node => {
					if(node.classList.contains('selected')) {
						node.classList.remove('selected');
					}
				});
				e.target.parentNode.classList.add('selected');
				setState(prevState => ({
					...prevState,
					coverImageFile: {
						name: imageObj.coverImageFile.name,
						extension: 'png',
						type: imageObj.coverImageFile.type,
						referenceId: "",
						referenceIdType: 0,
						file: imageObj.coverImageFile.file
					},
					imagePreviewName: imageObj.imagePreviewName
				}));
			}
		});
	};

	const removeSelectedFile = () => {
		clearImageStateObject();
		if(state.imageSelectOption === '1') {
			handleClickForLogoInput();
		}
	};

	const removeSelectedFileAndCloseModal = () => {
		Utils.modalm().close();
		clearImageStateObject();
		if(state.imageSelectOption === '1') {
			handleClickForLogoInput();
		}
	};

	const removeTag = (i) => {
		const newTags = [...state.tags];
		newTags.splice(i, 1);
		setState(prevState => ({ ...prevState, tags: newTags }));
	};

	const inputKeyDown = (e) => {
		const val = e.target.value;
		if (e.key === 'Enter' && val) {
			if (state.tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
				return;
			}
			setState(prevState => ({ ...prevState, tags: [...prevState.tags, val] }));
			tagInput.current.value = null;
		} else if (e.key === 'Backspace' && !val) {
			removeTag(state.tags.length - 1);
		}
	};

	return (
		<div className="overlay">
			<div className="popup share-modal">
				<div className="title">
					<span className="fa-stack fa-1x icon-wrap">
						<i className="fa fa-circle fa-stack-2x circle-icon"></i>
						<i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
					</span>
					<div className="text">
						{
							isUpdateProcess 
							? t('updateCategoryMapMsgTxt') 
							: t('addNewCategoryMapMsgTxt')
						}
					</div>
				</div>
				<a className="close">&times;</a>
				<div className="select-shared">
					<ul>
						<li className="buttons shared-select">
							<div className="email-tab-contents">
								<div className="email-box active">
									<div className="shared-email none">
									</div>
									<div className="popup-input cat-name-input">
										{isUpdateProcess === true ? (
											// update
											<input type="text" id="share-email-input" className="category-name" maxLength={40}
												onChange={(e) => addCategoryName(e)}
												placeholder={t("categoryNameMsgTxt")}
												defaultValue={selectedCategory.name}
											/>
										) : (
											// add new
											<input type="text" id="share-email-input" className="category-name" maxLength={40}
												onChange={(e) => addCategoryName(e)}
												placeholder={t("categoryNameMsgTxt")}
											/>
										)}
									</div>
									<div className="input-tag">
										<ul className="input-tag__tags">
											<li className="input-tag__tags__input">
												<input 
													type="text" 
													onKeyDown={inputKeyDown} 
													ref={tagInput} 
													placeholder={t("categoryTagsMsgTxt")}
												/>
											</li>
											{state.tags.map((tag, i) => (
												<li key={tag}>
													{tag}
													<button type="button" onClick={() => { removeTag(i); }}>+</button>
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
												onChange={(e) => handleSelectCoverImage(e)}
												accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
												placeholder={t("chooseCoverImageMsgTxt")}
											/>
											<span
												className={`selected-file-name ${state.coverImageFile.file ? 'file-name-exist' : ''}`}
											>
												{state.coverImageFile.file ? (
													<img src={imageIcon} alt="Icon" className="mr-2" />
												) : ''}
												<span>
													{
														state.coverImageFile.file ?
														state.imagePreviewName :
														t("chooseCoverImageMsgTxt")
													}
												</span>
												{state.coverImageFile.file ? (
													<a onClick={() => removeSelectedFile()}>&times;</a>
												) : ''}
											</span>
											<select 
												name="sharePermission" 
												id="sharePermission" 
												defaultValue={'-1'}
												onChange={(e) => { onChangeImageSelectOption(e) }}
											>
												<option value="-1">{t("chooseCoverImageMsgTxt")}</option>
												<option value="1">{t("uploadFromComputerMsgTxt")}</option>
												<option value="2">{t("uploadFromLibraryMsgTxt")}</option>
											</select>
										</div>
									</div>			
									<div
										className={`popup-input default-image-wrapper
										${(state.imageSelectOption === '1' || state.imageSelectOption === '-1') ? 'none' : ''}`}
									>
										<div className="image-wrap">
											<img src={SampleCover1} className="default-image" alt="SampleCover1" 
												onClick={(e) => selectImageFromLibrary(e)} 
											/>
										</div>
										<div className="image-wrap">
											<img src={SampleCover2} className="default-image" alt="SampleCover2" 
												onClick={(e) => selectImageFromLibrary(e)} 
											/>
										</div>
										<div className="image-wrap">
											<img src={SampleCover3} className="default-image" alt="SampleCover3" 
												onClick={(e) => selectImageFromLibrary(e)} 
											/>
										</div>
										<div className="image-wrap">
											<img src={SampleCover4} className="default-image" alt="SampleCover4" 
												onClick={(e) => selectImageFromLibrary(e)} 
											/>
										</div>
										<div className="image-wrap">
											<img src={SampleCover5} className="default-image" alt="SampleCover5" 
												onClick={(e) => selectImageFromLibrary(e)} 
											/>
										</div>
										<div className="image-wrap">
											<img src={SampleCover6} className="default-image" alt="SampleCover6" 
												onClick={(e) => selectImageFromLibrary(e)} 
											/>
										</div>
										<div className="image-wrap">
											<img src={SampleCover7} className="default-image" alt="SampleCover7" 
												onClick={(e) => selectImageFromLibrary(e)} 
											/>
										</div>
										<div className="image-wrap">
											<img src={SampleCover8} className="default-image" alt="SampleCover8" 
												onClick={(e) => selectImageFromLibrary(e)} 
											/>
										</div>
									</div>
									{/* Computer image selection - cropping */}
									<div className={`popup-input image-preview ${state.imagePreviewUrl ? '' : 'none'}`}>
										<ReactCrop
											src={state.imagePreviewUrl}
											crop={state.crop}
											ruleOfThirds
											onImageLoaded={onImageLoaded}
											onComplete={onCropComplete}
											onChange={onCropChange}
										/>
										{state.croppedImageUrl && (
											<div>
												<div className="image-preview--title">{t("previewImageMsgTxt")}</div>
												<img 
													style={{ maxWidth: "100%", height: "100px" }} 
													className="preview" 
													src={state.croppedImageUrl} 
													alt="Crop"
												/>
											</div>
										)}
									</div>
									{(isUpdateProcess === true && !state.imagePreviewUrl) ? (
										<div className="popup-input selected-cover-image">
											<img src={selectedCategory.image} alt={selectedCategory.name} />
										</div>
									) : null}
									<div className="share-send-button">
										<div className="right-button-wrap">
											{isUpdateProcess === false ? (
												<button
													className="yellow-button button submit-form-button float-right"
													type="button"
													title={t("saveSmallMsgTxt")}
													data-submit-method="register"
													onClick={addNewCategoryFunc}
												>
													{t("saveSmallMsgTxt")}
												</button>
											) : (
												<button
													className="yellow-button button submit-form-button float-right"
													type="button"
													title={t("updateMsgTxt")}
													data-submit-method="register"
													onClick={updateCategoryFunc}
												>
													{t("updateMsgTxt")}
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
};

export default AddCategoryModal;

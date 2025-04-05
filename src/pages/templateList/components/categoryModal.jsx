import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Input, Button, Select, message } from "antd";
import ReactCrop from 'react-image-crop';
import "react-image-crop/dist/ReactCrop.css";
import Resizer from 'react-image-file-resizer';
import templateService from "../../../services/api/template";
import { CloseOutlined } from '@ant-design/icons';

import imageIcon from "../../../styles/img/small-image-icon.png";
import SampleCover1 from "../../../styles/img/sample-template-cover-1.png";
import SampleCover2 from "../../../styles/img/sample-template-cover-2.png";
import SampleCover3 from "../../../styles/img/sample-template-cover-3.png";
import SampleCover4 from "../../../styles/img/sample-template-cover-4.png";
import SampleCover5 from "../../../styles/img/sample-template-cover-5.png";
import SampleCover6 from "../../../styles/img/sample-template-cover-6.png";
import SampleCover7 from "../../../styles/img/sample-template-cover-7.png";
import SampleCover8 from "../../../styles/img/sample-template-cover-8.png";

import categoryCoverImageJSONData from '../../../libraries/templateCoverImageData.json';
import './categoryModal.css';

const { Option } = Select;
const { TextArea } = Input;

const AddCategoryModal = ({ sharedClick, isUpdateProcess, selectedCategory, selectedCategoryName }) => {
    const { t, i18n } = useTranslation();
    const tagInput = useRef(null);
    const previewCanvasRef = useRef(null);
    const [imageRef, setImageRef] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [selectedImageObj, setSelectedImageObj] = useState(null);
    const [categoryName, setCategoryName] = useState(selectedCategoryName || "");

    const initialTags = selectedCategory && selectedCategory.tags ? selectedCategory.tags : [];

    const [tags, setTags] = useState(initialTags);
    const [imageSelectOption, setImageSelectOption] = useState("1");
    const [imageSelectOptionText, setImageSelectOptionText] = useState(t("uploadFromComputerMsgTxt"));
    const [crop, setCrop] = useState({
        unit: "%",
        width: 30,
        height: 30,
        x: 0,
        y: 0,
        aspect: 13 / 9
    });
    const [coverImageFile, setCoverImageFile] = useState({
        name: "",
        extension: "",
        type: "",
        referenceId: "",
        referenceIdType: 0,
        file: ""
    });
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [imagePreviewName, setImagePreviewName] = useState("");
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);

    const handleClose = () => {
        sharedClick(false);
    };

    const onCropChange = newCrop => {
        // Ensure all required crop values are defined to avoid undefined values
        const validCrop = {
            ...newCrop,
            unit: "%",
            x: typeof newCrop.x === 'number' ? newCrop.x : 0,
            y: typeof newCrop.y === 'number' ? newCrop.y : 0,
            width: typeof newCrop.width === 'number' ? newCrop.width : 30,
            height: typeof newCrop.height === 'number' ? newCrop.height : 30,
            aspect: 13 / 9
        };
        setCrop(validCrop);
    };

    const onCropComplete = (crop) => {
        if (imageRef && crop.width && crop.height) {
            const canvas = document.createElement('canvas');
            const scaleX = imageRef.naturalWidth / imageRef.width;
            const scaleY = imageRef.naturalHeight / imageRef.height;
            canvas.width = crop.width;
            canvas.height = crop.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                imageRef,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width,
                crop.height
            );

            // Convert canvas to blob then to base64
            canvas.toBlob(blob => {
                if (!blob) return;
                
                const croppedImageUrl = URL.createObjectURL(blob);
                setCroppedImageUrl(croppedImageUrl);
                
                // Process the image for the API
                Resizer.imageFileResizer(
                    blob,
                    700,
                    500,
                    'png',
                    100,
                    0,
                    blob => {
                        const optimizedFileObj = new File(
                            [blob],
                            Date.now().toString() + Math.floor(Math.random() * 10000000000000000).toString(),
                            { type: blob.type }
                        );

                        const reader = new FileReader();
                        reader.readAsDataURL(optimizedFileObj);
                        reader.onload = () => {
                            const image = reader.result.split(';base64,')[1];
                            setCoverImageFile({
                                name: optimizedFileObj.name,
                                extension: 'png',
                                type: blob.type || 'image/png',
                                referenceId: "",
                                referenceIdType: 0,
                                file: image
                            });
                            setImagePreviewName(selectedImageObj?.name || optimizedFileObj.name);
                        };
                    },
                    'blob',
                    100,
                    80
                );
            }, 'image/png');
        }
    };

    const onImageLoaded = image => {
        setImageRef(image);
        // Ensure crop is properly initialized with image dimensions
        if (image && !crop.width) {
            const aspectRatio = 13 / 9;
            const width = 30;
            const height = width / aspectRatio;
            setCrop({
                unit: "%",
                width,
                height,
                x: 0,
                y: 0,
                aspect: aspectRatio
            });
        }
        return false;
    };

    const clearImageStateObject = () => {
        setCoverImageFile({
            name: "",
            extension: "",
            type: "",
            referenceId: "",
            referenceIdType: 0,
            file: ""
        });
        setImagePreviewUrl("");
        setImagePreviewName("");
    };

    const warningForMissingData = () => {
        Modal.warning({
            title: t("warningMsgTxt"),
            content: t("missingDataForAddCategoryMsgTxt"),
            okText: t("okMsgTxt")
        });
    };

    // Create new category
    const addNewCategoryFunc = async () => {
        const data = {
            name: categoryName,
            content: "",
            parentTemplateId: null,
            languageId: i18n.language,
            isActive: true,
            companyId: JSON.parse(localStorage.getItem("userInformation")).companyId,
            fileRequest: (coverImageFile.file !== "") ? coverImageFile : null,
            tags: tags,
            isDownloadable: true
        };

        console.log("Preparing to create template with data:", JSON.stringify(data, null, 2));

        if (categoryName === "" || coverImageFile.file === "") {
            warningForMissingData();
        } else {
            try {
                // Validate the request data
                if (typeof data.languageId !== 'string') {
                    data.languageId = String(data.languageId);
                    console.log("Converted languageId to string:", data.languageId);
                }
                
                const response = await templateService.createTemplate(data);
                console.log("Template creation response:", response);
                message.success(t("templateCreatedSuccessfully"));
                localStorage.setItem('isCustomModalOpen', "false");
                clearImageStateObject();
                sharedClick(true);
            } catch (error) {
                console.error("Error creating template:", error);
                console.error("Request data that caused error:", JSON.stringify(data, null, 2));
                message.error(t("errorCreatingTemplate") + ": " + (error.message || "Unknown error"));
            }
        }
    };

    // Update category
    const updateCategoryFunc = async () => {
        if (!selectedCategory) {
            message.error(t("noCategorySelectedError"));
            return;
        }

        const data = {
            id: selectedCategory.id,
            name: categoryName,
            content: "",
            parentTemplateId: null,
            languageId: i18n.language,
            isActive: true,
            companyId: JSON.parse(localStorage.getItem("userInformation")).companyId,
            fileRequest: (coverImageFile.file !== "") ? coverImageFile : null,
            tags: tags,
            isDownloadable: true
        };
        
        console.log("Preparing to update template with data:", JSON.stringify(data, null, 2));
        
        try {
            // Validate the request data
            if (typeof data.languageId !== 'string') {
                data.languageId = String(data.languageId);
                console.log("Converted languageId to string:", data.languageId);
            }
            
            const response = await templateService.updateTemplate(data);
            console.log("Template update response:", response);
            message.success(t("templateUpdatedSuccessfully"));
            localStorage.setItem('isCustomModalOpen', "false");
            clearImageStateObject();
            sharedClick(true);
        } catch (error) {
            console.error("Error updating template:", error);
            console.error("Request data that caused error:", JSON.stringify(data, null, 2));
            message.error(t("errorUpdatingTemplate") + ": " + (error.message || "Unknown error"));
        }
    };

    const onChangeImageSelectOption = e => {
        const value = e;
        const optionText = value === "1" ? t("uploadFromComputerMsgTxt") : t("uploadFromLibraryMsgTxt");

        setImageSelectOption(value);
        setImageSelectOptionText(optionText);

        switch (value) {
            case '-1':
                document.querySelector('.file-input-custom')?.classList.add('width-0');
                clearImageStateObject();
                document.querySelectorAll('.image-wrap').forEach(node => {
                    if(node.classList.contains('selected')) {
                        node.classList.remove('selected');
                    }
                });
                break;
            case '1':
                document.querySelector('.file-input-custom')?.classList.remove('width-0');
                handleClickForLogoInput();
                document.querySelectorAll('.image-wrap').forEach(node => {
                    if(node.classList.contains('selected')) {
                        node.classList.remove('selected');
                    }
                });
                break;
            case '2':
                document.querySelector('.file-input-custom')?.classList.add('width-0');
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

    const handleClickForLogoInput = () => {
        document.getElementById('coverImageInput')?.click();
    };

    const handleSelectCoverImage = e => {
        const _fileObj = e.target.files[0];
        if (!_fileObj) return;

        setSelectedImageObj(_fileObj);
        const fileSizeLimit = 4194304; // byte for 4MB image file

        if (_fileObj.size > fileSizeLimit) {
            Modal.warning({
                title: t("warningMsgTxt"),
                content: t("imageFileSizeMsgTxt").replace("*_*_*", fileSizeLimit),
                onOk: removeSelectedFileAndCloseModal
            });
            return;
        }

        Resizer.imageFileResizer(
            _fileObj,
            600,
            500,
            'png',
            100,
            0,
            blob => {
                const optimizedFileObj = new File(
                    [blob],
                    Date.now().toString() + Math.floor(Math.random() * 10000000000000000).toString(),
                    { type: blob.type }
                );

                const reader = new FileReader();
                reader.readAsDataURL(optimizedFileObj);
                reader.onload = () => {
                    const image = reader.result.split(';base64,')[1];
                    setCoverImageFile({
                        name: optimizedFileObj.name,
                        extension: 'png',
                        type: _fileObj.type,
                        referenceId: "",
                        referenceIdType: 0,
                        file: image
                    });
                    setImagePreviewName(_fileObj.name);
                };
            },
            'blob',
            100,
            80
        );

        // Preview image
        setTimeout(() => {
            Resizer.imageFileResizer(
                _fileObj,
                410,
                300,
                'png',
                100,
                0,
                uri => setImagePreviewUrl(uri),
                'base64'
            );
        }, 500);
    };

    const selectImageFromLibrary = e => {
        const defaultImages = JSON.parse(JSON.stringify(categoryCoverImageJSONData)).categoryDefaultCoverImages;
        defaultImages.forEach(imageObj => {
            if(imageObj.keyText === e.target.alt) {
                document.querySelectorAll('.image-wrap').forEach(node => {
                    if(node.classList.contains('selected')) {
                        node.classList.remove('selected');
                    }
                });
                e.target.parentNode.classList.add('selected');
                setCoverImageFile({
                    name: imageObj.coverImageFile.name,
                    extension: 'png',
                    type: imageObj.coverImageFile.type,
                    referenceId: "",
                    referenceIdType: 0,
                    file: imageObj.coverImageFile.file
                });
                setImagePreviewName(imageObj.imagePreviewName);
            }
        });
    };

    const removeSelectedFile = () => {
        clearImageStateObject();

        if(imageSelectOption === '1') {
            handleClickForLogoInput();
        }
    };

    const removeSelectedFileAndCloseModal = () => {
        Modal.destroyAll();
        clearImageStateObject();

        if(imageSelectOption === '1') {
            handleClickForLogoInput();
        }
    };

    const removeTag = i => {
        const newTags = [...tags];
        newTags.splice(i, 1);
        setTags(newTags);
    };

    const inputKeyDown = e => {
        const val = e.target.value;
        if (e.key === 'Enter' && val) {
            e.preventDefault();
            if (tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
                return;
            }
            setTags([...tags, val]);
            e.target.value = '';
        } else if (e.key === 'Backspace' && !val) {
            removeTag(tags.length - 1);
        }
    };

    const getModalTitle = () => (
        <div className="title">
            <span className="icon-wrap">
                <i className="fa fa-external-link"></i>
            </span>
            <div className="text">
                {isUpdateProcess ? t('updateCategoryMapMsgTxt') : "Kategori Oluştur"}
            </div>
        </div>
    );

    return (
        <Modal
            title={getModalTitle()}
            open={true}
            closable={true}
            maskClosable={false}
            onCancel={handleClose}
            width={600}
            footer={null}
            centered
            destroyOnClose
            className="category-modal"
            style={{ top: 20 }}
        >
            <div className="select-shared">
                <div className="email-box active">
                    <div className="popup-input cat-name-input">
                        <Input
                            type="text"
                            className="category-name"
                            maxLength={40}
                            onChange={e => setCategoryName(e.target.value)}
                            placeholder="Kategori İsmi"
                            defaultValue={selectedCategoryName}
                        />
                    </div>
                    <div className="input-tag">
                        <ul className="input-tag__tags">
                            <li className="input-tag__tags__input">
                                <input
                                    type="text"
                                    onKeyDown={inputKeyDown}
                                    ref={tagInput}
                                    placeholder="Kategori Etiketi Ekle (Enter ile ekle)"
                                />
                            </li>
                            {tags.map((tag, i) => (
                                <li key={i} className="tag-item">
                                    {tag}
                                    <Button 
                                        type="text" 
                                        size="small" 
                                        className="tag-close-btn"
                                        onClick={() => removeTag(i)}
                                        icon={<CloseOutlined />} 
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="cover-photo-select-button">
                        <Select
                            defaultValue="-1"
                            onChange={onChangeImageSelectOption}
                            className="file-select-dropdown"
                            placeholder="Kapak Fotoğrafı Seç"
                        >
                            <Option value="-1">Kapak Fotoğrafı Seç</Option>
                            <Option value="1">Bilgisayardan Yükle</Option>
                            <Option value="2">Kütüphaneden Yükle</Option>
                        </Select>
                    </div>
                    
                    {imageSelectOption === '1' && (
                        <div className="popup-input image-input">
                            <input
                                type="file"
                                id="coverImageInput"
                                name="coverImageInput"
                                className="file-input-custom"
                                onChange={handleSelectCoverImage}
                                accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
                            />
                            {!coverImageFile.file && (
                                <Button
                                    className="upload-btn"
                                    onClick={handleClickForLogoInput}
                                >
                                    Dosya Seç
                                </Button>
                            )}
                            {coverImageFile.file && (
                                <div className="selected-file-name file-name-exist">
                                    <img src={imageIcon} alt="Icon" className="mr-2" />
                                    <span className="file-name">
                                        {imagePreviewName}
                                    </span>
                                    <Button 
                                        type="text" 
                                        size="small" 
                                        className="file-close-btn"
                                        onClick={removeSelectedFile}
                                        icon={<CloseOutlined />} 
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className={`popup-input default-image-wrapper ${imageSelectOption !== '2' ? 'none' : ''}`}>
                        <div className="image-wrap">
                            <img
                                src={SampleCover1}
                                className="default-image"
                                alt="SampleCover1"
                                onClick={selectImageFromLibrary}
                            />
                        </div>
                        <div className="image-wrap">
                            <img
                                src={SampleCover2}
                                className="default-image"
                                alt="SampleCover2"
                                onClick={selectImageFromLibrary}
                            />
                        </div>
                        <div className="image-wrap">
                            <img
                                src={SampleCover3}
                                className="default-image"
                                alt="SampleCover3"
                                onClick={selectImageFromLibrary}
                            />
                        </div>
                        <div className="image-wrap">
                            <img
                                src={SampleCover4}
                                className="default-image"
                                alt="SampleCover4"
                                onClick={selectImageFromLibrary}
                            />
                        </div>
                        <div className="image-wrap">
                            <img
                                src={SampleCover5}
                                className="default-image"
                                alt="SampleCover5"
                                onClick={selectImageFromLibrary}
                            />
                        </div>
                        <div className="image-wrap">
                            <img
                                src={SampleCover6}
                                className="default-image"
                                alt="SampleCover6"
                                onClick={selectImageFromLibrary}
                            />
                        </div>
                        <div className="image-wrap">
                            <img
                                src={SampleCover7}
                                className="default-image"
                                alt="SampleCover7"
                                onClick={selectImageFromLibrary}
                            />
                        </div>
                        <div className="image-wrap">
                            <img
                                src={SampleCover8}
                                className="default-image"
                                alt="SampleCover8"
                                onClick={selectImageFromLibrary}
                            />
                        </div>
                    </div>
                    <div className={`popup-input image-preview ${imagePreviewUrl ? '' : 'none'}`}>
                        {imagePreviewUrl && (
                            <div className="img-container">
                                <div className="image-preview--title">{t("previewImageMsgTxt")}</div>
                                <img 
                                    src={imagePreviewUrl}
                                    alt="Preview"
                                    style={{ maxWidth: "100%", height: "auto" }} 
                                    onLoad={(e) => {
                                        setImageRef(e.target);
                                        if (e.target) {
                                            const aspect = 13/9;
                                            const width = 30;
                                            const height = width / aspect;
                                            setCrop({
                                                unit: "%",
                                                width,
                                                height,
                                                x: 0,
                                                y: 0,
                                                aspect
                                            });
                                            // Call crop complete with initial crop
                                            onCropComplete({
                                                unit: "%", 
                                                width,
                                                height,
                                                x: 0,
                                                y: 0,
                                                aspect
                                            });
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    {croppedImageUrl && (
                        <div>
                            <div className="image-preview--title">{t("previewImageMsgTxt")}</div>
                            <img
                                style={{ maxWidth: "100%", height: "auto", margin: "10px 0", borderRadius: "4px" }}
                                className="preview"
                                src={croppedImageUrl}
                                alt="Crop"
                            />
                        </div>
                    )}
                    {(isUpdateProcess && !imagePreviewUrl && selectedCategory) ? (
                        <div className="popup-input selected-cover-image">
                            <img src={selectedCategory.image} alt={selectedCategory.name} />
                        </div>
                    ) : null}
                    <div className="share-send-button">
                        <div className="right-button-wrap">
                            {!isUpdateProcess ? (
                                <Button
                                    className="yellow-button button submit-form-button float-right"
                                    type="primary"
                                    size="large"
                                    onClick={addNewCategoryFunc}
                                >
                                    Kaydet
                                </Button>
                            ) : (
                                <Button
                                    className="yellow-button button submit-form-button float-right"
                                    type="primary"
                                    size="large"
                                    onClick={updateCategoryFunc}
                                >
                                    {t("updateMsgTxt")}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddCategoryModal;

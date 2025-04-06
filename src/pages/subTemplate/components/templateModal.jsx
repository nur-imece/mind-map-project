import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Input, Button, Select, message, Radio, Upload, Tag } from "antd";
import { UploadOutlined, CloseOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../context/languageContext";
import templateService from "../../../services/api/template";
import mindMapService from "../../../services/api/mindmap";
import "./templateModal.scss";

const { Option } = Select;

const TemplateModal = ({ sharedClick, isUpdateProcess, selectedTemplate, selectedTemplateName, displayedMindMaps }) => {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  
  // State variables
  const [templateName, setTemplateName] = useState(isUpdateProcess && selectedTemplate ? selectedTemplate.name : "");
  const [selectedMindMap, setSelectedMindMap] = useState(null);
  const [selectedMindMapContent, setSelectedMindMapContent] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(localStorage.getItem("selectedTemplateId") || null);
  const [isDescriptionEnabled, setIsDescriptionEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [tags, setTags] = useState(isUpdateProcess && selectedTemplate?.tags ? selectedTemplate.tags : []);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingMindMap, setIsLoadingMindMap] = useState(false);
  
  useEffect(() => {
    if (selectedTemplate && isUpdateProcess) {
      // Additional setup if needed when template is selected for editing
    }
  }, [selectedTemplate, isUpdateProcess]);

  const handleClose = () => {
    sharedClick(false);
  };

  const handleMindMapChange = async (value) => {
    setSelectedMindMap(value);
    setIsLoadingMindMap(true);
    try {
      // Fetch the latest mind map content directly from API
      const response = await mindMapService.getMindMapById(value);
      if (response.data && response.data.mindMap) {
        setSelectedMindMapContent(response.data.mindMap.content);
      } else {
        message.error(t("errorFetchingMindMapContentMsgTxt"));
      }
    } catch (error) {
      console.error("Error fetching mind map content:", error);
      message.error(t("errorFetchingMindMapContentMsgTxt"));
    } finally {
      setIsLoadingMindMap(false);
    }
  };

  const handleTemplateNameChange = (e) => {
    setTemplateName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setIsDescriptionEnabled(e.target.value);
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      setIsUploading(true);
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: reader.result,
            base64: base64,
            type: file.type,
            extension: file.name.split('.').pop()
          }
        ]);
        setIsUploading(false);
        onSuccess();
      };
      reader.onerror = (error) => {
        setIsUploading(false);
        onError(error);
      };
    } catch (error) {
      setIsUploading(false);
      onError(error);
    }
  };

  const handleRemoveFile = () => {
    setFileList([]);
  };

  // Tag management
  const handleTagClose = (removedTag) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const saveTemplate = async () => {
    if (!templateName) {
      message.error(t("pleaseEnterTemplateNameMsgTxt"));
      return;
    }

    if (!selectedMindMap) {
      message.error(t("pleaseSelectMindMapMsgTxt"));
      return;
    }

    if (fileList.length === 0) {
      message.error(t("pleaseUploadImageMsgTxt"));
      return;
    }

    if (!selectedMindMapContent) {
      message.error(t("noMindMapContentMsgTxt"));
      return;
    }

    try {
      const fileRequest = {
        name: fileList[0].name,
        extension: fileList[0].extension,
        type: fileList[0].type,
        referenceId: "",
        referenceIdType: 0,
        file: fileList[0].base64
      };

      const payload = {
        mindMapId: selectedMindMap,
        name: templateName,
        parentTemplateId: parseInt(selectedCategoryId),
        companyId: JSON.parse(localStorage.getItem("userInformation")).companyId,
        content: selectedMindMapContent,
        isActive: true,
        isDownloadable: true,
        languageId: selectedLanguage,
        tags: tags,
        fileRequest: fileRequest
      };

      // Show a loading message
      const loadingMessage = message.loading(t("savingTemplateMsgTxt"), 0);
      
      try {
        const result = await mindMapService.saveAsTemplate(payload);
        
        // Hide loading message
        loadingMessage();
        
        if (result && result.data) {
          message.success(t("templateCreatedSuccessfully"));
          sharedClick(false);
          
          // Call parent's refresh function instead of reloading the page
          if (typeof window.getSubTemplateList === 'function') {
            window.getSubTemplateList();
          } else {
            // Fallback if global function isn't available
            window.dispatchEvent(new Event('refreshTemplateList'));
          }
        } else {
          message.error(t("errorMsgTxt"));
        }
      } catch (error) {
        // Hide loading message in case of error
        loadingMessage();
        console.error("Error saving template:", error);
        message.error(t("errorMsgTxt"));
      }
    } catch (error) {
      console.error("Error preparing template data:", error);
      message.error(t("errorMsgTxt"));
    }
  };

  const updateTemplate = async () => {
    if (!templateName) {
      message.error(t("pleaseEnterTemplateNameMsgTxt"));
      return;
    }

    if (fileList.length === 0 && !selectedTemplate?.image) {
      message.error(t("pleaseUploadImageMsgTxt"));
      return;
    }

    try {
      const fileRequest = fileList.length > 0 ? {
        name: fileList[0].name,
        extension: fileList[0].extension,
        type: fileList[0].type,
        referenceId: "",
        referenceIdType: 0,
        file: fileList[0].base64
      } : null;

      const payload = {
        id: selectedTemplate.id,
        name: templateName,
        parentTemplateId: parseInt(selectedCategoryId),
        companyId: JSON.parse(localStorage.getItem("userInformation")).companyId,
        content: selectedTemplate.content,
        isActive: true,
        isDownloadable: true,
        languageId: selectedLanguage,
        tags: tags,
        fileRequest: fileRequest
      };

      // Show a loading message
      const loadingMessage = message.loading(t("updatingTemplateMsgTxt"), 0);
      
      try {
        const result = await templateService.updateTemplate(payload);
        
        // Hide loading message
        loadingMessage();
        
        if (result && result.data) {
          message.success(t("templateUpdatedSuccessfully"));
          sharedClick(false);
          
          // Call parent's refresh function instead of reloading the page
          if (typeof window.getSubTemplateList === 'function') {
            window.getSubTemplateList();
          } else {
            // Fallback if global function isn't available
            window.dispatchEvent(new Event('refreshTemplateList'));
          }
        } else {
          message.error(t("errorMsgTxt"));
        }
      } catch (error) {
        // Hide loading message in case of error
        loadingMessage();
        console.error("Error updating template:", error);
        message.error(t("errorMsgTxt"));
      }
    } catch (error) {
      console.error("Error preparing template data:", error);
      message.error(t("errorMsgTxt"));
    }
  };

  return (
    <Modal
      title={isUpdateProcess ? t("editTemplateMsgTxt") : t("createTemplateMsgTxt")}
      open={true}
      onCancel={handleClose}
      footer={null}
      centered
      width={500}
      className="template-modal"
      destroyOnClose
    >
      <div className="template-modal__content">
        <div className="template-modal__category-info">
          <span className="template-modal__category-label">{t("categoryNameMsgTxt")}: </span>
          <span className="template-modal__category-value">{selectedTemplateName || localStorage.getItem("selectedTemplateName")}</span>
        </div>

        <div className="template-modal__form-item">
          <label className="template-modal__label">{t("templateNameMsgTxt")}</label>
          <Input 
            value={templateName}
            onChange={handleTemplateNameChange}
            placeholder={t("enterTemplateNameMsgTxt")}
            className="template-modal__input"
            autoFocus
          />
        </div>

        <div className="template-modal__form-item">
          <label className="template-modal__label">{t("chooseZihinHaritasiMsgTxt")}</label>
          <Select
            placeholder={t("selectMindMapMsgTxt")}
            onChange={handleMindMapChange}
            disabled={isUpdateProcess || isLoadingMindMap}
            loading={isLoadingMindMap}
            className="template-modal__select"
          >
            {displayedMindMaps.map(map => (
              <Option key={map.id} value={map.id}>
                {map.name} ({map.modifiedDate})
              </Option>
            ))}
          </Select>
        </div>
        
        <div className="template-modal__form-item">
          <label className="template-modal__label">{t("isTemplateDescriptionShownMsgTxt")}</label>
          <Radio.Group onChange={handleDescriptionChange} value={isDescriptionEnabled} className="template-modal__radio-group">
            <Radio value={true}>{t("yesMsgTxt")}</Radio>
            <Radio value={false}>{t("noMsgTxt")}</Radio>
          </Radio.Group>
        </div>

        <div className="template-modal__form-item">
          <label className="template-modal__label">{t("categoryTagsMsgTxt")}</label>
          <div className="template-modal__tag-container">
            <div className="template-modal__tag-input-wrapper">
              <SearchOutlined className="template-modal__search-icon" />
              <Input
                className="template-modal__tag-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder={t("newTagMsgTxt")}
                bordered={false}
              />
              {tags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleTagClose(tag)}
                  className="template-modal__tag"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="template-modal__form-item">
          <label className="template-modal__label">{t("coverImageMsgTxt")}</label>
          <Upload
            customRequest={customRequest}
            fileList={fileList}
            onRemove={handleRemoveFile}
            accept="image/*"
            maxCount={1}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            disabled={isUploading}
            className="template-modal__upload"
          >
            {fileList.length === 0 && (
              <Button 
                icon={<UploadOutlined />} 
                loading={isUploading}
                className="template-modal__upload-btn"
                size="small"
              >
                {t("selectImageMsgTxt")}
              </Button>
            )}
          </Upload>
          {selectedTemplate?.image && fileList.length === 0 && (
            <div className="template-modal__current-image">
              <img src={selectedTemplate.image} alt={selectedTemplate.name} className="template-modal__preview-img" />
            </div>
          )}
        </div>

        <div className="template-modal__actions">
          <Button onClick={handleClose} className="template-modal__cancel-btn">
            {t("cancelMsgTxt")}
          </Button>
          <Button
            type="primary"
            onClick={isUpdateProcess ? updateTemplate : saveTemplate}
            className="template-modal__save-btn"
            loading={isUploading}
          >
            {isUpdateProcess ? t("updateMsgTxt") : t("saveMsgTxt")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateModal; 
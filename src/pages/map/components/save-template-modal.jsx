import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select, message, Radio, Upload, Tag } from 'antd';
import { UploadOutlined, CloseOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';
import mindMapService from '../../../services/api/mindmap';
import templateService from '../../../services/api/template';
import './save-template-modal.css';

const { Option } = Select;

const SaveTemplateModal = ({ visible, onClose, mapData }) => {
  const { t } = useTranslation();

  // State variables
  const [templateName, setTemplateName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDescriptionEnabled, setIsDescriptionEnabled] = useState(true);

  // Fetch template categories on mount
  useEffect(() => {
    fetchTemplateCategories();
  }, []);

  const fetchTemplateCategories = async () => {
    setLoading(true);
    try {
      const languageId = localStorage.getItem('i18nextLng') || 'tr';
      const userInfo = JSON.parse(localStorage.getItem("userInformation") || "{}");
      const companyId = userInfo.companyId || '';

      const response = await templateService.getTemplateList(100, languageId, null, null, null);

      if (response.data && response.data.templateList) {
        setTemplates(response.data.templateList);
      } else {
        message.error("Şablon kategorileri yüklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error fetching template categories:", error);
      message.error("Şablon kategorileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateNameChange = (e) => {
    setTemplateName(e.target.value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategoryId(value);
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

  const saveAsTemplate = async () => {
    if (!templateName) {
      message.error("Lütfen şablon adı girin");
      return;
    }

    if (!selectedCategoryId) {
      message.error("Lütfen kategori seçin");
      return;
    }

    if (fileList.length === 0) {
      message.error("Lütfen kapak resmi yükleyin");
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

      const userInfo = JSON.parse(localStorage.getItem("userInformation") || "{}");
      const languageId = localStorage.getItem('i18nextLng') || 'tr';
      
      console.log("mapData", mapData);
      
      // mapData'nın kendisi content olduğu için JSON'a dönüştürüyoruz
      const content = JSON.stringify(mapData);

      const payload = {
        mindMapId: mapData.id,
        name: templateName,
        parentTemplateId: parseInt(selectedCategoryId),
        companyId: userInfo.companyId || 12,
        content: content,
        isActive: true,
        isDownloadable: true,
        languageId: languageId,
        tags: tags,
        fileRequest: fileRequest
      };

      // Show a loading message
      const loadingMessage = message.loading("Şablon kaydediliyor...", 0);

      try {
        console.log("Sending template payload:", payload);
        const result = await mindMapService.saveAsTemplate(payload);

        // Hide loading message
        loadingMessage();

        if (result && result.data) {
          message.success("Şablon başarıyla oluşturuldu");
          onClose();
        } else {
          message.error("Şablon kaydedilirken bir hata oluştu");
        }
      } catch (error) {
        // Hide loading message in case of error
        loadingMessage();
        console.error("Error saving template:", error);
        message.error("Şablon kaydedilirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error preparing template data:", error);
      message.error("Şablon verisi hazırlanırken bir hata oluştu");
    }
  };

  return (
      <Modal
          title="Haritayı Şablon Olarak Kaydet"
          open={visible}
          onCancel={onClose}
          footer={null}
          centered
          width={500}
          destroyOnClose
      >
        <div className="template-modal__content">
          <div className="template-modal__form-item">
            <label className="template-modal__label">Şablon Adı</label>
            <Input
                value={templateName}
                onChange={handleTemplateNameChange}
                placeholder="Şablon adı girin"
                className="template-modal__input"
                autoFocus
            />
          </div>

          <div className="template-modal__form-item">
            <label className="template-modal__label">Kategori Seç</label>
            <Select
                placeholder="Kategori seçin"
                onChange={handleCategoryChange}
                loading={loading}
                className="template-modal__select"
            >
              {templates.map(template => (
                  <Option key={template.id} value={template.id}>
                    {template.name}
                  </Option>
              ))}
            </Select>
          </div>

          <div className="template-modal__form-item">
            <label className="template-modal__label">Şablon açıklaması gösterilsin mi?</label>
            <Radio.Group onChange={handleDescriptionChange} value={isDescriptionEnabled} className="template-modal__radio-group">
              <Radio value={true}>Evet</Radio>
              <Radio value={false}>Hayır</Radio>
            </Radio.Group>
          </div>

          <div className="template-modal__form-item">
            <label className="template-modal__label">Etiketler</label>
            <div className="template-modal__tag-container">
              <div className="template-modal__tag-input-wrapper">
                <SearchOutlined className="template-modal__search-icon" />
                <Input
                    className="template-modal__tag-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Yeni etiket"
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
            <label className="template-modal__label">Kapak Resmi</label>
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
                    Resim Seç
                  </Button>
              )}
            </Upload>
          </div>

          <div className="template-modal__actions">
            <Button onClick={onClose} className="template-modal__cancel-btn">
              İptal
            </Button>
            <Button
                type="primary"
                onClick={saveAsTemplate}
                className="template-modal__save-btn"
                loading={isUploading}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </Modal>
  );
};

export default SaveTemplateModal;
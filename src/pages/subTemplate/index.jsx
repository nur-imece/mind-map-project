import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, message, Input, Row, Col, Card, Button, Tag } from "antd";
import Header from "../../components/header";
import SubHeader from "../../components/subHeader";
import templateService from "../../services/api/template";
import mindMapService from "../../services/api/mindmap";
import Utils from "../../utils";
import MapService from "../../services/api/mindmap";
import TemplateModal from "./components/templateModal";
import ModalImage from "react-modal-image";
import { SearchOutlined, ZoomInOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useLanguage } from "../../context/languageContext";
import request from "../../services/api/request";
import { PATHS } from "../../services/api/paths";
import "./index.scss";

// images
import blankTemplateLogo from "../../styles/img/plus-icon.png";
import moreOptionsIcon from "../../styles/img/more-options-icon.png";
import zoomPlusIcon from "../../styles/img/zoom_in-24px.png";
import mindMapIcon from "../../icons/mindMaps.svg";

const SubTemplateList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedLanguage } = useLanguage();
    
    const [myMindMaps, setMyMindMaps] = useState([]);
    const [sharedMindMaps, setSharedMindMaps] = useState([]);
    const [subTemplateData, setSubTemplateData] = useState([]);
    const [selectedTemplateName, setSelectedTemplateName] = useState(localStorage.getItem("selectedTemplateName"));
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isUpdateProcess, setIsUpdateProcess] = useState(false);
    const [isUserHasPermissionForOptions, setIsUserHasPermissionForOptions] = useState(false);
    const [isTeacherUserHasPermissionForOptions, setIsTeacherUserHasPermissionForOptions] = useState(false);
    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    
    useEffect(() => {
        localStorage.removeItem("deletedTemplateId");
        localStorage.removeItem("isCustomModalOpen");
        localStorage.setItem("retrieveUrl", window.location.pathname);
        
        document.title = "Foramind | " + t("mindMapMsgTxt");
        getSubTemplateList();
        getMyMindMaps();
        getMySharedMindMaps();

        // if category id is not exist, go to category page
        if (localStorage.getItem("selectedTemplateId") === null) {
            navigate("/template-list");
        }

        // Check user role for edit/delete permission
        if (localStorage.getItem("userRoleIdList")) {
            JSON.parse(localStorage.getItem("userRoleIdList")).forEach((role) => {
                if (role === 3 || role === 1) {
                    // superadmin or institution admin
                    setIsUserHasPermissionForOptions(true);
                    setIsTeacherUserHasPermissionForOptions(false);
                } else if (role === 4) {
                    // teacher role
                    setIsUserHasPermissionForOptions(false);
                    setIsTeacherUserHasPermissionForOptions(true);
                } else {
                    setIsUserHasPermissionForOptions(false);
                    setIsTeacherUserHasPermissionForOptions(false);
                }
            });
        }
    }, [navigate, t]);

    // Parse URL for tags when component mounts
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tagParams = searchParams.getAll('name');
        if (tagParams.length > 0) {
            setTags(tagParams);
        }
    }, [location.search]);

    // Update URL when tags change
    useEffect(() => {
        const params = new URLSearchParams();
        const recordSize = 1000;
        const languageId = selectedLanguage === "tr" ? "tr" : "en";
        const templateId = localStorage.getItem("selectedTemplateId");
        
        if (!templateId) return;
        
        params.append('templateId', templateId);
        params.append('recordSize', recordSize);
        params.append('languageId', languageId);
        
        tags.forEach(tag => {
            params.append('name', tag);
        });
        
        const newSearch = params.toString();
        const newUrl = `${location.pathname}?${newSearch}`;
        
        // Use replace state to avoid adding to browser history
        window.history.replaceState(null, '', newUrl);
    }, [tags, selectedLanguage]);

    const getSubTemplateList = async () => {
        try {
            const recordSize = 1000;
            const languageId = selectedLanguage === "tr" ? "tr" : "en";
            const templateId = localStorage.getItem("selectedTemplateId");
            
            if (!templateId) {
                message.error(t("noCategorySelectedError"));
                return;
            }
            
            // Create URL with all required parameters
            // Format: api/Template/GetSubTemplateList?templateId=170&recordSize=1000&languageId=tr
            let url = `${PATHS.TEMPLATE.GET_SUB_TEMPLATE_LIST}?templateId=${templateId}&recordSize=${recordSize}&languageId=${languageId}`;
            
            // Add search tags if they exist
            tags.forEach(tag => {
                url += `&name=${encodeURIComponent(tag)}`;
            });
            
            const response = await request.get(url);
            
            if (response.data?.templateList) {
                setSubTemplateData(response.data.templateList);
            }
        } catch (error) {
            console.error("Error fetching sub templates:", error);
            message.error(t("errorMsgTxt"));
        }
    };

    // Refresh template list when search tags or language changes
    useEffect(() => {
        getSubTemplateList();
    }, [tags, selectedLanguage]);

    // Add event listener to refresh template list
    useEffect(() => {
        // Make getSubTemplateList available globally for the modal component
        window.getSubTemplateList = getSubTemplateList;
        
        // Add event listener for refreshing template list
        const handleRefreshTemplateList = () => {
            getSubTemplateList();
        };
        
        window.addEventListener('refreshTemplateList', handleRefreshTemplateList);
        
        // Clean up
        return () => {
            delete window.getSubTemplateList;
            window.removeEventListener('refreshTemplateList', handleRefreshTemplateList);
        };
    }, []);

    const sharedClick = (isOpen) => {
        setIsTemplateModalOpen(isOpen);
        setIsUpdateProcess(isOpen);
    };

    // get all my mind map data
    const getMyMindMaps = async () => {
        try {
            const recordSize = 1000;
            const userId = JSON.parse(localStorage.getItem("userInformation"))?.id;
            
            if (!userId) return;
            
            const response = await mindMapService.getMindMapListByUserId(recordSize);
            
            if (response.data?.mindMap) {
                const mindMaps = response.data.mindMap.map(map => ({
                    ...map,
                    modifiedDate: map.modifiedDate ? Utils.formatDateWithMonthName(map.modifiedDate) : "",
                    creationDate: map.creationDate ? Utils.formatDateWithMonthName(map.creationDate) : ""
                }));
                
                setMyMindMaps(mindMaps);
            }
        } catch (error) {
            console.error("Error fetching mind maps:", error);
        }
    };

    // get all shared with me mind map data
    const getMySharedMindMaps = async () => {
        try {
            const recordSize = 1000;
            const userId = JSON.parse(localStorage.getItem("userInformation"))?.id;
            
            if (!userId) return;
            
            const response = await mindMapService.sharedWithMeMindList(userId, recordSize);
            
            if (response.data?.mindMap) {
                const mindMaps = response.data.mindMap.map(map => ({
                    ...map,
                    modifiedDate: map.modifiedDate ? Utils.formatDateWithMonthName(map.modifiedDate) : "",
                    creationDate: map.creationDate ? Utils.formatDateWithMonthName(map.creationDate) : ""
                }));
                
                setSharedMindMaps(mindMaps);
            }
        } catch (error) {
            console.error("Error fetching shared mind maps:", error);
        }
    };

    const createMapWithTemplateEvent = (id, content, name) => {
        try {
            localStorage.setItem("mapPermission", "1");
            localStorage.removeItem("openedMapName");
            localStorage.removeItem("openedMapId");
            localStorage.setItem("mapTemplate", content);
            
            // Parse the content to extract backgroundName
            const parsedContent = JSON.parse(content);
            const backgroundName = parsedContent.backgroundName || "";
            
            // Create the payload for the API
            const payload = {
                name: name,
                content: content,
                backgroundName: backgroundName,
                templateId: id,
                isPublic: false,
                isDownloadable: true,
                isCopiable: true,
                isShareable: true,
                languageId: 1,
                mapPermissionId: 1
            };
            
            // Call the createMindMap API directly
            mindMapService.createMindMap(payload)
                .then(response => {
                    if (response.data) {
                        message.success(t("mindMapCreatedSuccessfully"));
                        // Navigate to the map detail page with the mapId parameter
                        navigate(`/map?mapId=${response.data.mindMap.id}`);
                    }
                })
                .catch(error => {
                    console.error("Error creating mind map:", error);
                    message.error(t("errorMsgTxt"));
                });
        } catch (error) {
            console.error("Error parsing content:", error);
            message.error(t("errorMsgTxt"));
        }
    };

    const deleteTemplate = async () => {
        Modal.destroyAll();
        try {
            const templateId = JSON.parse(localStorage.getItem("deletedTemplateId"));
            const response = await templateService.deleteTemplate(templateId);
            
            if (response.data) {
                getSubTemplateList();
                message.success(t("deleteSuccessMsgTxt"));
            }
        } catch (error) {
            message.error(t("errorMsgTxt"));
        }
    };

    const deleteTemplateWarning = (id, name) => {
        localStorage.setItem("deletedTemplateId", id);
        
        Modal.confirm({
            title: t("warningMsgTxt"),
            content: (
                <div>
                    <b>{name}</b>: {t("templateWillRemoveAreYouSureMsgTxt")}
                </div>
            ),
            onOk: deleteTemplate,
            okText: t("yesMsgTxt"),
            cancelText: t("noMsgTxt"),
            okButtonProps: { className: "button yellow-button confirm-button" },
            cancelButtonProps: { className: "button fresh-button reject-button" },
        });
    };

    // Tag management functions
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

    const removeTag = (tag) => {
        const newTags = tags.filter(t => t !== tag);
        setTags(newTags);
    };

    const showImagePreview = (imageUrl, name) => {
        setPreviewImage(imageUrl);
        setPreviewVisible(true);
    };

    const handleCancelPreview = () => {
        setPreviewVisible(false);
    };

    const handleGoBack = () => {
        navigate("/template-list");
    };

    // Filter templates based on search term (now handled on server)
    const filteredTemplates = subTemplateData;

    return (
        <>
            <Header />
            <div className="sub-template__container">
                {isTemplateModalOpen ? (
                    <TemplateModal
                        sharedClick={sharedClick}
                        isUpdateProcess={isUpdateProcess}
                        selectedTemplate={selectedTemplate}
                        selectedTemplateName={selectedTemplateName}
                        displayedMindMaps={[...myMindMaps, ...sharedMindMaps]}
                    />
                ) : null}
                
                <div className="sub-template__content">
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        className="sub-template__back-btn"
                        onClick={handleGoBack}
                    >
                        {t("categoryListMsgTxt")}
                    </Button>
                    
                    <Row className="sub-template__header-row align-items-center" gutter={16}>
                        <Col lg={16} md={12} xs={24}>
                            <div className="sub-template__category-title">
                                <span className="sub-template__category-icon">
                                    <img src={mindMapIcon} alt="Mind Map Icon" width={32} height={32} />
                                </span>
                                <h1>{t("mindMapMsgTxt")} - {selectedTemplateName}</h1>
                            </div>
                        </Col>
                        <Col lg={8} md={12} xs={24} className="d-flex justify-content-end">
                            <div className="sub-template__tag-filter-container">
                                <div className="sub-template__filter-row">
                                    <div className="sub-template__tags-wrapper">
                                        {tags.map(tag => (
                                            <Tag
                                                key={tag}
                                                closable
                                                onClose={() => removeTag(tag)}
                                                className="sub-template__tag"
                                            >
                                                {tag}
                                            </Tag>
                                        ))}
                                    </div>
                                    <Input
                                        className="sub-template__custom-input"
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onKeyDown={handleInputKeyDown}
                                        placeholder={t("filterByTagOrNameMsgTxt")}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    
                    <Row gutter={[16, 16]} className="sub-template__grid">
                        {isUserHasPermissionForOptions || isTeacherUserHasPermissionForOptions ? (
                            <Col xxl={6} xl={8} lg={8} md={12} sm={12} xs={24}>
                                <Card 
                                    className="sub-template__add-card" 
                                    onClick={() => {
                                        setIsTemplateModalOpen(true);
                                    }}
                                >
                                    <div className="sub-template__add-content">
                                        <img
                                            src={blankTemplateLogo}
                                            alt={t("createTemplateMsgTxt")}
                                            className="sub-template__add-icon"
                                        />
                                        <h3>{t("createTemplateMsgTxt")}</h3>
                                    </div>
                                </Card>
                            </Col>
                        ) : null}
                        
                        {filteredTemplates.length > 0 ? (
                            filteredTemplates.map((template) => (
                                <Col xxl={6} xl={8} lg={8} md={12} sm={12} xs={24} key={template.id}>
                                    <Card className="sub-template__card">
                                        {(isUserHasPermissionForOptions &&
                                            JSON.parse(localStorage.getItem("userInformation")).companyId === template.companyId) ||
                                        (isTeacherUserHasPermissionForOptions &&
                                            JSON.parse(localStorage.getItem("userInformation")).id === template.createdBy) ? (
                                            <div className="sub-template__options">
                                                <img
                                                    src={moreOptionsIcon}
                                                    alt={t("optionsMsgTxt")}
                                                    className="sub-template__options-icon"
                                                />
                                                <div className="sub-template__options-menu">
                                                    <div
                                                        className="sub-template__option-item"
                                                        onClick={() => deleteTemplateWarning(template.id, template.name)}
                                                    >
                                                        {t("deleteMsgTxt")}
                                                    </div>
                                                    <div
                                                        className="sub-template__option-item"
                                                        onClick={() => {
                                                            setIsTemplateModalOpen(true);
                                                            setIsUpdateProcess(true);
                                                            setSelectedTemplate(template);
                                                            setSelectedTemplateName(template.name);
                                                        }}
                                                    >
                                                        {t("editMsgTxt")}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                        
                                        <div className="sub-template__image-container">
                                            <img
                                                src={template.image}
                                                alt={template.name}
                                                className="sub-template__image"
                                                onClick={() => createMapWithTemplateEvent(
                                                    template.id,
                                                    template.content,
                                                    template.name
                                                )}
                                            />
                                            <div className="sub-template__actions">
                                                <button 
                                                    className="sub-template__zoom-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        showImagePreview(template.image, template.name);
                                                    }}
                                                    title={t("previewImageMsgTxt")}
                                                >
                                                    <ZoomInOutlined />
                                                </button>
                                                <button 
                                                    className="sub-template__create-btn"
                                                    onClick={() => createMapWithTemplateEvent(
                                                        template.id,
                                                        template.content,
                                                        template.name
                                                    )}
                                                    title={t("createMsgTxt")}
                                                >
                                                    <img
                                                        src={blankTemplateLogo}
                                                        alt={t("createMsgTxt")}
                                                        className="sub-template__create-icon"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="sub-template__details">
                                            <h3 className="sub-template__name">{template.name}</h3>
                                            <p className="sub-template__count">
                                                {template.generatedMapCount} {t("createdMsgTxt")}
                                            </p>
                                        </div>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col span={24}>
                                <div className="sub-template__no-templates">
                                    <p>{t("noTemplateFoundMsgTxt")}</p>
                                </div>
                            </Col>
                        )}
                    </Row>
                </div>
            </div>

            {/* Image Preview Modal */}
            <Modal 
                visible={previewVisible} 
                footer={null} 
                onCancel={handleCancelPreview}
                width={800}
                centered
                className="sub-template__preview-modal"
            >
                {previewImage && (
                    <img 
                        src={previewImage} 
                        alt="Template Preview" 
                        style={{ width: '100%' }} 
                    />
                )}
            </Modal>
        </>
    );
};

export default SubTemplateList;

import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";

import Header from "../../components/header";
import PageContainer from "../../components/PageContainer";
import TemplateListService from "../../services/api/template";
import MapService from "../../services/api/mindmap";
import AddCategoryModal from "./components/categoryModal";
import ChatGptService from "../../services/api/chatgpt";
import AiPackages from "../../services/api/mapaipackage";
import DocumentsServices from "../../services/api/document";
import { LanguageContext } from "../../context/languageContext";
import request from "../../services/api/request";
import { PATHS } from "../../services/api/paths";

import moreOptionsIcon from "@/styles/img/more-options-icon.png";
import gptModalImage from "@/styles/img/gpt-modal.png";
import robotImage from "@/styles/img/Robot.png";
import closeImage from "@/styles/img/close.png";
import createNewMapIcon from "@/icons/createNewMap.svg";

import "./index.scss";
import { Button, Modal, Input, Card, Row, Col, Typography, Tag } from "antd";

const { Title, Text } = Typography;

const TemplateList = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedLanguage } = useContext(LanguageContext);

    const [templateData, setTemplateData] = useState([]);
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [isAddCategoryModal, setIsAddCategoryModal] = useState(false);
    const [isUpdateProcess, setIsUpdateProcess] = useState(false);
    const [isUserHasPermissionForOptions, setIsUserHasPermissionForOptions] = useState(false);
    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [documents, setDocuments] = useState([]);
    const [inputModal, setInputModal] = useState(false);
    const [gptSubject, setGptSubject] = useState("");
    const [chatGptMapLanguage, setChatGptMapLanguage] = useState(selectedLanguage || "en");
    const [isLanguageTurkish, setIsLanguageTurkish] = useState(false);
    const [isLanguageEnglish, setIsLanguageEnglish] = useState(false);
    const [gptMapNumbers, setGptMapNumbers] = useState(0);
    const [isDocument, setIsDocument] = useState(false);
    const [documentId, setDocumentId] = useState(null);
    const [userRole, setUserRole] = useState(JSON.parse(localStorage.getItem("userRoleIdList")) || []);
    const [type, setType] = useState("0");
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        document.title = `Foramind | ${t("createMindMapMsgTxt")}`;

        const userId = JSON.parse(localStorage.getItem("userInformation")).id;
        const componyId = JSON.parse(localStorage.getItem("userInformation")).companyId;
        AiPackages.getRemainingMaps(userId).then((responseData) => {
            setGptMapNumbers(responseData.data.data);
        });

        DocumentsServices.getCompanyDocumentsForUser(componyId).then((responseData) => {
            setDocuments(responseData);
        });

        // user role control for edit/delete permission
        if (localStorage.getItem("userRoleIdList")) {
            JSON.parse(localStorage.getItem("userRoleIdList")).forEach((role) => {
                if (role === 3 || role === 1 || role === 4) {
                    setIsUserHasPermissionForOptions(true);
                }
            });
        }
    }, [t]);

    // Parse URL for tags when component mounts
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tagParams = searchParams.getAll('name');
        if (tagParams.length > 0) {
            setTags(tagParams);
        }
    }, [location.search]);

    // Effect to update chatGptMapLanguage when selectedLanguage changes
    useEffect(() => {
        setChatGptMapLanguage(selectedLanguage);
    }, [selectedLanguage]);
 
    // Effect to fetch template list when language changes or tags change
    useEffect(() => {
        getTemplateList();
    }, [selectedLanguage, tags]);

    // Update URL when tags change
    useEffect(() => {
        const params = new URLSearchParams();
        const recordSize = 1000;
        const languageId = selectedLanguage || "en";
        const companyId = JSON.parse(localStorage.getItem("userInformation"))?.companyId;
        
        params.append('recordSize', recordSize);
        params.append('languageId', languageId);
        if (companyId) params.append('companyId', companyId);

        console.log("tags",tags)
        tags.forEach(tag => {
            params.append('name', tag);
        });
        
        const newSearch = params.toString();
        const newUrl = `${location.pathname}?${newSearch}`;
        
        // Use replace state to avoid adding to browser history
        window.history.replaceState(null, '', newUrl);
    }, [tags, selectedLanguage]);

    const openChatGptModal = () => {
        setInputModal(true);

        if (chatGptMapLanguage === "tr") {
            setIsLanguageTurkish(true);
        }
        if (chatGptMapLanguage === "en") {
            setIsLanguageEnglish(true);
        }
    };

    const handleClose = () => {
        setInputModal(false);
        setGptSubject("");
        setIsDocument(false);
        setDocumentId(null);
    };

    const documentSwitchHandle = (value) => {
        if (isDocument === true) setDocumentId(null);
        setIsDocument(value);
    };

    const getTemplateList = async () => {
        const recordSize = 1000;
        const languageId = selectedLanguage || "en";
        const companyId = JSON.parse(localStorage.getItem("userInformation"))?.companyId;

        try {
            console.log(`Fetching template list with language: ${languageId} and tags:`, tags);
            // URL parametrelerini oluştur
            let url = `${PATHS.TEMPLATE.GET_TEMPLATE_LIST}?recordSize=${recordSize}&languageId=${languageId}`;
            if (companyId) url += `&companyId=${companyId}`;
            
            // Tagları ekle
            tags.forEach(tag => {
                url += `&name=${encodeURIComponent(tag)}`;
            });
            
            console.log("API request URL:", url);
            
            const templates = await request.get(url);
            if (templates.data?.templateList) {
                setTemplateData(templates.data.templateList);
            }
        } catch (error) {
            console.error("Error fetching template list:", error);
        }
    };

    const fillUserTemplatelist = (response) => {
        if (response.data?.templateList) {
            setTemplateData(response.data.templateList);
        }
    };

    const goToSubTemplates = (id, name) => {
        localStorage.setItem("selectedTemplateId", id);
        localStorage.setItem("selectedTemplateName", name);
        goToSubTemplatesListPage(name, id);
    };

    const goToSubTemplatesListPage = (templateData, templateId) => {
        if (templateData !== "yeni") {
            localStorage.setItem("selectedTemplateId", templateId);
            navigate("/sub-template-list");
        }
    };

    const sharedClick = (isOpen) => {
        setIsAddCategoryModal(false);
        
        if (isOpen === true) {
            getTemplateList();
        }
    };

    const newMap = async (templateData, templateName) => {
        try {
            console.log("Creating new mind map...");
            
            // Root node için benzersiz ID oluştur
            const rootId = Date.now().toString() + Math.floor(Math.random() * 100000000000000000).toString();
            
            // API isteği için data - MindMapCreateRequest tipine uygun hazırlama
            const data = {
                name: templateData === "yeni" ? "New Mind Map" : (templateName || "Template Mind Map"),
                content: JSON.stringify({
                    root: {
                        id: rootId,
                        text: "<br>New Mind Map<br><br>",
                        color: "#56DA66 !important",
                        borderColor: "#ff84cb",
                        textColor: "#F6F6F6 !important",
                        layout: "map",
                        shape: "box",
                        line: "solid",
                        collapsed: false,
                        nodeBackground: true,
                        imageItem: false,
                        nodeLine: true,
                        children: []
                    }
                }),
                isPublic: false,
                isDownloadable: true,
                isCopiable: true,
                isShareable: true,
                languageId: 1
            };
            
            const response = await MapService.createMindMap(data);
            console.log("Create mind map response:", response);
            
            if (response && response.data) {
                if (response.data.mindMap && response.data.mindMap.id) {
                    const mapId = response.data.mindMap.id;
                    console.log("Successfully created mind map with ID:", mapId);
                    navigate(`/map?mapId=${mapId}`);
                    return;
                } 
                else if (response.data.id) {
                    console.log("Successfully created mind map with ID:", response.data.id);
                    navigate(`/map?mapId=${response.data.id}`);
                    return;
                }
            }
            
            console.error("Failed to create mind map or get map ID:", response);
            message.error(t("errorCreatingMapMsgTxt"));
            
        } catch (error) {
            console.error("Error creating mind map:", error);
            message.error(t("errorCreatingMapMsgTxt"));
        }
    };

    const createChatGptMap = async () => {
        const question = gptSubject;
        const gptLanguage = chatGptMapLanguage;
        const docId = documentId === null || undefined ? null : documentId;
        let gptLanguageService;
        if (gptLanguage === "tr") {
            gptLanguageService = "Türkçe";
        }
        if (gptLanguage === "en") {
            gptLanguageService = "English";
        }
        const mapType = type || "0";
        const data = isDocument === false
            ? {
                question: question,
                language: gptLanguageService,
                type: mapType
            }
            : {
                question: question,
                language: gptLanguageService,
                documentIds: [docId],
            };
        console.log(`Creating ChatGPT map with language: ${gptLanguageService}`);
        if (isDocument === false) {
            await ChatGptService.getChatResponse(JSON.stringify(data), function () {
                ChatGptService.redirectMap(localStorage.getItem("openedMapId"));
            });
        } else {
            await ChatGptService.getEmbedingChatResponse(JSON.stringify(data), function () {
                DocumentsServices.redirectMap(localStorage.getItem("resposeDataDocumentId"));
            });
        }
    };

    const deleteCategoryTemplate = async (id) => {
        await TemplateListService.deleteTemplate(id, getTemplateList, this);
    };

    const deleteTemplateCategoryWarning = (id, name) => {
        localStorage.setItem("deletedTemplateCategoryId", id);
        Modal.confirm({
            title: t("warningMsgTxt"),
            content: <span><b>{name}</b>: {t("categoryWillRemoveWithSubsAreYouSureMsgTxt")}</span>,
            okText: t("yesMsgTxt"),
            cancelText: t("noMsgTxt"),
            onOk: async () => {
                await deleteCategoryTemplate(id);
                // Silme işlemi tamamlandıktan sonra listeyi yenile
                getTemplateList();
            }
        });
    };

    // Tag işlemleri
    const removeTag = (tag) => {
        const newTags = tags.filter(t => t !== tag);
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

    const addTag = () => {
        if (inputValue.trim() && !tags.includes(inputValue.trim())) {
            setTags([...tags, inputValue.trim()]);
            setInputValue('');
        }
    };

    const openEditCategoryModal = (category) => {
        localStorage.setItem("isCustomModalOpen", "true");
        setIsAddCategoryModal(true);
        setIsUpdateProcess(true);
        setSelectedCategory(category);
        setSelectedCategoryName(category.name);
    };

    const openAddCategoryModal = () => {
        localStorage.setItem("isCustomModalOpen", "true");
        setIsAddCategoryModal(true);
        setIsUpdateProcess(false);
        setSelectedCategory(null);
        setSelectedCategoryName("");
    };

    return (
        <>
            <Header />
            <PageContainer>
                {isAddCategoryModal && (
                    <AddCategoryModal
                        sharedClick={sharedClick}
                        isUpdateProcess={isUpdateProcess}
                        selectedCategory={selectedCategory}
                        selectedCategoryName={selectedCategoryName}
                    />
                )}

                <div className="template-header">
                    <div className="icon-container">
                        <img src={createNewMapIcon} alt="Create new map"/>
                    </div>
                    <Title level={3}>{t("createMindMapMsgTxt")}</Title>

                    <div className="tag-filter-container">
                        <div className="tags-wrapper">
                            {tags.map(tag => (
                                <Tag
                                    key={tag}
                                    closable
                                    onClose={() => removeTag(tag)}
                                >
                                    {tag}
                                </Tag>
                            ))}
                        </div>
                        <Input
                            className="custom-input"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                            placeholder={t("filterByTagOrNameMsgTxt")}
                        />
                    </div>

                </div>

                <div className="templates-grid">
                    {inputModal && (
                        <div className="gpt-modal">
                            <section className="modal-main custom-modal-main">
                                <div className="chat-gpt-header">
                                    <img
                                        src={gptModalImage}
                                        alt="Foramind, Zihin Haritası, Mind Map"
                                    />
                                    <h1>{t("chatGPTCreate")}</h1>
                                    <button
                                        onClick={handleClose}
                                        type="button"
                                        className="close"
                                        aria-label="Close"
                                    >
                                        <img
                                            src={closeImage}
                                            alt="Foramind, Zihin Haritası, Mind Map"
                                        />
                                    </button>
                                </div>

                                <form>
                                    <label htmlFor="gpt-subject">
                                        {t("chatGptMapSubject")}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t("fillSubject")}
                                        onChange={(e) => setGptSubject(e.target.value)}
                                        id="gpt-subject"
                                    />

                                    <div className="form-check">
                                        {userRole.some(role => role !== 2) && (
                                            <div className="switch-ai-or-documents-container">
                                                <div>
                                                    <label style={{fontSize: "15px"}}>
                                                        {t("useDocumentMsgTxt")}
                                                    </label>
                                                </div>
                                                <div className="switch-ai-or-documents-container__inner-container">
                                                    <label className="switch document-switch" style={{marginRight: "none"}}>
                                                        <input
                                                            type="checkbox"
                                                            onClick={(e) => documentSwitchHandle(e.target.checked)}
                                                        />
                                                        <span className="slider round"></span>
                                                    </label>
                                                    {isDocument === true && (
                                                        <select
                                                            className="custom-select-document"
                                                            name="document"
                                                            id="document"
                                                            onChange={(e) => setDocumentId(Number(e.target.value))}
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>
                                                                {t("pleaseSelectDocumentMsgTxt")}
                                                            </option>
                                                            {documents.map((document) => (
                                                                <option
                                                                    key={document.id}
                                                                    value={document.id}
                                                                >
                                                                    {document.contentName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {!isDocument && (
                                            <div style={{marginBottom: "20px"}}>
                                                <h5>Model Seçimi:</h5>
                                                <select
                                                    onChange={(e) => setType(e.target.value)}
                                                    defaultValue="0"
                                                >
                                                    <option value="1">4o</option>
                                                    <option value="0">4o mini</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="form-check__header">
                                            <h5>{t("languageSelect")}:</h5>
                                        </div>

                                        <div className="language-options">
                                            <div className="language-option">
                                                <input
                                                    className=""
                                                    type="radio"
                                                    name="flexRadioDefault"
                                                    id="flexRadioDefault1"
                                                    value="tr"
                                                    checked={chatGptMapLanguage === "tr"}
                                                    onChange={(e) => setChatGptMapLanguage(e.target.value)}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="flexRadioDefault1"
                                                >
                                                    {t("languageTurkish")}
                                                </label>
                                            </div>

                                            <div className="language-option">
                                                <input
                                                    className=""
                                                    type="radio"
                                                    name="flexRadioDefault"
                                                    id="flexRadioDefault2"
                                                    value="en"
                                                    checked={chatGptMapLanguage === "en"}
                                                    onChange={(e) => setChatGptMapLanguage(e.target.value)}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="flexRadioDefault2"
                                                >
                                                    {t("languageEnglish")}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        {!isDocument ? (
                                            <>
                                                <button
                                                    type="button"
                                                    id="cancel-gpt"
                                                    onClick={handleClose}
                                                >
                                                    {t("cancelChatGpt")}
                                                </button>

                                                <button
                                                    id="save-gpt"
                                                    type="button"
                                                    onClick={createChatGptMap}
                                                    className={
                                                        gptSubject.trim() === ""
                                                            ? "create-mind-map-ai-passive"
                                                            : "create-mind-map-ai-active"
                                                    }
                                                    disabled={gptSubject.trim() === ""}
                                                >
                                                    {t("createMap")}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    id="cancel-gpt"
                                                    onClick={handleClose}
                                                >
                                                    {t("cancelChatGpt")}
                                                </button>

                                                <button
                                                    id="save-gpt"
                                                    type="button"
                                                    onClick={createChatGptMap}
                                                    className={
                                                        documentId !== null && gptSubject.trim() !== ""
                                                            ? "create-mind-map-ai-active"
                                                            : "create-mind-map-ai-passive"
                                                    }
                                                    disabled={!(documentId !== null && gptSubject.trim() !== "")}
                                                >
                                                    {t("createMap")}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </section>
                        </div>
                    )}
                    
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Card 
                                hoverable
                                className="template-card"
                                cover={
                                    <div className="card-image-container" onClick={() => newMap("yeni")}>
                                        <div className="plus-icon">+</div>
                                    </div>
                                }
                            >
                                <Card.Meta title={t("addBlankMapMsgTxt")} />
                            </Card>
                        </Col>
                        
                        {gptMapNumbers > 0 && (
                            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                                <Card 
                                    hoverable
                                    className="template-card"
                                    cover={
                                        <div className="card-image-container" onClick={openChatGptModal}>
                                            <img alt={t("addChatGPTMsgTxt")} src={robotImage} />
                                        </div>
                                    }
                                >
                                    <Card.Meta title={t("addChatGPTMsgTxt")} />
                                </Card>
                            </Col>
                        )}
                        
                        {templateData
                            .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
                            .map((catItem) => {
                                const userInfo = JSON.parse(localStorage.getItem("userInformation") || "{}");
                                const canEdit = isUserHasPermissionForOptions && userInfo.companyId === catItem.companyId;
                                return (
                                    <Col key={catItem.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                                        <Card 
                                            hoverable
                                            className="template-card"
                                            cover={
                                                <div 
                                                    className="card-image-container" 
                                                    onClick={() => goToSubTemplates(catItem.id, catItem.name)}
                                                >
                                                    <img alt={catItem.name} src={catItem.image} />
                                                    {canEdit && (
                                                        <div className="more-options">
                                                            <Button 
                                                                type="text" 
                                                                className="more-options-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Toggle dropdown
                                                                }}
                                                            >
                                                                <img src={moreOptionsIcon} alt="options" />
                                                            </Button>
                                                            <div className="options-dropdown">
                                                                <Button 
                                                                    type="text" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteTemplateCategoryWarning(catItem.id, catItem.name);
                                                                    }}
                                                                >
                                                                    {t("deleteMsgTxt")}
                                                                </Button>
                                                                <Button 
                                                                    type="text"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openEditCategoryModal(catItem);
                                                                    }}
                                                                >
                                                                    {t("editMsgTxt")}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        >
                                            <Card.Meta title={catItem.name} />
                                        </Card>
                                    </Col>
                                );
                            })}
                        
                        {isUserHasPermissionForOptions && (
                            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                                <Card 
                                    hoverable
                                    className="template-card add-category-card"
                                    onClick={openAddCategoryModal}
                                    cover={
                                        <div className="card-image-container">
                                            <div className="plus-icon">+</div>
                                        </div>
                                    }
                                >
                                    <Card.Meta title={t("addNewCategoryMapMsgTxt")} />
                                </Card>
                            </Col>
                        )}
                    </Row>
                </div>
            </PageContainer>
        </>
    );
};

export default TemplateList;

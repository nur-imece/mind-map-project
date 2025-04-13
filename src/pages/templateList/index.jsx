import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";

import Header from "../../components/header";
import PageContainer from "../../components/PageContainer";
import TemplateListService from "../../services/api/template";
import MapService from "../../services/api/mindmap";
import AddCategoryModal from "./components/categoryModal";
import ChatGptModal from "./components/chatGptModal";
import AiPackages from "../../services/api/mapaipackage";
import DocumentsServices from "../../services/api/document";
import { LanguageContext } from "../../context/languageContext";
import request from "../../services/api/request";
import { PATHS } from "../../services/api/paths";

import moreOptionsIcon from "@/styles/img/more-options-icon.png";
import robotImage from "@/styles/img/Robot.png";
import createNewMapIcon from "@/icons/createNewMap.svg";

import "./index.scss";
import { Button, Modal, Input, Card, Row, Col, Typography } from "antd";

// Import custom components
import TemplateHeader from "./components/templateHeader";
import TemplateCard from "./components/templateCard";
import ActionCard from "./components/actionCard";

const { Title } = Typography;

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
    const [gptMapNumbers, setGptMapNumbers] = useState(0);
    const [userRole, setUserRole] = useState(JSON.parse(localStorage.getItem("userRoleIdList")) || []);
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
    };

    const closeChatGptModal = () => {
        setInputModal(false);
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

                <ChatGptModal 
                    isOpen={inputModal}
                    onClose={closeChatGptModal}
                    documents={documents}
                    gptMapNumbers={gptMapNumbers}
                />

                <TemplateHeader 
                    icon={createNewMapIcon}
                    title={t("createMindMapMsgTxt")}
                    tags={tags}
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    onInputKeyDown={handleInputKeyDown}
                    onRemoveTag={removeTag}
                    t={t}
                />

                <div className="templates-grid">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <ActionCard 
                                title={t("addBlankMapMsgTxt")}
                                onClick={() => newMap("yeni")}
                            />
                        </Col>
                        
                        {gptMapNumbers > 0 && (
                            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                                <ActionCard 
                                    title={t("addChatGPTMsgTxt")}
                                    onClick={openChatGptModal}
                                    icon={robotImage}
                                />
                            </Col>
                        )}
                        
                        {templateData
                            .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
                            .map((catItem) => (
                                <Col key={catItem.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                                    <TemplateCard 
                                        template={catItem}
                                        onClick={() => goToSubTemplates(catItem.id, catItem.name)}
                                        isUserHasPermissionForOptions={isUserHasPermissionForOptions}
                                        onDeleteClick={deleteTemplateCategoryWarning}
                                        onEditClick={openEditCategoryModal}
                                        t={t}
                                    />
                                </Col>
                            ))}
                        
                        {isUserHasPermissionForOptions && (
                            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                                <ActionCard 
                                    title={t("addNewCategoryMapMsgTxt")}
                                    onClick={openAddCategoryModal}
                                    className="add-category-card"
                                />
                            </Col>
                        )}
                    </Row>
                </div>
            </PageContainer>
        </>
    );
};

export default TemplateList;

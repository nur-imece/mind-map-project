import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Modal, 
  Input, 
  Button, 
  Typography, 
  Switch, 
  Select, 
  Radio, 
  Space, 
  Form, 
  Divider,
  message 
} from "antd";
import ChatGptService from "../../../services/api/chatgpt";

import gptModalImage from "@/styles/img/gpt-modal.png";
import "./chatGptModal.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ChatGptModal = ({ isOpen, onClose, documents, gptMapNumbers }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const [gptSubject, setGptSubject] = useState("");
    const [chatGptMapLanguage, setChatGptMapLanguage] = useState(localStorage.getItem("selectedLanguage") || "en");
    const [isDocument, setIsDocument] = useState(false);
    const [documentId, setDocumentId] = useState(null);
    const [type, setType] = useState("0");
    const [userRole, setUserRole] = useState(JSON.parse(localStorage.getItem("userRoleIdList")) || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Update language when context changes
        const selectedLanguage = localStorage.getItem("selectedLanguage");
        if (selectedLanguage) {
            setChatGptMapLanguage(selectedLanguage);
        }
    }, []);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            form.resetFields();
            setGptSubject("");
            setIsDocument(false);
            setDocumentId(null);
            setType("0");
            setLoading(false);
        }
    }, [isOpen, form]);

    const documentSwitchHandle = (checked) => {
        if (isDocument) setDocumentId(null);
        setIsDocument(checked);
    };

    const createChatGptMap = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const question = values.subject;
            let gptLanguageService;
            
            if (chatGptMapLanguage === "tr") {
                gptLanguageService = "Türkçe";
            }
            if (chatGptMapLanguage === "en") {
                gptLanguageService = "English";
            }
            
            const mapType = values.modelType || "0";
            const docId = values.documentId || null;
            
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
                const response = await ChatGptService.getChatResponse(data);
                console.log("response", response);
                if (response && response.data.id) {
                    navigate(`/map?mapId=${response.data.id}`);
                } else {
                    message.error(t("errorCreatingMapMsgTxt"));
                }
            } else {
                const response = await ChatGptService.getEmbedingChatResponse(data);
                if (response && response.data.id) {
                    navigate(`/map?mapId=${response.data.id}`);
                } else {
                    message.error(t("errorCreatingMapMsgTxt"));
                }
            }
            
            // Close modal after successful map creation
            onClose();
        } catch (error) {
            console.error("Error creating ChatGPT map:", error);
            message.error(t("errorCreatingMapMsgTxt"));
            setLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            className="gpt-modal-container"
            title={
                <div className="gpt-modal-header">
                    <img src={gptModalImage} alt="ChatGPT" className="gpt-modal-icon" />
                    <Title level={4} style={{ margin: 0 }}>{t("chatGPTCreate")}</Title>
                </div>
            }
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                name="chatGptForm"
                initialValues={{
                    subject: "",
                    useDocument: false,
                    modelType: "0",
                    language: chatGptMapLanguage
                }}
                onFinish={createChatGptMap}
            >
                <Form.Item 
                    name="subject"
                    label={<Text strong>{t("chatGptMapSubject")}</Text>}
                    rules={[
                        { required: true, message: t("fillSubject") }
                    ]}
                >
                    <Input 
                        placeholder={t("fillSubject")}
                        onChange={(e) => setGptSubject(e.target.value)}
                    />
                </Form.Item>

                {userRole.some(role => role !== 2) && (
                    <>
                        <Form.Item 
                            name="useDocument" 
                            label={<Text strong>{t("useDocumentMsgTxt")}</Text>}
                            valuePropName="checked"
                        >
                            <Switch 
                                onChange={documentSwitchHandle}
                            />
                        </Form.Item>

                        {isDocument && (
                            <Form.Item
                                name="documentId"
                                label={<Text strong>{t("pleaseSelectDocumentMsgTxt")}</Text>}
                                rules={[
                                    { required: isDocument, message: t("pleaseSelectDocumentMsgTxt") }
                                ]}
                            >
                                <Select placeholder={t("pleaseSelectDocumentMsgTxt")}>
                                    {documents.map((document) => (
                                        <Option key={document.id} value={document.id}>
                                            {document.contentName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                    </>
                )}

                {!isDocument && (
                    <Form.Item
                        name="modelType"
                        label={<Text strong>Model Seçimi</Text>}
                    >
                        <Select defaultValue="0">
                            <Option value="1">4o</Option>
                            <Option value="0">4o mini</Option>
                        </Select>
                    </Form.Item>
                )}

                <Divider orientation="left">{t("languageSelect")}</Divider>

                <Form.Item name="language">
                    <Radio.Group 
                        onChange={(e) => setChatGptMapLanguage(e.target.value)}
                        value={chatGptMapLanguage}
                    >
                        <Radio value="tr">{t("languageTurkish")}</Radio>
                        <Radio value="en">{t("languageEnglish")}</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item className="form-actions">
                    <Space>
                        <Button onClick={onClose} disabled={loading}>
                            {t("cancelChatGpt")}
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={loading}
                            disabled={(isDocument ? !(documentId && gptSubject.trim()) : !gptSubject.trim()) || loading}
                        >
                            {t("createMap")}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChatGptModal; 
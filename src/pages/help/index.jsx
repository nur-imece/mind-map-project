import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import Header from "../../components/header";
import PageContainer from "../../components/PageContainer";
import DefaultImage from "../../styles/img/foramind-video.png";
import videoInfoService from "../../services/api/videoinfo";

import "./index.scss";

const Help = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("video");
    const [data, setData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [filterTags, setFilterTags] = useState([]);

    useEffect(() => {
        getVideoData();
    }, [filterTags]);

    const getVideoData = async () => {
        try {
            const response = await videoInfoService.getActiveVideoInfoList(filterTags);
            if (response.data?.videoInfoModel) {
                setData(response.data.videoInfoModel);
            }
        } catch (error) {
            console.error("Error fetching video info:", error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && searchValue.trim()) {
            const newTag = searchValue.trim();
            if (!filterTags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
                setFilterTags([...filterTags, newTag]);
            }
            setSearchValue("");
        }
    };

    const removeTag = (index) => {
        const newTags = [...filterTags];
        newTags.splice(index, 1);
        setFilterTags(newTags);
    };

    return (
        <>
            <Header />
            <PageContainer>
                <div className="help-title">
                    <QuestionCircleOutlined className="icon" />
                    <h2>Yardım</h2>
                </div>
                
                <div className="tab-container">
                    <button 
                        className={`tab-button ${activeTab === "video" ? "active" : ""}`}
                        onClick={() => setActiveTab("video")}
                    >
                        Video
                    </button>
                    <button 
                        className={`tab-button ${activeTab === "eposta" ? "active" : ""}`}
                        onClick={() => setActiveTab("eposta")}
                    >
                        E-Posta
                    </button>
                </div>
                
                {activeTab === "video" && (
                    <div className="video-help-container">
                        <div className="video-title">
                            <strong>Video Yardım</strong>
                        </div>
                        <div className="search-container">
                            <Input
                                className="search-input"
                                placeholder="Etiket, isim ile filtrele"
                                value={searchValue}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                            />
                            {filterTags.length > 0 && (
                                <div className="tags-container">
                                    {filterTags.map((tag, i) => (
                                        <span key={i} className="tag">
                                            {tag}
                                            <button onClick={() => removeTag(i)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="video-grid">
                            {data.map((item) => (
                                <div className="video-card" key={item.id}>
                                    <a
                                        href={item.video}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <img
                                            src={item.image || DefaultImage}
                                            alt="Foramind, Zihin Haritası, Mind Map"
                                        />
                                        <div className="video-card-content">
                                            <h3 className="video-card-title">{item.title}</h3>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeTab === "eposta" && (
                    <div className="email-help-container">
                        <strong>E-posta Yardımı</strong>
                        <a
                            href="mailto:info@foramind.com"
                        >
                            info@foramind.com
                        </a>
                    </div>
                )}
            </PageContainer>
        </>
    );
};

export default Help;

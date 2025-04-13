import React from "react";
import { Button, Input, Tooltip, Typography } from "antd";
import { 
    HeartOutlined, 
    HeartFilled, 
    UnorderedListOutlined, 
    AppstoreOutlined, 
    ShareAltOutlined,
    AppstoreAddOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import MindMapsIcon from '../../../icons/mindMaps.svg';
import ChatGptMapListIcon from "../../../styles/img/gpt-gray-icon.png";

const { Title } = Typography;

const Toolbar = ({ 
    searchText, 
    handleSearch, 
    filterType, 
    toggleFilterType, 
    viewType, 
    toggleViewType 
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="title-wrapper">
                <div className="title-left">
                    <div className="title-with-icon">
                        <img src={MindMapsIcon} className="page-icon" alt="Mind Maps" />
                        <Title level={3}>{t("mindMapsMsgTxt")}</Title>
                    </div>
                </div>
                <div className="view-controls">
                    <Tooltip title={t("allMapsMsgTxt")}>
                        <Button
                            type="text"
                            icon={<AppstoreAddOutlined />}
                            onClick={() => toggleFilterType("all")}
                            className={`view-control-btn ${filterType === "all" ? 'active' : ''}`}
                        />
                    </Tooltip>
                    <Tooltip title={t("favoriteMsgTxt")}>
                        <Button
                            type="text"
                            icon={filterType === "favorites" ? <HeartFilled /> : <HeartOutlined />}
                            onClick={() => toggleFilterType("favorites")}
                            className={`view-control-btn ${filterType === "favorites" ? 'active' : ''}`}
                        />
                    </Tooltip>
                    <Tooltip title={t("sharedMapsMsgTxt")}>
                        <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                            onClick={() => toggleFilterType("shared")}
                            className={`view-control-btn ${filterType === "shared" ? 'active' : ''}`}
                        />
                    </Tooltip>
                    <Tooltip title={t("aiGeneratedMsgTxt")}>
                        <Button
                            type="text"
                            icon={
                                <img
                                    src={ChatGptMapListIcon}
                                    alt="AI"
                                    style={{ width: 20, height: 20 }}
                                />
                            }
                            onClick={() => toggleFilterType("ai-generated")}
                            className={`view-control-btn ${filterType === "ai-generated" ? 'active' : ''}`}
                        />
                    </Tooltip>
                    <Tooltip title={t("showAsListMsgTxt")}>
                        <Button
                            type="text"
                            icon={<UnorderedListOutlined />}
                            onClick={() => toggleViewType('list')}
                            className={`view-control-btn ${viewType === 'list' ? 'active' : ''}`}
                        />
                    </Tooltip>
                    <Tooltip title={t("showAsGridMsgTxt")}>
                        <Button
                            type="text"
                            icon={<AppstoreOutlined />}
                            onClick={() => toggleViewType('card')}
                            className={`view-control-btn ${viewType === 'card' ? 'active' : ''}`}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className="search-section">
                <Input
                    placeholder={t("filterByTagOrNameMsgTxt")}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                    allowClear
                />
            </div>
        </>
    );
};

export default Toolbar; 
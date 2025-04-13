import React from "react";
import { Button, Tooltip, Input } from 'antd';
import { HeartOutlined, HeartFilled, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import SubHeader from "../../../components/subHeader";

const Toolbar = ({ 
    searchText, 
    handleSearch, 
    isFavFilter, 
    toggleFavFilter, 
    activeLayout, 
    toggleLayout
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="title-wrapper">
                <div className="title-left">
                    <SubHeader
                        title={t("benimlePaylasilanlar")}
                        iconName="icon-share_list_icon"
                    />
                </div>
                <div className="view-controls">
                    <Tooltip title={t("showFavoritesMsgTxt")}>
                        <Button
                            type="text"
                            icon={isFavFilter ? <HeartFilled /> : <HeartOutlined />}
                            onClick={toggleFavFilter}
                            className={`view-control-btn ${isFavFilter ? 'active' : ''}`}
                        />
                    </Tooltip>
                    <Tooltip title={t("showAsListMsgTxt")}>
                        <Button
                            type="text"
                            icon={<UnorderedListOutlined />}
                            onClick={() => toggleLayout('list')}
                            className={`view-control-btn ${activeLayout === 'list' ? 'active' : ''}`}
                        />
                    </Tooltip>
                    <Tooltip title={t("showAsGridMsgTxt")}>
                        <Button
                            type="text"
                            icon={<AppstoreOutlined />}
                            onClick={() => toggleLayout('grid')}
                            className={`view-control-btn ${activeLayout === 'grid' ? 'active' : ''}`}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className="search-section">
                <Input
                    placeholder={t("ara")}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                />
            </div>
        </>
    );
};

export default Toolbar; 
import React from "react";
import { Card, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Utils from "../../../utils";
import iconShared from "../../../styles/img/shared-icon.png";
import iconGridFile from "../../../styles/img/grid-file-icon.png";

const GridView = ({ 
    data, 
    addRemoveFavorite, 
    deleteRow, 
    clickOpenUrl 
}) => {
    const { t } = useTranslation();

    return (
        <div className="grid-items">
            {data.map(item => (
                <Card 
                    key={item.id} 
                    className="grid-item" 
                    hoverable
                    cover={<img src={iconGridFile} alt={item.name} />}
                    actions={[
                        <Tooltip title={t("showMsgTxt")}>
                            <EyeOutlined 
                                onClick={() => {
                                    clickOpenUrl(item.id, item.name, item.mapPermissionId);
                                    localStorage.setItem("mapJsonObj", JSON.stringify(item));
                                    localStorage.setItem('mapPermission', item.mapPermissionId);
                                }}
                            />
                        </Tooltip>,
                        <Tooltip title={item.isFavorite ? t("removeFromFavListMsgTxt") : t("addToFavListMsgTxt")}>
                            {item.isFavorite ? 
                                <HeartFilled 
                                    className="favorite-active" 
                                    onClick={() => addRemoveFavorite(item.id, !item.isFavorite)} 
                                /> : 
                                <HeartOutlined 
                                    onClick={() => addRemoveFavorite(item.id, !item.isFavorite)} 
                                />
                            }
                        </Tooltip>,
                        <Tooltip title={t("deleteMsgTxt")}>
                            <DeleteOutlined onClick={() => deleteRow(item.id)} />
                        </Tooltip>
                    ]}
                >
                    <Card.Meta 
                        title={item.name}
                        description={
                            <div className="grid-item-meta">
                                {item.isMapShared && (
                                    <div className="shared-indicator">
                                        <img src={iconShared} alt={t("sharedMapMsgTxt")} />
                                        <span>{t("sharedMapMsgTxt")}</span>
                                    </div>
                                )}
                                <div className="creation-date">
                                    {Utils.formatDateWithMonthName(item.creationDate)}
                                </div>
                            </div>
                        }
                    />
                </Card>
            ))}
        </div>
    );
};

export default GridView; 
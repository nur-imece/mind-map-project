import React, { useState } from 'react';
import { Row, Col, Card, Typography, Tag, Dropdown, Menu, Input, Pagination, Empty, Button } from 'antd';
import { 
    MoreOutlined, 
    ShareAltOutlined,
    HeartOutlined,
    HeartFilled,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ChatGptMapListIcon from "@/styles/img/gpt-gray-icon.png";

const { Title } = Typography;

const MapCards = ({ 
    data, 
    searchText, 
    clickOpenUrl, 
    deleteRow, 
    updateMapName,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [editingKey, setEditingKey] = useState('');
    const [editingName, setEditingName] = useState('');

    const isEditing = (record) => record.id === editingKey;

    const edit = (record) => {
        setEditingKey(record.id);
        setEditingName(record.name);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (record) => {
        if (editingName && editingName.trim() && editingName !== record.name) {
            await updateMapName(record, editingName);
        }
        setEditingKey('');
    };

    // Filter data based on search
    const filteredData = searchText && data
        ? data.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()))
        : data;

    // Get current page data
    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    // Create menu items for the dropdown
    const getMapCardMenuItems = (record) => [
        {
            key: "1",
            icon: <EditOutlined />,
            label: t("editNameMsgTxt"),
            onClick: () => edit(record)
        },
        {
            key: "2",
            icon: <DeleteOutlined />,
            label: t("deleteMsgTxt"),
            onClick: () => deleteRow(record.id)
        }
    ];

    return (
        <>
            {filteredData.length === 0 ? (
                <Empty description={t("noDataTextMsgTxt")} />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {getCurrentPageData().map(map => (
                            <Col xs={24} sm={12} md={8} lg={6} key={map.id}>
                                <Card 
                                    hoverable 
                                    className="map-card user-map-card"
                                    actions={[
                                        <Dropdown menu={{ items: getMapCardMenuItems(map) }} trigger={['click']}>
                                            <MoreOutlined key="more" />
                                        </Dropdown>
                                    ]}
                                >
                                    <div className="map-card-content">
                                        <div className="map-card-header">
                                            {isEditing(map) ? (
                                                <div className="editable-card-title">
                                                    <Input
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onPressEnter={() => save(map)}
                                                        style={{ height: '28px' }}
                                                        autoFocus
                                                    />
                                                    <div className="editable-buttons">
                                                        <Button
                                                            type="text"
                                                            icon={<CheckOutlined />}
                                                            onClick={() => save(map)}
                                                            className="save-button"
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<CloseOutlined />}
                                                            onClick={cancel}
                                                            className="cancel-button"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="map-title-wrapper" onClick={() => clickOpenUrl(map.id, map.name)}>
                                                        <Title level={5} ellipsis={{ rows: 1 }}>{map.name}</Title>
                                                    </div>
                                                </>
                                            )}
                                            
                                            {map.isFavorite && (
                                                <Tag color="gold">★</Tag>
                                            )}
                                        </div>
                                        <div className="map-card-date">
                                            {map.creationDate}
                                        </div>
                                        <div className="map-card-status">
                                            <div className="status-left">
                                                {/* AI Icon (left-most) */}
                                                <div className="ai-icon-container">
                                                    {map.isAiGenerated && (
                                                        <img 
                                                            src={ChatGptMapListIcon} 
                                                            alt="AI" 
                                                            style={{ width: 20, height: 20 }} 
                                                            className="map-card-ai-icon"
                                                            title={t("aiGeneratedMsgTxt")}
                                                        />
                                                    )}
                                                </div>
                                                
                                                {/* Favorite Icon */}
                                                {map.isFavorite && (
                                                    <HeartFilled className="map-card-fav-icon" />
                                                )}

                                                {/* Shared Icon */}
                                                {map.isMapShared && (
                                                    <ShareAltOutlined className="map-card-shared-icon" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className="pagination-container">
                        <Pagination 
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredData.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger
                            pageSizeOptions={['10', '20', '50', '100']}
                            onShowSizeChange={(current, size) => {
                                setCurrentPage(1);
                                setPageSize(size);
                            }}
                            showTotal={(total) => 
                                `${t("pageTextMsgTxt")} ${currentPage} / ${Math.ceil(total/pageSize)}`
                            }
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default MapCards; 
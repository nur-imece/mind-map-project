import React from 'react';
import { Row, Col, Card, Typography, Tag, Dropdown, Menu, Modal, Input } from 'antd';
import { 
    MoreOutlined, 
    PlusOutlined, 
    ShareAltOutlined, 
    RobotOutlined, 
    SettingOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const MapCards = ({ 
    data, 
    searchText, 
    clickOpenUrl, 
    deleteRow, 
    updateMapName 
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Filter data based on search
    const filteredData = searchText && data
        ? data.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()))
        : data;

    const mapCardMenu = (record) => (
        <Menu>
            <Menu.Item 
                key="1" 
                icon={<EditOutlined />}
                onClick={() => {
                    Modal.confirm({
                        title: t("editNameMsgTxt"),
                        content: (
                            <Input 
                                defaultValue={record.name}
                                id="newMapName" 
                            />
                        ),
                        onOk: () => {
                            const newName = document.getElementById('newMapName').value;
                            updateMapName(record, newName);
                        }
                    });
                }}
            >
                {t("editNameMsgTxt")}
            </Menu.Item>
            <Menu.Item 
                key="2" 
                icon={<DeleteOutlined />}
                onClick={() => deleteRow(record.id)}
            >
                {t("deleteMsgTxt")}
            </Menu.Item>
        </Menu>
    );

    return (
        <Row gutter={[16, 16]}>
            {/* Kullanıcı haritaları */}
            {filteredData && filteredData.map(map => (
                <Col xs={24} sm={12} md={8} lg={6} key={map.id}>
                    <Card 
                        hoverable 
                        className="map-card user-map-card"
                        actions={[
                            <Dropdown overlay={mapCardMenu(map)} trigger={['click']}>
                                <MoreOutlined key="more" />
                            </Dropdown>
                        ]}
                    >
                        <div 
                            className="map-card-content"
                            onClick={() => clickOpenUrl(map.id, map.name)}
                        >
                            <div className="map-card-header">
                                <Title level={5} ellipsis={{ rows: 1 }}>{map.name}</Title>
                                {map.isAiGenerated && (
                                    <Tag color="purple">AI</Tag>
                                )}
                                {map.isFavorite && (
                                    <Tag color="gold">★</Tag>
                                )}
                            </div>
                            <div className="map-card-date">
                                {map.creationDate}
                            </div>
                            {map.isMapShared && (
                                <ShareAltOutlined className="map-card-shared-icon" />
                            )}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default MapCards; 
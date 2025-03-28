import React from 'react';
import { Layout, Input, Row, Col, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import MindMapTable from './mindmaptable';
import MapCards from './mapcards';

const { Content } = Layout;
const { Search } = Input;
const { Title } = Typography;

const MindMapContent = ({
    viewType,
    setViewType,
    data,
    loading,
    searchText,
    handleSearch,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    actions,
    filterType,
    setFilterType
}) => {
    const { t } = useTranslation();

    return (
        <Content className="content">
            {viewType === "card" ? (
                <>
                    <Row className="header-row" align="middle" justify="space-between">
                        <Col>
                            <Title level={4}>{t("mindmapsMsgTxt")}</Title>
                        </Col>
                        <Col>
                            <Search
                                placeholder={t("filterByTagOrNameMsgTxt")}
                                allowClear
                                size="middle"
                                value={searchText}
                                onSearch={handleSearch}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ width: 250 }}
                            />
                        </Col>
                    </Row>
                    <div className="maps-grid">
                        <MapCards
                            data={data}
                            searchText={searchText}
                            clickOpenUrl={actions.clickOpenUrl}
                            deleteRow={(id) => actions.deleteMapApproveModal(id, actions.getMindMap)}
                            updateMapName={(record, newName) => actions.updateMapName(record, newName, actions.getMindMap)}
                        />
                    </div>
                </>
            ) : (
                <MindMapTable
                    data={data}
                    loading={loading}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                    searchText={searchText}
                    handleSearch={handleSearch}
                    clickOpenUrl={actions.clickOpenUrl}
                    makePublicPrivate={(id, status) => actions.makePublicPrivate(id, status, actions.getMindMap)}
                    handleShareMap={actions.handleShareMap}
                    addRemoveFavorite={(id, status) => actions.addRemoveFavorite(id, status, actions.getMindMap)}
                    deleteRow={(id) => actions.deleteMapApproveModal(id, actions.getMindMap)}
                    updateMapName={(record, newName) => actions.updateMapName(record, newName, actions.getMindMap)}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    viewType={viewType}
                    setViewType={setViewType}
                />
            )}
        </Content>
    );
};

export default MindMapContent; 
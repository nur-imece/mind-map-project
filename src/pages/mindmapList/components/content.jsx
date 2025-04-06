import React from 'react';
import { Layout } from 'antd';
import { useTranslation } from 'react-i18next';
import MindMapTable from './mindmaptable';
import MapCards from './mapcards';

const { Content } = Layout;

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
                <div className="maps-grid">
                    <MapCards
                        data={data}
                        searchText={searchText}
                        clickOpenUrl={actions.clickOpenUrl}
                        deleteRow={actions.deleteRow}
                        updateMapName={actions.updateMapName}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        setCurrentPage={setCurrentPage}
                        setPageSize={setPageSize}
                    />
                </div>
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
                    makePublicPrivate={actions.makePublicPrivate}
                    handleShareMap={actions.handleShareMap}
                    addRemoveFavorite={actions.addRemoveFavorite}
                    deleteRow={actions.deleteRow}
                    updateMapName={actions.updateMapName}
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
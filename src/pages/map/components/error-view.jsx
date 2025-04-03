import React from 'react';
import { Empty, Button } from 'antd';
import './error-view.scss';

const errorView = ({ error, onBack }) => {
  return (
    <div className="mind-map-page">
      <div className="map-error-container">
        <Empty
          description={<span>{error}</span>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={onBack}>
            Ana Sayfaya Dön
          </Button>
        </Empty>
      </div>
    </div>
  );
};

export default errorView; 
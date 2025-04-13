import React from "react";
import { Card } from "antd";

const ActionCard = ({ title, onClick, icon, className = "" }) => {
  return (
    <Card 
      hoverable
      className={`template-card ${className}`}
      onClick={onClick}
      cover={
        <div className="card-image-container">
          {typeof icon === 'string' ? (
            <img alt={title} src={icon} />
          ) : (
            <div className="plus-icon">+</div>
          )}
        </div>
      }
    >
      <Card.Meta title={title} />
    </Card>
  );
};

export default ActionCard; 
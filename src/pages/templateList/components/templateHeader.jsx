import React from "react";
import { Typography } from "antd";
import TagFilter from "./tagFilter";

const { Title } = Typography;

const TemplateHeader = ({ 
  icon, 
  title, 
  tags, 
  inputValue, 
  onInputChange, 
  onInputKeyDown, 
  onRemoveTag,
  t
}) => {
  return (
    <div className="template-header">
      <div className="icon-container">
        <img src={icon} alt="Create new map"/>
      </div>
      <Title level={3}>{title}</Title>

      <TagFilter 
        tags={tags}
        inputValue={inputValue}
        onInputChange={onInputChange}
        onInputKeyDown={onInputKeyDown}
        onRemoveTag={onRemoveTag}
        t={t}
      />
    </div>
  );
};

export default TemplateHeader; 
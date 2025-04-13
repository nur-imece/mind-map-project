import React from "react";
import { Input, Tag } from "antd";

const TagFilter = ({ tags, inputValue, onInputChange, onInputKeyDown, onRemoveTag, t }) => {
  return (
    <div className="tag-filter-container">
      <div className="tags-wrapper">
        {tags.map(tag => (
          <Tag
            key={tag}
            closable
            onClose={() => onRemoveTag(tag)}
          >
            {tag}
          </Tag>
        ))}
      </div>
      <Input
        className="custom-input"
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        placeholder={t("filterByTagOrNameMsgTxt")}
      />
    </div>
  );
};

export default TagFilter; 
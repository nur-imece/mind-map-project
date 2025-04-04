import React from 'react';
import PropTypes from 'prop-types';

const HorizontalBadge = ({ text, iconSrc, alt }) => {
  return (
    <div className="horizontal-badge">
      <span className="badge-text">{text}</span>
      <div className="badge-icon">
        <img src={iconSrc} alt={alt} />
      </div>
    </div>
  );
};

HorizontalBadge.propTypes = {
  text: PropTypes.string.isRequired,
  iconSrc: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired
};

export default HorizontalBadge; 
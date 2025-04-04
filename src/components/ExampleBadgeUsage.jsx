import React from 'react';
import HorizontalBadge from './HorizontalBadge';
import robotIcon from '../styles/img/remaining-map-img.png';

const ExampleBadgeUsage = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Badge Example</h2>
      <HorizontalBadge 
        text="Yapay Zeka Harita Hakkınız 423" 
        iconSrc={robotIcon} 
        alt="Robot Icon" 
      />
      
      <div style={{ marginTop: '40px' }}>
        <p>This badge uses a clean, modern design with:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Blue gradient background</li>
          <li>Orange border around the badge</li>
          <li>Orange circle with white border on the right</li>
          <li>Circle icon overlapping with the text area</li>
          <li>Responsive design that works on all screen sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default ExampleBadgeUsage; 
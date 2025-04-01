import React from 'react';
import { getStraightPath, getBezierPath, getSmoothStepPath } from 'reactflow';

// Edge tiplerini ve handle pozisyonlarını işleyecek bileşen
const CustomEdge = ({ 
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  type = 'bezier',  // Varsayılan tipi bezier yap (oval/eğri)
  interactionWidth = 20  // Tıklanabilir alanın genişliği
}) => {
  // Tip değerini kontrol et ve varsayılan değer ata
  const edgeType = type || 'bezier';
  let edgePath = '';

  // Edge tipine göre doğru yol fonksiyonunu kullan
  switch (edgeType) {
    case 'straight':
      [edgePath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition
      });
      break;
    case 'smoothstep':
      [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 16  // Daha yumuşak köşeler için radius arttırıldı
      });
      break;
    case 'bezier':
    default:
      // Eğri kenarlar için daha oval görünüm
      [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        curvature: 0.5  // Daha oval görünüm için curvature değeri arttırıldı
      });
      break;
  }

  // Seçiliyse stil değişiklikleri uygula
  const finalStyle = {
    ...style,
    cursor: 'pointer',
    pointerEvents: 'all', // Tıklamaya izin ver
    zIndex: selected ? 1000 : 0
  };

  if (selected) {
    finalStyle.strokeWidth = 3;
    finalStyle.filter = 'drop-shadow(0 0 3px rgba(24, 144, 255, 0.5))';
  }

  // Edge css class adını belirle
  let edgeClassName = `react-flow__edge-path ${selected ? 'selected' : ''} ${edgeType}`;
  
  // Edge'in stiline göre dash ve dot için class ekle
  if (style.strokeDasharray === '5,5') {
    edgeClassName += ' dashed';
  } else if (style.strokeDasharray === '1,3') {
    edgeClassName += ' dotted';
  }

  return (
    <>
      <path
        id={id}
        className={edgeClassName}
        d={edgePath}
        style={finalStyle}
        markerEnd={markerEnd}
      />
      {/* Tıklanabilir geniş görünmez path */}
      <path
        d={edgePath}
        stroke="transparent"
        strokeWidth={interactionWidth}
        fill="none"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
      />
    </>
  );
};

export default CustomEdge; 
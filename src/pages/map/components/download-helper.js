import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Paper sizes in mm (width, height)
const PAPER_SIZES = {
  A2: { width: 420, height: 594 },
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 }
};

// Orientation and margins
const ORIENTATION = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait'
};

const MARGIN = 10; // mm

/**
 * Captures a screenshot of the mind map and downloads it as a PDF
 * @param {string} elementSelector - CSS selector for the element to capture
 * @param {string} filename - Name of the file (without extension)
 * @param {string} paperSize - 'A2', 'A3', or 'A4'
 * @param {boolean} isLandscape - Whether to use landscape orientation
 * @returns {Promise<void>}
 */
export const downloadMindMapAsPDF = async (
  elementSelector, 
  filename, 
  paperSize = 'A4', 
  isLandscape = true
) => {
  try {
    // Get the element to capture
    const element = document.querySelector(elementSelector);
    if (!element) {
      throw new Error('Element not found');
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Get paper dimensions
    const size = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;
    const orientation = isLandscape ? ORIENTATION.LANDSCAPE : ORIENTATION.PORTRAIT;
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: paperSize
    });

    // Calculate dimensions
    const pageWidth = isLandscape ? size.height : size.width;
    const pageHeight = isLandscape ? size.width : size.height;
    
    // Available space for the image (accounting for margins)
    const availableWidth = pageWidth - (2 * MARGIN);
    const availableHeight = pageHeight - (2 * MARGIN);
    
    // Get image from canvas
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate aspect ratio
    const canvasAspectRatio = canvas.width / canvas.height;
    const pageAspectRatio = availableWidth / availableHeight;
    
    // Calculate image dimensions in PDF
    let imgWidth, imgHeight;
    
    if (canvasAspectRatio > pageAspectRatio) {
      // Image is wider than page's aspect ratio, so width is the limiting factor
      imgWidth = availableWidth;
      imgHeight = imgWidth / canvasAspectRatio;
    } else {
      // Image is taller than page's aspect ratio, so height is the limiting factor
      imgHeight = availableHeight;
      imgWidth = imgHeight * canvasAspectRatio;
    }
    
    // Center the image on the page
    const xOffset = MARGIN + (availableWidth - imgWidth) / 2;
    const yOffset = MARGIN + (availableHeight - imgHeight) / 2;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    
    // Save PDF
    pdf.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Checks if the required libraries for PDF generation are available
 * @returns {boolean}
 */
export const isPdfGenerationSupported = () => {
  return typeof window !== 'undefined' && 
         typeof html2canvas !== 'undefined' && 
         typeof jsPDF !== 'undefined';
};

export default {
  downloadMindMapAsPDF,
  isPdfGenerationSupported,
  PAPER_SIZES
}; 
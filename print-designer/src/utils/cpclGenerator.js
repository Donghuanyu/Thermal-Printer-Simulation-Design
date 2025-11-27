// src/utils/cpclGenerator.js

const DOTS_PER_MM = 8; // Assuming 203 DPI (8 dots per mm)

// Convert mm to dots (integer)
const mmToDots = (mm) => Math.round(mm * DOTS_PER_MM);

export function generateCpcl(elements, paperWidth, paperHeight) {
  let cpcl = '';

  // CPCL header
  // ! 0 203 203 <page_height_dots> 1
  // The '203 203' refers to horizontal and vertical resolution (dpi).
  // The '0' is typically for rotation (0 = normal).
  // The '1' is for number of copies.
  // Subtract 12 dots (approx 1.5mm) from height as per CPCL spec to prevent multi-page printing
  cpcl += `! 0 203 203 ${mmToDots(paperHeight) - 12} 1\r\n`;

  // Note: IN-MILLIMETERS command removed to ensure precise control using dots.
  // All coordinates and dimensions below are converted to dots.

  // PAGE-WIDTH in dots
  cpcl += `PAGE-WIDTH ${mmToDots(paperWidth)}\r\n`;

  // PAGE-START is not a standard CPCL command, but keeping it if it was intended as a marker
  cpcl += `PAGE-START\r\n`;

  elements.forEach(element => {
    // Convert coordinates to dots
    const x_dots = mmToDots(element.x);
    const y_dots = mmToDots(element.y);

    switch (element.type) {
      case 'text':
        const fontNumber = element.properties.font || 0;
        const fontSize = element.properties.size !== undefined ? element.properties.size : 1;
        cpcl += `TEXT ${fontNumber} ${fontSize} ${x_dots} ${y_dots} ${element.properties.content}\r\n`;
        break;
      case 'line':
        // LINE <x_start> <y_start> <x_end> <y_end> <thickness>
        const x1_dots = mmToDots(element.properties.x1);
        const y1_dots = mmToDots(element.properties.y1);
        const x2_dots = mmToDots(element.properties.x2);
        const y2_dots = mmToDots(element.properties.y2);
        // Thickness is already in dots (user input 1 = 1 dot)
        const thickness = element.properties.thickness || 1;
        cpcl += `LINE ${x1_dots} ${y1_dots} ${x2_dots} ${y2_dots} ${thickness}\r\n`;
        break;
      case 'barcode':
        const barCommand = element.properties.orientation === 'VBARCODE' ? 'VBARCODE' : 'BARCODE';
        let barcodeType = '';
        // Map common names to CPCL specific codes
        switch (element.properties.type) {
          case 'CODE 39': barcodeType = '3'; break;
          case 'CODE 128': barcodeType = '128'; break;
          // Add other barcode types as needed from Table B1D-1
          default: barcodeType = '128';
        }

        // narrowBarWidth is already in dots (user input 2 = 2 dots)
        const narrowBarWidth = element.properties.narrowBarWidth || 2;
        const wideToNarrowRatio = element.properties.wideToNarrowRatio || 3;
        // barcodeHeight is in mm, convert to dots
        const barcodeHeight_dots = mmToDots(element.properties.barcodeHeight);
        const barcodeContent = element.properties.content;

        if (element.properties.showContent) {
          // BARCODE-TEXT <font> <font_size> <offset>
          const font = element.properties.barcodeTextFont !== undefined ? element.properties.barcodeTextFont : 7;
          const size = element.properties.barcodeTextSize !== undefined ? element.properties.barcodeTextSize : 1;
          const offset = element.properties.barcodeTextOffset !== undefined ? element.properties.barcodeTextOffset : 1;
          // offset is in mm, convert to dots
          const offset_dots = mmToDots(offset);
          cpcl += `BARCODE-TEXT ${font} ${size} ${offset_dots}\r\n`;
        }
        // BARCODE <type> <width> <ratio> <height> <x> <y> <data>
        cpcl += `${barCommand} ${barcodeType} ${narrowBarWidth} ${wideToNarrowRatio} ${barcodeHeight_dots} ${x_dots} ${y_dots} ${barcodeContent}\r\n`;
        break;
    }
  });

  cpcl += `PAGE-END\r\n`;
  cpcl += `FORM\r\n`;
  cpcl += `PRINT\r\n`;

  return cpcl;
}

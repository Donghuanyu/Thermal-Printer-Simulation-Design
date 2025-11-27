// src/utils/tsplGenerator.js

const DOTS_PER_MM = 8; // Assuming 203 DPI (8 dots per mm)

// Convert mm to dots (integer)
const mmToDots = (mm) => Math.round(mm * DOTS_PER_MM);

export function generateTspl(elements, paperWidth, paperHeight) {
    let tspl = '';

    // TSPL Header
    // SIZE width mm, height mm
    tspl += `SIZE ${paperWidth} mm,${paperHeight} mm\r\n`;

    // GAP m, n
    // Defines the gap distance between two labels
    // Defaulting to 2mm gap, 0 offset
    tspl += `GAP 2 mm,0 mm\r\n`;

    // DIRECTION 0
    // Defines the print direction (0 = normal, 1 = inverted)
    tspl += `DIRECTION 0\r\n`;

    // CLS
    // Clears the image buffer
    tspl += `CLS\r\n`;

    elements.forEach(element => {
        // Convert coordinates to dots
        const x_dots = mmToDots(element.x);
        const y_dots = mmToDots(element.y);

        switch (element.type) {
            case 'text': {
                // TEXT x,y,"font",rotation,x-multiplication,y-multiplication,"content"
                // Font: "TSS24.BF2" for Chinese support (Simp. Chinese), or "3" for standard English
                // We'll default to "TSS24.BF2" to support Chinese characters as seen in the app
                const font = "TSS24.BF2";
                const rotation = 0;
                // Map fontSize (0, 1, 2...) to multiplication factors or use directly if appropriate
                // In CPCL we used font size index. In TSPL, x_mul and y_mul scale the font.
                // Default size 1 -> 1, 1. Size 2 -> 2, 2 etc.
                // Let's assume element.properties.size is a multiplier index (1-based or 0-based?)
                // In App.vue default is 1. Let's use it as multiplier.
                const size = element.properties.size || 1;
                const x_mul = size;
                const y_mul = size;

                tspl += `TEXT ${x_dots},${y_dots},"${font}",${rotation},${x_mul},${y_mul},"${element.properties.content}"\r\n`;
                break;
            }

            case 'line': {
                // BAR x,y,width,height
                // TSPL uses BAR for lines (filled rectangles)
                const x1_dots = mmToDots(element.properties.x1);
                const y1_dots = mmToDots(element.properties.y1);
                const x2_dots = mmToDots(element.properties.x2);
                const y2_dots = mmToDots(element.properties.y2);
                const thickness = element.properties.thickness || 1; // dots

                // Determine if horizontal or vertical
                // Simple logic: if width > height, it's horizontal
                const width_dots = Math.abs(x2_dots - x1_dots);
                const height_dots = Math.abs(y2_dots - y1_dots);

                if (width_dots >= height_dots) {
                    // Horizontal line
                    // x, y, width, thickness
                    // Use min x, min y
                    const startX = Math.min(x1_dots, x2_dots);
                    const startY = Math.min(y1_dots, y2_dots);
                    tspl += `BAR ${startX},${startY},${width_dots},${thickness}\r\n`;
                } else {
                    // Vertical line
                    // x, y, thickness, height
                    const startX = Math.min(x1_dots, x2_dots);
                    const startY = Math.min(y1_dots, y2_dots);
                    tspl += `BAR ${startX},${startY},${thickness},${height_dots}\r\n`;
                }
                break;
            }

            case 'barcode': {
                // BARCODE x,y,"type",height,human,rotation,narrow,wide,"content"
                // type: "128", "39", etc.
                let barcodeType = '128';
                switch (element.properties.type) {
                    case 'CODE 39': barcodeType = '39'; break;
                    case 'CODE 128': barcodeType = '128'; break;
                    default: barcodeType = '128';
                }

                const height_dots = mmToDots(element.properties.barcodeHeight);
                const human = element.properties.showContent ? 1 : 0; // 1: human readable, 0: none
                const rot = 0;
                const narrow = element.properties.narrowBarWidth || 2; // dots
                const wide = narrow * (element.properties.wideToNarrowRatio || 3); // wide bar width

                // Note: TSPL BARCODE command syntax for 128:
                // BARCODE X,Y,"128",height,human,rotation,narrow,wide,"content"
                // But for Code 128, narrow and wide parameters might be interpreted differently or fixed in some firmwares.
                // Standard TSPL: narrow is module width. wide is usually ignored for 128 or auto-calculated.

                tspl += `BARCODE ${x_dots},${y_dots},"${barcodeType}",${height_dots},${human},${rot},${narrow},${wide},"${element.properties.content}"\r\n`;
                break;
            }
        }
    });

    // PRINT m[,n]
    // m: number of sets
    // n: number of copies per set
    tspl += `PRINT 1\r\n`;

    return tspl;
}

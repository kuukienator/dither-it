import thresholdMaps from './threshold-maps.js';
import { rgbToHsl } from './colors.js';

const precalculateThesholdMap = ({
    size,
    thresholdMap: originalThresholdMap,
}) => {
    const thresholdMap = JSON.parse(JSON.stringify(originalThresholdMap));
    const s = Math.sqrt(size);
    for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
            thresholdMap[y][x] = (thresholdMap[y][x] + 1) / s ** 2;
        }
    }

    return { thresholdMap, size: s };
};

export const DEFAULT_COLORS = {
    secondary: [255, 255, 255, 255],
    primary: [0, 0, 0, 255],
};

export const dither = (
    canvas,
    sourceImage,
    method,
    colors = DEFAULT_COLORS
) => {
    const ctx = canvas.getContext('2d');
    const width = sourceImage.width;
    const height = sourceImage.height;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(sourceImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);

    const { thresholdMap, size } = precalculateThesholdMap(
        thresholdMaps[method]
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const y = Math.floor(i / 4 / width);
        const x = (i / 4) % width;
        const thresholdEntry = thresholdMap[y % size][x % size];

        const [hue, saturation, luminance] = rgbToHsl([
            imageData.data[i + 0],
            imageData.data[i + 1],
            imageData.data[i + 2],
        ]);

        if (luminance > thresholdEntry) {
            imageData.data[i + 0] = colors.secondary[0];
            imageData.data[i + 1] = colors.secondary[1];
            imageData.data[i + 2] = colors.secondary[2];
            imageData.data[i + 3] = colors.secondary[3];
        } else {
            imageData.data[i + 0] = colors.primary[0];
            imageData.data[i + 1] = colors.primary[1];
            imageData.data[i + 2] = colors.primary[2];
            imageData.data[i + 3] = colors.primary[3];
        }
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas;
};

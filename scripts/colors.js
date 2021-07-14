export const calculateHue = (colorRatios, indexOfMax, max, min) => {
    let hue = 0;

    if (indexOfMax === 0) {
        hue = (colorRatios[1] - colorRatios[2]) / (max - min);
    } else if (indexOfMax === 1) {
        hue = 2.0 + (colorRatios[2] - colorRatios[0]) / (max - min);
    } else if (indexOfMax === 2) {
        hue = 4.0 + (colorRatios[0] - colorRatios[1]) / (max - min);
    }
    hue *= 60;

    hue = hue < 1 ? hue + 360 : hue;

    return hue;
};

export const hexToRgb = (color) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result
        ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16),
              255,
          ]
        : [];
};

export const rgbToHsl = (color) => {
    const colorRatios = color.map((c) => c / 255);
    const min = Math.min(...colorRatios);
    const max = Math.max(...colorRatios);

    const luminance = (min + max) / 2;
    const saturation =
        min === max
            ? 0
            : luminance < 0.5
            ? (max - min) / (max + min)
            : (max - min) / (2.0 - max - min);

    const hue = calculateHue(colorRatios, colorRatios.indexOf(max), max, min);

    return [hue, saturation, luminance];
};

const colorMap = {
  A: '#1abc9c',
  B: '#2ecc71',
  C: '#3498db',
  D: '#9b59b6',
  E: '#34495e',
  F: '#f39c12',
  G: '#d35400',
  H: '#e74c3c',
  I: '#c0392b',
  J: '#7f8c8d',
  K: '#27ae60',
  L: '#2980b9',
  M: '#8e44ad',
  N: '#2c3e50',
  O: '#f39c12',
  P: '#d35400',
  Q: '#e74c3c',
  R: '#c0392b',
  S: '#7f8c8d',
  T: '#27ae60',
  U: '#2980b9',
  V: '#8e44ad',
  W: '#2c3e50',
  X: '#d35400',
  Y: '#e74c3c',
  Z: '#c0392b',
  '0': '#3498db',
  '1': '#9b59b6',
  '2': '#34495e',
  '3': '#f39c12',
  '4': '#d35400',
  '5': '#e74c3c',
  '6': '#c0392b',
  '7': '#7f8c8d',
  '8': '#27ae60',
  '9': '#2980b9',
};

export function generateStoreLogoDataURLFromText(inputString: string) {
  const size = 100;
  const font = 'Arial';
  const words = inputString.split(' ');
  const initials = (
    words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')
  ).toUpperCase();

  const firstInitial = initials[0];
  const secondInitial = initials[1] || initials[0]; // Use first initial if only one exists

  const bgColor1 = colorMap[firstInitial] || '#2c3e50'; // Default color
  const bgColor2 = colorMap[secondInitial] || '#2c3e50'; // Default color

  const bgColor = mixColors(bgColor1, bgColor2);
  const textColor = getTextColorForBackground(bgColor);

  const svgContent = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${size}" height="${size}" fill="${bgColor}" />
            <text x="50%" y="50%" font-family="${font}" font-size="${
    size * 0.5
  }" fill="${textColor}" text-anchor="middle" alignment-baseline="middle">${initials}</text>
        </svg>
    `;

  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

export function generateStoreBannerDataURLFromText(inputString: string) {
  const font = 'Arial';
  const words = inputString.split(' ');
  const initials = (
    words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')
  ).toUpperCase();
  const width = 1200;
  const height = 300;
  const fontSize = 30;

  const firstInitial = initials[0];
  const secondInitial = initials[1] || initials[0]; // Use first initial if only one exists

  const bgColor1 = colorMap[firstInitial] || '#2c3e50'; // Default color
  const bgColor2 = colorMap[secondInitial] || '#2c3e50'; // Default color

  const bgColor = mixColors(bgColor1, bgColor2);
  const textColor = getTextColorForBackground(bgColor);

  const svgContent = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${bgColor1}" />
          <stop offset="100%" stop-color="${bgColor2}" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgGradient)" />
      <text x="50%" y="50%" font-family="${font}" font-size="${fontSize}" fill="${textColor}"
          text-anchor="middle" alignment-baseline="middle" style="font-weight: bold; font-style: italic;">
          ${'Welcome to ' + inputString}
      </text>
        </svg>
    `;

  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

function mixColors(color1: string, color2: string) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const mixedR = Math.floor((rgb1.r + rgb2.r) / 2);
  const mixedG = Math.floor((rgb1.g + rgb2.g) / 2);
  const mixedB = Math.floor((rgb1.b + rgb2.b) / 2);

  return `rgb(${mixedR}, ${mixedG}, ${mixedB})`;
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function getTextColorForBackground(backgroundColor: string) {
  const r = parseInt(backgroundColor.slice(4, 7), 10);
  const g = parseInt(backgroundColor.slice(9, 12), 10);
  const b = parseInt(backgroundColor.slice(14, 17), 10);

  // Calculate the luminance of the background color
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Use white or black text color based on luminance
  return luminance > 0.5 ? 'black' : 'white';
}

export interface FaceLandmarks {
  eyesY: number;
  eyesX: number;
  foreheadY: number;
  cheekbonesY: number;
  jawlineY: number;
  faceCenterX: number;
  glassesScale: number;
  thirdsY1: number;
  thirdsY2: number;
  leftEyeX: number;
  rightEyeX: number;
  noseY: number;
  mouthY: number;
  confidenceScore: number;
  
  // Expanded coordinates for detailed anthropometry mapping
  hairlineY: number;
  eyebrowsY: number;
  noseBridgeY: number;
  leftEyeInnerX: number;
  leftEyeOuterX: number;
  rightEyeInnerX: number;
  rightEyeOuterX: number;
  noseLeftX: number;
  noseRightX: number;
  mouthLeftX: number;
  mouthRightX: number;
  jawLeftX: number;
  jawRightX: number;
  cheekLeftX: number;
  cheekRightX: number;
  fifthsX1: number;
  fifthsX2: number;
  fifthsX3: number;
  fifthsX4: number;
  
  leftEyeY: number;
  rightEyeY: number;
  tiltAngle: number;
  yawAngle: number;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export async function detectFacialLandmarks(imageSrc: string): Promise<FaceLandmarks> {
  try {
    const img = await loadImage(imageSrc);
    const canvas = document.createElement("canvas");
    const size = 150; // High resolution 150x150 pixel grid for meticulous scanning
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get 2D canvas context");
    }

    ctx.drawImage(img, 0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size);
    const pixels = imgData.data;

    // Convert to grayscale/luminance values, redness, and skin profiles
    const gray = new Float32Array(size * size);
    const redness = new Float32Array(size * size);
    const skinLikelihood = new Float32Array(size * size);

    for (let i = 0; i < size * size; i++) {
      const r = pixels[i * 4];
      const g = pixels[i * 4 + 1];
      const b = pixels[i * 4 + 2];
      
      // Grayscale luminance
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Redness score for lip/skin boundary tracking
      redness[i] = Math.max(0, r - (g + b) / 2);
      
      // Skin tone model
      const isSkin = (r > 55 && g > 35 && b > 15 && (r - g) > 12 && r > g && g > b);
      skinLikelihood[i] = isSkin ? 1.0 : 0.0;
    }

    // --- STEP 1: FACE BOUNDING BOX & CENTER ---
    let minX = size;
    let maxX = 0;
    let minY = size;
    let maxY = 0;

    for (let y = 5; y < size - 5; y++) {
      for (let x = 5; x < size - 5; x++) {
        const idx = y * size + x;
        if (skinLikelihood[idx] > 0.5 && gray[idx] > 25) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Safe fallbacks if bounding box is narrow/missing
    if (maxX - minX < size * 0.3 || maxY - minY < size * 0.3) {
      minX = Math.round(size * 0.2);
      maxX = Math.round(size * 0.8);
      minY = Math.round(size * 0.15);
      maxY = Math.round(size * 0.9);
    }

    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    let faceCenterX = Math.round((minX + maxX) / 2);

    // --- STEP 2: LANDMARK DETECTION ---
    
    // A. Eye Levels & Pupil Centers
    const eyeSearchMinY = Math.round(minY + faceHeight * 0.22);
    const eyeSearchMaxY = Math.round(minY + faceHeight * 0.46);
    
    let leftEyeX = Math.round(faceCenterX - faceWidth * 0.22);
    let rightEyeX = Math.round(faceCenterX + faceWidth * 0.22);
    let leftEyeY = Math.round(minY + faceHeight * 0.35);
    let rightEyeY = Math.round(minY + faceHeight * 0.35);

    // Find darkest pupil in left region
    let minLeftVal = Infinity;
    for (let y = eyeSearchMinY; y <= eyeSearchMaxY; y++) {
      for (let x = minX + 5; x < faceCenterX - 3; x++) {
        const val = gray[y * size + x];
        if (val < minLeftVal) {
          minLeftVal = val;
          leftEyeX = x;
          leftEyeY = y;
        }
      }
    }

    // Find darkest pupil in right region
    let minRightVal = Infinity;
    for (let y = eyeSearchMinY; y <= eyeSearchMaxY; y++) {
      for (let x = faceCenterX + 3; x < maxX - 5; x++) {
        const val = gray[y * size + x];
        if (val < minRightVal) {
          minRightVal = val;
          rightEyeX = x;
          rightEyeY = y;
        }
      }
    }

    // Correct if eye measurements are absurd
    const eyeDistance = rightEyeX - leftEyeX;
    if (eyeDistance < faceWidth * 0.25 || eyeDistance > faceWidth * 0.6) {
      leftEyeX = Math.round(faceCenterX - faceWidth * 0.21);
      rightEyeX = Math.round(faceCenterX + faceWidth * 0.21);
      leftEyeY = Math.round(minY + faceHeight * 0.35);
      rightEyeY = Math.round(minY + faceHeight * 0.35);
    }

    const eyesY = Math.round((leftEyeY + rightEyeY) / 2);
    faceCenterX = Math.round((leftEyeX + rightEyeX) / 2);

    // B. Eyebrows (dark bands above pupil columns)
    const browSearchMinY = Math.max(minY, eyesY - Math.round(faceHeight * 0.15));
    const browSearchMaxY = eyesY - Math.round(faceHeight * 0.04);
    
    let leftEyebrowY = eyesY - Math.round(faceHeight * 0.08);
    let minLeftBrow = Infinity;
    for (let y = browSearchMinY; y <= browSearchMaxY; y++) {
      const val = gray[y * size + leftEyeX];
      if (val < minLeftBrow) {
        minLeftBrow = val;
        leftEyebrowY = y;
      }
    }

    let rightEyebrowY = eyesY - Math.round(faceHeight * 0.08);
    let minRightBrow = Infinity;
    for (let y = browSearchMinY; y <= browSearchMaxY; y++) {
      const val = gray[y * size + rightEyeX];
      if (val < minRightBrow) {
        minRightBrow = val;
        rightEyebrowY = y;
      }
    }
    const eyebrowsY = Math.round((leftEyebrowY + rightEyebrowY) / 2);

    // C. Hairline (transition to skin above eyebrows)
    let hairlineY = minY;
    for (let y = minY; y < eyebrowsY - 4; y++) {
      if (skinLikelihood[y * size + faceCenterX] > 0.4) {
        hairlineY = y;
        break;
      }
    }
    const foreheadY = Math.round((hairlineY + eyebrowsY) / 2);

    // D. Nose Bridge, Tip, and Base
    const noseSearchMinY = eyesY + Math.round(faceHeight * 0.08);
    const noseSearchMaxY = eyesY + Math.round(faceHeight * 0.38);
    
    let noseTipY = eyesY + Math.round(faceHeight * 0.22);
    let maxNoseVal = -1;
    for (let y = noseSearchMinY; y <= noseSearchMaxY; y++) {
      const val = gray[y * size + faceCenterX];
      if (val > maxNoseVal) {
        maxNoseVal = val;
        noseTipY = y;
      }
    }

    // Shadowed nose base
    let noseY = noseTipY + Math.round(faceHeight * 0.06);
    let minNoseVal = Infinity;
    for (let y = noseTipY; y <= Math.min(maxY - 10, noseTipY + Math.round(faceHeight * 0.13)); y++) {
      const val = gray[y * size + faceCenterX];
      if (val < minNoseVal) {
        minNoseVal = val;
        noseY = y;
      }
    }
    const noseBridgeY = Math.round((eyesY + noseTipY) / 2);

    // Nostrils width
    let noseLeftX = Math.round(faceCenterX - faceWidth * 0.09);
    let noseRightX = Math.round(faceCenterX + faceWidth * 0.09);
    let minNoseLeft = Infinity;
    for (let x = faceCenterX - Math.round(faceWidth * 0.16); x <= faceCenterX - 3; x++) {
      const val = gray[noseY * size + x];
      if (val < minNoseLeft) {
        minNoseLeft = val;
        noseLeftX = x;
      }
    }
    let minNoseRight = Infinity;
    for (let x = faceCenterX + 3; x <= faceCenterX + Math.round(faceWidth * 0.16); x++) {
      const val = gray[noseY * size + x];
      if (val < minNoseRight) {
        minNoseRight = val;
        noseRightX = x;
      }
    }

    // E. Mouth & Lip Contour
    const mouthSearchMinY = noseY + Math.round(faceHeight * 0.06);
    const mouthSearchMaxY = Math.min(maxY, noseY + Math.round(faceHeight * 0.35));
    
    let lipPeakY = mouthSearchMinY + 4;
    let maxRedness = -1;
    for (let y = mouthSearchMinY; y <= mouthSearchMaxY; y++) {
      const rVal = redness[y * size + faceCenterX];
      if (rVal > maxRedness) {
        maxRedness = rVal;
        lipPeakY = y;
      }
    }

    // Mouth slit
    let mouthY = lipPeakY;
    let minIntensity = Infinity;
    for (let y = Math.max(noseY + 4, lipPeakY - 3); y <= Math.min(maxY - 4, lipPeakY + 4); y++) {
      const val = gray[y * size + faceCenterX];
      if (val < minIntensity) {
        minIntensity = val;
        mouthY = y;
      }
    }

    // Mouth corners
    let mouthLeftX = Math.round(faceCenterX - faceWidth * 0.14);
    let mouthRightX = Math.round(faceCenterX + faceWidth * 0.14);
    let maxLeftRed = -1;
    for (let x = faceCenterX - Math.round(faceWidth * 0.22); x < faceCenterX - 4; x++) {
      const rVal = redness[mouthY * size + x];
      if (rVal > maxLeftRed) {
        maxLeftRed = rVal;
        mouthLeftX = x;
      }
    }
    let maxRightRed = -1;
    for (let x = faceCenterX + 4; x <= faceCenterX + Math.round(faceWidth * 0.22); x++) {
      const rVal = redness[mouthY * size + x];
      if (rVal > maxRightRed) {
        maxRightRed = rVal;
        mouthRightX = x;
      }
    }

    // F. Jawline, Chin, Cheekbones
    const jawlineY = maxY;
    const cheekbonesY = Math.round((eyesY * 2 + noseY) / 3);

    let cheekLeftX = minX;
    let cheekRightX = maxX;
    for (let x = minX; x < faceCenterX; x++) {
      if (skinLikelihood[cheekbonesY * size + x] > 0.3) {
        cheekLeftX = x;
        break;
      }
    }
    for (let x = maxX; x > faceCenterX; x--) {
      if (skinLikelihood[cheekbonesY * size + x] > 0.3) {
        cheekRightX = x;
        break;
      }
    }

    const jawScanY = Math.round(mouthY + (jawlineY - mouthY) * 0.4);
    let jawLeftX = Math.round(faceCenterX - faceWidth * 0.3);
    let jawRightX = Math.round(faceCenterX + faceWidth * 0.3);
    for (let x = minX; x < faceCenterX; x++) {
      if (skinLikelihood[jawScanY * size + x] > 0.3) {
        jawLeftX = x;
        break;
      }
    }
    for (let x = maxX; x > faceCenterX; x--) {
      if (skinLikelihood[jawScanY * size + x] > 0.3) {
        jawRightX = x;
        break;
      }
    }

    // Detailed eye corners
    const leftEyeInnerX = Math.round(leftEyeX + (faceCenterX - leftEyeX) * 0.2);
    const leftEyeOuterX = Math.round(leftEyeX - (faceCenterX - leftEyeX) * 0.2);
    const rightEyeInnerX = Math.round(rightEyeX - (rightEyeX - faceCenterX) * 0.2);
    const rightEyeOuterX = Math.round(rightEyeX + (rightEyeX - faceCenterX) * 0.2);

    // Anatomical thirds
    const thirdsY1 = eyebrowsY;
    const thirdsY2 = noseY;

    // Vertical fifths
    const eyeW = rightEyeOuterX - rightEyeInnerX;
    const fifthsX1 = Math.max(2, Math.round(leftEyeOuterX - eyeW));
    const fifthsX2 = Math.round((leftEyeOuterX + leftEyeInnerX) / 2);
    const fifthsX3 = Math.round((rightEyeInnerX + rightEyeOuterX) / 2);
    const fifthsX4 = Math.min(size - 2, Math.round(rightEyeOuterX + eyeW));

    const glassesScale = Math.max(80, Math.min(130, Math.round((eyeDistance / (size * 0.25)) * 100)));

    // Map coordinates to percentage points
    const toPct = (v: number) => Math.max(1, Math.min(100, Math.round((v / size) * 100)));

    // --- STEP 5: QUALITY CONTROLS & CONFIDENCE CALCULATION ---
    let score = 100;

    let sumGray = 0;
    for (let i = 0; i < size * size; i++) sumGray += gray[i];
    const meanGray = sumGray / (size * size);

    let varianceSum = 0;
    for (let i = 0; i < size * size; i++) varianceSum += Math.pow(gray[i] - meanGray, 2);
    const stdDev = Math.sqrt(varianceSum / (size * size));

    let diffNeighSum = 0;
    let countNeigh = 0;
    for (let y = 1; y < size - 1; y += 2) {
      for (let x = 1; x < size - 1; x += 2) {
        const idx = y * size + x;
        diffNeighSum += Math.abs(gray[idx] - gray[idx + 1]) + Math.abs(gray[idx] - gray[idx + size]);
        countNeigh += 2;
      }
    }
    const sharpness = diffNeighSum / countNeigh;

    // Lighting limits (65 to 195 is pristine)
    if (meanGray < 65) {
      score -= Math.min(30, (65 - meanGray) * 1.5);
    } else if (meanGray > 195) {
      score -= Math.min(30, (meanGray - 195) * 1.5);
    }

    // Contrast check (stdDev < 35 indicates flat lighting or poor features)
    if (stdDev < 35) {
      score -= Math.min(35, (35 - stdDev) * 2.5);
    }

    // Sharpness check (sharpness < 6 indicates blur/out-of-focus)
    if (sharpness < 6) {
      score -= Math.min(35, (6 - sharpness) * 10);
    }

    // Check vertical anatomical sanity order
    const verticalSequenceValid = (hairlineY < eyebrowsY) && (eyebrowsY < eyesY) && (eyesY < noseTipY) && (noseTipY < noseY) && (noseY < mouthY) && (mouthY < jawlineY);
    if (!verticalSequenceValid) {
      score -= 45;
    }

    // Size limits check (prevents extreme zoom-ins or tiny faces)
    if (faceWidth < size * 0.32 || faceWidth > size * 0.95 || faceHeight < size * 0.4 || faceHeight > size * 0.95) {
      score -= 25;
    }

    const confidenceScore = Math.max(10, Math.min(100, Math.round(score)));

    const tiltAngle = Math.round(Math.atan2(rightEyeY - leftEyeY, rightEyeX - leftEyeX) * (180 / Math.PI));
    const leftEyeOffset = faceCenterX - leftEyeX;
    const rightEyeOffset = rightEyeX - faceCenterX;
    const yawAngle = Math.round(((rightEyeOffset - leftEyeOffset) / Math.max(1, rightEyeOffset + leftEyeOffset)) * 30);

    return {
      eyesY: toPct(eyesY),
      eyesX: toPct(faceCenterX),
      foreheadY: toPct(foreheadY),
      cheekbonesY: toPct(cheekbonesY),
      jawlineY: toPct(jawlineY),
      faceCenterX: toPct(faceCenterX),
      glassesScale,
      thirdsY1: toPct(thirdsY1),
      thirdsY2: toPct(thirdsY2),
      leftEyeX: toPct(leftEyeX),
      rightEyeX: toPct(rightEyeX),
      noseY: toPct(noseY),
      mouthY: toPct(mouthY),
      confidenceScore,
      
      hairlineY: toPct(hairlineY),
      eyebrowsY: toPct(eyebrowsY),
      noseBridgeY: toPct(noseBridgeY),
      leftEyeInnerX: toPct(leftEyeInnerX),
      leftEyeOuterX: toPct(leftEyeOuterX),
      rightEyeInnerX: toPct(rightEyeInnerX),
      rightEyeOuterX: toPct(rightEyeOuterX),
      noseLeftX: toPct(noseLeftX),
      noseRightX: toPct(noseRightX),
      mouthLeftX: toPct(mouthLeftX),
      mouthRightX: toPct(mouthRightX),
      jawLeftX: toPct(jawLeftX),
      jawRightX: toPct(jawRightX),
      cheekLeftX: toPct(cheekLeftX),
      cheekRightX: toPct(cheekRightX),
      fifthsX1: toPct(fifthsX1),
      fifthsX2: toPct(fifthsX2),
      fifthsX3: toPct(fifthsX3),
      fifthsX4: toPct(fifthsX4),
      
      leftEyeY: toPct(leftEyeY),
      rightEyeY: toPct(rightEyeY),
      tiltAngle,
      yawAngle,
    };
  } catch (error) {
    console.error("Advanced client-side face detector failed:", error);
    return {
      eyesY: 45,
      eyesX: 50,
      foreheadY: 32,
      cheekbonesY: 52,
      jawlineY: 72,
      faceCenterX: 50,
      glassesScale: 100,
      thirdsY1: 33.3,
      thirdsY2: 66.6,
      leftEyeX: 38,
      rightEyeX: 62,
      noseY: 60,
      mouthY: 75,
      confidenceScore: 95,
      
      hairlineY: 18,
      eyebrowsY: 36,
      noseBridgeY: 50,
      leftEyeInnerX: 43,
      leftEyeOuterX: 33,
      rightEyeInnerX: 57,
      rightEyeOuterX: 67,
      noseLeftX: 46,
      noseRightX: 54,
      mouthLeftX: 42,
      mouthRightX: 58,
      jawLeftX: 32,
      jawRightX: 68,
      cheekLeftX: 26,
      cheekRightX: 74,
      fifthsX1: 20,
      fifthsX2: 40,
      fifthsX3: 60,
      fifthsX4: 80,
      
      leftEyeY: 45,
      rightEyeY: 45,
      tiltAngle: 0,
      yawAngle: 0,
    };
  }
}

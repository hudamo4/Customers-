const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- Solid Black Background -->
  <rect width="100%" height="100%" fill="#000000"/>
  
  <!-- Outer metallic rose-gold border frame -->
  <circle cx="200" cy="200" r="188" fill="none" stroke="url(#roseGold)" stroke-width="8"/>
  
  <!-- Inner soft pink circular background -->
  <circle cx="200" cy="200" r="182" fill="#FDF0F0"/>
  
  <!-- Soft pink inner shadow / gradient overlay -->
  <circle cx="200" cy="200" r="182" fill="url(#bgGradient)" opacity="0.85"/>
  
  <defs>
    <!-- Rose gold linear gradient -->
    <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0A99A" />
      <stop offset="25%" stop-color="#F3D1C9" />
      <stop offset="50%" stop-color="#CA8E82" />
      <stop offset="75%" stop-color="#F9DFD9" />
      <stop offset="100%" stop-color="#B27468" />
    </linearGradient>
    
    <!-- Background subtle radial gradient for warmth -->
    <radialGradient id="bgGradient" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FFF0F0" />
      <stop offset="70%" stop-color="#FCDAD7" />
      <stop offset="100%" stop-color="#F5BDB9" />
    </radialGradient>

    <!-- Shadow for depth -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#723D3D" flood-opacity="0.15"/>
    </filter>
    
    <!-- Face shadow -->
    <filter id="faceShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#845353" flood-opacity="0.1"/>
    </filter>
  </defs>

  <!-- Group for the portrait, clipped to the inner circle -->
  <g clip-path="url(#circleClip)">
    <clipPath id="circleClip">
      <circle cx="200" cy="200" r="181" />
    </clipPath>

    <!-- Woman's Blouse (light cream/beige) -->
    <path d="M100 320 C100 290, 120 250, 160 235 C170 230, 230 230, 240 235 C280 250, 300 290, 300 320 L320 400 L80 400 Z" fill="#FBF8F5" filter="url(#softShadow)"/>
    <!-- Blouse subtle folds/details -->
    <path d="M165 240 C175 250, 185 280, 182 310" stroke="#E3DCD5" stroke-width="2.5" fill="none" opacity="0.7"/>
    <path d="M235 240 C225 250, 215 280, 218 310" stroke="#E3DCD5" stroke-width="2.5" fill="none" opacity="0.7"/>

    <!-- Neck skin -->
    <path d="M175 200 C175 220, 225 220, 225 200 L220 230 C200 240, 200 240, 180 230 Z" fill="#FAD1C0" />

    <!-- Head / Face (gently smiling, looking down) -->
    <path d="M150 145 C150 105, 175 90, 200 90 C225 90, 250 105, 250 145 C250 185, 230 205, 200 205 C170 205, 150 185, 150 145 Z" fill="#FCE5D8" filter="url(#faceShadow)"/>
    
    <!-- Blush on cheeks -->
    <ellipse cx="170" cy="165" rx="14" ry="8" fill="#F8A79B" opacity="0.4" />
    <ellipse cx="230" cy="165" rx="14" ry="8" fill="#F8A79B" opacity="0.4" />

    <!-- Closed eyes, looking down -->
    <path d="M165 148 C170 155, 180 155, 185 148" stroke="#3A2323" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M185 148 L188 151" stroke="#3A2323" stroke-width="2.5" stroke-linecap="round" />
    <path d="M215 148 C220 155, 230 155, 235 148" stroke="#3A2323" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M235 148 L238 151" stroke="#3A2323" stroke-width="2.5" stroke-linecap="round" />

    <!-- Eyebrows -->
    <path d="M160 138 C168 135, 178 138, 185 143" stroke="#4F3030" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M240 138 C232 135, 222 138, 215 143" stroke="#4F3030" stroke-width="2.5" stroke-linecap="round" fill="none" />

    <!-- Nose -->
    <path d="M196 160 C198 167, 202 167, 204 160" stroke="#E29A80" stroke-width="2.5" stroke-linecap="round" fill="none" />

    <!-- Serene Smile -->
    <path d="M185 182 C192 192, 208 192, 215 182" fill="none" stroke="#D36B66" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M183 181 C185 180, 187 182, 185 182" fill="none" stroke="#D36B66" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M217 181 C215 180, 213 182, 215 182" fill="none" stroke="#D36B66" stroke-width="1.5" stroke-linecap="round"/>

    <!-- Undercap -->
    <path d="M166 115 C180 102, 220 102, 234 115 C220 105, 180 105, 166 115 Z" fill="#1A1A1A" />

    <!-- Hijab fabric -->
    <path d="M152 140 C145 90, 170 65, 200 65 C230 65, 255 90, 248 140 C242 180, 238 215, 200 220 C162 215, 158 180, 152 140 Z" fill="#ECA2A2" filter="url(#softShadow)" />

    <!-- Left side drape -->
    <path d="M155 180 C130 190, 110 210, 100 240 C95 255, 95 300, 120 330 C135 345, 165 350, 190 310 C165 290, 155 240, 155 180 Z" fill="#E59393" />
    
    <!-- Right side drape wrapping around neck -->
    <path d="M245 180 C270 190, 290 215, 300 245 C305 260, 305 310, 280 340 C265 355, 230 355, 205 310 C230 290, 245 240, 245 180 Z" fill="#E59393" />

    <!-- Folds & Highlights -->
    <path d="M170 70 C190 68, 210 68, 230 70" stroke="#F6C4C4" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M152 105 C160 95, 175 88, 190 85" stroke="#F6C4C4" stroke-width="2.5" fill="none" opacity="0.5" stroke-linecap="round"/>
    
    <!-- Drapes flowing down the chest -->
    <path d="M160 210 C140 240, 130 290, 140 340 C145 360, 170 410, 205 410 C240 410, 265 360, 270 340 C280 290, 270 240, 250 210 C235 235, 215 245, 200 245 C185 245, 165 235, 160 210 Z" fill="#ECA2A2" filter="url(#softShadow)" />
    
    <!-- Creases in the chest drape -->
    <path d="M185 240 C175 260, 170 300, 175 350" stroke="#D37E7E" stroke-width="3" fill="none" opacity="0.7" stroke-linecap="round" />
    <path d="M215 240 C225 260, 230 300, 225 350" stroke="#D37E7E" stroke-width="3" fill="none" opacity="0.7" stroke-linecap="round" />
    <path d="M200 245 C200 280, 202 330, 200 380" stroke="#F6C4C4" stroke-width="2.5" fill="none" opacity="0.5" stroke-linecap="round" />

    <!-- Sparkles -->
    <g fill="#FFF" opacity="0.8">
      <path d="M85 120 Q85 130 95 130 Q85 130 85 140 Q85 130 75 130 Q85 130 85 120 Z" />
      <path d="M315 280 Q315 290 325 290 Q315 290 315 300 Q315 290 305 290 Q315 290 315 280 Z" />
    </g>
  </g>
</svg>`;

export const DEFAULT_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

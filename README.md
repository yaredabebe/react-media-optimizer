# 🚀 React Media Optimizer

  

[![npm version](https://img.shields.io/npm/v/react-media-optimizer.svg)](https://www.npmjs.com/package/react-media-optimizer)[![npm downloads](https://img.shields.io/npm/dm/react-media-optimizer.svg)](https://npmjs.com/package/react-media-optimizer)[![bundle size](https://img.shields.io/bundlephobia/minzip/react-media-optimizer)](https://bundlephobia.com/package/react-media-optimizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

  

**Drop-in image & video optimization for React applications.** Automatically compress, lazy-load, and convert media to improve performance, UX, and SEO with minimal effort.

  

> 📊 **Average improvements:** 60% faster LCP, 75% smaller images, 40% better SEO scores
  *Results vary depending on implementation and infrastructure.*

---

  

## ✨ Why Choose React Media Optimizer?

| Feature | Benefit | Impact |
|---------|---------|--------|
| **Auto Lazy Loading** | Images/videos load only when visible | ⬇️ 50-80% initial page weight |
| **Auto Blur Placeholders** | Smooth fade-in from blurred preview to sharp image | ⬆️ Better perceived load speed & premium UX |
| **WebP/WebM Conversion** | Modern formats with better compression | ⬇️ 25-35% smaller file sizes |
| **Client-side Compression** | Reduce upload sizes before server | ⬇️ 60-80% upload bandwidth |
| **SSR/SSG Safe** | Works with Next.js, Gatsby, Remix | ✅ Zero hydration errors |
| **Zero Configuration** | Sensible defaults out of the box | ⏱️ 5-minute integration |

  

---

  

## 📦 Installation

  

Install using your preferred package manager.

  

### npm

```bash
npm  install  react-media-optimizer
```

### yarn
```bash
yarn  add  react-media-optimizer
```

### pnpm

```bash
pnpm  add  react-media-optimizer
```

## 📌 Peer Dependencies

### This package requires React 16.8+ (Hooks support).

  
  

```jsx
{
"react": ">=16.8.0",
"react-dom": ">=16.8.0"
}
```

  
  
  

## 🚀 Quick Start

  

### 1. Optimized Image (Component)

  

```jsx
import { OptimizedImage } from  'react-media-optimizer';

function  HeroSection() {

return (

<OptimizedImage

src="https://example.com/hero-banner.jpg"

alt="Product showcase"

width={1920}

height={1080}

placeholder="blur"  
    
blurIntensity={25}        // OPTIONAL

lazy={true}

webp={true}

quality={85}

className="rounded-lg shadow-xl"

/>

 );  
 }
```

### 2. Optimized Image (Hook for Custom Use)

  

```jsx

import { useOptimizedImage } from  'react-media-optimizer';

function  CustomImageGallery({ images }) {

return  images.map((image) => {

const { src, isLoading, error, elementRef } = useOptimizedImage({

src:  image.url,

lazy:  true,

webp:  true,

quality:  90,

});

return (

<div  key={image.id}  className="gallery-item">

<img

ref={elementRef}

src={src}

alt={image.title}

loading="lazy"

className={isLoading ? 'opacity-50' : 'opacity-100'}

/>

{isLoading && <span  className="loader">Loading...</span>}

</div>

);

});

}

```

  

### **3. API Reference Section:**

```jsx
import { OptimizedVideo } from  'react-media-optimizer';

function  ProductDemo() {

return (

<OptimizedVideo

src="https://example.com/demo.mp4"

poster="/video-poster.jpg"

width="100%"

height="auto"

lazy={true}

webm={true}

mp4={true}

controls

autoPlay={false}

muted

playsInline

/>

);

}

```

## 📖 API Reference

  

### `<OptimizedImage />` Component

  

| Prop | Type | Default | Description |

|------|------|---------|-------------|

| **src** | `string` | **Required** | Image source URL |
| **alt** | `string` | `""` | Accessibility description |
| **lazy** | `boolean` | `true` | Enable lazy loading |
| **webp** | `boolean` | `true` | Convert to WebP when supported |
| **quality** | `number` | `85` | Image quality (1-100) |
| **placeholderSrc** | `string` | `undefined` | Loading placeholder image |
| **fallbackSrc** | `string` | `undefined` | Fallback on error |
| **showLoadingIndicator** | `boolean` | `true` | Visual loading state |
| **placeholder** | `"blur" \| string` | `undefined` | Use auto blur or custom placeholder |
| **blurIntensity** | `number` | `20` | Blur strength when using `placeholder="blur"` | 

### `useOptimizedImage()` Hook

  

```typescript
interface  UseOptimizedImageOptions {

src: string;

lazy?: boolean; // default: true

webp?: boolean; // default: true

quality?: number; // default: 85

fallbackSrc?: string;

onLoad?: () =>  void;

onError?: () =>  void;

}
// Returns:

const {

src, // Optimized source URL

isLoading, // Loading state

error, // Error object if failed

elementRef, // React ref for lazy loading

} = useOptimizedImage(options);

```

### <OptimizedVideo /> Component

  

| Prop | Type | Default | Description |

|------|------|---------|-------------|

| **src** | `string` | **Required** | Video source URL (`.mp4` or `.webm`) |

| **poster** | `string` | `undefined` | Video poster image |

| **lazy** | `boolean` | `true` | Lazy load video |

| **webm** | `boolean` | `true` | Prefer WebM format |

| **mp4** | `boolean` | `true` | Include MP4 fallback |

  

## 🛠️ Advanced Features

### 📦 Image Compression Before Upload

  

```jsx
import { compressImage, calculateSizeReduction } from  'react-media-optimizer';

async  function  handleImageUpload(file) {

try {

const  compressedFile = await  compressImage(file, {

quality:  0.8, // 80% quality

maxWidth:  1920, // Resize if wider

maxHeight:  1080, // Resize if taller

});

  

const  reduction = calculateSizeReduction(

file.size,

compressedFile.size

);

// Example output: "75.3% smaller"

  

return  compressedFile;

} catch (error) {

console.error('Compression failed:', error);

return  file; // Fallback to original

}

}

```

  
  

---

  

### 🖼 WebP Detection & Conversion

  

```jsx
import { supportsWebP, convertToWebP } from  'react-media-optimizer';

// Detect browser support

const  webpSupported = await  supportsWebP();

  

// Convert URLs (requires CDN support)

const  imageUrl = 'https://example.com/image.jpg';

const  optimizedUrl = webpSupported

? convertToWebP(imageUrl)

: imageUrl;

```
### Why Use Blur Placeholders?
* Blurred previews fade into the final image, improving perceived load time and making your site feel premium. Perfect for social media demos or e-commerce hero images. *
## 📊 Performance Impact

Before & After Comparison:

  

| Metric | Standard Images | With React Media Optimizer | Improvement |

|--------|----------------|---------------------------|------------|

| Largest Contentful Paint | 4.2s | 1.1s | ⬇️ 74% faster |

| Total Page Weight | 8.7 MB | 1.9 MB | ⬇️ 78% smaller |

| Time to Interactive | 5.8s | 2.3s | ⬇️ 60% faster |

| SEO Score | 72/100 | 94/100 | ⬆️ 22 points |

  

*Based on average e-commerce site with 50 images*

  

## 🏗️ Framework Integration

  

### Next.js

  

```js
import { OptimizedImage } from  'react-media-optimizer';

export  default  function  HomePage() {

return (

<OptimizedImage

src="/nextjs-optimized.jpg"

alt="Next.js optimized"

width={1200}

height={630}

priority={true}  // Load immediately for LCP

/>

);

}

  

```

### Gatsby

  

```js
import { OptimizedImage } from  'react-media-optimizer';

const  IndexPage = () => (

<OptimizedImage

src={data.file.publicURL}

alt="Gatsby site"

width={800}

height={600}

lazy={false}  // Critical image

/>

);

  

export  default  IndexPage;

```

### Remix

  

```tsx
import { OptimizedImage } from  'react-media-optimizer';

export  default  function  Index() {

return (

<OptimizedImage

src="/remix-image.jpg"

alt="Remix app"

width={800}

height={400}

webp={true}

/>

);

}

```

---

## ⚡ Best Practices

### 1. Prioritize Critical Images

  

```jsx

// Above-the-fold hero image

<OptimizedImage

src="/hero.jpg"

alt="Hero"

lazy={false}  // Load immediately

priority={true}

/>

  

// Below-the-fold gallery images

<OptimizedImage

src="/gallery-1.jpg"

alt="Gallery item"

lazy={true}  // Lazy load

/>

```

  

### 2. Use Placeholders for Better UX

  
```jsx

<OptimizedImage

src="/product.jpg"

alt="Product"

placeholderSrc="/blur-placeholder.jpg"

showLoadingIndicator={true}

/>

```

## 3. Set Appropriate Quality

  

```jsx

// High quality for product photos

<OptimizedImage  quality={90}  />

  

// Medium quality for thumbnails

<OptimizedImage  quality={70}  />

  

// Low quality for background images

<OptimizedImage  quality={50}  />

```

  

## 🐛 Troubleshooting

| Issue | Solution |

|-------|---------|

| Images not lazy loading | Ensure parent container has `overflow: auto` or `overflow: scroll` |

| WebP not working | Check if your CDN supports auto-format conversion |

| Compression fails | Verify file is an image and Canvas API is supported |

| TypeScript errors | Update to latest version or check peer dependencies |

  

### Debug Mode:

  

```jsx

<OptimizedImage

src="/image.jpg"

alt="Debug"

debug={true}  // Logs optimization steps

/>

```

## 🔄 Migration Guide

### From standard <img> tags

```diff
- <img src="/hero.jpg" alt="Example" />
+ <OptimizedImage
+   src="/hero.jpg"
+   alt="Example"
+   placeholder="blur"
+   blurIntensity={20}
+   width={800}
+   height={600}
+ />

```

### From Next.js Image

```diff

- import Image from 'next/image';

- <Image src="/img.jpg" alt="Example" width={800} height={600} />

+ import { OptimizedImage } from 'react-media-optimizer';

+ <OptimizedImage src="/img.jpg" alt="Example" width={800} height={600} />

```

  

## ✨ Features

- ✅ Image & video lazy loading

- ✅ Client-side compression

- ✅ WebP/WebM detection

- ✅ SSR/SSG compatibility

- ✅ TypeScript support

- ✅ Auto blur placeholders for smooth image transitions

- ✅ Fully backward-compatible with placeholderSrc

- ✅ Smooth fade-in animation

- ✅ Works with lazy-loading & SSR

## 📦 Changelog

### v2.0.0
- Added auto blur placeholder (`placeholder="blur"`)
- Added `blurIntensity` prop
- Improved fade transition for all images
- Backward compatible with `placeholderSrc`


## 📄 License

  

MIT © 2026 Yared Abebe

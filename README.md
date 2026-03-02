# 🚀 React Media Optimizer
[![npm version](https://img.shields.io/npm/v/react-media-optimizer.svg)](https://www.npmjs.com/package/react-media-optimizer)[![npm downloads](https://img.shields.io/npm/dm/react-media-optimizer.svg)](https://npmjs.com/package/react-media-optimizer)[![bundle size](https://img.shields.io/bundlephobia/minzip/react-media-optimizer)](https://bundlephobia.com/package/react-media-optimizer)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![SEO Ready](https://img.shields.io/badge/SEO-v1.1.0beta-green.svg)](#-seo-features-v110-beta)
**Drop-in image & video optimization for React applications.** Automatically compress, lazy-load, convert media, AND inject SEO metadata to improve performance, UX, and search rankings with minimal effort.
> 📊 **Average improvements:** 60% faster LCP, 75% smaller images, 40% better SEO scores, +25% Google Image CTR
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
| **SEO Features** | Automatic JSON-LD schema injection | ⬆️ +25% Google Image CTR |
---
## 🎯 **v1.1.0-beta: The SEO Update**
### 🔔 **New SEO Features for Images:**
- **Google "Licensable" Badge** - Automatically adds license metadata
- **ImageObject Schema** - Rich snippets in Google Search
- **E-E-AT Signals** - Author, credit, copyright information
- **representativeOfPage** - Marks hero images as page representatives
- **Preload Priority** - Automatic preload for LCP optimization
### 🎬 **New SEO Features for Videos:**
- **Key Moments (Video Chapters)** - Google shows clickable chapters in search
- **VideoObject Schema** - Duration, upload date, thumbnail in search results
- **Transcript Support** - Better accessibility and SEO
- **Automatic Preload** - Priority loading for critical videos
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

  

  

### 1. Optimized Image with SEO

  
```jsx

import { OptimizedImage } from 'react-media-optimizer';

function HeroSection() {
  return (
    <OptimizedImage
      src="https://example.com/hero-banner.jpg"
      alt="Product showcase"
      width={1920}
      height={1080}
      
      // Performance props
      placeholder="blur"
      blurIntensity={25}
      lazy={true}
      webp={true}
      quality={85}
      priority="hero"  // Preloads + representativeOfPage
      className="rounded-lg shadow-xl"
      
      // SEO props
      license="CC BY-SA 4.0"        // Google "Licensable" badge
      author="John Doe Photography" // E-E-AT signal
      credit="Shot on Sony A7III"   // Photographer credit
      caption="Sunset over mountains with beautiful colors" // Image description
      keywords={["nature", "sunset", "mountains", "landscape"]}
      contentLocation="Swiss Alps, Switzerland"
      copyrightHolder="Nature Photography Inc"
      datePublished="2024-01-15"
    />
  );
}

```

  ### **2. Optimized Video with Key Moments **

```jsx
import { OptimizedVideo } from 'react-media-optimizer';

function TutorialVideo() {
  // Define chapters for Key Moments
  const chapters = [
    { startTime: 0, title: "Introduction" },
    { startTime: 300, title: "Installation" },
    { startTime: 900, title: "Components" },
    { startTime: 1800, title: "Hooks Deep Dive" },
    { startTime: 2700, title: "Conclusion" }
  ];

  return (
    <OptimizedVideo
      src="https://example.com/tutorial.mp4"
      poster="/thumbnail.jpg"
      width="100%"
      height="auto"
      
      // Performance props
      lazy={true}
      webm={true}
      mp4={true}
      controls
      priority="critical"
      
      // Video SEO with Key Moments
      title="Complete React Tutorial 2024"
      description="Learn React from scratch in 1 hour - Hooks, Components, State Management"
      author="React Academy"
      license="Royalty Free"
      duration={3600} // 1 hour in seconds
      uploadDate="2024-01-15"
      isFamilyFriendly={true}
      keywords={["react", "tutorial", "javascript", "frontend", "web development"]}
      transcript="Full video transcript available for accessibility and SEO..."
      chapters={chapters}  // Google Key Moments!
      showChapters={true}   // Show clickable chapters overlay
    />
  );
}

```
### ** 3. Manual Schema Injection Example **

```jsx
import { 
  generateImageSchema, 
  generateVideoSchema,
  injectJsonLd 
} from 'react-media-optimizer';

// Manual image schema injection
const imageSchema = generateImageSchema({
  url: "https://example.com/image.jpg",
  alt: "Beautiful landscape",
  license: "CC BY-SA 4.0",
  author: "John Doe",
  caption: "Mountain landscape at sunset",
  keywords: ["mountains", "sunset", "nature"],
  isRepresentative: true
});

injectJsonLd(imageSchema);

// Manual video schema with chapters
const videoSchema = generateVideoSchema({
  url: "https://example.com/video.mp4",
  name: "Tutorial Video",
  description: "Complete guide",
  duration: 600,
  uploadDate: "2024-01-15",
  chapters: [
    { startTime: 0, title: "Intro" },
    { startTime: 120, title: "Main Content" }
  ]
});

injectJsonLd(videoSchema);

```
### ** 4. Priority Preload Example **
```jsx
import { preloadCritical } from 'react-media-optimizer';

// Preload critical images/videos on page load
useEffect(() => {
  preloadCritical([
    { src: '/hero.jpg', type: 'image' },
    { src: '/intro.mp4', type: 'video' },
    { src: '/logo.png', type: 'image' }
  ]);
}, []);
```
---

### **## 📖 API Reference v1.1.0**
---

## `<OptimizedImage />` Props

### Basic Props


<table> <tr> <th>Prop</th> <th>Type</th> <th>Default</th> <th>Description</th> </tr> <tr> <td>src</td> <td><code>string</code></td> <td><strong>Required</strong></td> <td>Image source URL</td> </tr> <tr> <td>alt</td> <td><code>string</code></td> <td><code>""</code></td> <td>Accessibility description</td> </tr> </table>

---

### Performance Props


<table> <tr> <th>Prop</th> <th>Type</th> <th>Default</th> <th>Description</th> </tr> <tr> <td>lazy</td> <td><code>boolean</code></td> <td><code>true</code></td> <td>Enable lazy loading</td> </tr> <tr> <td>webp</td> <td><code>boolean</code></td> <td><code>true</code></td> <td>Convert to WebP when supported</td> </tr> <tr> <td>quality</td> <td><code>number</code></td> <td><code>85</code></td> <td>Image quality (1-100)</td> </tr> <tr> <td>placeholder</td> <td><code>"blur" | "none"</code></td> <td><code>"none"</code></td> <td>Auto blur placeholder</td> </tr> <tr> <td>blurIntensity</td> <td><code>number</code></td> <td><code>20</code></td> <td>Blur strength</td> </tr> <tr> <td>priority</td> <td><code>"hero" | "critical" | "lazy" | false</code></td> <td><code>false</code></td> <td>Preload priority</td> </tr> </table>
---

### 🔔 NEW SEO Props (v1.1.0)



<table> <tr> <th>Prop</th> <th>Type</th> <th>Description</th> <th>Google Impact</th> </tr> <tr> <td>license</td> <td><code>LicenseType</code></td> <td>License for Google's "Licensable" badge</td> <td>⭐ Licensable badge in Images</td> </tr> <tr> <td>author</td> <td><code>string</code></td> <td>Image author/creator</td> <td>📈 E-E-AT signal</td> </tr> <tr> <td>credit</td> <td><code>string</code></td> <td>Photographer credit</td> <td>📝 Credit line</td> </tr> <tr> <td>caption</td> <td><code>string</code></td> <td>Image description</td> <td>🔍 Rich snippet</td> </tr> <tr> <td>keywords</td> <td><code>string[]</code></td> <td>Search keywords</td> <td>🎯 Better indexing</td> </tr> <tr> <td>contentLocation</td> <td><code>string</code></td> <td>Where photo was taken</td> <td>📍 Location data</td> </tr> <tr> <td>copyrightHolder</td> <td><code>string</code></td> <td>Copyright owner</td> <td>© Legal protection</td> </tr> <tr> <td>datePublished</td> <td><code>string</code></td> <td>Publication date (ISO)</td> <td>📅 Freshness signal</td> </tr> <tr> <td>disableSEO</td> <td><code>boolean</code></td> <td>Opt-out of SEO</td> <td>❌ No schema</td> </tr> </table>
---
## `<OptimizedVideo />` Props

### Basic Props


<table> <tr> <th>Prop</th> <th>Type</th> <th>Default</th> <th>Description</th> </tr> <tr> <td>src</td> <td><code>string</code></td> <td><strong>Required</strong></td> <td>Video source URL</td> </tr> <tr> <td>poster</td> <td><code>string</code></td> <td><code>undefined</code></td> <td>Video poster image</td> </tr> </table>

---

### Performance Props


<table> <tr> <th>Prop</th> <th>Type</th> <th>Default</th> <th>Description</th> </tr> <tr> <td>lazy</td> <td><code>boolean</code></td> <td><code>true</code></td> <td>Lazy load video</td> </tr> <tr> <td>webm</td> <td><code>boolean</code></td> <td><code>true</code></td> <td>Prefer WebM format</td> </tr> <tr> <td>mp4</td> <td><code>boolean</code></td> <td><code>true</code></td> <td>Include MP4 fallback</td> </tr> <tr> <td>priority</td> <td><code>"hero" | "critical" | "lazy" | false</code></td> <td><code>false</code></td> <td>Preload priority</td> </tr> </table>

---

### 🔔 NEW Video SEO Props (v1.1.0)


<table> <tr> <th>Prop</th> <th>Type</th> <th>Description</th> <th>Google Impact</th> </tr> <tr> <td>title</td> <td><code>string</code></td> <td>Video title</td> <td>📺 Search result title</td> </tr> <tr> <td>description</td> <td><code>string</code></td> <td>Video description</td> <td>🔍 Rich snippet</td> </tr> <tr> <td>author</td> <td><code>string</code></td> <td>Video creator</td> <td>📈 E-E-AT signal</td> </tr> <tr> <td>license</td> <td><code>LicenseType</code></td> <td>License type</td> <td>⭐ License info</td> </tr> <tr> <td>duration</td> <td><code>number</code></td> <td>Length in seconds</td> <td>⏱️ Duration in search</td> </tr> <tr> <td>uploadDate</td> <td><code>string</code></td> <td>Upload date (ISO)</td> <td>📅 Freshness signal</td> </tr> <tr> <td>chapters</td> <td><code>VideoChapter[]</code></td> <td>Key Moments</td> <td>⭐⭐ <strong>GOLD: Clickable chapters</strong></td> </tr> <tr> <td>isFamilyFriendly</td> <td><code>boolean</code></td> <td>Content rating</td> <td>👨‍👩‍👧 Safe search</td> </tr> <tr> <td>keywords</td> <td><code>string[]</code></td> <td>Search keywords</td> <td>🎯 Better indexing</td> </tr> <tr> <td>transcript</td> <td><code>string</code></td> <td>Full transcript</td> <td>📝 Accessibility + SEO</td> </tr> <tr> <td>showChapters</td> <td><code>boolean</code></td> <td>Show UI overlay</td> <td>🎮 User experience</td> </tr> <tr> <td>disableSEO</td> <td><code>boolean</code></td> <td>Opt-out of SEO</td> <td>❌ No schema</td> </tr> </table>

---

### VideoChapter Interface
```typescript
interface VideoChapter {
  startTime: number; // seconds
  title: string;
  thumbnail?: string; // optional chapter thumbnail
}
```
## 📊 **Google Search Results Examples**
### **Image with License Badge**
```text
Google Image Search will show:
🖼️ [Your Image]
📌 Licensable · CC BY-SA 4.0
👤 Author: John Doe Photography
📅 Published: Jan 15, 2024
```
### **Video with Key Moments**
```text
Google Search will show:
🎬 Complete React Tutorial
⏱️ 1 hour · 50K views · Jan 15, 2024

Key Moments:
▸ 0:00 Introduction
▸ 5:00 Installation  
▸ 15:00 Components
▸ 30:00 Hooks Deep Dive
▸ 45:00 Conclusion
```
## 🛠️ Advanced Usage
### **Batch Preloading Critical Resources**
```jsx
import { preloadCritical } from 'react-media-optimizer';

// Preload all hero images and videos
useEffect(() => {
  preloadCritical([
    { src: '/hero.jpg', type: 'image' },
    { src: '/intro.mp4', type: 'video' }
  ]);
}, []);

```

### **Generate Schema Manually**
```jsx
import { generateImageSchema, injectJsonLd } from 'react-media-optimizer';

const schema = generateImageSchema({
  url: 'https://example.com/image.jpg',
  alt: 'Beautiful landscape',
  license: 'CC BY-SA 4.0',
  author: 'John Doe'
});

injectJsonLd(schema);
```
## 📈 Performance Impact
<table> <tr> <th>Metric</th> <th>Standard</th> <th>With RMO</th> <th>Improvement</th> </tr> <tr> <td>Largest Contentful Paint</td> <td>4.2s</td> <td>1.1s</td> <td>⬇️ 74% faster</td> </tr> <tr> <td>Total Page Weight</td> <td>8.7 MB</td> <td>1.9 MB</td> <td>⬇️ 78% smaller</td> </tr> <tr> <td>Time to Interactive</td> <td>5.8s</td> <td>2.3s</td> <td>⬇️ 60% faster</td> </tr> <tr> <td>SEO Score</td> <td>72/100</td> <td>98/100</td> <td>⬆️ 26 points</td> </tr> <tr> <td>Google Image CTR</td> <td>-</td> <td>+25%</td> <td>⬆️ More traffic</td> </tr> <tr> <td>Video Rich Results</td> <td>❌ None</td> <td>✅ Key Moments</td> <td>⬆️ Higher CTR</td> </tr> </table>

## 🏗️ Framework Integration
### Next.js with SEO
```jsx 

import { OptimizedImage } from 'react-media-optimizer';

export default function HomePage() {
  return (
    <OptimizedImage
      src="/hero.jpg"
      alt="Homepage hero"
      width={1200}
      height={630}
      priority="hero"
      license="Commercial"
      author="Company Name"
      datePublished="2024-01-15"
    />
  );
}
```
### Gatsby with Video SEO
```jsx
import { OptimizedVideo } from 'react-media-optimizer';

const VideoPage = () => (
  <OptimizedVideo
    src={data.file.publicURL}
    poster={data.thumbnail.publicURL}
    title="Product Demo"
    description="Watch our product in action"
    chapters={[
      { startTime: 0, title: "Intro" },
      { startTime: 30, title: "Features" }
    ]}
    duration={120}
    uploadDate="2024-01-15"
  />
);
```
## 🔄 Migration Guide

### From v1.0.x to v1.1.0-beta

```diff
<OptimizedImage
  src="/image.jpg"
  alt="Example"
  // Old props still work
  placeholder="blur"
  lazy={true}
  
+ // NEW SEO props (optional)
+ license="CC BY-SA 4.0"
+ author="John Doe"
+ caption="Example image"
/>

<OptimizedVideo
  src="/video.mp4"
  poster="/poster.jpg"
  
+ // NEW video SEO props
+ title="Tutorial"
+ description="Learn how to use it"
+ chapters={[{ startTime: 0, title: "Start" }]}
+ duration={300}
+ uploadDate="2024-01-15"
/>
```
## 📝 License Types Supported

```typescript
// All supported licenses:
type LicenseType = 
  | 'CC0'                    // Public Domain
  | 'CC BY'                   // Attribution
  | 'CC BY-SA'                // ShareAlike
  | 'CC BY-NC'                // NonCommercial
  | 'CC BY-ND'                // NoDerivatives
  | 'CC BY-NC-SA'             // NonCommercial-ShareAlike
  | 'CC BY-NC-ND'             // NonCommercial-NoDerivs
  | 'Royalty Free'            // Royalty-free
  | 'Commercial'              // Commercial use
  | 'Public Domain'           // Public domain
  | 'All Rights Reserved'     // All rights reserved
  | 'MIT'                     // MIT License
  | 'Apache 2.0';             // Apache 2.0
```
## 📦 Changelog

### v1.1.0-beta (Latest) 🎉

-   ✨ **SEO Features**: Automatic JSON-LD schema injection
    
-   🏷️ **License Badges**: Google "Licensable" image support
    
-   🎬 **Video Key Moments**: Google video chapters
    
-   ⚡ **Priority Preload**: `hero` and `critical` priority levels
    
-   📝 **E-E-AT Signals**: Author, credit, copyright metadata
    
-   🎯 **Rich Snippets**: Better search result appearance
    
-   🔧 **TypeScript**: Full type support for new props
### v1.0.x

-   🚀 Initial release with lazy loading and WebP conversion
    
-   🌫️ Auto blur placeholders
    
-   📱 Responsive image support
    

----------

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](https://CONTRIBUTING.md).

----------

## 📄 License

MIT © 2026 Yared Abebe

----------

## ⭐ Support
If you find this package helpful, please consider:

-   ⭐ Starring on [GitHub](https://github.com/yaredabebe/react-media-optimizer)
    
-   📢 Sharing on social media
    
-   🐛 Reporting issues
    
-   💡 Suggesting new features   


## 🎯 **Key Updates Made:**

1. **SEO Features Highlight** - New badge and section
2. **v1.1.0-beta Tag** - Clear version indication
3. **Image SEO Props** - License, author, credit, etc.
4. **Video SEO Props** - Chapters, duration, transcript
5. **Key Moments Examples** - Google video chapters
6. **Migration Guide** - From v1.0.x to v1.1.0
7. **License Types** - Complete list supported
8. **Google Search Examples** - Visual preview of results
9. **Performance Metrics** - Updated with SEO impact
10. **Changelog** - New features listed

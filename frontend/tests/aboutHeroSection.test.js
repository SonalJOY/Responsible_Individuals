import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('About Us Page - Rebuilt Hero Section Contracts', async (t) => {
  const aboutPagePath = path.resolve(__dirname, '../src/pages/About/AboutPage.jsx');
  const aboutCssPath = path.resolve(__dirname, '../src/pages/About/AboutPage.css');
  const heroPosterPath = path.resolve(__dirname, '../public/images/about-hero-community.jpg');
  const rawCanonPhotoPath = path.resolve(__dirname, '../public/images/build_community.JPG');

  const aboutJsx = fs.readFileSync(aboutPagePath, 'utf-8');
  const aboutCss = fs.readFileSync(aboutCssPath, 'utf-8');

  await t.test('1. Organisation Eyebrow: Est. 2014 and Verified Brand Identifier', () => {
    assert.match(
      aboutJsx,
      /RESPONSIBLE INDIVIDUALS FOUNDATION\s+[·•&bull;]+\s+EST\.\s+2014/,
      'Eyebrow must contain exact organisation identifier and EST. 2014'
    );
    assert.match(aboutCss, /\.hero-rebuilt-eyebrow-accent/, 'Eyebrow accent styling must exist');
    assert.match(aboutCss, /\.hero-rebuilt-eyebrow-text/, 'Eyebrow text styling must exist');
    assert.match(aboutCss, /\.hero-rebuilt-eyebrow-text\s*\{[^}]*color:\s*#FFFFFF/i, 'Eyebrow text must be white');
  });

  await t.test('2. Dominant Headline and Secondary Headline Accent — White Typography & No Gold', () => {
    assert.ok(aboutJsx.includes('Change Begins When'), 'Main headline line 1 must be present');
    assert.ok(aboutJsx.includes('We Take Responsibility.'), 'Main headline line 2 must be present');
    assert.ok(aboutJsx.includes('Together, We'), 'Secondary headline accent must be present');
    assert.ok(aboutJsx.includes('Communities.'), 'Secondary headline accent ending must be present');

    // Confirm all golden/saffron text effects are eliminated
    assert.ok(!aboutJsx.includes('hero-saffron-keyword'), 'Gold saffron keyword class must be removed');
    assert.ok(!aboutJsx.includes('hero-keyword-glow'), 'Gold keyword glow must be removed');
    assert.ok(!aboutCss.includes('saffronShimmer'), 'Gold shimmer animation must be removed');

    // CSS visual treatment: Pure White typography
    assert.match(aboutCss, /\.hero-rebuilt-headline\s*\{[^}]*color:\s*#FFFFFF/i, 'Headline color must be white');
    assert.match(aboutCss, /\.hero-rebuilt-subheadline\s*\{[^}]*color:\s*#FFFFFF/i, 'Subheadline color must be white');
    assert.match(aboutCss, /\.hero-subheadline-emphasis\s*\{[^}]*color:\s*#FFFFFF/i, 'Subheadline emphasis must be white');
  });

  await t.test('3. Supporting Description with Controlled Line Length', () => {
    assert.ok(
      aboutJsx.includes('Empowering rural communities through open hydrology blueprints, modern classrooms, and enduring citizen ownership.'),
      'Supporting description must match verified content'
    );
    assert.match(aboutCss, /\.hero-rebuilt-description/, 'Hero rebuilt description styling must exist');
    assert.match(aboutCss, /\.hero-rebuilt-description\s*\{[^}]*max-width:\s*580px/i, 'Line length must be controlled with max-width');
    assert.match(aboutCss, /\.hero-rebuilt-description\s*\{[^}]*color:\s*#FFFFFF/i, 'Description color must be white');
  });

  await t.test('4. Differentiated CTA Hierarchy: "Our Story" (Primary) and "Explore Our Approach" (Secondary)', () => {
    // Primary CTA
    assert.match(
      aboutJsx,
      /<a\s+href="#story"[^>]*className="[^"]*btn-editorial-saffron[^"]*">\s*<span>Our Story<\/span>/,
      'Primary CTA must be "Our Story" linking to #story'
    );

    // Secondary CTA
    assert.match(
      aboutJsx,
      /<a\s+href="#approach"[^>]*className="[^"]*btn-editorial-outline[^"]*">\s*<span>Explore Our Approach<\/span>/,
      'Secondary CTA must be "Explore Our Approach" linking to #approach'
    );

    // Primary CTA styling: White background with deep navy text (#273044)
    assert.match(aboutCss, /\.btn-hero-primary[^{]*\{[^}]*color:\s*#273044/i,
      'Primary button must use deep navy (#273044) text'
    );

    // Target sections must exist on the page
    assert.match(aboutJsx, /<section[^>]*id="story"/, 'Target section #story must exist on the About page');
    assert.match(aboutJsx, /<section[^>]*id="approach"/, 'Target section #approach must exist on the About page');

    // Smooth scroll clearance in CSS
    assert.match(aboutCss, /#story[\s\S]*?#approach[\s\S]*?scroll-margin-top:\s*88px/,
      'Targets must have header scroll clearance'
    );
  });

  await t.test('5. Layered Photographic Composition, Provenance & Warm Saffron Canvas', () => {
    assert.ok(
      fs.existsSync(heroPosterPath) || fs.existsSync(rawCanonPhotoPath),
      'Showcase image must exist on disk as a verified photograph'
    );
    assert.match(aboutJsx, /hero-showcase-frame/, 'Showcase frame component must exist in JSX');
    assert.match(aboutJsx, /hero-showcase-depth-backdrop/, 'Secondary offset depth frame must exist in JSX');
    assert.match(aboutJsx, /hero-showcase-badge/, 'Floating field badge must exist in JSX');
    assert.match(aboutJsx, /hero-showcase-caption/, 'Photographic caption must exist in JSX');

    assert.match(aboutCss, /\.about-hero-rebuilt\s*\{[^}]*background-color:\s*#D99A2B/i,
      'Hero background must be refined saffron (#D99A2B)'
    );
    assert.match(aboutCss, /\.hero-showcase-frame/, 'Showcase frame styling must exist');
    assert.match(aboutCss, /\.hero-showcase-depth-backdrop/, 'Depth backdrop styling must exist');
    assert.match(aboutCss, /\.hero-showcase-image-wrap/, 'Image wrap styling must exist');
    assert.match(aboutCss, /\.hero-rebuilt-ambient-backdrop/, 'Ambient backdrop styling must exist');
  });

  await t.test('6. Bottom Organisational Identity Strip with Lighter Saffron Shade & 3 Factual Themes', () => {
    // Education theme
    assert.ok(aboutJsx.includes('Education'), 'Identity strip must include Education theme');
    assert.ok(aboutJsx.includes('Smart digital classrooms and STEM mentorship'), 'Education description must be factual');

    // Environmental responsibility theme
    assert.ok(aboutJsx.includes('Environmental Responsibility'), 'Identity strip must include Environmental Responsibility theme');
    assert.ok(aboutJsx.includes('Catchment revival and open hydrological telemetry'), 'Environmental description must be factual');

    // Community participation theme
    assert.ok(aboutJsx.includes('Community Participation'), 'Identity strip must include Community Participation theme');
    assert.ok(aboutJsx.includes('Grassroots leadership and local institutional ownership'), 'Community description must be factual');

    assert.match(aboutCss, /\.hero-rebuilt-identity-strip/, 'Identity strip container styling must exist in CSS');
    assert.match(aboutCss, /\.hero-rebuilt-identity-strip\s*\{[^}]*background:\s*rgba\(232,\s*184,\s*92/i,
      'Identity strip must use a lighter saffron shade (#E8B85C / rgba(232, 184, 92))'
    );
    assert.match(aboutCss, /\.hero-identity-card/, 'Identity card item styling must exist in CSS');
    assert.match(aboutCss, /\.hero-identity-icon-box/, 'Identity icon box styling must exist in CSS');
    assert.match(aboutCss, /\.hero-identity-divider/, 'Identity divider styling must exist in CSS');
  });

  await t.test('7. Scroll Indicator and Keyboard Accessibility', () => {
    assert.match(
      aboutJsx,
      /<motion\.a\s+href="#story"\s+className="hero-scroll-indicator"\s+aria-label="Scroll down to explore our story"/,
      'Scroll indicator must have explicit aria-label and link to #story'
    );
    assert.match(aboutCss, /\.scroll-indicator-mouse/, 'Mouse scroll indicator frame styling must exist');
    assert.match(aboutCss, /\.scroll-indicator-dot/, 'Bouncing scroll indicator dot styling must exist');
  });

  await t.test('8. Responsive Breakpoints and Touch Targets', () => {
    assert.match(aboutCss, /@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?\.hero-rebuilt-grid\s*\{[^}]*grid-template-columns:/,
      'Desktop breakpoint must establish asymmetric 2-column grid'
    );
    assert.match(aboutCss, /@media\s*\(max-width:\s*768px\)\s*\{[\s\S]*?\.hero-rebuilt-headline/,
      'Mobile/tablet breakpoint must scale headline'
    );
    assert.match(aboutCss, /@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\.hero-rebuilt-actions\s*\{[^}]*flex-direction:\s*column/,
      'Small mobile breakpoint must stack action buttons'
    );
  });

  await t.test('9. Signature Water-to-Roots SVG Animation: Paths, Line Drawing & Botanical Nodes', () => {
    assert.match(aboutJsx, /hero-water-roots-container/, 'Water-to-roots container must exist in JSX');
    assert.match(aboutJsx, /hero-water-roots-svg/, 'Water-to-roots SVG must exist in JSX');
    assert.match(aboutJsx, /hero-water-main/, 'Main water flow path must exist in JSX');
    assert.match(aboutJsx, /hero-branch-1/, 'First tributary branch path must exist in JSX');
    assert.match(aboutJsx, /hero-branch-2/, 'Second tributary branch path must exist in JSX');
    assert.match(aboutJsx, /hero-root-1/, 'Root capillary path 1 must exist in JSX');
    assert.match(aboutJsx, /hero-botanical-leaf/, 'Emerging botanical leaves must exist in JSX');

    // CSS Keyframes and line drawing properties
    assert.match(aboutCss, /@keyframes\s+drawWaterPath/, 'drawWaterPath keyframes must exist in CSS');
    assert.match(aboutCss, /@keyframes\s+drawBranchPath/, 'drawBranchPath keyframes must exist in CSS');
    assert.match(aboutCss, /@keyframes\s+drawRootPath/, 'drawRootPath keyframes must exist in CSS');
    assert.match(aboutCss, /@keyframes\s+leafReveal/, 'leafReveal keyframes must exist in CSS');
    assert.match(aboutCss, /@keyframes\s+organicSway/, 'organicSway keyframes must exist in CSS');
    assert.match(aboutCss, /\.hero-water-main\s*\{[^}]*stroke-dashoffset:/, 'Main water path must use stroke-dashoffset');
  });

  await t.test('10. Organic Background Animation: 3 Slow Translucent Shapes', () => {
    assert.match(aboutJsx, /hero-ambient-organic-layer/, 'Ambient organic layer container must exist in JSX');
    assert.match(aboutJsx, /hero-ambient-blob\s+blob-1/, 'Blob 1 SVG must exist in JSX');
    assert.match(aboutJsx, /hero-ambient-blob\s+blob-2/, 'Blob 2 SVG must exist in JSX');
    assert.match(aboutJsx, /hero-ambient-blob\s+blob-3/, 'Blob 3 SVG must exist in JSX');

    // CSS Keyframes and slow 18-25s animation
    assert.match(aboutCss, /@keyframes\s+blobDriftOne/, 'blobDriftOne keyframes must exist in CSS');
    assert.match(aboutCss, /@keyframes\s+blobDriftTwo/, 'blobDriftTwo keyframes must exist in CSS');
    assert.match(aboutCss, /@keyframes\s+blobDriftThree/, 'blobDriftThree keyframes must exist in CSS');
    assert.match(aboutCss, /\.blob-1\s*\{[^}]*animation:[^}]*22s/i, 'Blob 1 must use ~22s duration');
    assert.match(aboutCss, /\.blob-2\s*\{[^}]*animation:[^}]*25s/i, 'Blob 2 must use ~25s duration');
    assert.match(aboutCss, /\.blob-3\s*\{[^}]*animation:[^}]*19s/i, 'Blob 3 must use ~19s duration');
  });

  await t.test('11. Organic Photograph Reveal & Botanical Frame Details', () => {
    assert.match(aboutJsx, /hero-photo-organic-reveal/, 'Photo organic reveal class must exist in JSX');
    assert.match(aboutJsx, /hero-frame-botanical-accent\s+corner-top-right/, 'Top-right botanical corner accent must exist');
    assert.match(aboutJsx, /hero-frame-botanical-accent\s+corner-bottom-left/, 'Bottom-left botanical corner accent must exist');
    assert.match(aboutJsx, /hero-caption-animated/, 'Animated caption class must exist in JSX');

    // CSS Keyframes
    assert.match(aboutCss, /@keyframes\s+photoFrameOrganicReveal/, 'photoFrameOrganicReveal keyframes must exist');
    assert.match(aboutCss, /@keyframes\s+photoScaleSettle/, 'photoScaleSettle keyframes must exist');
    assert.match(aboutCss, /@keyframes\s+botanicalSway/, 'botanicalSway keyframes must exist');
    assert.match(aboutCss, /@keyframes\s+captionGlideUp/, 'captionGlideUp keyframes must exist');
    assert.match(aboutCss, /\.hero-photo-organic-reveal\s*\{[^}]*clip-path:/, 'Organic reveal must use clip-path');
  });

  await t.test('12. Three Pillar Sequential Reveal and Hover Interactions', () => {
    assert.match(aboutJsx, /hero-identity-card-1/, 'Card 1 sequential class must exist');
    assert.match(aboutJsx, /hero-identity-card-2/, 'Card 2 sequential class must exist');
    assert.match(aboutJsx, /hero-identity-card-3/, 'Card 3 sequential class must exist');

    assert.match(aboutCss, /@keyframes\s+pillarCardReveal/, 'pillarCardReveal keyframes must exist');
    assert.match(aboutCss, /@keyframes\s+dividerVerticalExpand/, 'dividerVerticalExpand keyframes must exist');
    assert.match(aboutCss, /\.hero-identity-card:hover\s*\{[^}]*transform:\s*translateY\(-4px\)/,
      'Card hover state must elevate by max 4px'
    );
    assert.match(aboutCss, /\.hero-identity-card:hover\s+\.hero-identity-icon-box\s*\{[^}]*transform:/,
      'Card hover state must subtly lift icon'
    );
  });

  await t.test('13. Scroll-Triggered Story Transition Tendril', () => {
    assert.match(aboutJsx, /hero-story-transition-tendril/, 'Story transition tendril must exist in JSX');
    assert.match(aboutCss, /\.hero-story-transition-tendril/, 'Story transition tendril styling must exist');
    assert.match(aboutCss, /@keyframes\s+tendrilFlow/, 'tendrilFlow keyframes must exist');
  });

  await t.test('14. Accessibility: Reduced-Motion Overrides', () => {
    assert.match(aboutCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?stroke-dashoffset:\s*0\s*!important/i,
      'Reduced motion must disable line drawing stroke-dashoffset'
    );
    assert.match(aboutCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?clip-path:\s*none\s*!important/i,
      'Reduced motion must clear clip-path on photos'
    );
    assert.match(aboutCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none\s*!important/i,
      'Reduced motion must disable animations'
    );
  });
});

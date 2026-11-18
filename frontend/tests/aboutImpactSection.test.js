import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('About Us Page - Impact Section Visual Redesign & Organic Animation Contracts', async (t) => {
  const aboutPagePath = path.resolve(__dirname, '../src/pages/About/AboutPage.jsx');
  const aboutCssPath = path.resolve(__dirname, '../src/pages/About/AboutPage.css');

  const aboutJsx = fs.readFileSync(aboutPagePath, 'utf-8');
  const aboutCss = fs.readFileSync(aboutCssPath, 'utf-8');

  await t.test('1. Warm Ivory Canvas & Deep Charcoal Typography', () => {
    // Assert warm ivory / off-white background
    assert.match(aboutCss, /\.about-impact-editorial\s*\{[^}]*background-color:\s*#FAF8F5/i,
      'Impact section must use warm ivory / off-white (#FAF8F5) background'
    );
    // Assert black background removed from impact section
    assert.ok(!aboutCss.includes('.about-impact-editorial {\n  padding: 5.5rem 0;\n  background-color: var(--color-charcoal-900);'),
      'Solid black background must be eliminated from impact section'
    );
    // Headline color deep charcoal / navy
    assert.match(aboutCss, /\.impact-headline\s*\{[^}]*color:\s*#1E293B/i,
      'Impact headline must use deep charcoal / navy (#1E293B)'
    );
    // Number color deep charcoal / navy (not bright orange)
    assert.match(aboutCss, /\.impact-panel-number\s*\{[^}]*color:\s*#1E293B/i,
      'Metric numbers must use deep charcoal / navy (#1E293B), not bright orange'
    );
  });

  await t.test('2. Exact 4 Metrics Integrity and Verifiable Footnote', () => {
    assert.ok(aboutJsx.includes('50,000+'), 'Metric 1 (50,000+) must be present');
    assert.ok(aboutJsx.includes('LIVES TRANSFORMED'), 'Label 1 (LIVES TRANSFORMED) must be present');
    assert.ok(aboutJsx.includes('120+'), 'Metric 2 (120+) must be present');
    assert.ok(aboutJsx.includes('COMMUNITIES REACHED'), 'Label 2 (COMMUNITIES REACHED) must be present');
    assert.ok(aboutJsx.includes('50+'), 'Metric 3 (50+) must be present');
    assert.ok(aboutJsx.includes('PROJECTS COMPLETED'), 'Label 3 (PROJECTS COMPLETED) must be present');
    assert.ok(aboutJsx.includes('2,500+'), 'Metric 4 (2,500+) must be present');
    assert.ok(aboutJsx.includes('ACTIVE VOLUNTEERS'), 'Label 4 (ACTIVE VOLUNTEERS) must be present');

    // Unmodified verification statement
    assert.ok(
      aboutJsx.includes('All figures reconciled against quarterly field operational ledgers and audited project records.'),
      'Footnote audit statement must be retained verbatim without invented claims'
    );
  });

  await t.test('3. White Statistic Panels with Subtle Borders and Shadows', () => {
    assert.match(aboutJsx, /impact-metric-panel/, 'Metric panels must exist in JSX');
    assert.match(aboutCss, /\.impact-metric-panel\s*\{[^}]*background:\s*#FFFFFF/i,
      'Metric panels must have white background'
    );
    assert.match(aboutCss, /\.impact-metric-panel\s*\{[^}]*border:\s*1px\s+solid/i,
      'Metric panels must have subtle border'
    );
    assert.match(aboutCss, /\.impact-metric-panel\s*\{[^}]*box-shadow:/i,
      'Metric panels must have subtle box-shadow'
    );
    assert.match(aboutCss, /\.impact-metric-panel:hover\s*\{[^}]*transform:\s*translateY\(-4px\)/i,
      'Metric panels must have subtle hover elevation'
    );
  });

  await t.test('4. Organic Animation A — Growth Line with Branching Leaves', () => {
    assert.match(aboutJsx, /impact-growth-line-container/, 'Growth line container must exist in JSX');
    assert.match(aboutJsx, /impact-growth-path/, 'Growth SVG path must exist in JSX');
    assert.match(aboutJsx, /impact-growth-leaf/, 'Branching leaves must exist in JSX');

    assert.match(aboutCss, /@keyframes\s+drawGrowthLine/, 'drawGrowthLine keyframes must exist in CSS');
    assert.match(aboutCss, /@keyframes\s+leafFadeIn/, 'leafFadeIn keyframes must exist in CSS');
    assert.match(aboutCss, /\.impact-growth-path\s*\{[^}]*stroke-dashoffset:/,
      'Growth line must use stroke-dashoffset for drawing animation'
    );
  });

  await t.test('5. Organic Animation B — Expanding Water Ripples', () => {
    assert.match(aboutJsx, /impact-water-ripples/, 'Water ripples container must exist in JSX');
    assert.match(aboutJsx, /impact-ripple-ring\s+ring-1/, 'Ripple ring 1 must exist in JSX');
    assert.match(aboutJsx, /impact-ripple-ring\s+ring-2/, 'Ripple ring 2 must exist in JSX');
    assert.match(aboutJsx, /impact-ripple-ring\s+ring-3/, 'Ripple ring 3 must exist in JSX');

    assert.match(aboutCss, /@keyframes\s+rippleExpand/, 'rippleExpand keyframes must exist in CSS');
    assert.match(aboutCss, /\.impact-water-ripples/, 'Water ripples styling must exist in CSS');
  });

  await t.test('6. Organic Animation C — Sequential Number Counters', () => {
    assert.match(aboutJsx, /metricSeqActive/, 'Sequential active state array must exist in JSX');
    assert.match(aboutJsx, /metricSeqActive\[0\]/, 'Metric 1 must bind to sequential active state');
    assert.match(aboutJsx, /metricSeqActive\[1\]/, 'Metric 2 must bind to sequential active state');
    assert.match(aboutJsx, /metricSeqActive\[2\]/, 'Metric 3 must bind to sequential active state');
    assert.match(aboutJsx, /metricSeqActive\[3\]/, 'Metric 4 must bind to sequential active state');
  });

  await t.test('7. Organic Animation D — Floating Organic Elements', () => {
    assert.match(aboutJsx, /impact-floating-elements/, 'Floating elements container must exist in JSX');
    assert.match(aboutJsx, /impact-floating-leaf\s+leaf-pos-1/, 'Floating leaf 1 must exist in JSX');
    assert.match(aboutJsx, /impact-floating-leaf\s+leaf-pos-2/, 'Floating leaf 2 must exist in JSX');
    assert.match(aboutJsx, /impact-floating-leaf\s+leaf-pos-3/, 'Floating leaf 3 must exist in JSX');

    assert.match(aboutCss, /@keyframes\s+floatDrift1/, 'floatDrift1 keyframes must exist');
    assert.match(aboutCss, /@keyframes\s+floatDrift2/, 'floatDrift2 keyframes must exist');
    assert.match(aboutCss, /@keyframes\s+floatDrift3/, 'floatDrift3 keyframes must exist');
  });

  await t.test('8. Organic Animation E & F — Connecting Milestones & Animated SVG Icons', () => {
    assert.match(aboutJsx, /impact-milestone-connector/, 'Milestone connectors must exist in JSX');
    assert.match(aboutJsx, /impact-panel-icon-wrap/, 'Panel icon wrapper must exist in JSX');

    assert.match(aboutCss, /\.impact-milestone-connector/, 'Milestone connector styles must exist in CSS');
    assert.match(aboutCss, /\.impact-panel-icon-wrap/, 'Panel icon wrapper styles must exist in CSS');
    assert.match(aboutCss, /\.impact-panel-icon\s*\{[^}]*color:\s*#D99A2B/i,
      'Icons must use muted saffron (#D99A2B)'
    );
  });

  await t.test('9. Motion, Performance & Accessibility', () => {
    // Accessibility aria-label on panels
    assert.match(aboutJsx, /aria-label=\{`\$\{targetValue\}\s+\$\{label\}\s+-\s+\$\{note\}`\}/,
      'Metric panels must have accessible aria-labels with final values'
    );
    // Reduced motion overrides
    assert.match(aboutCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.impact-ripple-ring/i,
      'Reduced motion must override impact ripples'
    );
    assert.match(aboutCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.impact-growth-path/i,
      'Reduced motion must override impact growth path'
    );
  });

  await t.test('10. Responsive Layout: Desktop 4-col, Tablet 2-col, Mobile 1-col', () => {
    assert.match(aboutCss, /@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?\.impact-panels-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*1fr\)/i,
      'Desktop breakpoint must establish 4-column grid'
    );
    assert.match(aboutCss, /@media\s*\(min-width:\s*640px\)\s*\{[\s\S]*?\.impact-panels-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/i,
      'Tablet breakpoint must establish 2-column grid'
    );
  });
});


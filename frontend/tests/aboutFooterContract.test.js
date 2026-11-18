import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('About Us Page & Volunteer Page - Shared Footer Architecture Contract', () => {
  const publicLayoutPath = path.join(rootDir, 'src', 'layouts', 'PublicLayout.jsx');
  const appRoutesPath = path.join(rootDir, 'src', 'routes', 'AppRoutes.jsx');
  const footerComponentPath = path.join(rootDir, 'src', 'components', 'common', 'Footer.jsx');
  const aboutPagePath = path.join(rootDir, 'src', 'pages', 'About', 'AboutPage.jsx');
  const aboutCssPath = path.join(rootDir, 'src', 'pages', 'About', 'AboutPage.css');
  const volunteerPagePath = path.join(rootDir, 'src', 'pages', 'Volunteer', 'VolunteerPage.jsx');

  test('1. Shared layout enforces single source of truth for Footer', () => {
    const layoutContent = fs.readFileSync(publicLayoutPath, 'utf8');
    assert.match(
      layoutContent,
      /import\s+Footer\s+from\s+['"]\.\.\/components\/common\/Footer['"]/,
      'PublicLayout must import shared Footer from components/common/Footer'
    );
    assert.match(
      layoutContent,
      /<Footer\s*\/>/,
      'PublicLayout must render <Footer /> at the bottom of public pages'
    );
  });

  test('2. Both About and Volunteer routes are mounted within PublicLayout', () => {
    const routesContent = fs.readFileSync(appRoutesPath, 'utf8');
    assert.match(
      routesContent,
      /<Route\s+path=["']\/["']\s+element=\{<PublicLayout\s*\/>\}>[\s\S]*?<Route\s+path=["']about["']\s+element=\{<AboutPage\s*\/>\}[\s\S]*?<Route\s+path=["']volunteer["']\s+element=\{<VolunteerPage\s*\/>\}/,
      'Both about and volunteer routes must be nested children of PublicLayout'
    );
  });

  test('3. No duplicate or conflicting footer elements in AboutPage or VolunteerPage', () => {
    const aboutContent = fs.readFileSync(aboutPagePath, 'utf8');
    const volunteerContent = fs.readFileSync(volunteerPagePath, 'utf8');

    assert.doesNotMatch(
      aboutContent,
      /<footer[\s>]/i,
      'AboutPage must not render a duplicate <footer> tag'
    );
    assert.doesNotMatch(
      volunteerContent,
      /<footer[\s>]/i,
      'VolunteerPage must not render a duplicate <footer> tag'
    );
  });

  test('4. AboutPage.css does not introduce hostile footer overrides', () => {
    const aboutCss = fs.readFileSync(aboutCssPath, 'utf8');
    assert.doesNotMatch(
      aboutCss,
      /\.footer-editorial-root|\.footer-content|\.footer-grid|\.footer-col/,
      'AboutPage.css must not contain style overrides that alter the shared footer'
    );
  });

  test('5. Footer component renders authentic branding, navigation, and disclosures', () => {
    const footerContent = fs.readFileSync(footerComponentPath, 'utf8');
    
    // Brand & Mission
    assert.ok(footerContent.includes('RESPONSIBLE'), 'Footer must contain brand title RESPONSIBLE');
    assert.ok(footerContent.includes('INDIVIDUALS'), 'Footer must contain brand subtitle INDIVIDUALS');
    assert.ok(footerContent.includes('80G Verified'), 'Footer must include 80G tax exemption badge');

    // Navigation columns
    assert.ok(footerContent.includes('Platform'), 'Footer must include Platform column');
    assert.ok(footerContent.includes('Get Involved'), 'Footer must include Get Involved column');
    assert.ok(footerContent.includes('Stay Informed'), 'Footer must include Stay Informed column');

    // Working links
    assert.ok(footerContent.includes('to="/about"'), 'Footer must link to /about');
    assert.ok(footerContent.includes('to="/volunteer"'), 'Footer must link to /volunteer');
    assert.ok(footerContent.includes('to="/donate"'), 'Footer must link to /donate');
    assert.ok(footerContent.includes('to="/projects"'), 'Footer must link to /projects');

    // Bottom bar & disclosures
    assert.ok(footerContent.includes('Responsible Individuals Foundation'), 'Footer must include organisation name');
    assert.ok(footerContent.includes('Registered Section 8 Non-Profit Organization'), 'Footer must include Section 8 registration');
    assert.ok(footerContent.includes('Privacy Policy'), 'Footer must include Privacy Policy');
    assert.ok(footerContent.includes('Terms of Service'), 'Footer must include Terms of Service');
    assert.ok(footerContent.includes('Annual Disclosures'), 'Footer must include Annual Disclosures');
  });
});


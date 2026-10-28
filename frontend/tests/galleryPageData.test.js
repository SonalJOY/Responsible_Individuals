import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '../src/pages/Gallery/GalleryData.js';

describe('Gallery Page Data Contract Tests', () => {
  test('1. Gallery items list contains exactly 5 items with unique IDs', () => {
    assert.strictEqual(GALLERY_ITEMS.length, 5);
    const ids = new Set(GALLERY_ITEMS.map((item) => item.id));
    assert.strictEqual(ids.size, 5);
  });

  test('2. Removed stories (ID 1, ID 3, ID 4, and ID 5) are completely absent from data source', () => {
    const item1 = GALLERY_ITEMS.find((item) => item.id === 1);
    const item3 = GALLERY_ITEMS.find((item) => item.id === 3);
    const item4 = GALLERY_ITEMS.find((item) => item.id === 4);
    const item5 = GALLERY_ITEMS.find((item) => item.id === 5);
    assert.strictEqual(item1, undefined, 'Community Wetland Planting Drive should be completely removed');
    assert.strictEqual(item3, undefined, 'Urban Miyawaki Sapling Installation should be completely removed');
    assert.strictEqual(item4, undefined, 'Women Artisan Weaving Workshop should be completely removed');
    assert.strictEqual(item5, undefined, 'Citizen Water Quality Monitoring Walk should be completely removed');

    const titles = GALLERY_ITEMS.map((item) => item.title);
    assert.ok(!titles.includes('Community Wetland Planting Drive'));
    assert.ok(!titles.includes('Urban Miyawaki Sapling Installation'));
    assert.ok(!titles.includes('Women Artisan Weaving Workshop'));
    assert.ok(!titles.includes('Citizen Water Quality Monitoring Walk'));
  });

  test('3. RI Inauguration Event item (ID 2) is preserved', () => {
    const eventItem = GALLERY_ITEMS.find((item) => item.id === 2);
    assert.ok(eventItem, 'Item 2 should exist');
    assert.strictEqual(eventItem.title, 'RI Inauguration Event');
    assert.strictEqual(eventItem.category, 'Education');
    assert.strictEqual(eventItem.location, 'Dasarahalli, Hebbal');
    assert.strictEqual(eventItem.impact, 'Community Engagement');
    assert.strictEqual(eventItem.image, '/images/gallery/ri-inauguration-event.jpg');
  });

  test('4. Tech Mahindra Artwork Initiative item (ID 6) is preserved', () => {
    const artworkItem = GALLERY_ITEMS.find((item) => item.id === 6);
    assert.ok(artworkItem, 'Item 6 should exist');
    assert.strictEqual(artworkItem.title, 'Tech Mahindra Artwork Initiative');
    assert.strictEqual(artworkItem.category, 'Community');
    assert.strictEqual(artworkItem.location, 'Bengaluru, Karnataka');
    assert.strictEqual(artworkItem.impact, 'Community Art & Engagement');
    assert.strictEqual(artworkItem.image, '/images/gallery/20261016_125717.jpg');
  });

  test('5. Sulikere School Awareness Programme item (ID 7) is preserved', () => {
    const sulikereItem = GALLERY_ITEMS.find((item) => item.id === 7);
    assert.ok(sulikereItem, 'Item 7 should exist');
    assert.strictEqual(sulikereItem.title, 'Sulikere School Awareness Programme');
    assert.strictEqual(sulikereItem.category, 'Education');
    assert.strictEqual(sulikereItem.location, 'Sulikere, Bengaluru');
    assert.strictEqual(sulikereItem.impact, 'Student Awareness & Engagement');
    assert.strictEqual(sulikereItem.image, '/images/gallery/IMG_5505.jpg');
  });

  test('6. Teaching and Mentoring – Child Safety Awareness item (ID 8) is preserved', () => {
    const safetyItem = GALLERY_ITEMS.find((item) => item.id === 8);
    assert.ok(safetyItem, 'Item 8 should exist');
    assert.strictEqual(safetyItem.title, 'Teaching and Mentoring – Child Safety Awareness');
    assert.strictEqual(safetyItem.category, 'Education');
    assert.strictEqual(safetyItem.location, 'Hosa Byrohalli School');
    assert.strictEqual(safetyItem.impact, 'Child Safety & Communication');
    assert.strictEqual(safetyItem.image, '/images/gallery/20251219_112126.jpg');
  });

  test('7. WASH Awareness Programme item (ID 9) is added with correct details', () => {
    const washItem = GALLERY_ITEMS.find((item) => item.id === 9);
    assert.ok(washItem, 'Item 9 must exist');
    assert.strictEqual(washItem.title, 'WASH Awareness Programme');
    assert.strictEqual(washItem.category, 'Education');
    assert.strictEqual(washItem.location, 'Hosa Byrohalli School, Karnataka');
    assert.strictEqual(washItem.image, '/images/gallery/20251216_135124.jpg');
    assert.strictEqual(washItem.description, 'An interactive awareness session educating students on hygiene, sanitation, and healthy daily practices.');
  });

  test('8. Category counts dynamically update based on remaining stories', () => {
    const totalCount = GALLERY_ITEMS.length;
    assert.strictEqual(totalCount, 5);

    const getCount = (cat) => cat === 'All' ? GALLERY_ITEMS.length : GALLERY_ITEMS.filter((i) => i.category === cat).length;

    assert.strictEqual(getCount('All'), 5);
    assert.strictEqual(getCount('Education'), 4);
    assert.strictEqual(getCount('Community'), 1);
    assert.strictEqual(getCount('Livelihoods'), 0);
    assert.strictEqual(getCount('Ecology'), 0);
    assert.strictEqual(getCount('Lake Restoration'), 0);
    assert.strictEqual(getCount('Afforestation'), 0);
  });
});

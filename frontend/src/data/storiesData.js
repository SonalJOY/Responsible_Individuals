/**
 * Stories Data Architecture
 * Centralized repository of prototype story narratives, quotes, and photo moments.
 * Easily replaceable with CMS or backend API responses when live data becomes available.
 */

export const featuredStory = {
  id: 'story-featured-01',
  slug: 'when-water-returned-to-the-village',
  category: 'WATER & COMMUNITIES',
  categoryColor: '#0D9488',
  categoryBg: '#F0FDFA',
  title: 'When Water Returned to the Village',
  subtitle: "How a community-led water restoration effort helped families build a more resilient future.",
  description: "How a community-led water restoration effort helped families build a more resilient future.",
  excerpt: "How a community-led water restoration effort helped families build a more resilient future.",
  location: 'Chikkaballapur District, Karnataka',
  readTime: '4 min read',
  date: 'March 2026',
  coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
  heroImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1600&q=80',
  supportingImages: [
    {
      url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
      caption: 'Community contour trenches slowing surface runoff along the village watershed slope.'
    },
    {
      url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
      caption: 'Resident committee members inspecting the replenished masonry stepwell catchment.'
    }
  ],
  quote: "When the first monsoon rains filled the desilted channels, you could feel the relief across every household.",
  quoteAuthor: "Resident Watershed Committee",
  quoteRole: "Prototype community voice",
  
  // Structured Narrative
  challenge: "Successive low-rainfall seasons and heavily silted runoff channels had left village open wells dry by mid-February. Farming families faced a shrinking groundwater table, which reduced winter cultivation and created an unsustainable reliance on costly private water tankers for daily household needs.",
  response: "Local residents, women's self-help groups, and hydrology field mentors convened under the village banyan tree to map historical drainage topography. Over four consecutive weekends, community teams desilted ancient check structures, excavated continuous contour trenches, and cleared invasive scrub blocking natural feeder streams.",
  people: "Eighty-two resident volunteers participated across the intervention, uniting generational knowledge from village elders with modern soil-moisture contour mapping. Local youth formed an ongoing stewardship patrol to inspect bunds and monitor silt traps before each seasonal downpour.",
  change: "Recharging groundwater aquifer lines stabilized open well water levels through late summer, reducing household expenditure on emergency water deliveries. More importantly, the project fostered a shared stewardship ethic that has transformed how the community protects its collective commons.",
  keyTakeaway: "Lasting environmental resilience does not require complex machinery—it begins when a community understands its watershed and commits to collective stewardship."
};

export const fieldStories = [
  {
    id: 'story-01',
    slug: 'a-classroom-beyond-four-walls',
    category: 'EDUCATION',
    categoryColor: '#2563EB',
    categoryBg: '#EFF6FF',
    title: 'A Classroom Beyond Four Walls',
    subtitle: 'Expanding horizons for curious young minds in rural community schools.',
    description: 'For students in underserved communities, access to learning can open possibilities far beyond the classroom.',
    excerpt: 'For students in underserved communities, access to learning can open possibilities far beyond the classroom.',
    location: 'Rural Kolar, Karnataka',
    readTime: '3 min read',
    date: 'February 2026',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80',
    supportingImages: [
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
        caption: 'Hands-on experiential learning kits bring foundational science principles to life.'
      }
    ],
    quote: "Seeing children run towards learning instead of hesitating at the school gate is the greatest proof of change.",
    quoteAuthor: "Primary School Head Teacher",
    quoteRole: "Prototype community voice",
    challenge: "Limited experimental science supplies and conventional rote-learning materials left primary school students disengaged, with many struggling to bridge foundational numeracy and literacy milestones.",
    response: "Educators, local volunteers, and parents converted an underutilized open courtyard into an outdoor discovery laboratory equipped with weather instruments, solar demonstration modules, and vernacular storybooks.",
    people: "Dedicated local teachers partnered with volunteer mentors from nearby university science programs, providing weekly experiential modules and creative weekend reading clubs.",
    change: "Student classroom engagement and regular attendance increased substantially. Children now lead their own science observation logs and share discoveries with their families at home.",
    keyTakeaway: "When education moves from passive memorization to active discovery, every child discovers their innate potential to create and inquire."
  },
  {
    id: 'story-02',
    slug: 'when-a-community-came-together',
    category: 'WATER & COMMUNITIES',
    categoryColor: '#0D9488',
    categoryBg: '#F0FDFA',
    title: 'When a Community Came Together',
    subtitle: 'Protecting vital aquatic commons through collective citizen action.',
    description: 'Local residents turned a shared challenge into a collective effort to protect the resources their families depend on.',
    excerpt: 'Local residents turned a shared challenge into a collective effort to protect the resources their families depend on.',
    location: 'Peri-urban Bengaluru',
    readTime: '4 min read',
    date: 'January 2026',
    coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80',
    supportingImages: [
      {
        url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        caption: 'Citizen teams installing native wetland filtration reeds along the inlet swale.'
      }
    ],
    quote: "We realized the wetland didn't belong to the municipality or to strangers—it belonged to our children's future.",
    quoteAuthor: "Resident Lake Volunteer",
    quoteRole: "Prototype community voice",
    challenge: "Urban construction debris and solid waste accumulation choked natural wetland feeder channels, contaminating local water bodies and eliminating bird nesting habitats.",
    response: "Neighborhood collectives organized regular weekend cleanup campaigns and partnered with environmental hydrologists to plant natural reed beds that filter storm runoff.",
    people: "Apartment residents, local street vendors, and environmental advocates worked shoulder-to-shoulder, breaking down social divides to protect their shared natural ecosystem.",
    change: "Clearer water inflows now sustain thriving aquatic flora, migratory water birds have returned to the shoreline, and the community conducts ongoing water-quality tests.",
    keyTakeaway: "Collective community ownership is the single most durable shield against ecological neglect."
  },
  {
    id: 'story-03',
    slug: 'the-farmers-who-chose-to-restore',
    category: 'ENVIRONMENT',
    categoryColor: '#059669',
    categoryBg: '#ECFDF5',
    title: 'The Farmers Who Chose to Restore',
    subtitle: 'Revitalizing semi-arid farmlands through regenerative agroforestry.',
    description: 'Small changes in land and water stewardship can create lasting benefits for communities and the environment.',
    excerpt: 'Small changes in land and water stewardship can create lasting benefits for communities and the environment.',
    location: 'Tumakuru Drylands',
    readTime: '5 min read',
    date: 'December 2025',
    coverImage: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1600&q=80',
    supportingImages: [
      {
        url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
        caption: 'Heirloom dryland crops interplanted with soil-enriching border trees.'
      }
    ],
    quote: "Our soil was exhausted and dry. By bringing back trees and native cover, we brought life back to the earth.",
    quoteAuthor: "Smallholder Agrarian Steward",
    quoteRole: "Prototype community voice",
    challenge: "Intensive chemical tillage combined with recurring drought cycles had stripped topsoil nutrients, causing declining crop yields and crippling input expenses for smallholder farmers.",
    response: "A collective of dryland farmers transitioned several demonstration acres to multi-canopy agroforestry, integrating drought-tolerant millets with nitrogen-fixing native trees and deep organic mulching.",
    people: "Generational agrarian families pooled indigenous heirloom seeds, shared composting techniques, and held regular peer-to-peer knowledge exchanges.",
    change: "Enhanced soil moisture retention reduced irrigation needs by nearly forty percent during hot dry spells, while natural predators lowered pest damage naturally.",
    keyTakeaway: "Working in harmony with natural soil ecology restores both economic stability for rural families and biodiversity to the earth."
  },
  {
    id: 'story-04',
    slug: 'young-hands-greener-streets',
    category: 'YOUTH',
    categoryColor: '#F59E0B',
    categoryBg: '#FEF3C7',
    title: 'Young Hands, Greener Streets',
    subtitle: 'Urban youth transforming concrete heat islands into vibrant green corridors.',
    description: 'A group of young volunteers discovered that meaningful environmental action can begin close to home.',
    excerpt: 'A group of young volunteers discovered that meaningful environmental action can begin close to home.',
    location: 'East Bengaluru',
    readTime: '3 min read',
    date: 'November 2025',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80',
    supportingImages: [
      {
        url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
        caption: 'Young volunteers preparing nutrient-rich potting soil for native roadside saplings.'
      }
    ],
    quote: "You don't need to travel to a distant forest to protect the climate. Your own street corner is where stewardship begins.",
    quoteAuthor: "Student Youth Lead",
    quoteRole: "Prototype community voice",
    challenge: "Rapid road widening and commercial development stripped shade trees from neighborhood streets, leaving unshaded asphalt corridors prone to intense urban heat traps.",
    response: "High school and college youth mapped available planting verges, fabricated protective bamboo tree guards from recycled timber, and planted native broadleaf saplings.",
    people: "Over forty enthusiastic students coordinated with neighborhood shopkeepers and resident elders, setting up daily morning watering rosters.",
    change: "Thriving saplings now offer continuous shade canopy along pedestrian walkways, cooling street-level temperatures and inspiring adjacent blocks to duplicate the initiative.",
    keyTakeaway: "Youth energy directed toward tangible community projects creates immediate change and lifelong civic champions."
  },
  {
    id: 'story-05',
    slug: 'stronger-together',
    category: 'COMMUNITY',
    categoryColor: '#7C3AED',
    categoryBg: '#F5F3FF',
    title: 'Stronger Together',
    subtitle: 'Reviving participatory civic dialogue to solve neighborhood problems.',
    description: 'Community-led action creates space for people to share ideas, solve problems and build a more resilient future.',
    excerpt: 'Community-led action creates space for people to share ideas, solve problems and build a more resilient future.',
    location: 'South District Neighborhoods',
    readTime: '4 min read',
    date: 'October 2025',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    supportingImages: [
      {
        url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
        caption: 'Residents collaborating during an open participatory neighborhood council.'
      }
    ],
    quote: "When we listen to each other without hierarchy, solutions to problems we struggled with for years become surprisingly clear.",
    quoteAuthor: "Neighborhood Council Facilitator",
    quoteRole: "Prototype community voice",
    challenge: "Lack of communicative platforms between long-time residents and recent arrivals left shared civic issues—like patchy street lighting and unsegregated waste—unresolved for months.",
    response: "Citizens instituted monthly open-circle townhalls in the public park, establishing transparent task teams to coordinate directly with municipal ward officers.",
    people: "Retired public servants, homemakers, local tradespeople, and youth coordinators built consensus around actionable priorities.",
    change: "Regular maintenance cycles restored safe pedestrian lighting, waste segregation achieved high community compliance, and neighbor-to-neighbor solidarity deepened significantly.",
    keyTakeaway: "True community empowerment begins when every voice has a place at the table and every member feels shared responsibility."
  },
  {
    id: 'story-06',
    slug: 'why-we-show-up',
    category: 'VOLUNTEERS',
    categoryColor: '#E11D48',
    categoryBg: '#FFF1F2',
    title: 'Why We Show Up',
    subtitle: 'How regular citizens turn weekend hours into sustained social impact.',
    description: 'A look at the people who give their time, energy and skills to support communities around them.',
    excerpt: 'A look at the people who give their time, energy and skills to support communities around them.',
    location: 'Statewide Volunteer Network',
    readTime: '3 min read',
    date: 'September 2025',
    coverImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80',
    supportingImages: [
      {
        url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
        caption: 'Volunteers and community partners sharing notes after an impact field workshop.'
      }
    ],
    quote: "Giving a few hours on a Saturday doesn't just help someone else—it grounds you in what really matters in this world.",
    quoteAuthor: "Weekend Volunteer Steward",
    quoteRole: "Prototype community voice",
    challenge: "Many skilled citizens want to contribute meaningfully to social and environmental challenges, but lack transparent, structured pathways for grassroots participation.",
    response: "A flexible skills-based volunteer network was created, connecting software engineers, designers, educators, and field hands directly to targeted community initiatives.",
    people: "Dozens of working professionals, students, and retirees who dedicate consistent weekend time to mentoring children, measuring water quality, and planting green corridors.",
    change: "Grassroots projects gained invaluable technical expertise and dependable manpower, while volunteers forged deep, enduring bonds with local communities.",
    keyTakeaway: "Sustainable social progress is fueled by ordinary people who consistently show up for one another."
  }
];

export const humanVoiceData = {
  quote: "Change does not always begin with an organization. Sometimes, it begins with one person deciding to act.",
  attribution: "Prototype community voice",
  context: "Shared during a participatory community circle review",
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
  alt: 'Community steward in natural daylight'
};

export const communityMoments = [
  {
    id: 'moment-01',
    title: 'Participatory Watershed Mapping',
    tag: 'Water & Communities',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80',
    location: 'Chikkaballapur'
  },
  {
    id: 'moment-02',
    title: 'Courtyard Learning Circle',
    tag: 'Education',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    location: 'Rural Kolar'
  },
  {
    id: 'moment-03',
    title: 'Morning Sapling Care',
    tag: 'Youth & Greenery',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    location: 'East Bengaluru'
  },
  {
    id: 'moment-04',
    title: 'Soil & Seed Preservation',
    tag: 'Regenerative Agriculture',
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=600&q=80',
    location: 'Tumakuru Drylands'
  },
  {
    id: 'moment-05',
    title: 'Open Civic Dialogue',
    tag: 'Community',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    location: 'South District'
  },
  {
    id: 'moment-06',
    title: 'Citizen Water Monitoring',
    tag: 'Volunteers',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    location: 'Peri-urban Wetlands'
  }
];

// Helper Functions
export function getAllStories() {
  return [featuredStory, ...fieldStories];
}

export function getFeaturedStory() {
  return featuredStory;
}

export function getFieldStories() {
  return fieldStories;
}

export function getStoryBySlug(slug) {
  const all = getAllStories();
  return all.find((item) => item.slug === slug) || null;
}

export function getRelatedStories(currentSlug, count = 3) {
  const all = getAllStories();
  return all.filter((item) => item.slug !== currentSlug).slice(0, count);
}

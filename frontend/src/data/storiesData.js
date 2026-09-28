/**
 * Stories Data Architecture
 * Centralized repository of prototype story narratives, quotes, and photo moments.
 * Easily replaceable with CMS or backend API responses when live data becomes available.
 */

export const featuredStory = {
  id: 'story-featured-01',
  slug: 'from-barren-silt-to-blooming-lake',
  category: 'WATER & ENVIRONMENT',
  categoryColor: '#0D9488',
  categoryBg: '#F0FDFA',
  title: 'From Foul Silt to Blooming Wetland: How 300 Citizens Revived Varthur Inflow',
  subtitle: 'A citizen-driven ecological breakthrough transforming an 8-year stagnant toxic storm drain into a self-filtering wetland biome.',
  description: 'How 300 Bengaluru citizens united with hydrologists and municipal engineers to turn 4,200 tons of foul silt into a thriving bird haven.',
  excerpt: 'How 300 Bengaluru citizens united with hydrologists and municipal engineers to turn 4,200 tons of foul silt into a thriving bird haven.',
  location: 'Bengaluru East, Karnataka',
  readTime: '5 min read',
  date: 'March 2026',
  coverImage: '/images/stories/varthur-blooming-wetland.jpg',
  heroImage: '/images/stories/varthur-blooming-wetland.jpg',
  supportingImages: [
    {
      url: '/images/stories/varthur-volunteers-desilting.jpg',
      caption: 'Community desilting squads clearing 4,200 tons of toxic sludge and planting native wetland reed beds.'
    },
    {
      url: '/images/stories/citizen-water-monitoring.jpg',
      caption: 'Citizen science volunteers conducting multi-parameter water quality testing at the inlet swale.'
    }
  ],
  quote: "We proved that when individuals take ownership of their immediate environment with structured scientific backing, government authorities readily step up to partner.",
  quoteAuthor: "Meera Sundararajan",
  quoteRole: "Resident Coordinator, Kaikondrahalli & Varthur Catchment Stewardship",
  
  metrics: [
    { label: 'Silt Removed', value: '4,200 Tons', sub: 'Bio-composted offsite' },
    { label: 'Contaminant Drop', value: '-74% BOD', sub: 'Water quality turnaround' },
    { label: 'Avian Species', value: '42 Species', sub: 'Nesting on new islands' },
    { label: 'Aquifer Recharged', value: '+45 Feet', sub: 'Borewell water level gain' }
  ],

  // Structured Narrative
  challenge: "For over eight years, the stormwater drain had degenerated into a stagnant blackwater channel choked with construction debris and industrial effluent. Groundwater borewells had plummeted below 900 feet, and raw sewage odors forced families to keep windows sealed year-round.",
  response: "Responsible Individuals partnered with neighborhood collectives, municipal engineers, and wetland hydrologists. Over consecutive weekends, 300 citizen volunteers cleared debris, dredged toxic silt berms, and installed floating bio-retention islands anchored with native vetiver and canna roots.",
  people: "From software engineers and retired geologists to school students and municipal staff, 300 community members worked side-by-side every Saturday. A weekly volunteer water monitoring brigade was formed to track dissolved oxygen and nitrogen levels.",
  change: "Open reflective water has returned, 42 bird species have established nesting habitats on the restored islands, and surrounding borewells recharged by an average of 45 feet, drastically cutting tanker dependencies for thousands of families.",
  keyTakeaway: "We proved that when individuals take ownership of their immediate environment with structured scientific backing, government authorities readily step up to partner."
};

export const fieldStories = [
  {
    id: 'story-kolar-iot',
    slug: 'first-generation-coder-from-kolar',
    category: 'EDUCATION & YOUTH',
    categoryColor: '#3B82F6',
    categoryBg: '#EFF6FF',
    title: 'Cracking the Code: How 15-Year-Old Anitha Built an IoT Soil Sensor for Her Village',
    subtitle: 'From zero computer exposure to state robotics laureate—transforming dryland agriculture through grassroots STEM.',
    description: '15-year-old Anitha created an automated solar soil moisture alert system to protect dryland farming harvests.',
    excerpt: '15-year-old Anitha created an automated solar soil moisture alert system to protect dryland farming harvests.',
    location: 'Kolar District, Karnataka',
    readTime: '4 min read',
    date: 'March 2026',
    coverImage: '/images/stories/rural-stem-sensor-lab.jpg',
    heroImage: '/images/stories/rural-stem-sensor-lab.jpg',
    supportingImages: [
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
        caption: 'Hands-on experiential learning kits bring foundational science principles to life.'
      }
    ],
    quote: "The STEM lab showed me that science is not just exam textbooks — it is a tool to solve my father’s struggles in the field.",
    quoteAuthor: "Anitha M.",
    quoteRole: "Student Fellow & State Science Laureate",
    challenge: "Anitha had never touched a computer until 9th grade. Her father, a dryland farmer, suffered repeated crop losses from irregular soil moisture cycles and erratic rainfall patterns.",
    response: "Through Responsible Individuals STEM Lab program, Anitha received hands-on robotics training, micro-controller programming, and mentorship from volunteer software engineers.",
    people: "Rural educators, passionate corporate engineer mentors, and fellow girl students collaborated over weekend workshops to prototype functional agricultural sensors.",
    change: "Anitha won the State Science Exhibition with her solar-powered automated soil moisture alarm, and has received a full engineering fellowship scholarship.",
    keyTakeaway: "When rural students receive real tools rather than dry textbooks, they engineer solutions that safeguard their communities."
  },
  {
    id: 'story-varthur-repeat',
    slug: 'from-barren-silt-to-blooming-lake',
    category: 'WATER & ENVIRONMENT',
    categoryColor: '#0D9488',
    categoryBg: '#F0FDFA',
    title: 'From Foul Silt to Blooming Wetland: How 300 Citizens Revived Varthur Inflow',
    subtitle: 'A citizen-driven ecological breakthrough transforming an 8-year stagnant toxic storm drain into a self-filtering wetland biome.',
    description: 'How 300 Bengaluru citizens united with hydrologists and municipal engineers to turn 4,200 tons of foul silt into a thriving bird haven.',
    excerpt: 'How 300 Bengaluru citizens united with hydrologists and municipal engineers to turn 4,200 tons of foul silt into a thriving bird haven.',
    location: 'Bengaluru East, Karnataka',
    readTime: '5 min read',
    date: 'March 2026',
    coverImage: '/images/stories/varthur-blooming-wetland.jpg',
    heroImage: '/images/stories/varthur-blooming-wetland.jpg',
    supportingImages: [
      {
        url: '/images/stories/varthur-volunteers-desilting.jpg',
        caption: 'Community desilting squads clearing 4,200 tons of toxic sludge and planting native wetland reed beds.'
      },
      {
        url: '/images/stories/citizen-water-monitoring.jpg',
        caption: 'Citizen science volunteers conducting multi-parameter water quality testing at the inlet swale.'
      }
    ],
    quote: "We proved that when individuals take ownership of their immediate environment with structured scientific backing, government authorities readily step up to partner.",
    quoteAuthor: "Meera Sundararajan",
    quoteRole: "Resident Coordinator, Kaikondrahalli & Varthur Catchment Stewardship",
    challenge: "For over eight years, the stormwater drain had degenerated into a stagnant blackwater channel choked with construction debris and industrial effluent. Groundwater borewells had plummeted below 900 feet, and raw sewage odors forced families to keep windows sealed year-round.",
    response: "Responsible Individuals partnered with neighborhood collectives, municipal engineers, and wetland hydrologists. Over consecutive weekends, 300 citizen volunteers cleared debris, dredged toxic silt berms, and installed floating bio-retention islands anchored with native vetiver and canna roots.",
    people: "From software engineers and retired geologists to school students and municipal staff, 300 community members worked side-by-side every Saturday.",
    change: "Open reflective water has returned, 42 bird species have established nesting habitats on the restored islands, and surrounding borewells recharged by an average of 45 feet.",
    keyTakeaway: "We proved that when individuals take ownership of their immediate environment with structured scientific backing, government authorities readily step up to partner."
  },
  {
    id: 'story-chikkaballapur',
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
    date: 'February 2026',
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
    heroImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1600&q=80',
    supportingImages: [
      {
        url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
        caption: 'Community contour trenches slowing surface runoff along the village watershed slope.'
      }
    ],
    quote: "When the first monsoon rains filled the desilted channels, you could feel the relief across every household.",
    quoteAuthor: "Resident Watershed Committee",
    quoteRole: "Village Elder & Water Custodian",
    challenge: "Successive low-rainfall seasons and heavily silted runoff channels had left village open wells dry by mid-February.",
    response: "Local residents, women's self-help groups, and hydrology field mentors convened to map historical drainage topography and restore check structures.",
    people: "Eighty-two resident volunteers participated across the intervention, uniting generational knowledge with modern contour mapping.",
    change: "Recharging groundwater aquifer lines stabilized open well water levels through late summer, reducing household expenditure on emergency water deliveries.",
    keyTakeaway: "Lasting environmental resilience begins when a community understands its watershed and commits to collective stewardship."
  },

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
    badge: 'Water & Communities',
    typeTag: 'Field Survey',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80',
    location: 'Chikkaballapur',
    meta: 'Chikkaballapur • Hydrology Action',
    themeColor: '#0284C7',
    description: 'Community teams and hydrology experts walking runoff channels to revive traditional stone bunds and check dams.',
    stats: [
      { label: 'Catchment Mapped', value: '18 Swales' },
      { label: 'Families Engaged', value: '120 Farmers' },
      { label: 'Water Security', value: '+35%' }
    ],
    abstract: 'The Participatory Watershed Mapping initiative in Chikkaballapur mobilized agrarian families across five village panchayats. By documenting historical runoff drainage patterns and desilting key feeder channels, the community restored traditional catchment integrity before the monsoon, directly recharging 28 community open wells.'
  },
  {
    id: 'moment-02',
    title: 'Courtyard Learning Circle',
    tag: 'Education',
    badge: 'Foundational Learning',
    typeTag: 'Youth Mentorship',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    location: 'Rural Kolar',
    meta: 'Rural Kolar • Experiential STEM',
    themeColor: '#8B5CF6',
    description: 'Evening peer tutoring and science circles hosted in open village courtyards by high school youth fellows.',
    stats: [
      { label: 'Active Learners', value: '45 Children' },
      { label: 'Youth Fellows', value: '6 Mentors' },
      { label: 'Reading Fluency', value: '92%' }
    ],
    abstract: 'Courtyard Learning Circles transform village verandas into vibrant learning hubs after dusk. High-school fellows facilitate interactive STEM experiments, multilingual storytelling, and numeracy kits, eliminating after-school learning drop-offs and fostering community-wide academic curiosity.'
  },
  {
    id: 'moment-03',
    title: 'Morning Sapling Care',
    tag: 'Youth & Greenery',
    badge: 'Youth & Greenery',
    typeTag: 'Urban Micro-Forest',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    location: 'East Bengaluru',
    meta: 'East Bengaluru • Native Canopy',
    themeColor: '#10B981',
    description: 'Neighborhood citizen collectives nurturing 500+ indigenous trees along lake peripheries and school zones.',
    stats: [
      { label: 'Native Trees', value: '520 Saplings' },
      { label: 'Weekly Stewards', value: '34 Vol.' },
      { label: 'Survival Rate', value: '88%' }
    ],
    abstract: 'The Morning Sapling Care initiative gathers volunteers every weekend at dawn to weed, mulch, and install drip irrigation for native shade trees. Focusing on multi-tiered native species like Honge, Neem, and Mahua, the initiative creates cooling urban canopy corridors in peri-urban tech corridors.'
  },
  {
    id: 'moment-04',
    title: 'Soil & Seed Preservation',
    tag: 'Regenerative Agriculture',
    badge: 'Regenerative Agriculture',
    typeTag: 'Heirloom Ecology',
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=600&q=80',
    location: 'Tumakuru Drylands',
    meta: 'Tumakuru Drylands • Soil Heritage',
    themeColor: '#D97706',
    description: 'Conserving drought-hardy millets and native legumes while implementing compost mulching across drylands.',
    stats: [
      { label: 'Seeds Saved', value: '26 Types' },
      { label: 'Natural Mulch', value: '40 Acres' },
      { label: 'Water Loss', value: '-40%' }
    ],
    abstract: 'Faced with rising drought vulnerability, Tumakuru dryland farmers established a community seed bank safeguarding 26 drought-resistant heirloom grains and pulses. By combining seed sharing with organic mulching and microbial soil inoculants, participatory farms have cut reliance on commercial inputs and enriched topsoil biodiversity.'
  },
  {
    id: 'moment-05',
    title: 'Open Civic Dialogue',
    tag: 'Community',
    badge: 'Civic Governance',
    typeTag: 'Participatory Forum',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    location: 'South District',
    meta: 'South District • Grassroots Sabhas',
    themeColor: '#EC4899',
    description: 'Bi-monthly open assemblies connecting ward citizens, local leaders, and sanitation workers for equitable civic solutions.',
    stats: [
      { label: 'Active Voices', value: '140+ Citizens' },
      { label: 'Action Points', value: '12 Wards' },
      { label: 'Resolution Rate', value: '100%' }
    ],
    abstract: 'Open Civic Dialogues bridge the gap between ward residents, frontline municipal staff, and local governance representatives. Through transparent agenda setting and open voting, assemblies have resolved waste segregation bottlenecks, established safe pedestrian walkways, and secured reliable lighting in underserved neighborhoods.'
  },
  {
    id: 'moment-06',
    title: 'Citizen Water Monitoring',
    tag: 'Volunteers',
    badge: 'Ecological Science',
    typeTag: 'Water Watch',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    location: 'Peri-urban Wetlands',
    meta: 'Peri-urban Wetlands • Water Watch',
    themeColor: '#059669',
    description: 'Equipping college students and residents with portable testing kits to track pH, dissolved oxygen, and inlet health.',
    stats: [
      { label: 'Monitored Inlets', value: '24 Sites' },
      { label: 'Trained Testers', value: '58 Vol.' },
      { label: 'Testing Standard', value: 'ISO 10500' }
    ],
    abstract: 'The Citizen Water Monitoring program trains community volunteers to conduct rigorous scientific testing on peri-urban wetland inflows. By recording dissolved oxygen levels, phosphate presence, and microbial trends every fortnight, citizens provide public health alerts and safeguard urban biodiversity reserves.'
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

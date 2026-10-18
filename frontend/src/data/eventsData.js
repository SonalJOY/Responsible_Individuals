import lakePlantingImg from '../assets/varthur-volunteers-desilting.jpg';
import stemLabImg from '../assets/rural-stem-sensor-lab.jpg';
import waterMonitoringImg from '../assets/citizen-water-monitoring.jpg';
import wasteSegregationImg from '../assets/area-community.jpg';

export const upcomingEvents = [
  {
    id: 'ev-1',
    slug: 'lake-cleanup-and-tree-plantation-drive',
    title: 'Monsoon Lake Restoration & Miyawaki Sapling Planting',
    category: 'Community Drive',
    focusArea: 'Environment & Water Restoration',
    date: '2026-09-26',
    displayDate: 'Sept 26, 2026',
    day: 26,
    month: 8, // 0-indexed: September = 8
    year: 2026,
    time: '7:30 AM – 11:30 AM',
    venue: 'Kaikondrahalli Lake Main Gate',
    city: 'Bengaluru',
    address: 'Sarjapur Main Road, Bengaluru, KA 560035',
    description: 'Join 250 volunteers for our flagship monsoon plantation drive. We will install 800 native tree saplings, bio-mulch root beds, and clear plastic debris along the shoreline.',
    registered_count: 142,
    capacity: 250,
    image: lakePlantingImg,
    imageAlt: 'Volunteers participating in shoreline wetland restoration and tree planting',
    link: '/events',
  },
  {
    id: 'ev-2',
    slug: 'stem-tutor-workshop-and-volunteer-orientation',
    title: 'Rural School STEM Mentorship: Volunteer Orientation',
    category: 'Volunteer Orientation',
    focusArea: 'Education & Digital Access',
    date: '2026-10-10',
    displayDate: 'Oct 10, 2026',
    day: 10,
    month: 9, // October = 9
    year: 2026,
    time: '10:00 AM – 1:00 PM',
    venue: 'Social Impact Hub, Indiranagar',
    city: 'Bengaluru',
    address: '#42, 100ft Road, Indiranagar, Bengaluru, KA 560038',
    description: 'Orientation session for engineers, university students, and educators interested in teaching weekend science, robotics, and coding sessions to rural government school batches.',
    registered_count: 56,
    capacity: 80,
    image: stemLabImg,
    imageAlt: 'Students and volunteer mentor assembling STEM science kits in a rural classroom',
    link: '/events',
  },
  {
    id: 'ev-3',
    slug: 'water-census-drive',
    title: 'Citizen Water Quality Monitoring & Bird Census',
    category: 'Ecology Walk',
    focusArea: 'Ecology & Water Monitoring',
    date: '2026-10-24',
    displayDate: 'Oct 24, 2026',
    day: 24,
    month: 9, // October = 9
    year: 2026,
    time: '6:30 AM – 9:30 AM',
    venue: 'Varthur Wetland',
    city: 'Bengaluru',
    address: 'Varthur Lake Inflow Channel, Bengaluru East',
    description: 'Hands-on water quality testing for dissolved oxygen and pH, followed by a guided census of migratory wetland birds with field hydrologists.',
    registered_count: 35,
    capacity: 50,
    image: waterMonitoringImg,
    imageAlt: 'Citizen volunteers collecting water samples for dissolved oxygen analysis',
    link: '/events',
  },
  {
    id: 'ev-4',
    slug: 'zero-waste-workshop',
    title: 'Decentralized Composting & Zero-Waste Masterclass',
    category: 'Civic Workshop',
    focusArea: 'Community Waste & Ecology',
    date: '2026-11-07',
    displayDate: 'Nov 07, 2026',
    day: 7,
    month: 10, // November = 10
    year: 2026,
    time: '11:00 AM – 1:30 PM',
    venue: 'Ward Hub, Jayanagar',
    city: 'Bengaluru',
    address: 'Ward Civic Centre, 4th Block Jayanagar, Bengaluru',
    description: 'Hands-on aerobic composting literacy for residential apartment associations, waste segregation champions, and citizen green ambassadors.',
    registered_count: 48,
    capacity: 60,
    image: wasteSegregationImg,
    imageAlt: 'Community members learning aerobic compost maintenance techniques',
    link: '/events',
  },
];

export function getEventsForMonth(year, month) {
  return upcomingEvents.filter(
    (ev) => ev.year === year && ev.month === month
  );
}

export function getEventForDate(year, month, day) {
  return upcomingEvents.find(
    (ev) => ev.year === year && ev.month === month && ev.day === day
  );
}

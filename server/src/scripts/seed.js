import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

dotenv.config();

const INITIAL_EVENTS = [
  {
    title: 'NIE AI & Robotics Hackathon 2026',
    category: 'Technical',
    date: new Date('2026-11-20T09:00:00.000Z'),
    time: '09:00 AM',
    venue: 'Sir MV Auditorium',
    capacity: 120,
    registeredCount: 0,
    department: 'Computer Science & Engineering',
    departmentCode: 'CSE',
    description: 'A 24-hour collegiate hackathon bringing together students across South India to build autonomous agents, neural computer-vision systems, and robotics hardware prototypes. Formally endorsed by the NIE Academic Senate.',
  },
  {
    title: 'Full-Stack Web Architecture Workshop',
    category: 'Workshop',
    date: new Date('2026-11-24T10:00:00.000Z'),
    time: '10:00 AM',
    venue: 'Turing Computing Lab 3',
    capacity: 45,
    registeredCount: 0,
    department: 'Information Science & Engineering',
    departmentCode: 'ISE',
    description: 'Intensive hands-on laboratory session covering high-throughput microservices, edge caching, real-time database locks, and production cloud containerization for departmental systems.',
  },
  {
    title: 'NIE Classical Fusion & Acoustic Eve',
    category: 'Cultural',
    date: new Date('2026-11-29T17:30:00.000Z'),
    time: '05:30 PM',
    venue: 'NIE Open Air Amphitheatre',
    capacity: 200,
    registeredCount: 0,
    department: 'Cultural Troupe & Fine Arts',
    departmentCode: 'CUL',
    description: 'An open-air evening of instrumental, carnatic, and contemporary fusion performances presented by the NIE Cultural Troupe and guest alumni performers.',
  },
  {
    title: 'Annual Inter-Collegiate Basketball Meet',
    category: 'Sports',
    date: new Date('2026-12-05T08:00:00.000Z'),
    time: '08:00 AM',
    venue: 'NIE Diamond Jubilee Sports Complex',
    capacity: 80,
    registeredCount: 0,
    department: 'Physical Education & Athletics',
    departmentCode: 'PED',
    description: 'Inter-department and invitational collegiate basketball tournament conducted under VTU competitive standards with certified match referees.',
  },
];

// Provisioned administrator credentials (override via .env — never hardcode
// production credentials here).
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@nie.ac.in';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'niePass2026!';

async function seedDatabase() {
  // Safety lock: this script wipes the entire database. It previously ran
  // unconditionally, so pointing it at production Atlas destroyed everything.
  if (!process.env.MONGO_URI) {
    console.error('[Seeder] MONGO_URI is not set. Configure server/.env first.');
    process.exit(1);
  }

  const confirmed = process.env.SEED_CONFIRM === 'true' || process.argv.includes('--force');
  if (!confirmed) {
    console.error('[Seeder] SAFETY LOCK: This script deletes ALL users, events and registrations.');
    console.error('[Seeder] Set SEED_CONFIRM=true in server/.env (or run with --force) to proceed.');
    process.exit(1);
  }

  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('[Seeder] Connected successfully!');

    // Clean existing records
    await Registration.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
    console.log('[Seeder] Cleared old records & mock students.');

    // 1. Create Pre-Seeded Administrator Account (password is never logged)
    const adminUser = await User.create({
      name: 'NIE Event Convenor',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      department: 'Academic & Event Senate',
      institution: 'National Institute of Engineering',
    });
    console.log(`[Seeder] Admin provisioned: ${adminUser.email}`);

    // 2. Create Pristine Events with 0 bookings
    const createdEvents = [];
    for (const eventData of INITIAL_EVENTS) {
      const ev = await Event.create({
        ...eventData,
        createdBy: adminUser._id,
      });
      createdEvents.push(ev);
    }
    console.log(`[Seeder] Published ${createdEvents.length} NIE events ready for real student bookings.`);

    console.log('[Seeder] Database clean & ready for real user onboarding!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    process.exit(1);
  }
}

seedDatabase();

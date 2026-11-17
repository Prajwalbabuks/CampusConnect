import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import User from '../models/User.js';
import Event from '../models/Event.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

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

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const CONFIRM_FLAG = process.argv.includes('--confirm');

function validateSeedConfiguration() {
  if (!process.env.MONGO_URI?.trim()) {
    throw new Error('MONGO_URI is required. Configure server/.env first.');
  }
  if (!ADMIN_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL)) {
    throw new Error('Set a valid SEED_ADMIN_EMAIL in server/.env.');
  }
  const strongPassword =
    typeof ADMIN_PASSWORD === 'string' &&
    ADMIN_PASSWORD.length >= 14 &&
    ADMIN_PASSWORD.length <= 72 &&
    /[a-z]/.test(ADMIN_PASSWORD) &&
    /[A-Z]/.test(ADMIN_PASSWORD) &&
    /\d/.test(ADMIN_PASSWORD) &&
    /[^A-Za-z0-9]/.test(ADMIN_PASSWORD);
  if (!strongPassword) {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be 14–72 characters and include lowercase, uppercase, numeric, and special characters.'
    );
  }
  if (!CONFIRM_FLAG) {
    throw new Error('No database records are deleted. Confirm Seed Admin provisioning with: npm run seed -- --confirm');
  }
}

async function provisionSeedAdmin() {
  validateSeedConfiguration();
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });

  // Add only the single Seed Admin constraint. Never sync/drop existing indexes.
  await User.collection.createIndex(
    { isSuperAdmin: 1 },
    {
      unique: true,
      partialFilterExpression: { isSuperAdmin: true },
      name: 'one_seed_admin_only',
    }
  );

  const otherSeedAdmin = await User.findOne({ isSuperAdmin: true, email: { $ne: ADMIN_EMAIL } }).select('_id');
  if (otherSeedAdmin) {
    throw new Error('A Seed Admin already exists with a different configured email. No records were changed.');
  }

  let adminUser = await User.findOne({ email: ADMIN_EMAIL }).select('+password +sessionVersion');
  if (adminUser) {
    // Reusing an existing identity requires proof of its configured password.
    const passwordMatches = await adminUser.comparePassword(ADMIN_PASSWORD);
    if (!passwordMatches) {
      throw new Error('The configured seed email already belongs to another account. No records were changed.');
    }
    const changed =
      adminUser.isSuperAdmin !== true || adminUser.role !== 'admin' || adminUser.isActive === false;
    adminUser.isSuperAdmin = true;
    adminUser.role = 'admin';
    adminUser.isActive = true;
    if (changed) adminUser.sessionVersion = (adminUser.sessionVersion ?? 0) + 1;
    await adminUser.save();
  } else {
    adminUser = await User.create({
      name: 'CampusConnect Seed Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isSuperAdmin: true,
      isActive: true,
      department: 'Academic & Event Senate',
      institution: 'National Institute of Engineering',
    });
  }

  // Preserve existing events and registrations. Add only missing starter events.
  let createdCount = 0;
  for (const eventData of INITIAL_EVENTS) {
    const existingEvent = await Event.findOne({ title: eventData.title }).select('_id');
    if (existingEvent) continue;
    await Event.create({ ...eventData, createdBy: adminUser._id });
    createdCount += 1;
  }

  console.log(`[Seeder] Seed Admin is ready. Added ${createdCount} missing starter event(s).`);
}

provisionSeedAdmin()
  .catch((error) => {
    console.error(`[Seeder] ${error.message || 'Provisioning failed.'}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

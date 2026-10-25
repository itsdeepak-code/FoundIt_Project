/**
 * Fills the local database with demo users, listings and claims.
 * WARNING: this deletes all existing users, items and claims first.
 *   npm run seed
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Claim } from '../models/Claim.js';
import { Item } from '../models/Item.js';
import { User } from '../models/User.js';

const DEMO_PASSWORD = 'password123';
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

await connectDB();
await Promise.all([User.deleteMany({}), Item.deleteMany({}), Claim.deleteMany({})]);

const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
const [asha, rahul, meera] = await User.create([
  { name: 'Asha Verma', email: 'asha@college.edu', passwordHash },
  { name: 'Rahul Singh', email: 'rahul@college.edu', passwordHash },
  { name: 'Meera Iyer', email: 'meera@college.edu', passwordHash },
]);

const items = await Item.create([
  {
    title: 'Blue steel water bottle',
    description: 'Found a blue insulated steel bottle (about 750 ml) left on a reading table.',
    type: 'found', category: 'Bottles', location: 'Central Library, 2nd floor', incidentDate: daysAgo(1), createdBy: asha._id,
  },
  {
    title: 'Student ID card',
    description: 'College ID card found near the main gate. Name partially visible, Computer Science department.',
    type: 'found', category: 'ID Cards', location: 'Main gate', incidentDate: daysAgo(2), createdBy: rahul._id,
  },
  {
    title: 'Black JBL wireless headphones',
    description: 'Over-ear JBL headphones in a grey pouch. The left ear cushion is slightly torn.',
    type: 'lost', category: 'Electronics', location: 'Lecture Hall B-204', incidentDate: daysAgo(3), createdBy: meera._id,
  },
  {
    title: 'Set of keys on a red keyring',
    description: 'Three keys (one looks like a hostel room key) on a red keyring with a small bell.',
    type: 'found', category: 'Keys', location: 'Canteen', incidentDate: daysAgo(4), createdBy: meera._id,
  },
  {
    title: 'Engineering Mathematics textbook',
    description: 'B.S. Grewal Higher Engineering Mathematics, has my name written on the first page and lots of notes.',
    type: 'lost', category: 'Books and Stationery', location: 'Library reading room', incidentDate: daysAgo(5), createdBy: rahul._id,
  },
  {
    title: 'Grey hoodie',
    description: 'Plain grey zip-up hoodie, size M, left on a bench after football practice.',
    type: 'found', category: 'Clothing', location: 'Sports ground', incidentDate: daysAgo(6), createdBy: asha._id,
  },
  {
    title: 'Brown leather wallet',
    description: 'Brown leather bifold wallet. Contains my bus pass and some cash.',
    type: 'lost', category: 'Accessories', location: 'Bus stop near Block A', incidentDate: daysAgo(7), createdBy: asha._id,
  },
  {
    title: 'Laptop charger (65W USB-C)',
    description: 'White 65W USB-C laptop charger found plugged into a socket in the computer lab.',
    type: 'found', category: 'Electronics', location: 'Computer Lab 3', incidentDate: daysAgo(9), createdBy: rahul._id,
  },
  {
    title: 'Navy blue backpack',
    description: 'Navy Wildcraft backpack with a keychain of a small panda. Has notebooks inside.',
    type: 'lost', category: 'Bags', location: 'Auditorium', incidentDate: daysAgo(10), createdBy: meera._id,
  },
]);

// Give each listing a realistic "posted" time (a few hours after the incident),
// so sorting by newest looks natural instead of every item sharing one timestamp.
await Promise.all(
  items.map((item) => {
    const postedAt = new Date(item.incidentDate.getTime() + 3 * 60 * 60 * 1000);
    return Item.collection.updateOne({ _id: item._id }, { $set: { createdAt: postedAt, updatedAt: postedAt } });
  })
);

const byTitle = Object.fromEntries(items.map((item) => [item.title, item]));

// A pending claim waiting for Asha to review.
await Claim.create({
  itemId: byTitle['Blue steel water bottle']._id,
  claimantId: rahul._id,
  reporterId: asha._id,
  ownershipReason: 'I was studying on the 2nd floor yesterday and left my bottle on the table when I went to class.',
  identifyingDetails: 'It has a small dent near the bottom and a sticker of a cat on the lid.',
});

// An accepted claim waiting to be marked as returned.
const keys = byTitle['Set of keys on a red keyring'];
keys.status = 'claim_pending';
await keys.save();
await Claim.create({
  itemId: keys._id,
  claimantId: asha._id,
  reporterId: meera._id,
  ownershipReason: 'These are my hostel keys, I lost them at lunch on Monday.',
  identifyingDetails: 'Room 214 key, a cycle lock key and a locker key. The bell is slightly broken.',
  status: 'accepted',
  reviewNote: 'Collect them from the canteen counter after 2 pm.',
  reviewedAt: daysAgo(1),
});

console.log('Seeded 3 users, %d items and 2 claims.', items.length);
console.log('Log in with asha@college.edu, rahul@college.edu or meera@college.edu - password: %s', DEMO_PASSWORD);
await mongoose.disconnect();

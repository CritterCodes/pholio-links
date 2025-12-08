import { MongoClient, Db, Collection } from 'mongodb';
import { User } from '@/types';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // This prevents TypeScript errors when using globalThis
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client for each request
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

// Collection getters with proper typing
export async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection('users');
}

export async function getFeatureRequestsCollection() {
  const db = await getDatabase();
  return db.collection('feature_requests');
}

export async function getBugReportsCollection() {
  const db = await getDatabase();
  return db.collection('bug_reports');
}

export async function getFormsCollection() {
  const db = await getDatabase();
  return db.collection('forms');
}

export async function getFormSubmissionsCollection() {
  const db = await getDatabase();
  return db.collection('form_submissions');
}


export async function getNotificationsCollection() {
  const db = await getDatabase();
  return db.collection('notifications');
}

export async function getFansCollection() {
  const db = await getDatabase();
  return db.collection('fans');
}

export async function getSubscribersCollection() {
  const db = await getDatabase();
  return db.collection('subscribers');
}

export async function getSettingsCollection() {
  const db = await getDatabase();
  return db.collection('settings');
}

export async function getCampaignsCollection() {
  const db = await getDatabase();
  return db.collection('campaigns');
}

export async function getAnalyticsCollection() {
  const db = await getDatabase();
  return db.collection('analytics');
}

// Database initialization function
export async function initializeDatabase() {
  const db = await getDatabase();
  
  // Create indexes for better performance
  const usersCollection = db.collection('users');
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await usersCollection.createIndex({ username: 1 }, { unique: true });
  
  // Index for embedded link searches
  await usersCollection.createIndex({ 'links._id': 1 });
  
  // Index for embedded gallery searches
  await usersCollection.createIndex({ 'galleries._id': 1 });

  console.log('Database indexes created successfully');
}

export default clientPromise;
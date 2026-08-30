const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Property = require('./models/Property');
const connectDB = require('./config/db');

dotenv.config();

// Swaminarayan University, Kalol, Gandhinagar Coordinates
const CENTER_LAT = 23.2384;
const CENTER_LNG = 72.4975;

const DUMMY_OWNERS = [
  {
    name: 'Ramesh Patel',
    email: 'ramesh.patel@rentease.com',
    phone: '+91 98765 43210',
    password: 'password123',
    role: 'owner',
    bio: 'Verified property owner offering clean student PGs and rooms near Swaminarayan University Kalol.',
  },
  {
    name: 'Jayesh Shah',
    email: 'jayesh.shah@rentease.com',
    phone: '+91 98250 12345',
    password: 'password123',
    role: 'owner',
    bio: 'Owner of modern furnished flats and PG accommodations along Ahmedabad-Mehsana Highway.',
  },
  {
    name: 'Anita Chaudhari',
    email: 'anita.chaudhari@rentease.com',
    phone: '+91 97123 45678',
    password: 'password123',
    role: 'owner',
    bio: 'Providing safe, hygienic girls hostels and private rooms with home-cooked meal facilities.',
  },
  {
    name: 'Rajesh Vaghela',
    email: 'rajesh.vaghela@rentease.com',
    phone: '+91 99099 87654',
    password: 'password123',
    role: 'owner',
    bio: 'Premium 2 BHK and 3 BHK family flats near Kalol GIDC and Swaminarayan Campus.',
  },
  {
    name: 'Bhavin Prajapati',
    email: 'bhavin.prajapati@rentease.com',
    phone: '+91 94260 33445',
    password: 'password123',
    role: 'owner',
    bio: 'Affordable shared accommodation for engineering and medical students.',
  },
];

const DUMMY_PROPERTIES = [
  {
    title: 'Swaminarayan Student Residency PG',
    type: 'PG',
    price: 5500,
    description: 'Fully furnished PG for boys located just 500m from Swaminarayan University campus. Includes 3-time Gujarati meals, high-speed WiFi, laundry service, and 24/7 security guard.',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['WiFi', 'Food', 'AC', 'Laundry', 'Parking', 'Security'],
    address: 'Opposite Swaminarayan University Main Gate, Saij, Kalol, Gandhinagar - 382721',
    latitude: 23.2392,
    longitude: 72.4981,
    propertyCode: '#RE-KAL01',
    rating: 4.8,
    isActive: true,
  },
  {
    title: 'Shreeji Girls Deluxe Hostel',
    type: 'PG',
    price: 6000,
    description: 'Safe and secure girls hostel with biometric entry, CCTV surveillance, attached bathrooms, and delicious Kathiyawadi & Gujarati meals. 3 mins auto ride from Swaminarayan College.',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['WiFi', 'Food', 'AC', 'Security', 'CCTV'],
    address: 'Near Water Tank, Saij Village Road, Kalol, Gandhinagar - 382721',
    latitude: 23.2371,
    longitude: 72.4962,
    propertyCode: '#RE-KAL02',
    rating: 4.7,
    isActive: true,
  },
  {
    title: 'Highway Heights 2BHK Apartment',
    type: 'Flat',
    price: 14500,
    description: 'Spacious semi-furnished 2 BHK apartment on 4th floor with lift, dedicated car parking, RO water plant, and dual balconies overlooking the highway green belt.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['Lift', 'Parking', 'Power Backup', 'Security', 'Water Supply'],
    address: 'Ahmedabad-Mehsana Highway, Kalol, Gandhinagar - 382721',
    latitude: 23.2415,
    longitude: 72.5012,
    propertyCode: '#RE-KAL03',
    rating: 4.6,
    isActive: true,
  },
  {
    title: 'Saij Villa Private AC Room',
    type: 'Room',
    price: 4200,
    description: 'Independent private single room with attached bath, study table, wardrobe, and Split AC. Ideal for final year university students or working professionals.',
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['AC', 'WiFi', 'Attached Bath', 'Parking'],
    address: 'Near Panchvati Circle, Saij, Kalol, Gandhinagar - 382721',
    latitude: 23.2365,
    longitude: 72.4950,
    propertyCode: '#RE-KAL04',
    rating: 4.5,
    isActive: true,
  },
  {
    title: 'Green Park Shared Student Flat',
    type: 'Shared',
    price: 3500,
    description: 'Shared 3 BHK flat for university students. 2 beds per room available. Fully functional kitchen with gas pipeline, washing machine, and high-speed fiber internet.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['WiFi', 'Kitchen', 'Laundry', 'Parking'],
    address: 'Borisana Road, Kalol, Gandhinagar - 382721',
    latitude: 23.2340,
    longitude: 72.4930,
    propertyCode: '#RE-KAL05',
    rating: 4.4,
    isActive: true,
  },
  {
    title: 'Kalol Town Executive 1BHK Flat',
    type: 'Flat',
    price: 9500,
    description: 'Modern 1 BHK flat with modular kitchen, sofa set, double bed, refrigerator, and geyser. Located in prime residential area with market at walking distance.',
    images: [
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['AC', 'Modular Kitchen', 'Geyser', 'Parking'],
    address: 'Near Kalol Bus Station, Highway Road, Kalol, Gandhinagar - 382721',
    latitude: 23.2450,
    longitude: 72.5040,
    propertyCode: '#RE-KAL06',
    rating: 4.9,
    isActive: true,
  },
  {
    title: 'Campus Side Boys Shared Room',
    type: 'Shared',
    price: 3800,
    description: 'Budget-friendly shared room just 300 meters from Swaminarayan Campus. Daily room cleaning, individual study desks, and RO drinking water system included.',
    images: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['WiFi', 'RO Water', 'Cleaning', 'Parking'],
    address: 'Swaminarayan Mandir Lane, Saij, Kalol, Gandhinagar - 382721',
    latitude: 23.2398,
    longitude: 72.4989,
    propertyCode: '#RE-KAL07',
    rating: 4.3,
    isActive: true,
  },
  {
    title: 'GIDC Residency Luxury 3BHK Flat',
    type: 'Flat',
    price: 21000,
    description: 'Premium 3 BHK residential apartment featuring master bedrooms, wooden flooring, covered double parking, gym access, and 24/7 security guard post.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['AC', 'Gym', 'Security', 'Covered Parking', 'Power Backup'],
    address: 'GIDC Industrial Area Road, Kalol, Gandhinagar - 382721',
    latitude: 23.2480,
    longitude: 72.5080,
    propertyCode: '#RE-KAL08',
    rating: 4.9,
    isActive: true,
  },
  {
    title: 'Patel Villa Budget Single Room',
    type: 'Room',
    price: 3600,
    description: 'Clean single non-AC room with fan, bed, table, chair, and private balcony. Perfect for students seeking quiet study environment near university campus.',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['WiFi', 'Balcony', 'Parking'],
    address: 'Near Old Bus Stand, Kalol, Gandhinagar - 382721',
    latitude: 23.2320,
    longitude: 72.4910,
    propertyCode: '#RE-KAL09',
    rating: 4.2,
    isActive: true,
  },
  {
    title: 'Vaghela Boys PG & Food Services',
    type: 'PG',
    price: 5200,
    description: 'Well-managed boys PG offering comfortable 2-seater and 3-seater rooms with nutritious unlimited breakfast, lunch, and dinner. 5 mins walk from Kalol University.',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['Food', 'WiFi', 'Laundry', 'Security'],
    address: 'College Road, Saij, Kalol, Gandhinagar - 382721',
    latitude: 23.2405,
    longitude: 72.4995,
    propertyCode: '#RE-KAL10',
    rating: 4.6,
    isActive: true,
  },
  {
    title: 'Kadi Road Furnished 2BHK Flat',
    type: 'Flat',
    price: 13000,
    description: 'Newly constructed 2 BHK apartment with inverter backup, solar water heater, modern bathroom fittings, and 24 hours water supply.',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['Solar Water', 'Power Backup', 'Parking', 'Lift'],
    address: 'Kadi Road Crossing, Kalol, Gandhinagar - 382721',
    latitude: 23.2355,
    longitude: 72.4890,
    propertyCode: '#RE-KAL11',
    rating: 4.7,
    isActive: true,
  },
  {
    title: 'Royal Swaminarayan Girls PG',
    type: 'PG',
    price: 6500,
    description: 'Premium girls PG featuring fully air-conditioned rooms, LED TV lounge, refrigerator on each floor, and 24-hour lady warden + security guard.',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['AC', 'WiFi', 'Food', 'Warden', 'Security', 'TV Lounge'],
    address: 'Opp. Swaminarayan Physiotherapy College, Kalol, Gandhinagar - 382721',
    latitude: 23.2388,
    longitude: 72.4978,
    propertyCode: '#RE-KAL12',
    rating: 4.9,
    isActive: true,
  },
  {
    title: 'University View Single Studio Room',
    type: 'Room',
    price: 4800,
    description: 'Compact independent studio room with small pantry, sink, private bathroom, and direct view of the Swaminarayan University clock tower.',
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['Pantry', 'WiFi', 'AC', 'Parking'],
    address: 'University Road, Saij, Kalol, Gandhinagar - 382721',
    latitude: 23.2381,
    longitude: 72.4970,
    propertyCode: '#RE-KAL13',
    rating: 4.6,
    isActive: true,
  },
  {
    title: 'Highway Touch 3BHK Family Flat',
    type: 'Flat',
    price: 18500,
    description: 'Spacious 3 BHK apartment with marble flooring, modular kitchen cabinets, dual lifts, children play park, and dedicated security post.',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['Lift', 'Security', 'Play Area', 'Parking', 'Power Backup'],
    address: 'Mehsana Highway Bypass, Kalol, Gandhinagar - 382721',
    latitude: 23.2430,
    longitude: 72.5025,
    propertyCode: '#RE-KAL14',
    rating: 4.8,
    isActive: true,
  },
  {
    title: 'Kalol Central Shared Flat for Medical Students',
    type: 'Shared',
    price: 4000,
    description: 'Shared 2 BHK flat specifically designed for ayurvedic and medical students at Swaminarayan University. Quiet neighborhood, 24x7 study desks and high speed internet.',
    images: [
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    ],
    facilities: ['WiFi', 'Study Desk', 'Kitchen', 'RO Water'],
    address: 'Near Ayurvedic Hospital, Kalol, Gandhinagar - 382721',
    latitude: 23.2395,
    longitude: 72.4965,
    propertyCode: '#RE-KAL15',
    rating: 4.5,
    isActive: true,
  },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Connected to MongoDB Atlas for Seeding...');

    // Clear existing dummy seed properties & owners if needed
    console.log('🧹 Purging existing properties with #RE-KAL codes...');
    await Property.deleteMany({ propertyCode: { $regex: '^#RE-KAL' } });

    // 1. Create or Find Owners
    const createdOwners = [];
    for (const ownerData of DUMMY_OWNERS) {
      let owner = await User.findOne({ email: ownerData.email });
      if (!owner) {
        owner = await User.create(ownerData);
        console.log(`👤 Created Owner: ${owner.name} (${owner.email})`);
      } else {
        console.log(`👤 Existing Owner Found: ${owner.name}`);
      }
      createdOwners.push(owner);
    }

    // 2. Insert 15 Kalol Swaminarayan University Properties
    console.log('🏡 Inserting 15 Kalol properties...');
    for (let i = 0; i < DUMMY_PROPERTIES.length; i++) {
      const propData = DUMMY_PROPERTIES[i];
      const assignedOwner = createdOwners[i % createdOwners.length];

      await Property.create({
        ...propData,
        ownerId: assignedOwner._id,
      });
      console.log(`  ✓ Inserted: ${propData.title} (${propData.propertyCode}) - ${propData.price}/mo`);
    }

    console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('📍 15 Properties near Swaminarayan University, Kalol, Gandhinagar are now live in MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

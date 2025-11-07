import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Property from '../models/Property';
import Enquiry from '../models/Enquiry';
import Page from '../models/Page';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in environment variables');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Enquiry.deleteMany({});
    await Page.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@vishalproperties.com',
      phone: '9876543210',
      password: 'Admin@12345',
      role: 'admin',
      status: 'active'
    });
    console.log('✓ Created admin user:', adminUser.email);

    // Create regular user
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      phone: '9876543211',
      password: 'User@12345',
      role: 'user',
      status: 'active'
    });
    console.log('✓ Created regular user:', regularUser.email);

    // Create properties
    const properties = await Property.insertMany([
      {
        title: '3 BHK Luxury Flat in Sector 36',
        slug: '3-bhk-luxury-flat-in-sector-36',
        price: 8500000,
        propertyType: 'Apartment',
        status: 'active',
        location: 'Sector 36, Rohtak',
        city: 'Rohtak',
        area: 1500,
        bedrooms: 3,
        bathrooms: 2,
        features: ['Parking', 'Balcony', 'Gym', 'Security'],
        description: 'Spacious 3 BHK luxury apartment with modern amenities, located in prime area of Sector 36 Rohtak.',
        images: [
          'https://via.placeholder.com/400x300?text=Luxury+Flat+1',
          'https://via.placeholder.com/400x300?text=Luxury+Flat+2'
        ],
        coverImage: 'https://via.placeholder.com/400x300?text=Luxury+Flat+1',
        premium: true,
        ownerContact: '9876543210',
        createdBy: adminUser._id
      },
      {
        title: 'Residential Plot - Suncity Heights',
        slug: 'residential-plot-suncity-heights',
        price: 4500000,
        propertyType: 'Plot',
        status: 'active',
        location: 'Suncity Heights, Rohtak',
        city: 'Rohtak',
        area: 2500,
        bedrooms: 0,
        bathrooms: 0,
        features: ['Open Plot', 'Road Facing', 'Good Location'],
        description: 'Beautiful residential plot in Suncity Heights with all modern facilities and good connectivity.',
        images: [
          'https://via.placeholder.com/400x300?text=Plot+1',
          'https://via.placeholder.com/400x300?text=Plot+2'
        ],
        coverImage: 'https://via.placeholder.com/400x300?text=Plot+1',
        premium: false,
        ownerContact: '9876543210',
        createdBy: adminUser._id
      },
      {
        title: '2 BHK Apartment - Suncity Projects',
        slug: '2-bhk-apartment-suncity-projects',
        price: 5500000,
        propertyType: 'Apartment',
        status: 'active',
        location: 'Suncity Projects, Rohtak',
        city: 'Rohtak',
        area: 1100,
        bedrooms: 2,
        bathrooms: 1,
        features: ['Parking', 'Balcony', 'Water Supply'],
        description: 'Comfortable 2 BHK apartment in well-developed Suncity Projects area.',
        images: [
          'https://via.placeholder.com/400x300?text=Apartment+1',
          'https://via.placeholder.com/400x300?text=Apartment+2'
        ],
        coverImage: 'https://via.placeholder.com/400x300?text=Apartment+1',
        premium: false,
        ownerContact: '9876543210',
        createdBy: adminUser._id
      },
      {
        title: 'Commercial Space - Sector 3',
        slug: 'commercial-space-sector-3',
        price: 12000000,
        propertyType: 'Commercial',
        status: 'active',
        location: 'Sector 3, Rohtak',
        city: 'Rohtak',
        area: 2500,
        bedrooms: 0,
        bathrooms: 2,
        features: ['Loading Area', 'Power Backup', 'Security'],
        description: 'Prime commercial space ideal for offices, retail, or warehousing in Sector 3.',
        images: [
          'https://via.placeholder.com/400x300?text=Commercial+1',
          'https://via.placeholder.com/400x300?text=Commercial+2'
        ],
        coverImage: 'https://via.placeholder.com/400x300?text=Commercial+1',
        premium: true,
        ownerContact: '9876543210',
        createdBy: adminUser._id
      },
      {
        title: '4 BHK Villa - Premium Location',
        slug: '4-bhk-villa-premium-location',
        price: 15000000,
        propertyType: 'House',
        status: 'active',
        location: 'Suncity Heights, Rohtak',
        city: 'Rohtak',
        area: 3000,
        bedrooms: 4,
        bathrooms: 3,
        features: ['Garden', 'Parking', 'Security', 'Swimming Pool'],
        description: 'Luxurious 4 BHK villa with premium amenities and spacious garden.',
        images: [
          'https://via.placeholder.com/400x300?text=Villa+1',
          'https://via.placeholder.com/400x300?text=Villa+2'
        ],
        coverImage: 'https://via.placeholder.com/400x300?text=Villa+1',
        premium: true,
        ownerContact: '9876543210',
        createdBy: adminUser._id
      }
    ]);
    console.log(`✓ Created ${properties.length} properties`);

    // Create sample enquiries
    const enquiries = await Enquiry.insertMany([
      {
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        phone: '9876543212',
        message: 'Interested in the 3 BHK flat. Can you provide more details?',
        propertyId: properties[0]._id,
        status: 'new'
      },
      {
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '9876543213',
        message: 'Looking for commercial space for office setup.',
        propertyId: properties[3]._id,
        status: 'reviewed'
      }
    ]);
    console.log(`✓ Created ${enquiries.length} enquiries`);

    // Create sample pages
    const pages = await Page.insertMany([
      {
        slug: 'about',
        title: 'About Vishal Properties',
        content: 'Vishal Properties is a leading real estate company in Rohtak providing premium residential and commercial properties.',
        metaTitle: 'About Vishal Properties',
        metaDescription: 'Learn more about Vishal Properties and our services'
      },
      {
        slug: 'contact',
        title: 'Contact Us',
        content: 'Contact Vishal Properties for property inquiries, sales, or rentals. Our team is available 24/7 to assist you.',
        metaTitle: 'Contact Vishal Properties',
        metaDescription: 'Get in touch with our team for property assistance'
      }
    ]);
    console.log(`✓ Created ${pages.length} pages`);

    console.log('\n✅ Seed data inserted successfully!\n');
    console.log('='.repeat(50));
    console.log('ADMIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('Email: admin@vishalproperties.com');
    console.log('Password: Admin@12345');
    console.log('='.repeat(50));
    console.log('\nREGULAR USER CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('Email: user@example.com');
    console.log('Password: User@12345');
    console.log('='.repeat(50));
    console.log('\nDATA SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Users: 2 (1 admin, 1 regular)`);
    console.log(`Properties: ${properties.length}`);
    console.log(`Enquiries: ${enquiries.length}`);
    console.log(`Pages: ${pages.length}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('✗ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();

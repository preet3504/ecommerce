const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created')

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      role: 'USER'
    }
  })
  console.log('✅ Test user created')

  // Create categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Latest electronic devices and gadgets' },
    { name: 'Fashion', slug: 'fashion', description: 'Trendy clothing and accessories' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home essentials and kitchen appliances' },
    { name: 'Books', slug: 'books', description: 'Books and literature for all ages' },
    { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Sports equipment and fitness gear' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Beauty products and personal care items' },
    { name: 'Toys & Games', slug: 'toys-games', description: 'Fun toys and games for everyone' },
    { name: 'Automotive', slug: 'automotive', description: 'Car accessories and automotive parts' },
    { name: 'Health & Wellness', slug: 'health-wellness', description: 'Health supplements and wellness products' },
    { name: 'Jewelry & Watches', slug: 'jewelry-watches', description: 'Elegant jewelry and premium watches' },
    { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Everything for your beloved pets' },
    { name: 'Office Supplies', slug: 'office-supplies', description: 'Office essentials and stationery' },
    { name: 'Garden & Outdoor', slug: 'garden-outdoor', description: 'Gardening tools and outdoor equipment' },
    { name: 'Baby Products', slug: 'baby-products', description: 'Baby care and nursery essentials' },
    { name: 'Musical Instruments', slug: 'musical-instruments', description: 'Instruments and music accessories' }
  ]

  const createdCategories = []
  for (const cat of categories) {
    const category = await prisma.category.create({ data: cat })
    createdCategories.push(category)
  }
  console.log('✅ 15 categories created')

  // Product templates for each category
  const productTemplates = {
    'Electronics': [
      'Wireless Headphones', 'Smart Watch', 'Laptop', 'Smartphone', 'Tablet', 'Bluetooth Speaker',
      'Gaming Console', 'Digital Camera', 'Wireless Mouse', 'Mechanical Keyboard', 'Monitor',
      'Power Bank', 'USB Cable', 'Webcam', 'Microphone', 'Router', 'Smart TV', 'Earbuds',
      'Drone', 'VR Headset', 'Smartwatch Band', 'Phone Case', 'Screen Protector', 'Charger',
      'External Hard Drive', 'SSD', 'RAM', 'Graphics Card', 'Motherboard', 'CPU', 'Cooling Fan',
      'LED Strip', 'Smart Bulb', 'Security Camera', 'Doorbell Camera', 'Smart Plug', 'Fitness Tracker',
      'E-Reader', 'Portable Projector', 'Action Camera'
    ],
    'Fashion': [
      'Cotton T-Shirt', 'Denim Jeans', 'Leather Jacket', 'Sneakers', 'Formal Shirt', 'Dress',
      'Hoodie', 'Sweatpants', 'Blazer', 'Skirt', 'Shorts', 'Polo Shirt', 'Cardigan', 'Sweater',
      'Coat', 'Boots', 'Sandals', 'Heels', 'Loafers', 'Belt', 'Wallet', 'Handbag', 'Backpack',
      'Sunglasses', 'Watch', 'Scarf', 'Hat', 'Cap', 'Gloves', 'Socks', 'Tie', 'Bow Tie',
      'Cufflinks', 'Bracelet', 'Necklace', 'Earrings', 'Ring', 'Perfume', 'Cologne', 'Lipstick'
    ],
    'Home & Kitchen': [
      'Coffee Maker', 'Blender', 'Toaster', 'Microwave', 'Air Fryer', 'Pressure Cooker',
      'Knife Set', 'Cutting Board', 'Cookware Set', 'Bakeware', 'Dinnerware Set', 'Glassware',
      'Utensil Set', 'Storage Containers', 'Trash Can', 'Dish Rack', 'Kitchen Scale', 'Mixer',
      'Food Processor', 'Slow Cooker', 'Rice Cooker', 'Electric Kettle', 'Can Opener', 'Grater',
      'Peeler', 'Measuring Cups', 'Mixing Bowls', 'Baking Sheet', 'Muffin Pan', 'Cake Pan',
      'Spatula Set', 'Ladle', 'Tongs', 'Whisk', 'Rolling Pin', 'Colander', 'Strainer', 'Pitcher',
      'Thermos', 'Lunch Box'
    ],
    'Books': [
      'Fiction Novel', 'Mystery Thriller', 'Romance Book', 'Science Fiction', 'Fantasy Novel',
      'Biography', 'Self-Help Book', 'Cookbook', 'Travel Guide', 'History Book', 'Poetry Collection',
      'Art Book', 'Photography Book', 'Business Book', 'Marketing Guide', 'Programming Book',
      'Design Book', 'Psychology Book', 'Philosophy Book', 'Religion Book', 'Children Book',
      'Young Adult Novel', 'Graphic Novel', 'Comic Book', 'Magazine', 'Journal', 'Notebook',
      'Planner', 'Calendar', 'Dictionary', 'Encyclopedia', 'Atlas', 'Textbook', 'Workbook',
      'Study Guide', 'Test Prep', 'Language Learning', 'Music Book', 'Drama Script', 'Essay Collection'
    ],
    'Sports & Fitness': [
      'Yoga Mat', 'Dumbbells', 'Resistance Bands', 'Jump Rope', 'Foam Roller', 'Exercise Ball',
      'Kettlebell', 'Pull-up Bar', 'Push-up Bars', 'Ab Wheel', 'Weight Bench', 'Treadmill',
      'Exercise Bike', 'Elliptical', 'Rowing Machine', 'Boxing Gloves', 'Punching Bag', 'Tennis Racket',
      'Badminton Set', 'Basketball', 'Football', 'Soccer Ball', 'Volleyball', 'Baseball Glove',
      'Cricket Bat', 'Golf Clubs', 'Skateboard', 'Bicycle', 'Helmet', 'Knee Pads', 'Elbow Pads',
      'Water Bottle', 'Gym Bag', 'Fitness Tracker', 'Heart Rate Monitor', 'Stopwatch', 'Whistle',
      'Swimming Goggles', 'Swim Cap', 'Running Shoes'
    ],
    'Beauty & Personal Care': [
      'Face Cream', 'Moisturizer', 'Cleanser', 'Toner', 'Serum', 'Face Mask', 'Eye Cream',
      'Sunscreen', 'Foundation', 'Concealer', 'Powder', 'Blush', 'Bronzer', 'Highlighter',
      'Eyeshadow Palette', 'Eyeliner', 'Mascara', 'Lipstick', 'Lip Gloss', 'Lip Balm',
      'Nail Polish', 'Nail File', 'Makeup Brush Set', 'Beauty Blender', 'Hair Dryer', 'Straightener',
      'Curling Iron', 'Hair Brush', 'Comb', 'Shampoo', 'Conditioner', 'Hair Mask', 'Hair Oil',
      'Body Lotion', 'Body Wash', 'Soap', 'Deodorant', 'Perfume', 'Cologne', 'Razor'
    ],
    'Toys & Games': [
      'Action Figure', 'Doll', 'Puzzle', 'Board Game', 'Card Game', 'Building Blocks',
      'Remote Control Car', 'Drone Toy', 'Stuffed Animal', 'Play Kitchen', 'Tool Set',
      'Doctor Kit', 'Art Set', 'Coloring Book', 'Crayons', 'Markers', 'Paint Set', 'Clay Set',
      'Musical Toy', 'Drum Set', 'Xylophone', 'Piano Toy', 'Guitar Toy', 'Ball Pit', 'Trampoline',
      'Swing Set', 'Slide', 'Sandbox', 'Water Table', 'Bubble Machine', 'Kite', 'Frisbee',
      'Yo-Yo', 'Spinning Top', 'Marbles', 'Trading Cards', 'Stickers', 'Temporary Tattoos',
      'Slime Kit', 'Science Kit'
    ],
    'Automotive': [
      'Car Cover', 'Floor Mats', 'Seat Covers', 'Steering Wheel Cover', 'Phone Holder',
      'Dash Cam', 'GPS Navigator', 'Car Charger', 'Air Freshener', 'Cleaning Kit', 'Wax',
      'Polish', 'Tire Pressure Gauge', 'Jump Starter', 'Tool Kit', 'First Aid Kit', 'Fire Extinguisher',
      'Emergency Kit', 'Sunshade', 'Organizer', 'Trunk Organizer', 'Cup Holder', 'Headrest Pillow',
      'Lumbar Support', 'Seat Gap Filler', 'Blind Spot Mirror', 'Backup Camera', 'Parking Sensor',
      'LED Lights', 'Fog Lights', 'Headlight Bulbs', 'Wiper Blades', 'Air Filter', 'Oil Filter',
      'Spark Plugs', 'Battery', 'Fuses', 'Relay', 'Antenna', 'License Plate Frame'
    ],
    'Health & Wellness': [
      'Multivitamin', 'Vitamin C', 'Vitamin D', 'Omega-3', 'Protein Powder', 'Pre-Workout',
      'Post-Workout', 'BCAA', 'Creatine', 'Collagen', 'Probiotics', 'Fiber Supplement',
      'Calcium', 'Magnesium', 'Zinc', 'Iron', 'B-Complex', 'Melatonin', 'Ashwagandha',
      'Turmeric', 'Ginger', 'Garlic', 'Green Tea Extract', 'Apple Cider Vinegar', 'Glucosamine',
      'Joint Support', 'Digestive Enzymes', 'Detox Tea', 'Weight Loss', 'Energy Drink',
      'Electrolytes', 'Meal Replacement', 'Protein Bar', 'Energy Bar', 'Granola Bar',
      'Trail Mix', 'Nuts', 'Seeds', 'Dried Fruit', 'Herbal Tea'
    ],
    'Jewelry & Watches': [
      'Gold Necklace', 'Silver Necklace', 'Diamond Ring', 'Engagement Ring', 'Wedding Band',
      'Bracelet', 'Bangle', 'Anklet', 'Earrings', 'Studs', 'Hoops', 'Pendant', 'Charm',
      'Brooch', 'Cufflinks', 'Tie Pin', 'Watch', 'Smartwatch', 'Fitness Watch', 'Luxury Watch',
      'Sports Watch', 'Dress Watch', 'Chronograph', 'Dive Watch', 'Pilot Watch', 'Watch Band',
      'Watch Box', 'Jewelry Box', 'Ring Holder', 'Necklace Stand', 'Earring Organizer',
      'Cleaning Kit', 'Polishing Cloth', 'Magnifier', 'Repair Kit', 'Gemstone', 'Pearl',
      'Crystal', 'Birthstone', 'Locket'
    ],
    'Pet Supplies': [
      'Dog Food', 'Cat Food', 'Pet Bowl', 'Water Fountain', 'Pet Bed', 'Pet Carrier',
      'Leash', 'Collar', 'Harness', 'ID Tag', 'Pet Toy', 'Chew Toy', 'Scratching Post',
      'Cat Tree', 'Litter Box', 'Litter', 'Poop Bags', 'Pet Shampoo', 'Brush', 'Nail Clipper',
      'Pet Wipes', 'Flea Treatment', 'Tick Collar', 'Pet Vitamins', 'Dental Treats', 'Training Treats',
      'Pet Gate', 'Crate', 'Playpen', 'Pet Stairs', 'Ramp', 'Pet Camera', 'Automatic Feeder',
      'Pet Fountain', 'Aquarium', 'Fish Food', 'Bird Cage', 'Bird Food', 'Hamster Cage', 'Rabbit Hutch'
    ],
    'Office Supplies': [
      'Notebook', 'Planner', 'Calendar', 'Sticky Notes', 'Index Cards', 'Binder', 'Folder',
      'File Organizer', 'Desk Organizer', 'Pen Holder', 'Stapler', 'Staples', 'Paper Clips',
      'Binder Clips', 'Rubber Bands', 'Tape', 'Tape Dispenser', 'Scissors', 'Paper Cutter',
      'Hole Punch', 'Label Maker', 'Labels', 'Markers', 'Highlighters', 'Pens', 'Pencils',
      'Erasers', 'Sharpener', 'Ruler', 'Calculator', 'Desk Lamp', 'Mouse Pad', 'Keyboard Tray',
      'Monitor Stand', 'Laptop Stand', 'Cable Organizer', 'Desk Mat', 'Chair Cushion', 'Footrest'
    ],
    'Garden & Outdoor': [
      'Garden Hose', 'Sprinkler', 'Watering Can', 'Pruning Shears', 'Garden Gloves', 'Rake',
      'Shovel', 'Spade', 'Trowel', 'Hoe', 'Wheelbarrow', 'Garden Cart', 'Kneeling Pad',
      'Plant Pots', 'Planters', 'Hanging Basket', 'Garden Stakes', 'Trellis', 'Garden Fence',
      'Mulch', 'Soil', 'Fertilizer', 'Seeds', 'Bulbs', 'Lawn Mower', 'Trimmer', 'Edger',
      'Leaf Blower', 'Chainsaw', 'Hedge Trimmer', 'Pressure Washer', 'Grill', 'BBQ Tools',
      'Patio Furniture', 'Umbrella', 'Fire Pit', 'Hammock', 'Outdoor Lights', 'Solar Lights'
    ],
    'Baby Products': [
      'Diapers', 'Wipes', 'Baby Formula', 'Baby Food', 'Bottles', 'Bottle Warmer', 'Sterilizer',
      'Pacifier', 'Teether', 'Bib', 'Burp Cloth', 'Swaddle', 'Blanket', 'Crib Sheet', 'Mattress',
      'Crib', 'Bassinet', 'Changing Table', 'Diaper Bag', 'Baby Monitor', 'Thermometer',
      'Humidifier', 'Night Light', 'Mobile', 'Bouncer', 'Swing', 'Play Mat', 'Activity Gym',
      'High Chair', 'Booster Seat', 'Stroller', 'Car Seat', 'Baby Carrier', 'Baby Wrap',
      'Bath Tub', 'Bath Toys', 'Hooded Towel', 'Baby Shampoo', 'Baby Lotion', 'Diaper Cream'
    ],
    'Musical Instruments': [
      'Acoustic Guitar', 'Electric Guitar', 'Bass Guitar', 'Ukulele', 'Violin', 'Cello',
      'Piano', 'Keyboard', 'Synthesizer', 'Drum Set', 'Snare Drum', 'Cymbals', 'Drumsticks',
      'Trumpet', 'Trombone', 'Saxophone', 'Clarinet', 'Flute', 'Harmonica', 'Recorder',
      'Microphone', 'Mic Stand', 'Pop Filter', 'Audio Interface', 'MIDI Controller', 'Headphones',
      'Studio Monitors', 'Guitar Amp', 'Bass Amp', 'Effects Pedal', 'Guitar Strings', 'Guitar Picks',
      'Guitar Strap', 'Guitar Case', 'Music Stand', 'Metronome', 'Tuner', 'Capo', 'Sheet Music'
    ]
  }

  // Create products for each category
  let totalProducts = 0
  for (const category of createdCategories) {
    const templates = productTemplates[category.name] || []
    const products = []

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i]
      const price = (Math.random() * 200 + 10).toFixed(2)
      const stock = Math.floor(Math.random() * 100) + 10
      const featured = i < 3 // First 3 products are featured

      const baseSlug = template.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      products.push({
        name: template,
        slug: `${category.slug}-${baseSlug}`,
        description: `High-quality ${template.toLowerCase()} with excellent features and durability. Perfect for everyday use.`,
        price: parseFloat(price),
        stock: stock,
        images: JSON.stringify([
          `https://picsum.photos/seed/${category.slug}-${i}-1/400/400`,
          `https://picsum.photos/seed/${category.slug}-${i}-2/400/400`,
          `https://picsum.photos/seed/${category.slug}-${i}-3/400/400`
        ]),
        categoryId: category.id,
        featured: featured
      })
    }

    await prisma.product.createMany({ data: products })
    totalProducts += products.length
    console.log(`✅ ${products.length} products created for ${category.name}`)
  }

  console.log(`\n🎉 Database seeded successfully!`)
  console.log(`📊 Summary:`)
  console.log(`   - 2 Users created`)
  console.log(`   - 15 Categories created`)
  console.log(`   - ${totalProducts} Products created`)
  console.log(`\n🔐 Test Credentials:`)
  console.log(`   Admin: admin@example.com / admin123`)
  console.log(`   User: user@example.com / user123`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

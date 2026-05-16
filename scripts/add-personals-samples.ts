import { faker } from '@faker-js/faker';
import { db } from '../server/db';
import { listings, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Helper function to generate a title for the personal listing based on subcategory
function generateTitle(subcategory: string): string {
  const titles: Record<string, string[]> = {
    'M4W': [
      'Looking to connect with someone special',
      'Single guy seeking genuine connection',
      'Let\'s grab coffee and see where it goes',
      'Athletic guy looking for active partner',
      'New to the area, would love to meet someone'
    ],
    'W4M': [
      'Creative woman seeking connection',
      'Looking for someone to explore the city with',
      'Genuine connection wanted, no games',
      'Dog lover seeking same for walks and talks',
      'Let\'s skip the apps and meet in person'
    ],
    'M4M': [
      'Seeking genuine connection and laughs',
      'Looking for someone to hike with',
      'New in town, would love to meet locals',
      'Coffee, conversation, and chemistry?',
      'Low-key guy seeking similar'
    ],
    'W4W': [
      'Artistic soul seeking connection',
      'Looking for new friends, maybe more',
      'Let\'s grab drinks and see if we click',
      'New to the scene, looking to connect',
      'Book lover seeking someone to share recommendations'
    ],
    'M4T': [
      'Open-minded guy seeking authentic connection',
      'Let\'s meet for coffee and conversation',
      'Respectful guy interested in getting to know you',
      'New to dating, looking for genuine people',
      'Looking for real connection in a digital world'
    ],
    'W4T': [
      'Let\'s share stories over coffee',
      'Open-hearted woman seeking connection',
      'Looking for someone genuine and kind',
      'Coffee dates and good conversation',
      'Seeking authentic connection in the city'
    ],
    'T4M': [
      'Let\'s connect over shared interests',
      'Seeking meaningful conversation and connection',
      'Coffee, conversation, and seeing where it goes',
      'Looking for genuine people to connect with',
      'New in town, would love to meet someone real'
    ],
    'T4W': [
      'Looking for authentic connection',
      'Coffee and conversation to start?',
      'Let\'s skip the small talk and connect for real',
      'Seeking meaningful connection in the city',
      'New to the area, would love to meet like-minded people'
    ],
    'T4T': [
      'Seeking authentic connection with like-minded person',
      'Let\'s share our stories over coffee',
      'Looking for genuine connection in the community',
      'Coffee and real conversation to start?',
      'New in town, seeking others to connect with'
    ],
    'Couple4M': [
      'Couple seeking male friend for outings',
      'Married couple looking to expand social circle',
      'Fun couple seeking third for adventures',
      'Open-minded couple looking for new connections',
      'Let\'s meet for drinks and see if we all click'
    ],
    'Couple4W': [
      'Couple seeking female friend to hang with',
      'Fun-loving couple looking for new connections',
      'Let\'s meet for coffee and see if we click',
      'Looking to expand our social circle',
      'Seeking genuine connection to share adventures'
    ],
    'Couple4Couple': [
      'Couple seeking couple friends for double dates',
      'Let\'s meet up for games and drinks',
      'Looking for other couples to hang out with',
      'New in town, seeking couple friends',
      'Couple seeking same for hiking, dining, and fun'
    ]
  };

  const subcategoryTitles = titles[subcategory] || titles['M4W'];
  return subcategoryTitles[Math.floor(Math.random() * subcategoryTitles.length)];
}

// Helper function to generate a description for the personal listing
function generateDescription(subcategory: string): string {
  const descriptions: Record<string, string[]> = {
    'M4W': [
      `Hey there! I'm ${faker.person.firstName('male')}, ${faker.number.int({ min: 25, max: 45 })} years old and looking to meet someone interesting. I enjoy ${faker.word.words(2)} and ${faker.word.words(2)}. If you'd like to chat, you can reach me at ${faker.internet.email().replace('@', ' at ')}. No spam please.`,
      `${faker.number.int({ min: 25, max: 45 })} y/o professional in the ${faker.company.buzzNoun()} industry. I love hiking, trying new restaurants, and ${faker.word.words(2)}. Looking for genuine connection. Contact: ${faker.internet.email().replace('@', ' at ')}`,
      `Recently moved to the area and looking to meet new people. I'm ${faker.number.int({ min: 25, max: 45 })}, work in ${faker.company.buzzNoun()}, and enjoy ${faker.word.words(2)}. If interested, message me at ${faker.internet.email().replace('@', ' at ')}`,
      `Single guy, ${faker.number.int({ min: 25, max: 45 })}, into ${faker.word.words(2)} and ${faker.word.words(2)}. Looking for someone with similar interests. Let's grab coffee! ${faker.internet.email().replace('@', ' at ')}`,
      `I'm a ${faker.number.int({ min: 25, max: 45 })} year old guy who enjoys ${faker.word.words(2)}, cooking, and good conversation. Would love to connect with someone authentic. Contact: ${faker.internet.email().replace('@', ' at ')}`
    ],
    'W4M': [
      `Hi! I'm ${faker.person.firstName('female')}, ${faker.number.int({ min: 25, max: 45 })} y/o professional seeking a genuine connection. I love ${faker.word.words(2)} and trying new things. Contact me at ${faker.internet.email().replace('@', ' at ')} if interested.`,
      `${faker.number.int({ min: 25, max: 45 })} year old woman who enjoys ${faker.word.words(2)}, hiking, and good coffee. Looking for someone with similar interests. Send a message to ${faker.internet.email().replace('@', ' at ')} if that's you!`,
      `Creative ${faker.number.int({ min: 25, max: 45 })} y/o who works in ${faker.company.buzzNoun()}. I spend weekends ${faker.word.words(2)} and exploring new places. Reach out if you'd like to join: ${faker.internet.email().replace('@', ' at ')}`,
      `New to dating after a long relationship. I'm ${faker.number.int({ min: 25, max: 45 })}, work in ${faker.company.buzzNoun()}, and enjoy ${faker.word.words(2)}. Looking for genuine connection. ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} year old woman looking for someone to explore the city with. I love arts, music, and ${faker.word.words(2)}. Let's skip the dating apps! ${faker.internet.email().replace('@', ' at ')}`
    ],
    'M4M': [
      `${faker.number.int({ min: 25, max: 45 })} y/o guy into ${faker.word.words(2)}, fitness, and trying new restaurants. Looking for genuine connection. Contact me at ${faker.internet.email().replace('@', ' at ')}`,
      `Hi there! I'm a ${faker.number.int({ min: 25, max: 45 })} year old professional who enjoys ${faker.word.words(2)} and outdoor activities. Would love to meet someone with similar interests. ${faker.internet.email().replace('@', ' at ')}`,
      `Looking for new connections in the area. I'm ${faker.number.int({ min: 25, max: 45 })}, work in ${faker.company.buzzNoun()}, and enjoy ${faker.word.words(2)}. Let's grab coffee! ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} y/o who loves hiking, cooking, and good conversation. Recently moved to the area and looking to meet people. Contact: ${faker.internet.email().replace('@', ' at ')}`,
      `Outgoing ${faker.number.int({ min: 25, max: 45 })} y/o guy seeking friends or more. I enjoy ${faker.word.words(2)}, travel, and ${faker.word.words(2)}. Reach out if you'd like to connect! ${faker.internet.email().replace('@', ' at ')}`
    ],
    'W4W': [
      `${faker.number.int({ min: 25, max: 45 })} y/o creative woman looking to meet like-minded people. I enjoy art, ${faker.word.words(2)}, and exploring new places. Message me at ${faker.internet.email().replace('@', ' at ')}`,
      `Hi! I'm a ${faker.number.int({ min: 25, max: 45 })} year old who works in ${faker.company.buzzNoun()} and loves ${faker.word.words(2)}. Looking for genuine connections. Contact: ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} year old woman new to the area. I enjoy hiking, reading, and ${faker.word.words(2)}. Would love to meet someone to explore with. ${faker.internet.email().replace('@', ' at ')}`,
      `Looking for new friends or maybe more. I'm ${faker.number.int({ min: 25, max: 45 })}, work in ${faker.company.buzzNoun()}, and enjoy ${faker.word.words(2)}. Let's grab coffee! ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} year old woman who enjoys ${faker.word.words(2)}, cooking, and good conversation. Seeking authentic connections. Reach out: ${faker.internet.email().replace('@', ' at ')}`
    ],
    'M4T': [
      `${faker.number.int({ min: 25, max: 45 })} y/o open-minded guy looking to connect. I enjoy ${faker.word.words(2)}, movies, and trying new restaurants. If interested, reach out at ${faker.internet.email().replace('@', ' at ')}`,
      `Respectful ${faker.number.int({ min: 25, max: 45 })} year old seeking genuine connection. I work in ${faker.company.buzzNoun()} and enjoy ${faker.word.words(2)}. Let's meet for coffee! ${faker.internet.email().replace('@', ' at ')}`,
      `Hi! I'm a ${faker.number.int({ min: 25, max: 45 })} y/o who enjoys ${faker.word.words(2)}, hiking, and good conversation. Looking for someone authentic to connect with. ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} year old professional seeking real connection. I'm into ${faker.word.words(2)} and exploring new places. Contact me: ${faker.internet.email().replace('@', ' at ')}`,
      `Looking for genuine people in a digital world. I'm ${faker.number.int({ min: 25, max: 45 })}, enjoy ${faker.word.words(2)}, and work in ${faker.company.buzzNoun()}. Let's chat! ${faker.internet.email().replace('@', ' at ')}`
    ],
    'W4T': [
      `${faker.number.int({ min: 25, max: 45 })} year old woman seeking authentic connection. I enjoy ${faker.word.words(2)}, art, and good conversation. Contact me at ${faker.internet.email().replace('@', ' at ')}`,
      `Open-hearted ${faker.number.int({ min: 25, max: 45 })} y/o looking to connect. I work in ${faker.company.buzzNoun()} and love ${faker.word.words(2)}. Let's grab coffee! ${faker.internet.email().replace('@', ' at ')}`,
      `Hi! I'm a ${faker.number.int({ min: 25, max: 45 })} year old who enjoys hiking, cooking, and ${faker.word.words(2)}. Looking for genuine connection. ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} y/o creative seeking like-minded people. I'm passionate about ${faker.word.words(2)} and trying new things. Reach out: ${faker.internet.email().replace('@', ' at ')}`,
      `Looking for real connection in a busy world. I'm ${faker.number.int({ min: 25, max: 45 })}, work in ${faker.company.buzzNoun()}, and enjoy ${faker.word.words(2)}. ${faker.internet.email().replace('@', ' at ')}`
    ],
    'T4M': [
      `${faker.number.int({ min: 25, max: 45 })} y/o seeking genuine connection. I enjoy ${faker.word.words(2)}, hiking, and trying new restaurants. If interested, contact me at ${faker.internet.email().replace('@', ' at ')}`,
      `Hi! I'm ${faker.number.int({ min: 25, max: 45 })}, work in ${faker.company.buzzNoun()}, and love ${faker.word.words(2)}. Looking for authentic people to connect with. ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} year old who enjoys art, ${faker.word.words(2)}, and good conversation. New to the area and looking to meet people. ${faker.internet.email().replace('@', ' at ')}`,
      `Looking for meaningful connection. I'm ${faker.number.int({ min: 25, max: 45 })}, enjoy ${faker.word.words(2)}, and work in ${faker.company.buzzNoun()}. Let's grab coffee! ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} y/o who loves cooking, travel, and ${faker.word.words(2)}. Seeking genuine connection. Contact: ${faker.internet.email().replace('@', ' at ')}`
    ],
    'T4W': [
      `${faker.number.int({ min: 25, max: 45 })} year old seeking authentic connection. I enjoy ${faker.word.words(2)}, art, and exploring new places. Message me at ${faker.internet.email().replace('@', ' at ')}`,
      `Hi! I'm a ${faker.number.int({ min: 25, max: 45 })} y/o who works in ${faker.company.buzzNoun()} and loves ${faker.word.words(2)}. Looking to connect with like-minded people. ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} year old new to the area. I enjoy hiking, reading, and ${faker.word.words(2)}. Would love to meet someone to explore with. Contact: ${faker.internet.email().replace('@', ' at ')}`,
      `Looking for genuine connection. I'm ${faker.number.int({ min: 25, max: 45 })}, enjoy ${faker.word.words(2)}, and love trying new things. Let's skip the small talk! ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} y/o who enjoys ${faker.word.words(2)}, music, and good conversation. Seeking authentic connections. Reach out: ${faker.internet.email().replace('@', ' at ')}`
    ],
    'T4T': [
      `${faker.number.int({ min: 25, max: 45 })} year old seeking connection with like-minded people. I enjoy ${faker.word.words(2)}, art, and good conversation. Contact me at ${faker.internet.email().replace('@', ' at ')}`,
      `Hi! I'm a ${faker.number.int({ min: 25, max: 45 })} y/o who works in ${faker.company.buzzNoun()} and loves ${faker.word.words(2)}. Looking to connect with others in the community. ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} year old new to the area. I enjoy hiking, ${faker.word.words(2)}, and exploring new places. Let's meet up! ${faker.internet.email().replace('@', ' at ')}`,
      `Looking for authentic connections. I'm ${faker.number.int({ min: 25, max: 45 })}, enjoy ${faker.word.words(2)}, and love good coffee. Let's chat! ${faker.internet.email().replace('@', ' at ')}`,
      `${faker.number.int({ min: 25, max: 45 })} y/o who enjoys ${faker.word.words(2)}, cooking, and meaningful conversation. Seeking genuine connections. ${faker.internet.email().replace('@', ' at ')}`
    ],
    'Couple4M': [
      `Fun-loving couple (${faker.number.int({ min: 25, max: 45 })}M, ${faker.number.int({ min: 25, max: 45 })}F) seeking male friend for outings. We enjoy ${faker.word.words(2)}, hiking, and trying new restaurants. Contact us at ${faker.internet.email().replace('@', ' at ')}`,
      `Married couple in our ${faker.number.int({ min: 30, max: 40 })}s looking to expand our social circle. We're into ${faker.word.words(2)} and travel. Looking for a like-minded guy to hang with. ${faker.internet.email().replace('@', ' at ')}`,
      `Couple (${faker.number.int({ min: 25, max: 35 })}M, ${faker.number.int({ min: 25, max: 35 })}F) seeking third for adventures. We enjoy ${faker.word.words(2)}, cooking, and exploring. Reach out: ${faker.internet.email().replace('@', ' at ')}`,
      `Open-minded couple looking for new connections. We're both ${faker.number.int({ min: 28, max: 45 })}, enjoy ${faker.word.words(2)}, and love trying new things. Contact: ${faker.internet.email().replace('@', ' at ')}`,
      `Couple seeking male friend to hang out with. We're ${faker.number.int({ min: 25, max: 45 })} and ${faker.number.int({ min: 25, max: 45 })}, enjoy ${faker.word.words(2)}, and outdoor activities. Let's connect! ${faker.internet.email().replace('@', ' at ')}`
    ],
    'Couple4W': [
      `Fun couple (${faker.number.int({ min: 25, max: 45 })}M, ${faker.number.int({ min: 25, max: 45 })}F) seeking female friend to hang with. We enjoy ${faker.word.words(2)}, hiking, and good food. Contact us at ${faker.internet.email().replace('@', ' at ')}`,
      `Married couple in our ${faker.number.int({ min: 30, max: 40 })}s looking to expand our social circle. We're into ${faker.word.words(2)} and travel. Looking for a like-minded woman to hang with. ${faker.internet.email().replace('@', ' at ')}`,
      `Couple (${faker.number.int({ min: 25, max: 35 })}M, ${faker.number.int({ min: 25, max: 35 })}F) seeking third for adventures. We enjoy ${faker.word.words(2)}, art, and exploring. Reach out: ${faker.internet.email().replace('@', ' at ')}`,
      `Open-minded couple looking for new connections. We're both ${faker.number.int({ min: 28, max: 45 })}, enjoy ${faker.word.words(2)}, and love trying new things. Contact: ${faker.internet.email().replace('@', ' at ')}`,
      `Couple seeking female friend to hang out with. We're ${faker.number.int({ min: 25, max: 45 })} and ${faker.number.int({ min: 25, max: 45 })}, enjoy ${faker.word.words(2)}, and outdoor activities. Let's connect! ${faker.internet.email().replace('@', ' at ')}`
    ],
    'Couple4Couple': [
      `Fun couple (${faker.number.int({ min: 25, max: 45 })}M, ${faker.number.int({ min: 25, max: 45 })}F) seeking another couple for double dates. We enjoy ${faker.word.words(2)}, board games, and trying new restaurants. Contact us at ${faker.internet.email().replace('@', ' at ')}`,
      `Married couple in our ${faker.number.int({ min: 30, max: 40 })}s looking for couple friends. We're into ${faker.word.words(2)}, hiking, and travel. Let's meet up! ${faker.internet.email().replace('@', ' at ')}`,
      `Couple (${faker.number.int({ min: 25, max: 35 })}M, ${faker.number.int({ min: 25, max: 35 })}F) seeking same for weekend hangouts. We enjoy ${faker.word.words(2)}, cooking, and game nights. Reach out: ${faker.internet.email().replace('@', ' at ')}`,
      `New in town and looking for couple friends. We're both ${faker.number.int({ min: 28, max: 45 })}, enjoy ${faker.word.words(2)}, and love trying new things. Contact: ${faker.internet.email().replace('@', ' at ')}`,
      `Couple seeking couple friends for hiking, dining, and fun. We're ${faker.number.int({ min: 25, max: 45 })} and ${faker.number.int({ min: 25, max: 45 })}, enjoy ${faker.word.words(2)}, and outdoor activities. Let's connect! ${faker.internet.email().replace('@', ' at ')}`
    ]
  };

  const subcategoryDescriptions = descriptions[subcategory] || descriptions['M4W'];
  return subcategoryDescriptions[Math.floor(Math.random() * subcategoryDescriptions.length)];
}

interface Location {
  state: string;
  cities: string[];
}

// Function to create a listing object for insertion
function createPersonalListing(userId: number, subcategory: string, state: string, city: string) {
  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  return {
    userId,
    title: generateTitle(subcategory),
    description: generateDescription(subcategory),
    type: 'personal',
    subcategory,
    price: null,
    country: 'United States',
    state,
    city,
    status: 'active',
    isFeatured: false,
    isPaid: false,
    isBoosted: false,
    isRemote: false,
    expiresAt,
    createdAt: new Date()
  };
}

// Main function to insert sample personal listings
async function insertPersonalListings() {
  try {
    console.log('Starting to insert personal listings...');
    
    // Get first user or create one if none exists
    let user = (await db.select().from(users).limit(1))[0];
    
    if (!user) {
      console.log('No users found. Creating a sample user...');
      [user] = await db.insert(users).values({
        username: 'sampleuser',
        email: 'sample@example.com',
        password: 'password123',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue',
        role: 'user',
        createdAt: new Date()
      }).returning();
      console.log('Created sample user:', user);
    }
    
    // List of states and cities
    const locations: Location[] = [
      { state: 'California', cities: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose'] },
      { state: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse'] },
      { state: 'Texas', cities: ['Austin', 'Houston', 'Dallas', 'San Antonio'] },
      { state: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] },
      { state: 'Illinois', cities: ['Chicago', 'Springfield', 'Peoria', 'Rockford'] }
    ];
    
    // List of all subcategories
    const subcategories = [
      'M4W', 'W4M', 'M4M', 'W4W', 'M4T', 'W4T', 
      'T4M', 'T4W', 'T4T', 'Couple4M', 'Couple4W', 'Couple4Couple'
    ];
    
    // Create listings for each subcategory in various locations
    const listingsToInsert = [];
    
    // Create 5 listings for each subcategory spread across different locations
    subcategories.forEach(subcategory => {
      for (let i = 0; i < 5; i++) {
        // Pick a random location
        const location = locations[Math.floor(Math.random() * locations.length)];
        const city = location.cities[Math.floor(Math.random() * location.cities.length)];
        
        listingsToInsert.push(createPersonalListing(user.id, subcategory, location.state, city));
      }
    });
    
    // Insert all listings
    const insertedListings = await db.insert(listings).values(listingsToInsert).returning();
    
    console.log(`Successfully inserted ${insertedListings.length} personal listings.`);
  } catch (error) {
    console.error('Error inserting personal listings:', error);
  }
}

// Run the script
insertPersonalListings().then(() => {
  console.log('Finished inserting personal listings.');
});
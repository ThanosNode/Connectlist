// This file contains sample location data for the app
// In a production environment, this would likely be fetched from an API

export const countries = [
  "United States",
  "Canada", 
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Australia",
  "Japan",
  "Brazil",
  "Mexico",
  "India",
  "China",
  "South Africa",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Singapore",
  "United Arab Emirates",
  "Nigeria",
  "South Korea"
];

type StateMap = {
  [country: string]: string[];
};

const stateMap: StateMap = {
  "United States": [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "District of Columbia"
  ],
  "Canada": [
    "Ontario",
    "Quebec",
    "British Columbia",
    "Alberta",
    "Manitoba",
    "Saskatchewan",
    "Nova Scotia",
    "New Brunswick"
  ],
  "United Kingdom": [
    "England",
    "Scotland",
    "Wales",
    "Northern Ireland"
  ],
  "Germany": [
    "Bavaria",
    "North Rhine-Westphalia",
    "Baden-Württemberg",
    "Lower Saxony",
    "Hesse",
    "Berlin"
  ],
  "France": [
    "Île-de-France",
    "Auvergne-Rhône-Alpes",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Hauts-de-France",
    "Provence-Alpes-Côte d'Azur"
  ],
  "United Arab Emirates": [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain"
  ],
  "Nigeria": [
    "Lagos",
    "Abuja",
    "Kano",
    "Rivers",
    "Oyo",
    "Kaduna"
  ],
  "South Korea": [
    "Seoul",
    "Busan",
    "Incheon",
    "Daegu",
    "Daejeon",
    "Gwangju",
    "Ulsan"
  ]
};

// Add empty arrays for countries without specific states
countries.forEach(country => {
  if (!stateMap[country]) {
    stateMap[country] = ["All Regions"];
  }
});

type CityMap = {
  [countryAndState: string]: string[];
};

const cityMap: CityMap = {
  // United States state entries
  "United States|Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "All Cities"],
  "United States|Alaska": ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "All Cities"],
  "United States|Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "All Cities"],
  "United States|Arkansas": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "All Cities"],
  "United States|California": [
    "San Francisco",
    "Los Angeles", 
    "San Diego",
    "San Jose",
    "Sacramento",
    "Oakland",
    "All Cities"
  ],
  "United States|Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "All Cities"],
  "United States|Connecticut": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "All Cities"],
  "United States|Delaware": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "All Cities"],
  "United States|Florida": [
    "Miami",
    "Orlando",
    "Tampa",
    "Jacksonville",
    "Fort Lauderdale",
    "All Cities"
  ],
  "United States|Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "All Cities"],
  "United States|Hawaii": ["Honolulu", "Hilo", "Kailua", "Kapolei", "Kaneohe", "All Cities"],
  "United States|Idaho": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "All Cities"],
  "United States|Illinois": ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "All Cities"],
  "United States|Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "All Cities"],
  "United States|Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "All Cities"],
  "United States|Kansas": ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "All Cities"],
  "United States|Kentucky": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "All Cities"],
  "United States|Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "All Cities"],
  "United States|Maine": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "All Cities"],
  "United States|Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "All Cities"],
  "United States|Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "All Cities"],
  "United States|Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "All Cities"],
  "United States|Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington", "All Cities"],
  "United States|Mississippi": ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi", "All Cities"],
  "United States|Missouri": ["Kansas City", "Saint Louis", "Springfield", "Columbia", "Independence", "All Cities"],
  "United States|Montana": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "All Cities"],
  "United States|Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "All Cities"],
  "United States|Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "All Cities"],
  "United States|New Hampshire": ["Manchester", "Nashua", "Concord", "Dover", "Rochester", "All Cities"],
  "United States|New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton", "All Cities"],
  "United States|New Mexico": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "All Cities"],
  "United States|New York": [
    "New York City",
    "Buffalo",
    "Rochester",
    "Syracuse",
    "Albany",
    "All Cities"
  ],
  "United States|North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "All Cities"],
  "United States|North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "All Cities"],
  "United States|Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "All Cities"],
  "United States|Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond", "All Cities"],
  "United States|Oregon": ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "All Cities"],
  "United States|Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "All Cities"],
  "United States|Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence", "All Cities"],
  "United States|South Carolina": ["Columbia", "Charleston", "North Charleston", "Mount Pleasant", "Rock Hill", "All Cities"],
  "United States|South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "All Cities"],
  "United States|Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "All Cities"],
  "United States|Texas": [
    "Austin",
    "Houston",
    "Dallas",
    "San Antonio",
    "Fort Worth",
    "All Cities"
  ],
  "United States|Utah": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "All Cities"],
  "United States|Vermont": ["Burlington", "South Burlington", "Rutland", "Essex Junction", "Bennington", "All Cities"],
  "United States|Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "All Cities"],
  "United States|Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "All Cities"],
  "United States|West Virginia": ["Charleston", "Huntington", "Parkersburg", "Wheeling", "Morgantown", "All Cities"],
  "United States|Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "All Cities"],
  "United States|Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "All Cities"],
  "United States|District of Columbia": ["Washington", "Georgetown", "All Cities"],
  "Canada|Ontario": [
    "Toronto",
    "Ottawa",
    "Hamilton",
    "London",
    "Windsor"
  ],
  "Canada|Quebec": [
    "Montreal",
    "Quebec City",
    "Laval",
    "Gatineau",
    "Sherbrooke"
  ],
  "United Kingdom|England": [
    "London",
    "Manchester",
    "Birmingham",
    "Liverpool",
    "Leeds"
  ],
  "United Arab Emirates|Dubai": [
    "Downtown Dubai",
    "Dubai Marina",
    "Jumeirah",
    "Deira",
    "Business Bay",
    "Palm Jumeirah"
  ],
  "United Arab Emirates|Abu Dhabi": [
    "Al Reem Island",
    "Corniche",
    "Yas Island",
    "Al Raha Beach",
    "Khalifa City"
  ],
  "Nigeria|Lagos": [
    "Ikeja",
    "Victoria Island",
    "Lekki",
    "Surulere", 
    "Yaba"
  ],
  "Nigeria|Abuja": [
    "Central Business District",
    "Maitama",
    "Asokoro",
    "Gwarinpa",
    "Wuse"
  ],
  "South Korea|Seoul": [
    "Gangnam",
    "Hongdae",
    "Itaewon",
    "Myeongdong",
    "Jongno"
  ],
  "South Korea|Busan": [
    "Haeundae",
    "Seomyeon",
    "Gwangalli",
    "Nampo",
    "Centum City"
  ]
};

export function getStates(country: string): string[] {
  return stateMap[country] || ["All Regions"];
}

export function getCities(country: string, state: string): string[] {
  const key = `${country}|${state}`;
  return cityMap[key] || ["All Cities"];
}

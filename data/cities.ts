import { getCitiesByState, getCitiesByStateFromCityTable } from "@/app/api/dbOperations/dbOperations.route";
import { redisGet, redisSet } from "@/lib/redisApi";

// Major US cities by state
export const citiesByState: { [stateKey: string]: string[] } = {
  'AL': ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa', 'Auburn', 'Dothan', 'Hoover', 'Decatur', 'Madison'],
  'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Kodiak', 'Bethel', 'Kotzebue', 'Nome', 'Barrow'],
  'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise'],
  'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'North Little Rock', 'Conway', 'Rogers', 'Pine Bluff', 'Bentonville'],
  'CA': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Fremont', 'San Bernardino', 'Modesto', 'Oxnard', 'Fontana', 'Moreno Valley'],
  'CO': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Boulder'],
  'CT': ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'Bristol', 'Meriden'],
  'DE': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford', 'Seaford', 'Georgetown', 'Elsmere', 'New Castle'],
  'FL': [
    'Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 
    'Port St. Lucie', 'Cape Coral', 'Gainesville', 'Coral Springs', 'Clearwater', 'Palm Bay', 'West Palm Beach',
    'Naples', 'Sarasota', 'Winter Park', 'Kissimmee', 'Daytona Beach', 'Ocala', 'Pensacola', 'Fort Myers', 
    'Fernandina Beach', 'Lakeland', 'DeLand', 'Delray Beach', 'Port Richey', 'Miramar', 'Brandon', 'Sanford', 
    'Bradenton', 'Coral Gables', 'Port Charlotte', 'Tarpon Springs', 'Apopka', 'Hollywood', 'Pembroke Pines', 
    'Pompano Beach', 'Plantation', 'Sunrise', 'Miami Gardens', 'Boca Raton', 'Deerfield Beach', 'Boynton Beach', 
    'Lauderhill', 'Weston', 'Tamarac', 'Margate', 'Coconut Creek', 'Doral', 'Hialeah Gardens', 'Miami Lakes', 
    'North Miami Beach', 'Aventura', 'Sunny Isles Beach', 'Miami Beach', 'Key West', 'Fort Pierce', 'Vero Beach', 
    'Sebastian', 'Palm City', 'Stuart', 'Jupiter', 'Palm Beach Gardens', 'Wellington', 'Royal Palm Beach', 
    'Melbourne', 'Cocoa Beach', 'Merritt Island', 'Titusville', 'Rockledge', 'Cocoa', 'Satellite Beach', 
    'Indialantic', 'Melbourne Beach', 'West Melbourne', 'Cape Canaveral', 'New Smyrna Beach', 'Ormond Beach', 
    'Holly Hill', 'Port Orange', 'South Daytona', 'St. Augustine', 'The Villages', 'Kendall', 'Bradenton', 
    'Sanford', 'Brandon', 'Miramar', 'Port Richey', 'Delray Beach', 'DeLand', 'Lakeland', 'Fort Myers', 
    'Pensacola', 'Ocala', 'Daytona Beach', 'Kissimmee', 'Winter Park', 'Sarasota', 'Naples', 'West Palm Beach', 
    'Palm Bay', 'Clearwater', 'Coral Springs', 'Gainesville', 'Cape Coral', 'Port St. Lucie', 'Fort Lauderdale', 
    'Tallahassee', 'Hialeah', 'St. Petersburg', 'Orlando', 'Tampa', 'Miami', 'Jacksonville'
  ],
  'GA': ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Albany', 'Marietta'],
  'HI': ['Honolulu', 'Hilo', 'Kailua', 'Kapolei', 'Kaneohe', 'Mililani Town', 'Ewa Gentry', 'Kihei', 'Makawao', 'Wahiawa'],
  'ID': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d\'Alene', 'Twin Falls', 'Lewiston', 'Post Falls'],
  'IL': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Champaign', 'Bloomington', 'Decatur', 'Arlington Heights', 'Evanston', 'Schaumburg', 'Bolingbrook', 'Palatine'],
  'IN': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Bloomington', 'Fishers', 'Hammond', 'Gary', 'Lafayette'],
  'IA': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Ames', 'West Des Moines', 'Council Bluffs', 'Dubuque'],
  'KS': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina'],
  'KY': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Georgetown', 'Florence', 'Elizabethtown', 'Nicholasville'],
  'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma'],
  'ME': ['Portland', 'Lewiston', 'Bangor', 'Auburn', 'Biddeford', 'Sanford', 'Brunswick', 'Augusta', 'Scarborough', 'Gorham'],
  'MD': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Hagerstown', 'Annapolis', 'College Park', 'Salisbury', 'Laurel'],
  'MA': ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford', 'Brockton', 'Quincy', 'Lynn', 'Fall River'],
  'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor', 'Flint', 'Dearborn', 'Livonia', 'Westland'],
  'MN': ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'Saint Cloud', 'Woodbury', 'Eagan'],
  'MS': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Greenville', 'Olive Branch', 'Horn Lake'],
  'MO': ['Kansas City', 'Saint Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon', 'Saint Joseph', 'Saint Charles', 'Saint Peters'],
  'MT': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell', 'Havre', 'Anaconda', 'Miles City'],
  'NE': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'Norfolk', 'Columbus', 'North Platte'],
  'NV': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley', 'Elko', 'Mesquite', 'Boulder City'],
  'NH': ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester', 'Keene', 'Derry', 'Portsmouth', 'Laconia', 'Lebanon'],
  'NJ': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Hamilton', 'Trenton'],
  'NM': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'South Valley', 'Clovis', 'Hobbs', 'Alamogordo'],
  'NY': ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Hempstead', 'Troy', 'Niagara Falls', 'Binghamton', 'Rockville Centre', 'Valley Stream', 'Long Beach', 'Newburgh', 'Poughkeepsie'],
  'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Greenville'],
  'ND': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Mandan', 'Jamestown', 'Wahpeton'],
  'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain'],
  'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City', 'Enid', 'Stillwater'],
  'OR': ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford', 'Springfield', 'Corvallis'],
  'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona'],
  'RI': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Coventry', 'Cumberland', 'West Warwick', 'West Greenwich'],
  'SC': ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Hilton Head Island', 'Florence'],
  'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton', 'Pierre', 'Huron', 'Vermillion'],
  'TN': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Hendersonville'],
  'TX': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'Pasadena', 'McKinney', 'Mesquite', 'McAllen'],
  'UT': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'South Jordan'],
  'VT': ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier', 'Winooski', 'St. Albans', 'Newport', 'Vergennes', 'Middlebury'],
  'VA': ['Virginia Beach', 'Norfolk', 'Arlington', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Portsmouth', 'Suffolk'],
  'WA': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Yakima', 'Federal Way'],
  'WV': ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown', 'Wheeling', 'Weirton', 'Fairmont', 'Martinsburg', 'Beckley', 'Clarksburg'],
  'WI': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Oshkosh', 'Eau Claire', 'Janesville'],
  'WY': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River', 'Evanston', 'Riverton', 'Cody']
};
// await redisSet('citiesByState',citiesByState);//!!!
// console.log("added all in redis", )
// Helper function to get cities for a state
export async function getCitiesForState(stateKey: string): Promise<string[]> {
  const cities = await getCitiesByStateFromCityTable(stateKey);
  //const citiesByState = await redisGet("citiesByState");
  return cities || [];
}

// Helper function to get all states with cities
export function getStatesWithCities(): string[] {
  return Object.keys(citiesByState);
}

// Helper function to search cities in a state
export async function searchCitiesInState(stateKey: string, searchTerm: string): Promise<any> {
  const cities = await getCitiesForState(stateKey) || [];
  if (!searchTerm) return cities;
  
  const lowerSearch = searchTerm.toLowerCase();
  return cities.filter(city => 
    city.toLowerCase().includes(lowerSearch)
  );
}

// Helper function to get paginated cities
export async function getPaginatedCities(stateKey: string, page: number = 1, limit: number = 20, searchTerm: string = ''): Promise<{
  cities: Array<{name: string, slug: string, featured: boolean}>,
  pagination: {
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number
  }
}> {
  const filteredCities = await searchCitiesInState(stateKey, searchTerm);
  const totalItems = filteredCities.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
 // const paginatedCities = filteredCities.slice(startIndex, endIndex);
  const cityVar = filteredCities
  const cities = filteredCities.cities.map((city:{name:string;slug:string; featured:boolean}) => {
    return {
    name: city.name,
    slug: city.slug.toLowerCase().replace(/\s+/g, '-'),
    featured: city.featured
    }
  });
  
  return {
    cities,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit
    }
  };
} 
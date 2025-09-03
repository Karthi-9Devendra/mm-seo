import mysql from 'mysql2/promise';
import { getCachedData, setCachedData, getCitiesCacheKey, getZipCodesCacheKey, getStatesCacheKey, getSpecializationsCacheKey } from '../lib/memoryCache';
import { getCachedDataRedis, setCachedDataRedis } from '@/helper/redisPouplate';
import { redisGet, redisSet } from '@/app/api/redis/redis.route';
import { osBulkIndex } from '@/app/api/search/search.route';

// Database connection configuration
const dbConfig = {
  host: "medical-records-stage-stagemedicalrecordsrdswriter-dabjgn9vtpln.cp6y0gkokmyv.us-east-1.rds.amazonaws.com",
  user: "medicalrecords_read",
  password: "StrongPassword123!",
  database: "medicalrecords",
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

export async function getDoctorByNPI(npi: string) {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Query to join Provider and User tables to get doctor information
      const [rows] = await connection.execute(`
        SELECT 
          p.id,
          p.npi,
          p.entityTypeCode,
          p.enumerationDate,
          p.lastUpdateDate,
          p.certificationDate,
          u.id as userId,
          u.providerId,
          u.lastName,
          u.firstName,
          u.middleName,
          u.namePrefix,
          u.nameSuffix,
          u.credential,
          u.otherCredential,
          u.genderCode,
          u.isSoleProprietor
        FROM Provider p
        LEFT JOIN User u ON p.id = u.providerId
        WHERE p.npi = ?
      `, [npi]) as [any[], any];

      if (!rows || rows.length === 0) {
        return null;
      }

      const doctor = rows[0];
      
      // Get addresses for this doctor
      const [addressRows] = await connection.execute(`
        SELECT 
          id,
          providerId,
          addressType,
          firstLineAddress,
          secondLineAddress,
          cityName,
          stateName,
          postalCodeNew,
          countryCode,
          telephoneNumber,
          faxNumber
        FROM Address
        WHERE providerId = ?
      `, [doctor.id]) as [any[], any];

      // Transform the data to match the expected Doctor type
      return {
        id: doctor.id,
        npi: doctor.npi,
        entityTypeCode: doctor.entityTypeCode,
        enumerationDate: doctor.enumerationDate,
        lastUpdateDate: doctor.lastUpdateDate,
        certificationDate: doctor.certificationDate,
        user: {
          id: doctor.userId,
          providerId: doctor.providerId,
          lastName: doctor.lastName,
          firstName: doctor.firstName,
          middleName: doctor.middleName,
          namePrefix: doctor.namePrefix,
          nameSuffix: doctor.nameSuffix,
          credential: doctor.credential,
          otherCredential: doctor.otherCredential,
          genderCode: doctor.genderCode,
          isSoleProprietor: doctor.isSoleProprietor,
        },
        addresses: addressRows.map((addr: any) => ({
          id: addr.id,
          providerId: addr.providerId,
          addressType: addr.addressType,
          firstLineAddress: addr.firstLineAddress,
          secondLineAddress: addr.secondLineAddress,
          cityName: addr.cityName,
          stateName: addr.stateName,
          postalCodeNew: addr.postalCodeNew,
          countryCode: addr.countryCode,
          telephoneNumber: addr.telephoneNumber,
          faxNumber: addr.faxNumber,
        })),
        providerTaxonomies: [], // You may need to add taxonomy queries if needed
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch doctor from database');
  }
}

export async function getDoctorsByLocationAndSpecialization(stateKey: string, cityorzip: string, specialization: string, page: number = 1, limit: number = 20, searchTerm: string = '') {
  try {
    // Check cache first
    const cacheKey = `doctors:${stateKey}:${cityorzip}:${specialization}:${page}:${searchTerm}`;
    const cachedData = await redisGet(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit for doctors:', cacheKey);
      return cachedData;
    }

    const connection = await pool.getConnection();
    
    try {
      let providerIds: number[] = [];

      // Convert to uppercase like the Prisma code
      const upperState = stateKey.toUpperCase();
      const upperCity = cityorzip.toUpperCase();

      console.log('getDoctorsByLocationAndSpecialization called with:', { stateKey, cityorzip, upperState, upperCity });

      // First, get provider IDs from Address table based on location
      if (cityorzip && stateKey) {
        const [addressRows] = await connection.execute(`
          SELECT DISTINCT pt.providerId
          FROM ProviderTaxonomy pt 
          JOIN Taxonomy t ON pt.taxonomyId = t.id
          JOIN Address a ON pt.providerId = a.providerId
          WHERE t.classification = ? 
          AND a.countryCode = 'US' 
          AND a.stateName = ? 
          AND a.cityName = ?
        `, [specialization, upperState, upperCity]) as [any[], any];
        
        providerIds = addressRows.map((row: any) => row.providerId);
        console.log('Found provider IDs:', providerIds);
      }

      if (providerIds.length === 0) {
        console.log('No provider IDs found, returning empty array');
        return {
          doctors: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit
          }
        };
      }

      // Build search condition for doctor names
      const searchCondition = searchTerm ? `AND (u.firstName LIKE '%${searchTerm}%' OR u.lastName LIKE '%${searchTerm}%' OR CONCAT(u.firstName, ' ', u.lastName) LIKE '%${searchTerm}%')` : '';

      // Get total count for pagination
      const placeholders = providerIds.map(() => '?').join(',');
      const [countRows] = await connection.execute(`
        SELECT COUNT(*) as total
        FROM Provider p
        LEFT JOIN User u ON p.id = u.providerId
        WHERE p.id IN (${placeholders})
        ${searchCondition}
      `, providerIds) as [any[], any];

      const offset = (page - 1) * limit;

      // Get full provider data with user information and pagination
      const [rows] = await connection.execute(`
        SELECT 
          p.id,
          p.npi,
          u.firstName,
          u.lastName
        FROM Provider p
        LEFT JOIN User u ON p.id = u.providerId
        WHERE p.id IN (${placeholders})
        ${searchCondition}
        ORDER BY u.lastName, u.firstName
        LIMIT ${limit} OFFSET ${offset}
      `, providerIds) as [any[], any];

      console.log('Found doctors:', rows.length);

      const doctors = rows.map(doctor => ({
        id: doctor.id.toString(),
        npi: doctor.npi.toString(),
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        user: {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
        },
      }));

      const result = {
        doctors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countRows[0].total / limit),
          totalItems: countRows[0].total,
          itemsPerPage: limit
        }
      };

      // Cache the result for 1 hour
      await redisSet(cacheKey, result);

      try {
        const cleanSpecialization = specialization
          .toLowerCase()
          .replace(/\s+/g, "-");

        const allStates = (await getStates()) as any[];
        let stateObj = allStates.find((s) => s.key === stateKey);
        const stateSlug = stateObj.name.toLowerCase().replace(/\s+/g, "-");

        const doctorsWithMeta = result.doctors.map((doc) => ({
          ...doc,
          state: stateSlug,
          city: cityorzip,
          specialization: cleanSpecialization,
        }));

        await osBulkIndex("doctors", doctorsWithMeta);
      } catch (error) {
        console.error("Error uploading in elastic search", error);
      }

      console.log("Cache miss for doctors:", cacheKey);

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch doctors from database');
  }
}

export async function getSpecializations(page: number = 1, limit: number = 20, searchTerm: string = '') {
  try {
    // Check cache first
    const cacheKey = `specializations:${page}:${searchTerm}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit for specializations:', cacheKey);
      return cachedData;
    }

    const connection = await pool.getConnection();
    
    try {
      const offset = (page - 1) * limit;
      
      // Build search condition
      const searchCondition = searchTerm ? `AND (classification LIKE '%${searchTerm}%' OR definition LIKE '%${searchTerm}%')` : '';
      
      // Get total count for pagination with search
      const [countRows] = await connection.execute(`
        SELECT COUNT(DISTINCT classification) as total
        FROM Taxonomy 
        WHERE section = 'Individual'
        ${searchCondition}
      `) as [any[], any];
      
      // Get distinct specializations from Taxonomy table with pagination and search
      const [rows] = await connection.execute(`
        SELECT classification, MAX(definition) as definition 
        FROM Taxonomy 
        WHERE section = 'Individual'
        ${searchCondition}
        GROUP BY classification
        ORDER BY classification
        LIMIT ${limit} OFFSET ${offset}
      `) as [any[], any];

      const specializations = rows.map(row => ({
        classification: row.classification,
        definition: row.definition,
      }));

      const result = {
        specializations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countRows[0].total / limit),
          totalItems: countRows[0].total,
          itemsPerPage: limit
        }
      };

      // Cache the result for 1 hour
      await setCachedData(cacheKey, result, 3600);
      console.log('Cache miss for specializations:', cacheKey);

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch specializations from database');
  }
}

export async function getSpecializationByClassification(classification: string) {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get specific specialization with definition
      const [rows] = await connection.execute(`
        SELECT classification, MAX(definition) as definition FROM Taxonomy 
        WHERE section = 'Individual' AND classification = ?
        GROUP BY classification
        LIMIT 1
      `, [classification]) as [any[], any];

      if (rows.length === 0) {
        return null;
      }

      return {
        classification: rows[0].classification,
        definition: rows[0].definition,
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch specialization from database');
  }
}

export async function getCitiesByState(stateKey: string, page: number = 1, limit: number = 100, searchTerm: string = '') {
  try {
    // Check cache first
    const cacheKey = getCitiesCacheKey(stateKey, page, searchTerm);
    const cachedData = await redisGet(cacheKey); //getCachedData(cacheKey)
    
    if (cachedData) {
      console.log('Cache hit for cities:', cacheKey);
      return cachedData;
    }

    const connection = await pool.getConnection();
    
    try {
      // Use the state key directly (it's already the abbreviation like 'AL')
      const stateAbbr = stateKey.toUpperCase();
      const offset = (page - 1) * limit;
      
      // Build search condition
      const searchCondition = searchTerm ? `AND cityName LIKE '%${searchTerm}%'` : '';
      
      // For large states like NY, skip the expensive COUNT query
      const isLargeState = ['NY', 'CA', 'TX', 'FL'].includes(stateAbbr);
      
      let totalCount = 0;
      let totalPages = 0;
      
      if (!isLargeState) {
        // Only do COUNT for smaller states
        try {
          const [countRows] = await connection.execute(`
            SELECT COUNT(DISTINCT cityName) as total
            FROM Address 
            WHERE countryCode = 'US' 
            AND stateName = ?
            AND cityName IS NOT NULL
            AND cityName != ''
            AND LENGTH(cityName) > 0
            ${searchCondition}
          `, [stateAbbr]) as [any[], any];
          
          totalCount = countRows[0].total;
          totalPages = Math.ceil(totalCount / limit);
        } catch (error) {
          console.log('Count query failed, using fallback pagination');
        }
      }
      
      // Get distinct cities from Address table for the given state with pagination and search
      const [rows] = await connection.execute(`
        SELECT DISTINCT cityName 
        FROM Address 
        WHERE countryCode = 'US' 
        AND stateName = ?
        AND cityName IS NOT NULL
        AND cityName != ''
        AND LENGTH(cityName) > 0
        ${searchCondition}
        ORDER BY cityName
        LIMIT ${limit} OFFSET ${offset}
      `, [stateAbbr]) as [any[], any];

      const cities = rows.map(row => ({
        name: row.cityName.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
        slug: row.cityName.toLowerCase().replace(/\s+/g, '-')
      }));

      // For large states, use simple pagination without total count
      if (isLargeState) {
        totalCount = -1; // Indicates "unknown" total
        totalPages = -1; // Indicates "unknown" total pages
      }

      const result = {
        cities,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limit
        }
      };

      // Cache the result for 1 hour
      await redisSet(cacheKey, result); //setCachedData(cacheKey, result, 3600);
      console.log('Cache miss for cities:', cacheKey);

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch cities from database');
  }
}

export async function getZipCodesByState(stateKey: string, page: number = 1, limit: number = 20, searchTerm: string = '') {
  try {
    // Check cache first
    const cacheKey = getZipCodesCacheKey(stateKey, page, searchTerm);
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit for zip codes:', cacheKey);
      return cachedData;
    }

    const connection = await pool.getConnection();
    
    try {
      // Use the state key directly (it's already the abbreviation like 'AL')
      const stateAbbr = stateKey.toUpperCase();
      const offset = (page - 1) * limit;
      
      // Build search condition
      const searchCondition = searchTerm ? `AND postalCodeNew LIKE '%${searchTerm}%'` : '';
      
      // Get total count for pagination with search
      const [countRows] = await connection.execute(`
        SELECT COUNT(DISTINCT postalCodeNew) as total
        FROM Address 
        WHERE countryCode = 'US' 
        AND stateName = ?
        AND postalCodeNew IS NOT NULL
        AND postalCodeNew != ''
        AND LENGTH(postalCodeNew) = 5
        ${searchCondition}
      `, [stateAbbr]) as [any[], any];
      
      // Get distinct zip codes from Address table for the given state with pagination and search
      const [rows] = await connection.execute(`
        SELECT DISTINCT postalCodeNew 
        FROM Address 
        WHERE countryCode = 'US' 
        AND stateName = ?
        AND postalCodeNew IS NOT NULL
        AND postalCodeNew != ''
        AND LENGTH(postalCodeNew) = 5
        ${searchCondition}
        ORDER BY postalCodeNew
        LIMIT ${limit} OFFSET ${offset}
      `, [stateAbbr]) as [any[], any];

      const zipCodes = rows.map(row => ({
        code: row.postalCodeNew,
        slug: row.postalCodeNew
      }));

      const result = {
        zipCodes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countRows[0].total / limit),
          totalItems: countRows[0].total,
          itemsPerPage: limit
        }
      };

      // Cache the result for 1 hour
      await setCachedData(cacheKey, result, 3600);
      console.log('Cache miss for zip codes:', cacheKey);

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch zip codes from database');
  }
}

export async function getStates() {
  // Check cache first
  const cacheKey = getStatesCacheKey();
  const cachedData = await getCachedData(cacheKey);
  
  if (cachedData) {
    console.log('Cache hit for states');
    return cachedData;
  }

  const states = [
    { name: 'California', key: 'CA' },
    { name: 'Texas', key: 'TX' },
    { name: 'Florida', key: 'FL' },
    { name: 'New York', key: 'NY' },
    { name: 'Pennsylvania', key: 'PA' },
    { name: 'Illinois', key: 'IL' },
    { name: 'Ohio', key: 'OH' },
    { name: 'Georgia', key: 'GA' },
    { name: 'North Carolina', key: 'NC' },
    { name: 'Michigan', key: 'MI' },
    { name: 'New Jersey', key: 'NJ' },
    { name: 'Virginia', key: 'VA' },
    { name: 'Washington', key: 'WA' },
    { name: 'Arizona', key: 'AZ' },
    { name: 'Massachusetts', key: 'MA' },
    { name: 'Tennessee', key: 'TN' },
    { name: 'Indiana', key: 'IN' },
    { name: 'Missouri', key: 'MO' },
    { name: 'Maryland', key: 'MD' },
    { name: 'Colorado', key: 'CO' },
    { name: 'Wisconsin', key: 'WI' },
    { name: 'Minnesota', key: 'MN' },
    { name: 'South Carolina', key: 'SC' },
    { name: 'Alabama', key: 'AL' },
    { name: 'Louisiana', key: 'LA' },
    { name: 'Kentucky', key: 'KY' },
    { name: 'Oregon', key: 'OR' },
    { name: 'Oklahoma', key: 'OK' },
    { name: 'Connecticut', key: 'CT' },
    { name: 'Utah', key: 'UT' },
    { name: 'Nevada', key: 'NV' },
    { name: 'Iowa', key: 'IA' },
    { name: 'Arkansas', key: 'AR' },
    { name: 'Mississippi', key: 'MS' },
    { name: 'Kansas', key: 'KS' },
    { name: 'West Virginia', key: 'WV' },
    { name: 'Nebraska', key: 'NE' },
    { name: 'Idaho', key: 'ID' },
    { name: 'Hawaii', key: 'HI' },
    { name: 'New Hampshire', key: 'NH' },
    { name: 'Maine', key: 'ME' },
    { name: 'Montana', key: 'MT' },
    { name: 'Rhode Island', key: 'RI' },
    { name: 'Delaware', key: 'DE' },
    { name: 'South Dakota', key: 'SD' },
    { name: 'North Dakota', key: 'ND' },
    { name: 'Alaska', key: 'AK' },
    { name: 'Vermont', key: 'VT' },
    { name: 'Wyoming', key: 'WY' },
    { name: 'New Mexico', key: 'NM' }
  ];

  // Cache the result for 24 hours (states don't change often)
  await setCachedData(cacheKey, states, 86400);
  // await redisSet("states", state);
  console.log('Cache miss for states');

  return states;
}

export async function closePool() {
  await pool.end();
} 

// Alternative function for large states - no pagination, just return cities
export async function getCitiesByStateSimple(stateKey: string, searchTerm: string = '') {
  try {
    const cacheKey = `cities_simple:${stateKey}:${searchTerm}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit for simple cities:', cacheKey);
      return cachedData;
    }

    const connection = await pool.getConnection();
    
    try {
      const stateAbbr = stateKey.toUpperCase();
      const searchCondition = searchTerm ? `AND cityName LIKE '%${searchTerm}%'` : '';
      
      // Get distinct cities without pagination
      const [rows] = await connection.execute(`
        SELECT DISTINCT cityName 
        FROM Address 
        WHERE countryCode = 'US' 
        AND stateName = ?
        AND cityName IS NOT NULL
        AND cityName != ''
        AND LENGTH(cityName) > 0
        ${searchCondition}
        ORDER BY cityName
        LIMIT 1000
      `, [stateAbbr]) as [any[], any];

      const cities = rows.map(row => ({
        name: row.cityName.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
        slug: row.cityName.toLowerCase().replace(/\s+/g, '-')
      }));

      const result = { cities };

      // Cache for 2 hours since it's more expensive
      await setCachedData(cacheKey, result, 7200);
      console.log('Cache miss for simple cities:', cacheKey);

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch cities from database');
  }
} 

// Function using the City table for better performance
export async function getCitiesByStateFromCityTable(stateKey: string, page: number = 1, limit: number = 20, searchTerm: string = '') {
  try {
    // Check cache first
    const cacheKey = `cities_city_table:${stateKey}:${page}:${searchTerm}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit for cities from City table:', cacheKey);
      return cachedData;
    }

    const connection = await pool.getConnection();
    
    try {
      const stateAbbr = stateKey.toUpperCase();
      const offset = (page - 1) * limit;
      
      // Build search condition
      const searchCondition = searchTerm ? `AND cityName LIKE '%${searchTerm}%'` : '';
      
      // Get total count from City table (much faster)
      const [countRows] = await connection.execute(`
        SELECT COUNT(*) as total
        FROM City 
        WHERE stateName = ?
        ${searchCondition}
      `, [stateAbbr]) as [any[], any];
      
      // Get cities from City table with pagination
      const [rows] = await connection.execute(`
        SELECT cityName, recordCount
        FROM City 
        WHERE stateName = ?
        ${searchCondition}
        ORDER BY cityName
        LIMIT ${limit} OFFSET ${offset}
      `, [stateAbbr]) as [any[], any];

      const cities = rows.map(row => ({
        name: row.cityName.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
        slug: row.cityName.toLowerCase().replace(/\s+/g, '-'),
        recordCount: row.recordCount
      }));

      const result = {
        cities,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countRows[0].total / limit),
          totalItems: countRows[0].total,
          itemsPerPage: limit
        }
      };

      // Cache the result for 2 hours since it's pre-computed
      await setCachedData(cacheKey, result, 7200);
      console.log('Cache miss for cities from City table:', cacheKey);

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    // Fallback to original function if City table doesn't exist
    console.log('Falling back to original getCitiesByState function');
    return getCitiesByState(stateKey, page, limit, searchTerm);
  }
} 

import { Client } from '@elastic/elasticsearch';
import { Listing } from '@shared/schema';
import { log } from '../vite';

// Initialize Elasticsearch client (optional)
let esClient: Client | null = null;

// Check if Elasticsearch credentials are available
const hasElasticsearchCredentials = !!(process.env.ELASTICSEARCH_URL && 
  process.env.ELASTICSEARCH_USERNAME && 
  process.env.ELASTICSEARCH_PASSWORD);

if (hasElasticsearchCredentials) {
  esClient = new Client({
    node: process.env.ELASTICSEARCH_URL!,
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME!,
      password: process.env.ELASTICSEARCH_PASSWORD!
    },
    tls: {
      rejectUnauthorized: false // For development only, not recommended for production
    }
  });
} else {
  log('Elasticsearch credentials not found. Elasticsearch features will be disabled.', 'elasticsearch');
}

// Constants
const LISTINGS_INDEX = 'listings';

// Helper functions
export async function pingElasticsearch(): Promise<boolean> {
  if (!esClient) {
    log('Elasticsearch client not initialized - credentials missing', 'elasticsearch');
    return false;
  }
  
  try {
    const pingResult = await esClient.ping();
    log(`Elasticsearch ping successful: ${JSON.stringify(pingResult)}`, 'elasticsearch');
    return true;
  } catch (error) {
    log(`Elasticsearch ping failed: ${error.message}`, 'elasticsearch');
    return false;
  }
}

export async function createListingsIndex() {
  if (!esClient) {
    log('Elasticsearch client not available - skipping index creation', 'elasticsearch');
    return;
  }

  try {
    const indexExists = await esClient.indices.exists({ index: LISTINGS_INDEX });
    
    if (!indexExists) {
      await esClient.indices.create({
        index: LISTINGS_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              userId: { type: 'integer' },
              title: { type: 'text', analyzer: 'english' },
              description: { type: 'text', analyzer: 'english' },
              type: { type: 'keyword' },
              subcategory: { type: 'keyword' },
              price: { type: 'integer' },
              status: { type: 'keyword' },
              isFeatured: { type: 'boolean' },
              isPaid: { type: 'boolean' },
              isBoosted: { type: 'boolean' },
              country: { type: 'keyword' },
              state: { type: 'keyword' },
              city: { type: 'keyword' },
              isRemote: { type: 'boolean' },
              expiresAt: { type: 'date' },
              createdAt: { type: 'date' }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                english: {
                  tokenizer: 'standard',
                  filter: ['lowercase', 'english_stop', 'english_stemmer']
                }
              },
              filter: {
                english_stop: {
                  type: 'stop',
                  stopwords: '_english_'
                },
                english_stemmer: {
                  type: 'stemmer',
                  language: 'english'
                }
              }
            }
          }
        }
      });
      log(`Created '${LISTINGS_INDEX}' index`, 'elasticsearch');
    } else {
      log(`Index '${LISTINGS_INDEX}' already exists`, 'elasticsearch');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error creating index: ${errorMessage}`, 'elasticsearch');
    throw error;
  }
}

export async function indexListing(listing: Listing) {
  if (!esClient) {
    log('Elasticsearch client not available - skipping listing indexing', 'elasticsearch');
    return;
  }

  try {
    await esClient.index({
      index: LISTINGS_INDEX,
      id: listing.id.toString(),
      document: listing,
      refresh: true // Ensure document is immediately searchable
    });
    log(`Indexed listing ${listing.id}`, 'elasticsearch');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error indexing listing: ${errorMessage}`, 'elasticsearch');
    throw error;
  }
}

export async function updateListing(id: number, listing: Partial<Listing>) {
  if (!esClient) {
    log('Elasticsearch client not available - skipping listing update', 'elasticsearch');
    return;
  }

  try {
    await esClient.update({
      index: LISTINGS_INDEX,
      id: id.toString(),
      doc: listing,
      refresh: true
    });
    log(`Updated listing ${id} in Elasticsearch`, 'elasticsearch');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error updating listing: ${errorMessage}`, 'elasticsearch');
    throw error;
  }
}

export async function deleteListing(id: number) {
  if (!esClient) {
    log('Elasticsearch client not available - skipping listing deletion', 'elasticsearch');
    return;
  }

  try {
    await esClient.delete({
      index: LISTINGS_INDEX,
      id: id.toString(),
      refresh: true
    });
    log(`Deleted listing ${id} from Elasticsearch`, 'elasticsearch');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error deleting listing: ${errorMessage}`, 'elasticsearch');
    throw error;
  }
}

export async function bulkIndexListings(listings: Listing[]) {
  if (listings.length === 0) return;
  
  if (!esClient) {
    log('Elasticsearch client not available - skipping bulk indexing', 'elasticsearch');
    return;
  }
  
  try {
    const operations = listings.flatMap(listing => [
      { index: { _index: LISTINGS_INDEX, _id: listing.id.toString() } },
      listing
    ]);

    const response = await esClient.bulk({ refresh: true, operations });
    
    if (response.errors) {
      log(`Bulk indexing had errors: ${JSON.stringify(response.items)}`, 'elasticsearch');
    } else {
      log(`Bulk indexed ${listings.length} listings`, 'elasticsearch');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error bulk indexing listings: ${errorMessage}`, 'elasticsearch');
    throw error;
  }
}

export interface SearchParams {
  query?: string;
  country?: string;
  state?: string;
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  isRemote?: boolean;
  isFeatured?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc';
  page?: number;
  perPage?: number;
}

export async function searchListings(params: SearchParams): Promise<{ listings: Listing[], total: number }> {
  if (!esClient) {
    log('Elasticsearch client not available - cannot perform search', 'elasticsearch');
    throw new Error('Elasticsearch search not available - client not initialized');
  }

  const {
    query,
    country,
    state,
    city,
    type,
    minPrice,
    maxPrice,
    isRemote,
    isFeatured,
    sortBy = 'relevance',
    page = 1,
    perPage = 20
  } = params;

  // Build filter conditions
  const must: any[] = [];
  const filter: any[] = [];

  // Active listings only
  filter.push({ term: { status: 'active' } });
  
  // Basic text search
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['title^3', 'description'],  // Title has higher weight
        fuzziness: 'AUTO'
      }
    });
  }

  // Filter by location
  if (country) filter.push({ term: { country } });
  if (state) filter.push({ term: { state } });
  if (city) filter.push({ term: { city } });
  
  // Filter by type
  if (type) filter.push({ term: { type } });
  
  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    const rangeParams: any = {};
    if (minPrice !== undefined) rangeParams.gte = minPrice;
    if (maxPrice !== undefined) rangeParams.lte = maxPrice;
    filter.push({ range: { price: rangeParams } });
  }
  
  // Filter by remote flag
  if (isRemote !== undefined) filter.push({ term: { isRemote } });
  
  // Filter by featured flag
  if (isFeatured !== undefined) filter.push({ term: { isFeatured } });
  
  // Apply sorting
  let sort: any[] = [];
  switch (sortBy) {
    case 'price_asc':
      sort = [{ price: 'asc' }];
      break;
    case 'price_desc':
      sort = [{ price: 'desc' }];
      break;
    case 'date_desc':
      sort = [{ createdAt: 'desc' }];
      break;
    case 'date_asc':
      sort = [{ createdAt: 'asc' }];
      break;
    case 'relevance':
    default:
      // If there's a text query, use relevance, otherwise sort by date
      sort = query ? [] : [{ createdAt: 'desc' }];
      break;
  }
  
  // Add a secondary sort to ensure consistent results
  if (sortBy !== 'date_desc' && sortBy !== 'date_asc') {
    sort.push({ createdAt: 'desc' });
  }
  
  // Always add ID as final sort to ensure pagination consistency
  sort.push({ id: 'asc' });
  
  try {
    const result = await esClient.search({
      index: LISTINGS_INDEX,
      from: (page - 1) * perPage,
      size: perPage,
      sort,
      query: {
        bool: {
          must,
          filter
        }
      }
    });
    
    const listings = result.hits.hits.map(hit => hit._source as Listing);
    const total = result.hits.total as { value: number };
    
    return {
      listings,
      total: total.value
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Search error: ${errorMessage}`, 'elasticsearch');
    throw error;
  }
}

export async function syncListingsToElasticsearch(listings: Listing[]) {
  try {
    // First check if Elasticsearch is available
    const isAvailable = await pingElasticsearch();
    if (!isAvailable) {
      log('Elasticsearch is not available. Skipping sync.', 'elasticsearch');
      return;
    }
    
    // Create index if it doesn't exist
    await createListingsIndex();
    
    // Bulk index listings
    await bulkIndexListings(listings);
    
    log(`Successfully synced ${listings.length} listings to Elasticsearch`, 'elasticsearch');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error syncing listings to Elasticsearch: ${errorMessage}`, 'elasticsearch');
    throw error;
  }
}
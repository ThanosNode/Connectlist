import { Listing } from '@shared/schema';
import { db } from '../db';
import { log } from '../vite';
import { 
  pingElasticsearch, 
  createListingsIndex, 
  bulkIndexListings 
} from './elasticsearch';

/**
 * Syncs all active listings from the database to Elasticsearch.
 * This should be called during application startup.
 */
export async function syncAllListingsToElasticsearch() {
  try {
    // Check if Elasticsearch is available
    const isAvailable = await pingElasticsearch();
    if (!isAvailable) {
      log('Elasticsearch is not available. Skipping initial sync.', 'elasticsearch');
      return;
    }

    // Create index if it doesn't exist
    await createListingsIndex();
    
    // Get all active listings from the database
    const listings = await db.query.listings.findMany({
      where: (listings, { eq }) => eq(listings.status, 'active')
    });
    
    if (listings.length === 0) {
      log('No active listings to index', 'elasticsearch');
      return;
    }
    
    // Index all listings in batches
    const batchSize = 100;
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      await bulkIndexListings(batch);
      log(`Indexed batch ${i/batchSize + 1} of ${Math.ceil(listings.length/batchSize)}`, 'elasticsearch');
    }
    
    log(`Initial sync completed. Indexed ${listings.length} listings to Elasticsearch`, 'elasticsearch');
  } catch (error) {
    log(`Error in initial Elasticsearch sync: ${error.message}`, 'elasticsearch');
    // Don't throw here as we don't want to crash the application
  }
}
#!/bin/bash

# Make sure we have a backup
cp server/routes.ts server/routes.ts.bak2

# Find the search endpoint and replace it
sed -i '/app.get.*api\/listings\/search/,/try {/!b; :a; n; /const { listings, hasMore }/!ba; s/type: type as string | undefined,/\/\/ Removed type filter to use our intelligent categorization/' server/routes.ts

# Find the categorization section and replace it
sed -i '/Apply proper categorization to all listings/,/Apply strict category and subcategory filtering/c\      // Use our improved category service to do all the filtering in one step\n      let filteredListings = applyCategoryFiltering(\n        listings, \n        type as string || null, \n        subcategory as string || null\n      );' server/routes.ts

# Remove the old filtering code
sed -i '/If type is specified, strictly filter by that type/,/For other types, use the subcategory field/d' server/routes.ts

# Do the same for byState endpoint
sed -i '/app.get.*api\/listings\/byState/,/try {/!b; :a; n; /const { listings, hasMore }/!ba; s/type: type as string | undefined,/\/\/ Removed type filter to use our intelligent categorization/' server/routes.ts

# Find the byState categorization section and replace it
sed -i '/Apply proper categorization to all byState listings/,/Apply strict category and subcategory filtering for byState/c\      // Use our improved category service to do all the filtering in one step\n      let filteredListings = applyCategoryFiltering(\n        listings, \n        type as string || null, \n        subcategory as string || null\n      );' server/routes.ts

# Remove the old byState filtering code
sed -i '/If type is specified, strictly filter by that type for byState/,/For other types, use the subcategory field for byState/d' server/routes.ts
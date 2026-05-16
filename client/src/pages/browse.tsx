import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { useLocation } from "@/context/LocationContext";

export default function BrowseCategories() {
  const { selectedCountry, selectedState, selectedCity } = useLocation();
  
  // Sample categories with their subcategories
  const categories = [
    {
      name: "personal",
      subcategories: [
        "M4W", 
        "W4M", 
        "M4M", 
        "W4W", 
        "M4T", 
        "W4T",
        "T4M", 
        "T4W", 
        "T4T", 
        "Couple4M", 
        "Couple4W", 
        "Couple4Couple"
      ]
    },
    {
      name: "casual",
      subcategories: [
        "M4W", 
        "W4M", 
        "M4M", 
        "W4W", 
        "M4T", 
        "W4T",
        "T4M", 
        "T4W", 
        "T4T", 
        "Couple4M", 
        "Couple4W", 
        "Couple4Couple"
      ]
    },
    {
      name: "community",
      subcategories: [
        "Crypto Enthusiasts",
        "Web3 Meetups", 
        "Blockchain Study",
        "NFT Artists", 
        "DAO Members", 
        "DeFi Groups",
        "Tech Education", 
        "Developer Community"
      ]
    },
    {
      name: "jobs",
      subcategories: [
        "development",
        "design",
        "marketing",
        "community management",
        "technical writing",
        "content creation",
        "product management",
        "security"
      ]
    },
    {
      name: "business",
      subcategories: [
        "consulting",
        "token design",
        "smart contract audit",
        "community building",
        "marketing services",
        "defi strategy",
        "nft promotion",
        "exchange listing"
      ]
    }
  ];
  
  return (
    <>
      <Helmet>
        <title>Browse Categories | ConnectList</title>
        <meta name="description" content="Browse Web3-focused classifieds by category on ConnectList." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-2">browse categories</h1>
        <p className="text-sm mb-6">
          current location: {selectedCity}, {selectedState}, {selectedCountry}
        </p>
        
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.name} className="border border-gray-300 p-4">
              <h2 className="text-lg font-medium mb-3">{category.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {category.subcategories.map((subcategory) => (
                  <Link 
                    key={subcategory}
                    href={`/search/${category.name}/${subcategory.replace(/ /g, '-')}`}
                    className="text-blue-700 hover:underline text-sm"
                  >
                    {subcategory}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/post" className="text-blue-700 hover:underline text-sm">
            post a new listing
          </Link>
        </div>
      </div>
    </>
  );
}
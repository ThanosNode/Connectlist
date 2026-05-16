import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet';
import { categories } from '@/lib/categoryData';
import { getStates, getCities, countries } from '@/lib/locationData';
import { apiRequest } from '@/lib/queryClient';

export default function EditListing() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [country, setCountry] = useState('United States'); // Default to United States
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  
  // Derived values
  const listingId = parseInt(id || '0');
  const availableSubcategories = categories.find(c => c.id === type)?.subcategories || [];
  const availableCountries = countries;
  const availableStates = getStates(country);
  const availableCities = getCities(country, state);
  
  // Fetch the listing data
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!listingId) {
      setError('Invalid listing ID');
      setLoading(false);
      return;
    }
    
    async function fetchListing() {
      // Double-check user is still authenticated when function runs
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        const response = await apiRequest('GET', `/api/listings/${listingId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }
        
        const data = await response.json();
        setListing(data);
        
        // Check if the user owns the listing
        if (data.userId !== user.id) {
          setError('You do not have permission to edit this listing');
          return;
        }
        
        // Populate form fields
        setTitle(data.title || '');
        setDescription(data.description || '');
        
        // Convert type from database "job" to UI "jobs" if needed
        const displayType = data.type === 'job' ? 'jobs' : data.type;
        setType(displayType);
        
        setSubcategory(data.subcategory || '');
        setPrice(data.price ? data.price.toString() : '');
        setCountry(data.country || 'United States');
        setState(data.state || '');
        setCity(data.city || '');
        setIsRemote(data.isRemote || false);
        
      } catch (err) {
        setError('Error fetching listing: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    }
    
    fetchListing();
  }, [listingId, user, navigate]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit a listing",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare the listing data
      // Make sure we handle price as a whole number without decimals
      const priceValue = price ? Math.round(Number(price)) : 0;
      
      // Fix the type value - map "jobs" (from UI) to "job" (for database)
      // The database enum expects "job" (singular), but our UI uses "jobs" (plural)
      let fixedType = type;
      if (type === "jobs") {
        fixedType = "job";
      }
      
      // Log all values being sent to the server
      console.log("Sending listing update with values:", {
        title,
        description,
        type: fixedType,
        subcategory,
        price: priceValue,
        country,
        state,
        city: city || 'All Cities',
        isRemote
      });
      
      const updateData = {
        title,
        description,
        type: fixedType,
        subcategory: subcategory || null,
        price: priceValue,
        country,
        state,
        city: city || 'All Cities',
        isRemote,
      };
      
      // Submit the update using apiRequest which handles JWT tokens and CSRF validation
      const response = await apiRequest('PUT', `/api/listings/${listingId}`, updateData);
      
      if (response.ok) {
        const updatedListing = await response.json();
        
        toast({
          title: "Listing Updated",
          description: "Your listing has been successfully updated"
        });
        
        // Redirect to the listing page
        navigate(`/listing/${listingId}`);
      } else {
        // Handle error response
        let errorMessage = "Failed to update listing, please try again";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("Error parsing error response", jsonError);
        }
        
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Error updating listing: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">{error}</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Edit Listing | ConnectList</title>
        <meta name="description" content="Edit your listing on ConnectList" />
      </Helmet>
      
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 min-h-[120px]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium">
              Category
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setSubcategory(''); // Reset subcategory when category changes
              }}
              className="w-full p-2 border border-gray-300"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {type && availableSubcategories.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="subcategory" className="block text-sm font-medium">
                Subcategory
              </label>
              <select
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full p-2 border border-gray-300"
                required
              >
                <option value="">Select a subcategory</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {type !== 'personal' && type !== 'casual' && (
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium">
                Price (optional)
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border border-gray-300"
                min="0"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium">
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => {
                const newCountry = e.target.value;
                setCountry(newCountry);
                setState(''); // Reset state when country changes
                setCity(''); // Reset city when country changes
                console.log("Country changed to:", newCountry);
              }}
              className="w-full p-2 border border-gray-300"
              required
            >
              <option value="">Select a country</option>
              {availableCountries.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="state" className="block text-sm font-medium">
              State
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => {
                const newState = e.target.value;
                setState(newState);
                setCity(''); // Reset city when state changes
                console.log("State changed to:", newState);
              }}
              className="w-full p-2 border border-gray-300"
              required
            >
              <option value="">Select a state</option>
              {availableStates.map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </select>
          </div>
          
          {state && (
            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-medium">
                City
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => {
                  const newCity = e.target.value;
                  setCity(newCity);
                  console.log("City changed to:", newCity);
                }}
                className="w-full p-2 border border-gray-300"
                required
              >
                <option value="All Cities">All Cities</option>
                {availableCities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {type !== 'personal' && type !== 'casual' && (
            <div className="space-y-2">
              <span className="block text-sm font-medium">Is Remote?</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    id="remote-yes"
                    type="radio"
                    name="remote"
                    className="mr-2"
                    checked={isRemote}
                    onChange={() => setIsRemote(true)}
                  />
                  <label htmlFor="remote-yes" className="text-sm">Yes</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="remote-no"
                    type="radio"
                    name="remote"
                    className="mr-2"
                    checked={!isRemote}
                    onChange={() => setIsRemote(false)}
                  />
                  <label htmlFor="remote-no" className="text-sm">No</label>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Listing'
              )}
            </Button>
            
            <Link href={`/listing/${listingId}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
import { useState, useEffect } from "react";
import { Link, useLocation as useWouterLocation } from "wouter";
import { useLocation } from "@/context/LocationContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { countries, getStates, getCities } from "@/lib/locationData";
// Debug helper
const debug = (...args: any[]) => console.log('[LocationBar]', ...args);

export default function LocationBar() {
  const { 
    selectedCountry, 
    selectedState, 
    selectedCity,
    setCountry,
    setState,
    setCity
  } = useLocation();
  
  // Get wouter's location and navigate function
  const [, navigate] = useWouterLocation();

  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCountry) {
      const availableStates = getStates(selectedCountry);
      debug('Country changed:', selectedCountry, 'Available states:', availableStates);
      setStates(availableStates);
      
      // If no state is selected or the current state isn't available for this country,
      // select the first state from the list
      if (!selectedState || !availableStates.includes(selectedState)) {
        const firstState = availableStates[0];
        debug('Setting default state:', firstState);
        setState(firstState);
      }
    }
  }, [selectedCountry, selectedState, setState]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const availableCities = getCities(selectedCountry, selectedState);
      debug('State changed:', selectedState, 'Available cities:', availableCities);
      setCities(availableCities);
      
      // If no city is selected or the current city isn't available for this state,
      // select the first city from the list
      if (!selectedCity || !availableCities.includes(selectedCity)) {
        const firstCity = availableCities[0];
        debug('Setting default city:', firstCity);
        setCity(firstCity);
      }
    }
  }, [selectedCountry, selectedState, selectedCity, setCity]);

  const handleCountryChange = (country: string) => {
    setCountry(country);
    setState("");
    setCity("");
  };

  const handleStateChange = (state: string) => {
    setState(state);
    setCity("");
    // We will handle navigation through the Link component only
  };

  const handleCityChange = (city: string) => {
    setCity(city);
  };

  return (
    <div className="bg-secondary">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          {/* Left side with location selectors */}
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">Location:</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center font-medium">
                  {selectedCountry || "Select Country"} <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-96 overflow-y-auto w-56">
                {countries.map((country) => (
                  <DropdownMenuItem 
                    key={country} 
                    onClick={() => handleCountryChange(country)}
                    className={country === selectedCountry ? "font-medium" : ""}
                  >
                    {country}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {selectedCountry && (
              <>
                <span className="mx-2">/</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center font-medium">
                      {selectedState || "Select State"} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-96 overflow-y-auto w-56">
                    {states.map((state) => (
                      <DropdownMenuItem 
                        key={state} 
                        asChild
                      >
                        <Link 
                          href={`/state/${encodeURIComponent(state)}`}
                          onClick={(e) => {
                            e.preventDefault(); 
                            handleStateChange(state);
                            navigate(`/state/${encodeURIComponent(state)}`);
                          }}
                          className="w-full px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
                        >
                          {state}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            {selectedCountry && selectedState && (
              <>
                <span className="mx-2">/</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center font-medium">
                      {selectedCity || "Select City"} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-96 overflow-y-auto w-56">
                    {cities.map((city) => (
                      <DropdownMenuItem 
                        key={city} 
                        onClick={() => handleCityChange(city)}
                        className={city === selectedCity ? "font-medium" : ""}
                      >
                        {city}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
          
          {/* Right side with promotional text */}
          <div className="text-gray-600 font-medium hidden md:block">
            Some cities are thriving. <Link href="/post" className="text-blue-700 hover:underline">Post your FREE LISTING</Link> to activate your local community.
          </div>
        </div>
      </div>
    </div>
  );
}
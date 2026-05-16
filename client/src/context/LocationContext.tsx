import React, { createContext, useContext, useState, useEffect } from "react";
import { countries, getStates, getCities } from "@/lib/locationData";

// Debug helper
const debug = (...args: any[]) => console.log('[LocationContext]', ...args);

interface LocationContextType {
  selectedCountry: string;
  selectedState: string;
  selectedCity: string;
  setCountry: (country: string) => void;
  setState: (state: string) => void;
  setCity: (city: string) => void;
}

const LocationContext = createContext<LocationContextType>({
  selectedCountry: "",
  selectedState: "",
  selectedCity: "",
  setCountry: () => {},
  setState: () => {},
  setCity: () => {},
});

export const useLocation = () => useContext(LocationContext);

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("United States");
  const [selectedState, setSelectedState] = useState<string>("California");
  const [selectedCity, setSelectedCity] = useState<string>("San Francisco");

  // Load saved location from localStorage on mount
  useEffect(() => {
    try {
      debug('Initializing location context');
      const savedLocation = localStorage.getItem("userLocation");
      
      if (savedLocation) {
        try {
          const { country, state, city } = JSON.parse(savedLocation);
          
          // Verify that saved location data is valid
          if (countries.includes(country)) {
            debug('Loaded saved country from localStorage:', country);
            setSelectedCountry(country);
            
            const availableStates = getStates(country);
            if (availableStates.includes(state)) {
              debug('Loaded saved state from localStorage:', state);
              setSelectedState(state);
              
              const availableCities = getCities(country, state);
              if (availableCities.includes(city)) {
                debug('Loaded saved city from localStorage:', city);
                setSelectedCity(city);
              } else {
                debug('Saved city not found, using first available city');
                setSelectedCity(availableCities[0]);
              }
            } else {
              debug('Saved state not found, using first available state');
              setSelectedState(availableStates[0]);
            }
          } else {
            debug('Saved country not found, using default');
            useDefaultLocation();
          }
        } catch (error) {
          console.error("Failed to parse saved location:", error);
          useDefaultLocation();
        }
      } else {
        debug('No saved location, using default');
        useDefaultLocation();
      }
    } catch (error) {
      console.error("Error initializing location:", error);
      useDefaultLocation();
    }
  }, []);
  
  // Helper to set default location
  const useDefaultLocation = () => {
    const defaultCountry = "United States";
    const defaultState = getStates(defaultCountry)[0];
    const defaultCity = getCities(defaultCountry, defaultState)[0];
    
    debug('Setting default location:', defaultCountry, defaultState, defaultCity);
    setSelectedCountry(defaultCountry);
    setSelectedState(defaultState);
    setSelectedCity(defaultCity);
  };

  // Save location to localStorage when it changes
  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem(
        "userLocation",
        JSON.stringify({
          country: selectedCountry,
          state: selectedState,
          city: selectedCity,
        })
      );
    }
  }, [selectedCountry, selectedState, selectedCity]);

  const setCountry = (country: string) => {
    debug('Setting country:', country);
    setSelectedCountry(country);
    
    // When country changes, reset state and city to valid values
    const availableStates = getStates(country);
    const newState = availableStates[0];
    setState(newState);
  };

  const setState = (state: string) => {
    debug('Setting state:', state);
    setSelectedState(state);
    
    // When state changes, reset city to a valid value
    if (selectedCountry && state) {
      const availableCities = getCities(selectedCountry, state);
      const newCity = availableCities[0];
      setCity(newCity);
    }
  };

  const setCity = (city: string) => {
    debug('Setting city:', city);
    setSelectedCity(city);
  };

  const value = {
    selectedCountry,
    selectedState,
    selectedCity,
    setCountry,
    setState,
    setCity,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

import { Helmet } from "react-helmet-async";
import React, { useState, FormEvent } from "react";
import { categories } from "../lib/categoryData";
import { useAuth } from "@/context/AuthContext";
import { useLocation as useLocationContext } from "@/context/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function PostListing() {
  const [listingType, setListingType] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("hour");
  const [isRemote, setIsRemote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { selectedCountry, selectedState, selectedCity } = useLocationContext();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  // Redirect unauthenticated users
  // Initialize CSRF token when component mounts
  React.useEffect(() => {
    // Fetch CSRF token
    fetch('/api/csrf-init')
      .then(response => {
        console.log("CSRF init response headers:", 
          Array.from(response.headers.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        );
        return response.json();
      })
      .then(data => console.log("CSRF token initialized"))
      .catch(error => console.error("Error initializing CSRF token:", error));
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a listing",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isAuthenticated, navigate, toast]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You must be logged in to post a listing. Redirecting...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Post a Listing | ConnectList</title>
        <meta name="description" content="Create a new listing on ConnectList - the Web3-focused classifieds platform." />
      </Helmet>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-6">post a listing</h1>
        
        <div className="border border-gray-300 p-4">
          <p className="text-sm mb-4">
            all fields marked with * are required
          </p>
          
          <form className="space-y-4" onSubmit={async (e: FormEvent) => {
            e.preventDefault();
            
            if (!isAuthenticated) {
              toast({
                title: "Authentication Required",
                description: "Please log in to post a listing",
                variant: "destructive"
              });
              return;
            }
            
            if (!title || !description || !listingType) {
              toast({
                title: "Missing Fields",
                description: "Please fill out all required fields",
                variant: "destructive"
              });
              return;
            }
            
            if (!subcategory) {
              const categoryType = listingType === "personal" ? "connection type" : 
                                  listingType === "job" ? "job category" : 
                                  "business category";
              toast({
                title: `Missing ${categoryType}`,
                description: `Please select a ${categoryType} for your ${listingType} listing`,
                variant: "destructive"
              });
              return;
            }
            
            try {
              setIsSubmitting(true);
              
              // Calculate expiration date (30 days from now)
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 30);
              
              // Format price correctly
              let finalPrice = null;
              if (price) {
                finalPrice = parseInt(price);
              }
              
              const listingData = {
                title,
                description,
                type: listingType,
                subcategory, // Now all listing types have subcategories
                price: finalPrice,
                country: selectedCountry,
                state: selectedState,
                city: selectedCity,
                isRemote: listingType !== "personal" ? isRemote : false,
                expiresAt: expiresAt // Send as Date object, not as string
              };
              
              console.log("Submitting listing data:", listingData);
              
              try {
                // apiRequest now returns the Response object
                const response = await apiRequest("POST", "/api/listings", listingData);
                
                console.log("API Response status:", response.status, response.statusText);
                
                if (response.ok) {
                  // For successful responses, parse the JSON
                  const data = await response.json();
                  console.log("Listing created successfully:", data);
                  
                  if (data && data.listing && data.listing.id) {
                    toast({
                      title: "Listing Created",
                      description: "Your listing has been successfully posted"
                    });
                    navigate(`/listing/${data.listing.id}`);
                  } else {
                    // Handle case where response is ok but data structure is unexpected
                    console.warn("Listing created but returned unexpected data structure:", data);
                    toast({
                      title: "Listing Created",
                      description: "Your listing has been posted but we couldn't retrieve its details"
                    });
                    navigate('/'); // Redirect to home
                  }
                } else {
                  // For error responses, try to extract a message from the JSON
                  let errorMessage = "Failed to create listing, please try again";
                  
                  try {
                    const errorData = await response.json();
                    console.error("Error creating listing:", errorData);
                    errorMessage = errorData.message || errorMessage;
                  } catch (jsonError) {
                    // If JSON parsing fails, use the status text
                    console.error("Error parsing error response:", jsonError);
                    errorMessage = response.statusText || errorMessage;
                  }
                  
                  toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                  });
                }
              } catch (error) {
                // Catch network errors or other exceptions
                console.error("Exception during API request:", error);
                toast({
                  title: "Error",
                  description: "Failed to create your listing due to a network error. Please try again.",
                  variant: "destructive"
                });
              }
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to create your listing. Please try again.",
                variant: "destructive"
              });
            } finally {
              setIsSubmitting(false);
            }
          }}>
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="title">
                title *
              </label>
              <input
                id="title"
                className="w-full border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                type="text"
                placeholder="Enter listing title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="type">
                listing type *
              </label>
              <select
                id="type"
                className="w-full border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                value={listingType}
                onChange={(e) => {
                  setListingType(e.target.value);
                  setSubcategory(""); // Reset subcategory when type changes
                }}
              >
                <option value="">-- Select type --</option>
                <option value="personal">Personal</option>
                <option value="job">Job</option>
                <option value="business">Business</option>
              </select>
            </div>
            
            {/* Subcategory selection for all listing types */}
            {listingType && (
              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="subcategory">
                  {listingType === "personal" ? "connection type *" : 
                   listingType === "job" ? "job category *" : 
                   "business category *"}
                </label>
                <select
                  id="subcategory"
                  className="w-full border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  required
                >
                  <option value="">
                    {listingType === "personal" ? "-- Select connection type --" : 
                     listingType === "job" ? "-- Select job category --" : 
                     "-- Select business category --"}
                  </option>
                  {listingType === "personal" && 
                    categories.find(cat => cat.id === "personal")?.subcategories?.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))
                  }
                  {listingType === "job" && (
                    <>
                      <option value="technology">Technology</option>
                      <option value="consulting">Consulting</option>
                      <option value="project management">Project Management</option>
                      <option value="programming">Programming</option>
                      <option value="electrical">Electrical</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="real estate">Real Estate</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail</option>
                      <option value="marketing & advertising">Marketing & Advertising</option>
                      <option value="education">Education</option>
                      <option value="transportation & logistics">Transportation & Logistics</option>
                      <option value="food & beverage">Food & Beverage</option>
                      <option value="construction">Construction</option>
                      <option value="legal services">Legal Services</option>
                      <option value="human resources">Human Resources</option>
                      <option value="environmental services">Environmental Services</option>
                      <option value="arts & entertainment">Arts & Entertainment</option>
                    </>
                  )}
                  {listingType === "business" && categories.find(cat => cat.id === "business")?.subcategories?.map((sub) => (
                    <option key={sub} value={sub.toLowerCase().replace(/\s\([^)]*\)/g, '')}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="description">
                description *
              </label>
              <textarea
                id="description"
                className="w-full border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none min-h-[200px]"
                placeholder="Describe your listing in detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            {/* Price field - shown conditionally for job listings with different label */}
            {listingType === 'job' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="price">
                  Salary Per Year or Per Hour *
                </label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <input
                    id="price"
                    className="w-full border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                    type="number"
                    placeholder="Enter salary amount"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  <select
                    className="ml-2 border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                  >
                    <option value="hour">per hour</option>
                    <option value="year">per year</option>
                  </select>
                </div>
              </div>
            ) : listingType !== 'personal' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="price">
                  price (optional)
                </label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <input
                    id="price"
                    className="w-full border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                    type="number"
                    placeholder="Price in USD"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {/* Show remote option only for job and business listings */}
            {listingType !== "personal" && (
              <div className="space-y-2">
                <span className="block text-sm font-medium">is remote?</span>
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
            
            <div>
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 text-sm"
                disabled={!listingType || !subcategory}
              >
                preview listing
              </button>
              {listingType && !subcategory && (
                <p className="text-red-500 text-xs mt-1">
                  {listingType === "personal" ? "Please select a connection type for personal listing" : 
                   listingType === "job" ? "Please select a job category" : 
                   "Please select a business category"}
                </p>
              )}
            </div>
          </form>
        </div>
        
        <div className="mt-4 text-sm">
          <p>
            By posting, you agree to our <a href="/terms" className="text-blue-700 hover:underline">terms of use</a>.
          </p>
        </div>
      </div>
    </>
  );
}
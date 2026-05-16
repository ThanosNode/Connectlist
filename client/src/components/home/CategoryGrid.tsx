import { Link, useLocation as useWouterLocation } from "wouter";
import { categories } from "@/lib/categoryData";
import { useLocation } from "@/context/LocationContext";

// Sample states list for demo purposes
const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California",
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri"
];

export default function CategoryGrid() {
  const [, navigate] = useWouterLocation();
  const { setState } = useLocation();
  
  // Handle state navigation correctly
  const handleStateClick = (state: string, e: React.MouseEvent) => {
    e.preventDefault();
    // Update the location context
    setState(state);
    // Navigate to the state page
    navigate(`/state/${encodeURIComponent(state)}`);
  };

  return (
    <div className="space-y-8">
      {/* Standard categories */}
      <section>
        <h1 className="text-lg font-medium mb-2 border-b border-gray-300 pb-1">categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {categories.map((category) => (
            <div key={`category-${category.id}`}>
              <Link 
                href={`/browse`} 
                className="text-blue-700 hover:underline"
              >
                {category.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      {/* Jobs by state */}
      <section>
        <h1 className="text-lg font-medium mb-2 border-b border-gray-300 pb-1">jobs by state</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
          {states.map((state) => (
            <div key={state}>
              <a 
                href={`/state/${encodeURIComponent(state)}`}
                onClick={(e) => handleStateClick(state, e)}
                className="text-blue-700 hover:underline cursor-pointer"
              >
                {state}
              </a>
            </div>
          ))}
        </div>
      </section>
      
      {/* Business Listings by state */}
      <section>
        <h1 className="text-lg font-medium mb-2 border-b border-gray-300 pb-1">business listings by state</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
          {states.map((state) => (
            <div key={`business-${state}`}>
              <a 
                href={`/state/${encodeURIComponent(state)}`}
                onClick={(e) => handleStateClick(state, e)}
                className="text-blue-700 hover:underline cursor-pointer"
              >
                {state}
              </a>
            </div>
          ))}
        </div>
      </section>
      
      {/* Resumes by state */}
      <section>
        <h1 className="text-lg font-medium mb-2 border-b border-gray-300 pb-1">resumes by state</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
          {states.map((state) => (
            <div key={`resume-${state}`}>
              <a 
                href={`/state/${encodeURIComponent(state)}`}
                onClick={(e) => handleStateClick(state, e)}
                className="text-blue-700 hover:underline cursor-pointer"
              >
                {state}
              </a>
            </div>
          ))}
        </div>
      </section>
      
      {/* Personals by state */}
      <section>
        <h1 className="text-lg font-medium mb-2 border-b border-gray-300 pb-1">personals by state</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
          {states.map((state) => (
            <div key={`personal-${state}`}>
              <a 
                href={`/state/${encodeURIComponent(state)}`}
                onClick={(e) => handleStateClick(state, e)}
                className="text-blue-700 hover:underline cursor-pointer"
              >
                {state}
              </a>
            </div>
          ))}
        </div>
      </section>
      
      {/* Community by state */}
      <section>
        <h1 className="text-lg font-medium mb-2 border-b border-gray-300 pb-1">community by state</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
          {states.map((state) => (
            <div key={`community-${state}`}>
              <a 
                href={`/state/${encodeURIComponent(state)}`}
                onClick={(e) => handleStateClick(state, e)}
                className="text-blue-700 hover:underline cursor-pointer"
              >
                {state}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Edit, User, Settings, LogOut } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [_, navigate] = useLocation();
  
  // Redirect to home if not authenticated
  if (!user) {
    if (typeof window !== "undefined") {
      navigate("/");
    }
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>My Profile | ConnectList</title>
        <meta name="description" content="Manage your profile on ConnectList - the Web3-focused classifieds platform." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-6">my profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="border border-gray-300 p-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User size={24} className="text-gray-500" />
                </div>
                <div>
                  <h2 className="font-medium">{user.username}</h2>
                  <p className="text-sm text-gray-600">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <nav className="space-y-3">
                <Link href="/profile" className="text-blue-700 hover:underline block font-medium">
                  Profile Overview
                </Link>
                <Link href="/my-listings" className="text-blue-700 hover:underline block">
                  My Listings
                </Link>
                <Link href="/profile/settings" className="text-blue-700 hover:underline block">
                  Account Settings
                </Link>
                <button 
                  onClick={() => logout()}
                  className="text-blue-700 hover:underline block w-full text-left"
                >
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <div className="border border-gray-300 p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">personal information</h2>
                <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50">
                  <Edit size={16} className="mr-1" /> edit
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p>{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p>{user.role}</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-300 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">account activity</h2>
              </div>
              
              <div className="text-sm space-y-2">
                <p>Last login: {new Date().toLocaleDateString()}</p>
                <p>Active listings: 0</p>
                <p>Total listings created: 0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
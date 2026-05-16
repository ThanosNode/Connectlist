import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Lock } from "lucide-react";

export default function ProfileSettings() {
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
        <title>Account Settings | ConnectList</title>
        <meta name="description" content="Manage your account settings on ConnectList - the Web3-focused classifieds platform." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-6">account settings</h1>
        
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
                <Link href="/profile" className="text-blue-700 hover:underline block">
                  Profile Overview
                </Link>
                <Link href="/my-listings" className="text-blue-700 hover:underline block">
                  My Listings
                </Link>
                <Link href="/profile/settings" className="text-blue-700 hover:underline block font-medium">
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
              <div className="flex items-center gap-2 mb-4">
                <User size={20} />
                <h2 className="text-lg font-medium">profile information</h2>
              </div>
              
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={user.username} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name (optional)</Label>
                  <Input id="displayName" placeholder="How you want to be known on ConnectList" />
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </form>
            </div>
            
            <div className="border border-gray-300 p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={20} />
                <h2 className="text-lg font-medium">password & security</h2>
              </div>
              
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                
                <div className="flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </form>
            </div>
            
            <div className="border border-gray-300 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} />
                <h2 className="text-lg font-medium">account security</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded">
                  <div className="flex-shrink-0 text-red-600">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-700 mb-2">
                      This action is irreversible. All your listings and account information will be permanently deleted.
                    </p>
                    <Button variant="destructive" size="sm">Delete Account</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
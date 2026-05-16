import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("reports");
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      toast({
        title: "Access denied",
        description: "You must be logged in to access this page.",
        variant: "destructive",
      });
    } else if (user && user.role !== "super_admin" && user.role !== "sub_admin") {
      setLocation("/");
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user, setLocation, toast]);
  
  // Define report and user interfaces
  interface Report {
    id: number;
    listingId: number;
    listingTitle?: string;
    reason: string;
    userId: number;
    reporterEmail?: string;
    status: string;
    createdAt: string;
  }
  
  interface User {
    id: number;
    email: string;
    role: string;
    createdAt: string;
  }
  
  // Fetch reports
  const { 
    data: reports = [], 
    isLoading: isLoadingReports,
    isError: isReportsError
  } = useQuery<Report[]>({
    queryKey: ['/api/admin/reports'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/reports');
      
      // Mock data for demonstration
      if (!Array.isArray(response)) {
        return [
          {
            id: 1,
            listingId: 3,
            listingTitle: "Suspicious Listing",
            reason: "Contains inappropriate content",
            userId: 2,
            reporterEmail: "user2@example.com",
            status: "pending",
            createdAt: new Date().toISOString()
          }
        ];
      }
      return response;
    },
    enabled: isAuthenticated && !!user && (user.role === "super_admin" || user.role === "sub_admin")
  });
  
  // Fetch users (for super admin only)
  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
    isError: isUsersError
  } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/users');
      
      // Mock data for demonstration
      if (!Array.isArray(response)) {
        return [
          {
            id: 1,
            email: "admin@example.com",
            role: "super_admin",
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            email: "user2@example.com",
            role: "user",
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            email: "subadmin@example.com",
            role: "sub_admin",
            createdAt: new Date().toISOString()
          }
        ];
      }
      return response;
    },
    enabled: isAuthenticated && !!user && user.role === "super_admin"
  });
  
  // Function to handle report action
  const handleReportAction = async (reportId: number, action: 'approve' | 'reject') => {
    try {
      await apiRequest(`/api/admin/reports/${reportId}/${action}`, {}, 'POST');
      
      // Invalidate reports query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
      
      toast({
        title: "Success",
        description: `Report ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process report. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a listing
  const handleDeleteListing = async (listingId: number) => {
    try {
      await apiRequest(`/api/admin/listings/${listingId}`, {}, 'DELETE');
      
      // Invalidate reports query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
      
      toast({
        title: "Success",
        description: "Listing deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to promote user to sub-admin (super admin only)
  const handlePromoteToSubAdmin = async (userId: number) => {
    if (user?.role !== "super_admin") {
      toast({
        title: "Access denied",
        description: "Only super admins can promote users.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest(`/api/admin/users/${userId}/promote`, {}, 'POST');
      
      // Invalidate users query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      toast({
        title: "Success",
        description: "User promoted to sub-admin successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote user. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to demote sub-admin to regular user (super admin only)
  const handleDemoteSubAdmin = async (userId: number) => {
    if (user?.role !== "super_admin") {
      toast({
        title: "Access denied",
        description: "Only super admins can demote users.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest(`/api/admin/users/${userId}/demote`, {}, 'POST');
      
      // Invalidate users query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      toast({
        title: "Success",
        description: "Sub-admin demoted to regular user successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to demote user. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!isAuthenticated || !user || (user.role !== "super_admin" && user.role !== "sub_admin")) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Helmet>
        <title>Admin Dashboard | ConnectList</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-4">admin dashboard</h1>
        <p className="mb-4 text-sm leading-relaxed">
          manage reports, listings, and user roles from this dashboard.
        </p>
      </div>
      
      <Tabs 
        defaultValue="reports" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="mb-4">
          <TabsTrigger 
            value="reports"
            className="text-sm"
          >
            reports
          </TabsTrigger>
          {user.role === "super_admin" && (
            <>
              <TabsTrigger 
                value="users"
                className="text-sm"
              >
                manage sub-admins
              </TabsTrigger>
              <a 
                href="/admin/reports" 
                className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                financial reports
              </a>
            </>
          )}
        </TabsList>
        
        <TabsContent value="reports" className="border border-gray-300 p-4">
          <h2 className="text-lg font-medium mb-4">reported listings</h2>
          
          {isLoadingReports ? (
            <p className="text-sm text-gray-500">Loading reports...</p>
          ) : isReportsError ? (
            <p className="text-sm text-red-500">Error loading reports. Please try again.</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-gray-500">No reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left font-medium py-2 px-2">ID</th>
                    <th className="text-left font-medium py-2 px-2">Listing</th>
                    <th className="text-left font-medium py-2 px-2">Reason</th>
                    <th className="text-left font-medium py-2 px-2">Reporter</th>
                    <th className="text-left font-medium py-2 px-2">Date</th>
                    <th className="text-left font-medium py-2 px-2">Status</th>
                    <th className="text-left font-medium py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-2">{report.id}</td>
                      <td className="py-2 px-2">
                        <a 
                          href={`/listings/${report.listingId}`} 
                          className="text-blue-700 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {report.listingTitle || `Listing #${report.listingId}`}
                        </a>
                      </td>
                      <td className="py-2 px-2">{report.reason}</td>
                      <td className="py-2 px-2">{report.reporterEmail || `User #${report.userId}`}</td>
                      <td className="py-2 px-2">{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-2">
                        <span 
                          className={
                            report.status === 'pending' 
                              ? 'text-yellow-600' 
                              : report.status === 'approved' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                          }
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 flex space-x-2">
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReportAction(report.id, 'approve')}
                              className="text-blue-700 hover:underline text-xs"
                            >
                              approve
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'reject')}
                              className="text-blue-700 hover:underline text-xs"
                            >
                              reject
                            </button>
                            <button
                              onClick={() => handleDeleteListing(report.listingId)}
                              className="text-red-600 hover:underline text-xs"
                            >
                              delete listing
                            </button>
                          </>
                        )}
                        {report.status !== 'pending' && (
                          <span className="text-xs text-gray-500">processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        
        {user.role === "super_admin" && (
          <TabsContent value="users" className="border border-gray-300 p-4">
            <h2 className="text-lg font-medium mb-4">manage sub-admins</h2>
            <p className="text-sm mb-4">
              Sub-admins can only moderate and delete posts. They cannot create other admins.
            </p>
            
            {isLoadingUsers ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : isUsersError ? (
              <p className="text-sm text-red-500">Error loading users. Please try again.</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left font-medium py-2 px-2">ID</th>
                      <th className="text-left font-medium py-2 px-2">Email</th>
                      <th className="text-left font-medium py-2 px-2">Role</th>
                      <th className="text-left font-medium py-2 px-2">Created At</th>
                      <th className="text-left font-medium py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-2">{user.id}</td>
                        <td className="py-2 px-2">{user.email}</td>
                        <td className="py-2 px-2">
                          <span 
                            className={
                              user.role === 'super_admin' 
                                ? 'text-purple-600' 
                                : user.role === 'sub_admin' 
                                  ? 'text-blue-600' 
                                  : 'text-gray-600'
                            }
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 px-2">
                          {user.role === 'user' && (
                            <button
                              onClick={() => handlePromoteToSubAdmin(user.id)}
                              className="text-blue-700 hover:underline text-xs"
                            >
                              promote to sub-admin
                            </button>
                          )}
                          {user.role === 'sub_admin' && (
                            <button
                              onClick={() => handleDemoteSubAdmin(user.id)}
                              className="text-red-600 hover:underline text-xs"
                            >
                              demote to user
                            </button>
                          )}
                          {user.role === 'super_admin' && (
                            <span className="text-xs text-gray-500">super admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
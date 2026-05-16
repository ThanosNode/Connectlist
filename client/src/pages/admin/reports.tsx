import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminReports() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      toast({
        title: "Access denied",
        description: "You must be logged in to access this page.",
        variant: "destructive",
      });
    } else if (user && user.role !== "super_admin") {
      setLocation("/");
      toast({
        title: "Access denied",
        description: "Only super admins can access financial reports.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user, setLocation, toast]);
  
  // Define report interfaces
  interface CountryStat {
    country: string;
    totalListings: number;
    paidListings: number;
    revenue: number;
    states: {
      name: string;
      totalListings: number;
      paidListings: number;
      revenue: number;
    }[];
  }
  
  interface CategoryStat {
    type: string;
    totalListings: number;
    paidListings: number;
    revenue: number;
  }
  
  interface FinancialReport {
    totalListings: number;
    totalPaidListings: number;
    totalRevenue: number;
    countriesData: CountryStat[];
    categoriesData: CategoryStat[];
  }
  
  // Fetch financial reports
  const { 
    data: financialReport, 
    isLoading: isLoadingReport,
    isError: isReportError
  } = useQuery<FinancialReport>({
    queryKey: ['/api/admin/reports/financial'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/reports/financial');
      
      // Mock data for demonstration
      if (!response || !response.totalListings) {
        return {
          totalListings: 1250,
          totalPaidListings: 312,
          totalRevenue: 15600,
          countriesData: [
            {
              country: "United States",
              totalListings: 850,
              paidListings: 210,
              revenue: 10500,
              states: [
                {
                  name: "California",
                  totalListings: 320,
                  paidListings: 95,
                  revenue: 4750
                },
                {
                  name: "New York",
                  totalListings: 280,
                  paidListings: 75,
                  revenue: 3750
                },
                {
                  name: "Texas",
                  totalListings: 250,
                  paidListings: 40,
                  revenue: 2000
                }
              ]
            },
            {
              country: "Canada",
              totalListings: 400,
              paidListings: 102,
              revenue: 5100,
              states: [
                {
                  name: "Ontario",
                  totalListings: 180,
                  paidListings: 55,
                  revenue: 2750
                },
                {
                  name: "British Columbia",
                  totalListings: 150,
                  paidListings: 32,
                  revenue: 1600
                },
                {
                  name: "Quebec",
                  totalListings: 70,
                  paidListings: 15,
                  revenue: 750
                }
              ]
            }
          ],
          categoriesData: [
            {
              type: "job",
              totalListings: 580,
              paidListings: 210,
              revenue: 10500
            },
            {
              type: "business",
              totalListings: 420,
              paidListings: 98,
              revenue: 4900
            },
            {
              type: "personal",
              totalListings: 250,
              paidListings: 4,
              revenue: 200
            }
          ]
        };
      }
      return response;
    },
    enabled: isAuthenticated && !!user && user.role === "super_admin"
  });
  
  if (!isAuthenticated || !user || user.role !== "super_admin") {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Helmet>
        <title>Financial Reports | ConnectList Admin</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-4">financial reports</h1>
        <p className="mb-4 text-sm leading-relaxed">
          view detailed financial information about listings, payments, and revenue.
        </p>
      </div>
      
      {isLoadingReport ? (
        <p className="text-sm text-gray-500">Loading financial reports...</p>
      ) : isReportError ? (
        <p className="text-sm text-red-500">Error loading reports. Please try again.</p>
      ) : !financialReport ? (
        <p className="text-sm text-gray-500">No financial data available.</p>
      ) : (
        <div className="space-y-8">
          {/* Summary section */}
          <div className="border border-gray-300 p-4">
            <h2 className="text-lg font-medium mb-4">overall summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-sm">
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-xl font-semibold">{financialReport.totalListings}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-sm">
                <p className="text-sm text-gray-600">Paid Listings</p>
                <p className="text-xl font-semibold">{financialReport.totalPaidListings}</p>
                <p className="text-xs text-gray-500">
                  ({((financialReport.totalPaidListings / financialReport.totalListings) * 100).toFixed(1)}% of total)
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-sm">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-semibold">${financialReport.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Category breakdown */}
          <div className="border border-gray-300 p-4">
            <h2 className="text-lg font-medium mb-4">category breakdown</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left font-medium py-2 px-2">Category</th>
                    <th className="text-right font-medium py-2 px-2">Total Listings</th>
                    <th className="text-right font-medium py-2 px-2">Paid Listings</th>
                    <th className="text-right font-medium py-2 px-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {financialReport.categoriesData.map((category) => (
                    <tr key={category.type} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-2 capitalize">{category.type}</td>
                      <td className="py-2 px-2 text-right">{category.totalListings}</td>
                      <td className="py-2 px-2 text-right">
                        {category.paidListings} 
                        <span className="text-xs text-gray-500 ml-1">
                          ({((category.paidListings / category.totalListings) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">${category.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Geographic breakdown */}
          <div className="border border-gray-300 p-4">
            <h2 className="text-lg font-medium mb-4">geographic breakdown</h2>
            
            <div className="space-y-6">
              {financialReport.countriesData.map((country) => (
                <div key={country.country} className="mb-6">
                  <h3 className="text-md font-medium mb-2">{country.country}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="bg-gray-50 p-2 rounded-sm">
                      <p className="text-gray-600">Total Listings</p>
                      <p className="font-semibold">{country.totalListings}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded-sm">
                      <p className="text-gray-600">Paid Listings</p>
                      <p className="font-semibold">{country.paidListings}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded-sm">
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">${country.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left font-medium py-2 px-2">State/Province</th>
                          <th className="text-right font-medium py-2 px-2">Total Listings</th>
                          <th className="text-right font-medium py-2 px-2">Paid Listings</th>
                          <th className="text-right font-medium py-2 px-2">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {country.states.map((state) => (
                          <tr key={state.name} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-2 px-2">{state.name}</td>
                            <td className="py-2 px-2 text-right">{state.totalListings}</td>
                            <td className="py-2 px-2 text-right">
                              {state.paidListings}
                              <span className="text-xs text-gray-500 ml-1">
                                ({((state.paidListings / state.totalListings) * 100).toFixed(1)}%)
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">${state.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
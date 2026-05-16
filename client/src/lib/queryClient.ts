import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Store the CSRF token from the most recent GET request
export let csrfToken: string | null = null;

// Function to intercept fetch responses and capture CSRF tokens
export const updateCsrfToken = (response: Response) => {
  const token = response.headers.get('X-CSRF-Token');
  if (token) {
    csrfToken = token;
    console.log('CSRF token updated:', token);
  } else {
    console.log('No CSRF token in response headers:', 
      Array.from(response.headers.entries())
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    );
  }
  return response;
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  // Build headers with CSRF token for mutating requests
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Check for JWT token and add Authorization header
  // Try to get token from localStorage - looking for JWT first, then fallback to ultra-auth method
  const storedUser = localStorage.getItem('connectedUser');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      
      // First try to use JWT token if available (preferred method)
      if (userData.token) {
        headers["Authorization"] = `Bearer ${userData.token}`;
        console.log(`Adding JWT token to ${method} ${url} request`);
      } 
      // Fallback to legacy X-Ultra-Auth header (for backward compatibility)
      else {
        headers["X-Ultra-Auth"] = `${userData.id}:${userData.email}`;
        console.log(`Adding legacy auth to ${method} ${url} request`);
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
  }
  
  // Add CSRF token for non-GET requests if we have one
  if (method !== 'GET') {
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
      console.log(`Adding CSRF token to ${method} ${url} request:`, csrfToken);
    } else {
      console.warn(`No CSRF token available for ${method} ${url} request`);
      
      // Force a CSRF token refresh
      try {
        console.log("Attempting to refresh CSRF token...");
        const tokenResponse = await fetch('/api/csrf-init', { 
          credentials: "include" 
        });
        
        // Update the token
        updateCsrfToken(tokenResponse);
        
        // Check if we got a token now
        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
          console.log("Refreshed CSRF token successfully:", csrfToken);
        } else {
          console.error("Failed to refresh CSRF token");
        }
      } catch (error) {
        console.error("Error refreshing CSRF token:", error);
      }
    }
  }
  
  console.log(`Making ${method} request to ${url} with headers:`, headers);
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then(updateCsrfToken);

  // Don't throw an error here, just return the response
  // This allows the calling code to handle errors appropriately
  // and extract error messages from the response body
  
  // For API consumption via direct apiRequest, return the Response object
  // so the caller can check res.ok and handle errors
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add custom authentication headers
    const headers: Record<string, string> = {};
    
    // Check for JWT token and add Authorization header
    // Try to get token from localStorage - looking for JWT first, then fallback to ultra-auth method
    const storedUser = localStorage.getItem('connectedUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // First try to use JWT token if available (preferred method)
        if (userData.token) {
          headers["Authorization"] = `Bearer ${userData.token}`;
          console.log(`Adding JWT token to GET ${queryKey[0]} request`);
        } 
        // Fallback to legacy X-Ultra-Auth header (for backward compatibility)
        else {
          headers["X-Ultra-Auth"] = `${userData.id}:${userData.email}`;
          console.log(`Adding legacy auth to GET ${queryKey[0]} request`);
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers,
    }).then(updateCsrfToken);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

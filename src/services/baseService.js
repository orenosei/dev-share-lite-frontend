export const API_BASE_URL = 'http://localhost:4000';


export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  let token = null;
  if (typeof window !== 'undefined') {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        token = parsedUser?.token || null;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const headers = options.headers !== undefined 
    ? { ...defaultHeaders, ...options.headers }
    : defaultHeaders;

  if (options.headers && Object.keys(options.headers).length === 0) {
    delete headers['Content-Type'];
  }

  if (options.headers && options.headers.Authorization) {
    headers.Authorization = options.headers.Authorization;
  }

  const config = {
    method: 'GET',
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data?.message || data || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export default apiRequest;

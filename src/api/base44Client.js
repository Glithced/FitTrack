// Mock base44 API client
const base44 = {
  get: async (endpoint) => {
    console.log(`Mock GET request to ${endpoint}`);
    return { data: { message: `Fetched mock data from ${endpoint}` } };
  },
  post: async (endpoint, data) => {
    console.log(`Mock POST to ${endpoint}`, data);
    return { data: { success: true, message: 'Mock post successful', body: data } };
  }
};

export default base44;

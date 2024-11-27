import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const protocolUrl = url.searchParams.get('url');
  
  // You can add server-side validation or processing here
  return {
    protocolUrl
  };
};

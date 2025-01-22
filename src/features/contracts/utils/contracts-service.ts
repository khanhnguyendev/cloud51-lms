const BASE_URL = `${process.env.NEXTAUTH_URL}/api/v1`;

export const fetchContractById = async (id: string) => {
  const response = await fetch(`${BASE_URL}/contracts/${id}`, {
    method: 'GET'
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch contract');
  }

  const data = await response.json();
  return data.message;
};

export const fetchContractByContractCode = async (contractCode: string) => {
  const response = await fetch(
    `${BASE_URL}/contracts?contractCode=${contractCode}`,
    {
      method: 'GET'
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch contract');
  }
  const data = await response.json();
  return data.message;
};

export const fetchContracts = async ({
  page = 1,
  limit = 10,
  search = ''
}: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const response = await fetch(
    `${BASE_URL}/contracts?q=${search}&page=${page}&limit=${limit}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch contracts');
  }
  const data = await response.json();
  return data.message;
};

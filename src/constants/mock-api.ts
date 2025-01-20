import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter'; // For filtering

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Define the shape of Contract data
export type Contract = {
  contractDate: string;
  contractCode: string;
  contractType: 'loan' | 'lease';
  deviceType: string;
  deviceImei: string;
  totalAmount: number;
  fee: number;
  note: string;
  id: number;
  user: string;
  transactions: string[];
  created_at: string;
  updated_at: string;
};

// Mock contract data store
export const fakeContracts = {
  records: [] as Contract[], // Holds the list of contract objects

  // Initialize with sample data
  initialize() {
    const sampleContracts: Contract[] = [];
    function generateRandomContractData(id: number): Contract {
      const contractTypes: readonly ('loan' | 'lease')[] = ['loan', 'lease'];
      const deviceTypes = [
        'iPhone 16',
        'iPhone 16 Plus',
        'iPhone 16 Pro',
        'iPhone 16 Pro Max',
        'iPhone 15',
        'iPhone 15 Plus',
        'iPhone 15 Pro',
        'iPhone 15 Pro Max',
        'iPhone 14',
        'iPhone 14 Plus',
        'iPhone 14 Pro',
        'iPhone 14 Pro Max',
        'iPhone 13',
        'iPhone 13 Mini',
        'iPhone 13 Pro',
        'iPhone 13 Pro Max',
        'iPhone 12',
        'iPhone 12 Mini',
        'iPhone 12 Pro',
        'iPhone 12 Pro Max',
        'iPhone 11',
        'iPhone 11 Pro',
        'iPhone 11 Pro Max'
      ];

      return {
        id,
        contractDate: faker.date
          .between({ from: '2022-01-01', to: '2023-12-31' })
          .toISOString(),
        contractCode: faker.string.uuid(),
        contractType: faker.helpers.arrayElement<'loan' | 'lease'>(
          contractTypes
        ),
        deviceType: faker.helpers.arrayElement(deviceTypes),
        deviceImei: faker.phone.imei(),

        totalAmount:
          Math.floor(
            faker.number.int({
              min: 1000000,
              max: 10000000,
              multipleOf: 500000
            }) / 500000
          ) * 500000,
        fee: Math.max(
          200000,
          Math.floor(
            faker.number.int({
              min: 1000000,
              max: 10000000,
              multipleOf: 500000
            }) / 500000
          ) *
            500000 *
            0.1
        ),

        note: faker.helpers.arrayElement([
          'Hợp đồng này được ký kết giữa hai bên.',
          'Sản phẩm đã được kiểm tra và đáp ứng tiêu chuẩn chất lượng.',
          'Khách hàng sẽ nhận được hỗ trợ trong vòng 24 giờ.',
          'Điều kiện thanh toán đã được thống nhất giữa các bên.',
          'Hợp đồng có hiệu lực ngay khi được ký kết.'
        ]), // Vietnamese notes
        user: faker.string.uuid(),
        transactions: Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          () => faker.string.uuid()
        ),
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString()
      };
    }

    // Generate remaining records
    for (let i = 1; i <= 20; i++) {
      sampleContracts.push(generateRandomContractData(i));
    }

    this.records = sampleContracts;
  },

  // Get all contracts with optional filtering and search
  async getAll({
    contractType,
    search
  }: {
    contractType?: string;
    search?: string;
  }) {
    let contracts = [...this.records];

    // Filter contracts based on contractType
    if (contractType) {
      contracts = contracts.filter(
        (contract) => contract.contractType === contractType
      );
    }

    // Search functionality across multiple fields
    if (search) {
      contracts = matchSorter(contracts, search, {
        keys: ['contractCode', 'deviceType', 'note']
      });
    }

    return contracts;
  },

  // Get paginated results with optional filtering and search
  async getContracts({
    page = 1,
    limit = 10,
    contractType,
    search
  }: {
    page?: number;
    limit?: number;
    contractType?: string;
    search?: string;
  }) {
    await delay(1000);
    const allContracts = await this.getAll({ contractType, search });
    const totalContracts = allContracts.length;

    // Pagination logic
    const offset = (page - 1) * limit;
    const paginatedContracts = allContracts.slice(offset, offset + limit);

    // Mock current time
    const currentTime = new Date().toISOString();

    // Return paginated response
    return {
      success: true,
      time: currentTime,
      message: 'Sample contract data for testing and learning purposes',
      total_contracts: totalContracts,
      offset,
      limit,
      contracts: paginatedContracts
    };
  },

  // Get a specific contract by its ID
  async getContractById(id: number) {
    await delay(1000); // Simulate a delay

    // Find the contract by its ID
    const contract = this.records.find((contract) => contract.id === id);

    if (!contract) {
      return {
        success: false,
        message: `Contract with ID ${id} not found`
      };
    }

    // Mock current time
    const currentTime = new Date().toISOString();

    return {
      success: true,
      time: currentTime,
      message: `Contract with ID ${id} found`,
      contract
    };
  }
};

// Initialize sample contracts
fakeContracts.initialize();

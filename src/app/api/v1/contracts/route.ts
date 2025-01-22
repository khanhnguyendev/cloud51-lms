import { CONTRACT_FEE, CONTRACT_TYPE } from '@/constants/contract';
import {
  CONTRACT_CODE_EXISTING,
  CONTRACT_TYPE_INVALID,
  IMEI_EXISTING
} from '@/constants/error-message';
import { USER_ROLE } from '@/constants/role';
import { dbConnect, createSession, rollback } from '@/lib/db';
import {
  calculateDueDate,
  calculateFee,
  calculateInstallments
} from '@/lib/helper';
import { Contract, IContract } from '@/models/contract';
import { Transaction } from '@/models/transaction';
import { IUser, User } from '@/models/user';
import { BadRequestError } from '@/utils/exceptions/BadRequestException';
import { HTTP_STATUS_CODES, success, handleError } from '@/utils/response-util';
import { ClientSession } from 'mongoose';
import { type NextRequest } from 'next/server';

type createContractReq = {
  contractDate: string;
  contractCode: string;
  contractType: string;
  deviceType: string;
  deviceImei: number;
  totalAmount: number;
  customerName: string;
  customerPhone: number;
  note: string;
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('q');

    const skip = (page - 1) * limit;

    await dbConnect();
    let contracts;
    let totalContracts;

    if (search) {
      contracts = await Contract.aggregate([
        {
          $lookup: {
            from: 'users', // Reference to the User collection
            localField: 'user', // Field in Contract that references User
            foreignField: '_id', // _id field in User collection
            as: 'userDetails' // Alias for user data
          }
        },
        {
          $match: {
            $or: [
              { contractCode: { $regex: search, $options: 'i' } }, // Search in contractCode
              { deviceType: { $regex: search, $options: 'i' } }, // Search in deviceType
              { deviceImei: { $regex: search, $options: 'i' } }, // Search in deviceImei
              { note: { $regex: search, $options: 'i' } }, // Search in note
              { 'userDetails.name': { $regex: search, $options: 'i' } }, // Search in user's name
              {
                'userDetails.phones.number': { $regex: search, $options: 'i' }
              }, // Search in user's phone number
              { 'userDetails.address': { $regex: search, $options: 'i' } } // Search in user's address
            ]
          }
        },
        { $skip: skip },
        { $limit: limit }
      ]);

      totalContracts = await Contract.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $match: {
            $or: [
              { contractCode: { $regex: search, $options: 'i' } },
              { deviceType: { $regex: search, $options: 'i' } },
              { deviceImei: { $regex: search, $options: 'i' } },
              { note: { $regex: search, $options: 'i' } },
              { 'userDetails.name': { $regex: search, $options: 'i' } },
              {
                'userDetails.phones.number': { $regex: search, $options: 'i' }
              },
              { 'userDetails.address': { $regex: search, $options: 'i' } }
            ]
          }
        },
        { $count: 'total' }
      ]);

      totalContracts = totalContracts.length > 0 ? totalContracts[0].total : 0;
    } else {
      contracts = await Contract.find().skip(skip).limit(limit);
      totalContracts = await Contract.countDocuments();
    }

    const result = {
      totalContracts,
      offset: skip,
      limit,
      contracts
    };

    return success(HTTP_STATUS_CODES.OK, result);
  } catch (e) {
    return handleError(e as Error);
  }
}

export async function POST(req: Request) {
  const request: createContractReq = await req.json();
  console.log('Create contract request::', request);

  // Create session
  const session = await createSession();
  try {
    // start transaction
    session.startTransaction();

    // Find or create user
    const user = await findOrCreateUser(
      session,
      request.customerName,
      request.customerPhone
    );

    // Create a new contract
    const contract = await createContract(
      user,
      request.contractDate,
      request.contractCode,
      request.contractType,
      request.deviceType,
      request.deviceImei,
      request.totalAmount,
      request.note,
      session
    );

    // Create transactions for the contract
    await createTransactions(session, user, contract);

    // Commit the transaction
    await session.commitTransaction();

    console.log(`Contract created:: ${contract}`);

    return success(HTTP_STATUS_CODES.CREATED, contract);
  } catch (error) {
    await rollback(session);
    return handleError(error);
  } finally {
    await session.endSession();
  }
}

async function findOrCreateUser(
  session: ClientSession,
  customerName: string,
  customerPhone: number
) {
  try {
    if (!customerName || !customerPhone) return;

    const user = await User.findOne({ 'phones.number': customerPhone }).session(
      session
    );

    if (user) return user;

    const newUser = new User({
      username: customerPhone,
      name: customerName,
      role: USER_ROLE.CLIENT,
      phones: [{ number: customerPhone, isZalo: false }]
    });

    const savedUser = await newUser.save({ session });

    console.log('[findOrCreateUser] New user created::', savedUser);
    return savedUser;
  } catch (error) {
    throw new Error('Fail to findOrCreateUser');
  }
}

async function createContract(
  user: IUser,
  contractDate: string,
  contractCode: string,
  contractType: string,
  deviceType: string,
  deviceImei: number,
  totalAmount: number,
  note: string,
  session: ClientSession
) {
  // Validate inputs
  await validateContractInputs(contractCode, deviceImei, contractType);

  const fee = calculateFee(totalAmount, CONTRACT_FEE);

  // Create and save the contract
  const contract = new Contract({
    contractDate,
    contractCode,
    contractType,
    deviceType,
    deviceImei,
    totalAmount,
    fee,
    note,
    user: user._id
  });

  const newContract = await contract.save({ session });

  console.info(`[createContract] New contract created: ${newContract}`);

  return newContract;
}

async function validateContractInputs(
  contractCode: string,
  deviceImei: number,
  contractType: any
) {
  // Check if contract code is already in use
  const existingContract = await Contract.findOne({ contractCode });
  if (existingContract) {
    throw new BadRequestError(CONTRACT_CODE_EXISTING);
  }

  // Check if IMEI is already in use by another contract
  const existingImeiContract = await Contract.findOne({ deviceImei });
  if (existingImeiContract) {
    throw new BadRequestError(IMEI_EXISTING);
  }

  // Validate contract type (assuming CONTRACT_TYPE is defined somewhere)
  if (!Object.values(CONTRACT_TYPE).includes(contractType)) {
    throw new BadRequestError(CONTRACT_TYPE_INVALID);
  }
}

async function createTransactions(
  session: ClientSession,
  user: IUser,
  contract: IContract
) {
  // Calculate installments
  const installments = calculateInstallments(
    contract.contractDate.toString(),
    contract.contractType,
    contract.totalAmount
  );

  // Calculate due date
  const dueDate = calculateDueDate(
    contract.contractType,
    contract.contractDate.toString()
  );

  // Generate transaction documents
  const transactions = installments.map((installment) => ({
    contractId: contract._id,
    contractType: contract.contractType,
    userId: user._id,
    totalAmount: installment.amount,
    paymentDate: new Date(installment.date),
    amount: installment.amount,
    dueDate: dueDate,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  console.log(
    `[createTransactions] Created transactions for contract code ${contract.contractCode}:`,
    transactions
  );

  try {
    const savedTransactions = await Transaction.insertMany(transactions, {
      session
    });

    contract.transactions = savedTransactions.map((txn) => txn._id);
    await contract.save({ session });

    return savedTransactions;
  } catch (error) {
    console.error('[createTransactions] Error creating transactions:', error);
    throw new Error('Failed to create transactions.');
  }
}

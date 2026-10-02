import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/index.js';

const generateMockUser = (index, role = USER_ROLES.CUSTOMER) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    firstName: `User ${index + 1}`,
    lastName: `Last Name ${index + 1}`,
    email: `${role}${index + 1}@example.com`,
    password: 'coder123',
    role,
  };
};

const generateMockUsers = (quantity) => {
  return Array.from({ length: quantity }, (_, i) => generateMockUser(i));
};

const generateMockStoreUsers = (quantity) => {
  return Array.from({ length: quantity }, (_, i) => generateMockUser(i, USER_ROLES.STORE));
}

const generateMockDrivers = (quantity) => {
  return Array.from({ length: quantity }, (_, i) => {
    const driver = generateMockUser(i, USER_ROLES.DRIVER);
    return { ...driver, isAvailable: true };
  });
};

export default { generateMockUser, generateMockUsers, generateMockStoreUsers, generateMockDrivers };
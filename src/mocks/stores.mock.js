import mongoose from 'mongoose';

const generateMockStore = (ownerId, index) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: `Store ${index + 1}`,
    address: `Address ${index + 1}`,
    owner: ownerId,
    isActive: true,
  };
};

const generateMockStores = (storeUsers, quantity) => {
    return Array.from({ length: quantity }, (_, i) => {
        const ownerId = storeUsers[i % storeUsers.length]._id;
        return generateMockStore(ownerId, i);
    });
};

export default { generateMockStore, generateMockStores };
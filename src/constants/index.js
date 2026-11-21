export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  STORE: 'store',
  DRIVER: 'driver'
});

export const ORDER_STATUS = Object.freeze({
  CREATED: 'created',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
});

export const PRIORITY_LEVELS = Object.freeze({
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
});

export const DRIVER_STATUS = Object.freeze({
  ASSIGNED: ORDER_STATUS.ASSIGNED,
  IN_TRANSIT: ORDER_STATUS.IN_TRANSIT,
  DELIVERED: ORDER_STATUS.DELIVERED,
  CANCELLED: ORDER_STATUS.CANCELLED,
});

  export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
});


export const DOCUMENT_TYPES = Object.freeze({
  USER_DOCUMENT: 'user_document',
  DRIVER_LICENSE: 'driver_license',
  DELIVERY_PROOF: 'delivery_proof',
});


export const USER_DOCUMENT_TYPES = Object.freeze([
  DOCUMENT_TYPES.USER_DOCUMENT,
  DOCUMENT_TYPES.DRIVER_LICENSE,
]);

export const UPLOAD_FOLDERS = Object.freeze({
  DOCUMENTS: 'uploads/documents',
  LICENSES: 'uploads/licenses',
  PROOFS: 'uploads/proofs',
});

export const FOLDER_BY_DOCUMENT_TYPE = Object.freeze({
  [DOCUMENT_TYPES.USER_DOCUMENT]: UPLOAD_FOLDERS.DOCUMENTS,
  [DOCUMENT_TYPES.DRIVER_LICENSE]: UPLOAD_FOLDERS.LICENSES,
  [DOCUMENT_TYPES.DELIVERY_PROOF]: UPLOAD_FOLDERS.PROOFS,
});

export const ALLOWED_FILE_TYPES = Object.freeze({
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
});

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB, en bytes

export const FILE_FIELDS = Object.freeze({
  USER_DOCUMENT: 'document',
  ORDER_PROOF: 'proof',
});

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

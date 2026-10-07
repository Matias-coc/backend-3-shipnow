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
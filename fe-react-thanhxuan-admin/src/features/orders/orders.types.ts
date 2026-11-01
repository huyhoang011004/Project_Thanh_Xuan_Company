export interface OrderItem {
  _id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  // Specific to Laundry
  laundryServiceType?: string;
  weightOrPieces?: string;
  // Specific to Moving
  movingType?: string; // 'TRUCK_ONLY' | 'ALL_INCLUSIVE'
  truckType?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  movingDate?: string;
  // Common
  totalAmount?: number;
  status: string;
  createdAt: string;
}


export type StockRequest = {
  id: string;
  vendorId: string;
  outletId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
  totalQuantity: number;
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'rejected';
  createdAt: any; // Firestore Timestamp
};

export type DeliveryChallan = {
    id: string;
    stockRequestId: string;
    vendorId: string;
    outletId: string;
    items: {
        productId: string;
        productName: string;
        quantity: number;
    }[];
    totalQuantity: number;
    status: 'issued' | 'in_transit' | 'received';
    issuedAt: any; // Firestore Timestamp
}

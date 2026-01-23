

export type StockRequest = {
  id: string;
  vendorId: string;
  outletId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    variantSku: string;
    variantDescription?: string;
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
        variantSku: string;
        variantDescription?: string;
    }[];
    totalQuantity: number;
    status: 'issued' | 'in_transit' | 'received';
    issuedAt: any; // Firestore Timestamp
}

export type StockTransfer = {
  id: string;
  sourceOutletId: string;
  destinationOutletId: string;
  productId: string;
  productName: string;
  variantSku: string;
  quantity: number;
  status: 'requested' | 'dispatched' | 'received' | 'cancelled';
  requestedBy: string; // UID of the admin who initiated the transfer.
  createdAt: any; // Firestore Timestamp
  // Optional fields for UI convenience
  sourceOutletName?: string;
  destinationOutletName?: string;
};

export interface BookingFormData {
  date: string
  session: string
  numberOfPeople: number
  roomSize: string
  preferredManager: string
  reservationName: string
  notes: string
}

export interface RedeemableItem {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export interface BookingConfirmation {
  bookingId: string
  venue: {
    name: string
    address: string
  }
  details: {
    date: string
    timing: string
    numberOfPeople: number
    roomNumber: string
    manager: string
    notes: string
  }
  redeemedItems?: {
    id: string
    quantity: number
    items: number
    date: string
    coins: number
  }
  bookingCode: string
  redeemed_items: any[]
}


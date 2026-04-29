export interface AppwriteDocument {
  $id: string
  $createdAt: string
  $updatedAt: string
}

export interface Room extends AppwriteDocument {
  slug: string
  name: string
  capacity: string
  sort_order: number
  is_active: boolean
}

export interface RoomRate extends AppwriteDocument {
  room_id: string
  guests_label: string
  price: number
  sort_order: number
}

export interface RoomWithRates extends Room {
  rates: RoomRate[]
}

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'cancelled'
export type BookingSource = 'walk-in' | 'facebook' | 'website' | 'phone'

export interface Booking extends AppwriteDocument {
  room_id: string
  room_name: string
  guest_name: string
  guest_count: number | null
  check_in: string
  check_out: string
  check_in_time: string
  check_out_time: string
  total_amount: number
  down_payment: number
  payment_status: PaymentStatus
  source: BookingSource | null
  discount_code: string | null
  notes: string | null
  aux_room_ids: string | null  // comma-separated room IDs for combo bookings
}

export interface RoomCombo extends AppwriteDocument {
  name: string
  room_ids: string  // comma-separated room $id values
  capacity: string
  is_active: boolean
}

export interface RoomComboWithRates extends RoomCombo {
  rates: RoomRate[]
}

export type ExpenseCategory =
  | 'salary'
  | 'parking'
  | 'cleaning'
  | 'maintenance'
  | 'utilities'
  | 'supplies'
  | 'other'

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  salary: 'Employee Salary',
  parking: 'Parking',
  cleaning: 'Cleaning',
  maintenance: 'Maintenance',
  utilities: 'Utilities',
  supplies: 'Supplies',
  other: 'Other',
}

export interface Expense extends AppwriteDocument {
  category: ExpenseCategory
  amount: number
  expense_date: string
  description: string | null
}

export interface MonthlyReport {
  revenue: {
    total: number
    byRoom: { room_name: string; amount: number }[]
  }
  expenses: {
    total: number
    byCategory: { category: string; amount: number }[]
  }
  netIncome: number
  occupancy: {
    byRoom: { room_name: string; bookedNights: number; totalNights: number; rate: number }[]
  }
  bookingCount: number
}

export interface YearlyData {
  month: number
  revenue: number
  expenses: number
}

export type EmployeeRole = 'cleaner' | 'reception' | 'maintenance' | 'security' | 'other'

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  cleaner: 'Cleaner',
  reception: 'Reception',
  maintenance: 'Maintenance',
  security: 'Security',
  other: 'Other',
}

export interface Employee extends AppwriteDocument {
  name: string
  role: EmployeeRole
  is_active: boolean
}

export interface Shift extends AppwriteDocument {
  employee_id: string
  employee_name: string
  shift_date: string
  start_time: string
  end_time: string
  notes: string | null
}

export interface Banner extends AppwriteDocument {
  title: string
  image_url: string
  link_url: string | null
  is_active: boolean
}

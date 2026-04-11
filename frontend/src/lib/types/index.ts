import { ReactElement } from 'react'

export type BadgeVariant = 'free' | 'premium' | 'event' | 'draft'

export interface ICardData {
  variantBadge: BadgeVariant
  title: string
  description: string
  category?: string
  author: {
    name: string
    avatar: string
  }
  rating: number
  totalReviews: number
  image?: string
}

export interface IProgramFeatures {
  title: string
  description: string
  icon: React.ReactNode
}

export interface IDashboardStat {
  label: string
  value: number | string
  iconName: 'Book' | 'ClipboardCheck' | 'Award' | 'CheckCircle'
}

export interface IResumeCourse {
  title: string
  module: string
  progress: number
  image?: string
  description?: string
  variantBadge?: BadgeVariant
  author?: {
    name: string
    avatar: string
  }
  rating?: number
  totalReviews?: number
}

export interface IDeadlineItem {
  month: string
  day: string
  title: string
  course: string
  isPast?: boolean
}

export interface IFeedbackItem {
  status: 'Lulus' | 'Perlu Revisi'
  time: string
  title: string
  comment: string
  instructor: {
    name: string
    avatar: string
  }
}

// Transaction types
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED'

export type TransactionSortKey = 'transactionId' | 'courseName' | 'classType' | 'price' | 'paymentStatus'

export type SortDirection = 'asc' | 'desc'

export interface TransactionHistoryItem {
  uid: string
  transactionId: string
  courseImage: string
  courseName: string
  classType: 'Premium' | 'Bootcamp' | 'Free'
  price: number
  paymentStatus: PaymentStatus
  purchasedAt: string
  paymentMethod: 'Bank Transfer' | 'Virtual Account' | 'E-Wallet' | 'QRIS'
  qrImage?: string
}

export interface ICertificate {
  uid: string
  title: string
  courseName: string
  issuedDate: string
  category: string
  credentialId: string
  imageUrl?: string
}

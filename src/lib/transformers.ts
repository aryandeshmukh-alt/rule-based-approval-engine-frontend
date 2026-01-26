import { LeaveRequest, ExpenseRequest, DiscountRequest, Holiday, RequestStatus } from '@/types';

const normalizeStatus = (status: string | undefined | null): RequestStatus => {
    if (!status) return 'pending'; // Default if missing
    const s = status.toUpperCase();
    if (s === 'AUTO_APPROVED') return 'approved';
    if (s === 'APPROVED') return 'approved';
    if (s === 'REJECTED') return 'rejected';
    if (s === 'CANCELLED') return 'cancelled';
    return 'pending';
};

const sanitizeDate = (date: string | null | undefined): string | null => {
    if (!date || date.trim() === '') {
        return null; // Return null instead of current date to distinguish backend gaps
    }
    return date;
};

// Update Request interfaces in types for createdAt to be string | null? 
// No, I'll just check for null in the UI. 
// Wait, Request interfaces say string. Let's stick to string but use a specific placeholder.
const FALLBACK_DATE = '1970-01-01T00:00:00Z'; // Used to signal invalid/missing


export const transformLeaveRequest = (data: any): LeaveRequest => {
    const created = sanitizeDate(data.created_at);
    return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        fromDate: sanitizeDate(data.from_date) || FALLBACK_DATE,
        toDate: sanitizeDate(data.to_date) || FALLBACK_DATE,
        leaveType: data.leave_type,
        reason: data.reason || data.description || 'No reason found',
        status: normalizeStatus(data.status),
        statusReason: data.approval_comment || data.status_reason,
        createdAt: created || FALLBACK_DATE,
        updatedAt: sanitizeDate(data.updated_at) || created || FALLBACK_DATE,
    };
};

export const transformExpenseRequest = (data: any): ExpenseRequest => {
    const created = sanitizeDate(data.created_at);
    return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        amount: data.amount,
        category: data.category,
        reason: data.reason || data.description || 'No reason found',
        status: normalizeStatus(data.status),
        statusReason: data.approval_comment || data.status_reason,
        createdAt: created || FALLBACK_DATE,
        updatedAt: sanitizeDate(data.updated_at) || created || FALLBACK_DATE,
    };
};

export const transformDiscountRequest = (data: any): DiscountRequest => {
    const created = sanitizeDate(data.created_at);
    return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        discountPercentage: data.discount_percentage,
        reason: data.reason || data.description || 'No reason found',
        status: normalizeStatus(data.status),
        statusReason: data.approval_comment || data.status_reason,
        createdAt: created || FALLBACK_DATE,
        updatedAt: sanitizeDate(data.updated_at) || created || FALLBACK_DATE,
    };
};

export const transformHoliday = (data: any): Holiday => ({
    id: data.id,
    date: sanitizeDate(data.date),
    description: data.description,
});

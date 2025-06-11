export const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '0 ₫';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numValue);
}; 
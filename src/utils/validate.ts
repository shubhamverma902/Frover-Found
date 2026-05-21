export const required    = (v: string)  => !v.trim() ? 'Required' : '';
export const positiveNum = (v: string)  => !v || Number(v) <= 0 ? 'Enter a value greater than 0' : '';
export const nonNegNum   = (v: string)  => v === '' || isNaN(Number(v)) || Number(v) < 0 ? 'Must be 0 or more' : '';

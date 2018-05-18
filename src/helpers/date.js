/**
 * Return the date shifted by the timezone offset
 * @param {Date} date Date to offset
 */
export function applyTimezoneOffset(date) {
  return new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000));
}

/**
 * Return the date shifted by the opposite of the timezone offset
 * @param {Date} date Date to offset
 */
export function revertTimezoneOffset(date) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
}

// Single source of truth for event category & department vocabularies.
// Server canonical codes: server/src/utils/branches.js — keep the two in sync.

export const EVENT_CATEGORIES = ['Technical', 'Workshop', 'Cultural', 'Seminar', 'Sports'];

export const CATEGORY_FILTERS = ['All', ...EVENT_CATEGORIES];

export const EVENT_DEPARTMENTS = [
  { name: 'Computer Science & Engineering', code: 'CSE' },
  { name: 'Information Science & Engineering', code: 'ISE' },
  { name: 'Electronics & Communication Engineering', code: 'ECE' },
  { name: 'Electrical & Electronics Engineering', code: 'EEE' },
  { name: 'Artificial Intelligence & Machine Learning', code: 'AIML' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Civil Engineering', code: 'CV' },
  { name: 'Cultural Troupe & Fine Arts', code: 'CUL' },
  { name: 'Physical Education & Athletics', code: 'PED' },
];

export const DEPARTMENT_FILTERS = [{ name: 'All Departments', code: 'All' }, ...EVENT_DEPARTMENTS];

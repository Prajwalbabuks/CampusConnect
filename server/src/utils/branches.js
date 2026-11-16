// Canonical branch/department registry.
// Client equivalent: client/src/services/catalog.js — keep the codes in sync.
export const BRANCHES = [
  { code: 'CSE', name: 'Computer Science & Engineering', aliases: ['CS'] },
  { code: 'ISE', name: 'Information Science & Engineering', aliases: ['IS'] },
  { code: 'ECE', name: 'Electronics & Communication Engineering', aliases: ['EC'] },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', aliases: ['EE'] },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', aliases: ['AI'] },
  { code: 'ME', name: 'Mechanical Engineering', aliases: [] },
  { code: 'CV', name: 'Civil Engineering', aliases: [] },
];

// Normalize any known alias (EC, CS, AI, …) to its canonical code.
// Unknown codes pass through unchanged so non-branch departments (CUL, PED, …) survive.
export function canonicalBranchCode(code) {
  if (!code) return null;
  const clean = String(code).trim().toUpperCase();
  const found = BRANCHES.find((b) => b.code === clean || b.aliases.includes(clean));
  return found ? found.code : clean;
}

export function branchName(code) {
  const found = BRANCHES.find((b) => b.code === canonicalBranchCode(code));
  return found ? found.name : null;
}

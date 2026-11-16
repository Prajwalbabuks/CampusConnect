import { BRANCHES, branchName } from './branches.js';

// Derives a student's department/batch/section from the institutional email format:
//   <year><branchcode>_<name>_<section>@nie.ac.in   e.g. 2024cs_arun_a@nie.ac.in
// NOTE: This intentionally does NOT generate a USN. USNs must be supplied by the
// student (or loaded from institutional data) — random/fixed fallback USNs caused
// unique-index collisions between unrelated accounts.
export function parseStudentEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  const prefix = cleanEmail.split('@')[0];
  const parts = prefix.split('_');

  let name = '';
  let branchCode = 'CSE';
  let batch = '2024';
  let section = 'A';

  if (parts.length >= 3) {
    const batchBranch = parts[0];
    const matchYear = batchBranch.match(/\d{4}/);
    if (matchYear) batch = matchYear[0];

    const lower = batchBranch.toLowerCase();
    const match = BRANCHES.find((b) =>
      [b.code, ...b.aliases].some((c) => lower.includes(c.toLowerCase()))
    );
    if (match) branchCode = match.code;

    const nameTokens = parts.slice(1, -1).map((p) => p.charAt(0).toUpperCase() + p.slice(1));
    name = nameTokens.join(' ');
    section = parts[parts.length - 1].toUpperCase();
  }

  return {
    derivedName: name,
    department: branchName(branchCode) || 'Computer Science & Engineering',
    departmentCode: branchCode,
    batch,
    section: `Section ${section}`,
  };
}

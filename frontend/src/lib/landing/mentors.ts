export type LandingMentor = { name: string; role: string };

export const LANDING_MENTORS: LandingMentor[] = [
  { name: "jar", role: "Mentor Web Development" },
  { name: "zapp", role: "Mentor Machine Learning" },
  { name: "naf", role: "Mentor Open Source" },
  { name: "jar", role: "Mentor Open Source" },
];

export function mentorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

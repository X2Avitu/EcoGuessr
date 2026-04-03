export type DirtySpot = {
  id: string;
  title: string;
  description: string;
  severity: "small" | "medium" | "large";
  lat: number;
  lng: number;
  supplies: string[];
  estimatedPeople: number;
  estimatedMinutes: number;
  reportedBy: string;
  reportedAt: string;
  photoUrl?: string;
  status: "active" | "cleaning" | "resolved";
};

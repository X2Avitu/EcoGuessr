"use server";

import { randomBytes } from "node:crypto";
import { encodedRedirect } from "@/utils/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import type { Party } from "@/types/party";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  addUser,
  consumePasswordResetToken,
  findUserByEmail,
  setPasswordResetToken,
  updateUserPassword,
} from "@/lib/auth/users-store";
import {
  createSessionToken,
  getSession,
  getSessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";
import type { DirtySpot } from "@/types/dirty-spot";

export type { DirtySpot };

export async function signUpAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !name || !password) {
    return encodedRedirect("error", "/sign-up", "Email, name, and password are required.");
  }
  if (password.length < 8) {
    return encodedRedirect("error", "/sign-up", "Password must be at least 8 characters.");
  }

  try {
    const { salt, hash } = hashPassword(password);
    await addUser({
      email,
      name,
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_IN_USE") {
      return encodedRedirect("error", "/sign-up", "That email is already registered.");
    }
    console.error(e);
    return encodedRedirect("error", "/sign-up", "Could not create account. Try again.");
  }

  return encodedRedirect(
    "success",
    "/sign-in",
    "Account created. Sign in with your email and password.",
  );
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return encodedRedirect("error", "/sign-in", "Email and password are required.");
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return encodedRedirect("error", "/sign-in", "Invalid email or password.");
  }

  const token = createSessionToken(user.email, user.name);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions());

  redirect("/protected/map");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/home");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required.");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return encodedRedirect(
      "success",
      "/forgot-password",
      "If an account exists for that email, a reset link has been sent.",
    );
  }

  const token = randomBytes(32).toString("hex");
  await setPasswordResetToken(email, token, 60 * 60 * 1000);

  const sent = await sendPasswordResetEmail(user.email, token);

  if (!sent.ok) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      sent.error ?? "Could not send email. Configure RESEND_API_KEY or try later.",
    );
  }

  if (sent.devLink) {
    return encodedRedirect(
      "success",
      "/forgot-password",
      `DEV: reset link ${sent.devLink}`,
    );
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
}

function redirectResetWithToken(token: string, message: string) {
  redirect(
    `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`,
  );
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const token = formData.get("token")?.toString().trim();

  if (!password || !confirmPassword) {
    if (token) redirectResetWithToken(token, "Password and confirm password are required.");
    return encodedRedirect("error", "/protected/reset-password", "Password and confirm password are required.");
  }
  if (password !== confirmPassword) {
    if (token) redirectResetWithToken(token, "Passwords do not match.");
    return encodedRedirect("error", "/protected/reset-password", "Passwords do not match.");
  }
  if (password.length < 8) {
    if (token) redirectResetWithToken(token, "Password must be at least 8 characters.");
    return encodedRedirect("error", "/protected/reset-password", "Password must be at least 8 characters.");
  }

  let email: string | null = null;

  if (token) {
    email = await consumePasswordResetToken(token);
    if (!email) {
      return encodedRedirect(
        "error",
        "/forgot-password",
        "This reset link is invalid or expired. Request a new one.",
      );
    }
  } else {
    const session = await getSession();
    if (!session) {
      return encodedRedirect("error", "/sign-in", "Sign in to change your password.");
    }
    email = session.email;
  }

  const { salt, hash } = hashPassword(password);
  const ok = await updateUserPassword(email!, salt, hash);
  if (!ok) {
    return encodedRedirect("error", "/sign-in", "Account not found.");
  }

  if (token) {
    return encodedRedirect("success", "/sign-in", "Password updated. Sign in with your new password.");
  }
  return encodedRedirect(
    "success",
    "/protected/reset-password",
    "Password updated.",
  );
}

export type Squad = {
  id: string;
  name: string;
  neighborhood: string;
  members: number;
  streak: number;
  totalKg: number;
  color: string;
};

let mockSpots: DirtySpot[] = [
  { id: "s1", title: "Illegal dumping on Bovaird Dr E", description: "Large pile of construction debris and household trash scattered near the underpass.", severity: "large", lat: 43.7315, lng: -79.7624, supplies: ["Heavy duty bags", "Gloves", "Wheelbarrow", "Shovels"], estimatedPeople: 4, estimatedMinutes: 90, reportedBy: "user_1", reportedAt: "2024-05-14T10:00:00Z", status: "active" },
  { id: "s2", title: "Litter along Chinguacousy Trail", description: "Food wrappers, bottles, and general litter blown into the trail bushes.", severity: "medium", lat: 43.6841, lng: -79.7599, supplies: ["3 bags", "Gloves", "Grabbers"], estimatedPeople: 2, estimatedMinutes: 45, reportedBy: "user_2", reportedAt: "2024-05-14T11:30:00Z", status: "active" },
  { id: "s3", title: "Coffee cups at Gage Park", description: "A few scattered coffee cups and napkins near the gazebo.", severity: "small", lat: 43.6858, lng: -79.7599, supplies: ["1 bag", "Gloves"], estimatedPeople: 1, estimatedMinutes: 15, reportedBy: "user_3", reportedAt: "2024-05-14T12:00:00Z", status: "active" },
  { id: "s4", title: "Shopping cart & bags in Etobicoke Creek", description: "Abandoned shopping cart filled with plastic bags near the water edge.", severity: "large", lat: 43.6925, lng: -79.7424, supplies: ["Waders", "Ropes", "Heavy duty bags", "Gloves"], estimatedPeople: 3, estimatedMinutes: 60, reportedBy: "user_1", reportedAt: "2024-05-13T14:20:00Z", status: "active" },
  { id: "s5", title: "Windblown trash on Ray Lawson", description: "Cardboard and plastic accumulated against the fence line.", severity: "medium", lat: 43.6558, lng: -79.7369, supplies: ["2 bags", "Gloves", "Grabbers"], estimatedPeople: 2, estimatedMinutes: 40, reportedBy: "user_4", reportedAt: "2024-05-12T09:10:00Z", status: "active" },
  { id: "s6", title: "Fast food wrappers near Sheridan", description: "Scattered lunch debris across the sidewalk and grass.", severity: "small", lat: 43.6565, lng: -79.7388, supplies: ["1 bag", "Gloves"], estimatedPeople: 1, estimatedMinutes: 20, reportedBy: "user_5", reportedAt: "2024-05-14T13:45:00Z", status: "active" },
  { id: "s7", title: "Mattress dump on Steeles", description: "Old mattress and broken furniture dumped on the shoulder.", severity: "large", lat: 43.6264, lng: -79.7460, supplies: ["Truck/Van", "Work gloves", "2 strong people"], estimatedPeople: 2, estimatedMinutes: 30, reportedBy: "user_2", reportedAt: "2024-05-13T18:00:00Z", status: "active" },
  { id: "s8", title: "Park garbage overflow, Loafer's Lake", description: "Bins overflowing, creating a huge mess around the picnic area.", severity: "medium", lat: 43.7259, lng: -79.7915, supplies: ["4 large bags", "Gloves", "Grabbers"], estimatedPeople: 3, estimatedMinutes: 45, reportedBy: "user_6", reportedAt: "2024-05-14T08:00:00Z", status: "active" },
  { id: "s9", title: "Bottles smashed in parking lot", description: "Broken glass scattered across South Fletchers parking lot.", severity: "small", lat: 43.6548, lng: -79.7562, supplies: ["Broom", "Dustpan", "1 thick bag"], estimatedPeople: 1, estimatedMinutes: 25, reportedBy: "user_7", reportedAt: "2024-05-14T15:00:00Z", status: "active" },
  { id: "s10", title: "Illegal tire dump", description: "Around 10 old tires dumped near the industrial park.", severity: "large", lat: 43.7371, lng: -79.6918, supplies: ["Truck", "Heavy gloves"], estimatedPeople: 2, estimatedMinutes: 45, reportedBy: "user_8", reportedAt: "2024-05-11T11:00:00Z", status: "active" },
  { id: "s11", title: "Scattered paper in downtown alley", description: "Looks like a recycling bin blew over. Papers everywhere.", severity: "small", lat: 43.6872, lng: -79.7615, supplies: ["1 bag", "Gloves"], estimatedPeople: 1, estimatedMinutes: 15, reportedBy: "user_1", reportedAt: "2024-05-14T07:30:00Z", status: "active" },
  { id: "s12", title: "Bus stop litter accumulation", description: "High traffic bus stop with cups, wrappers and masks everywhere.", severity: "medium", lat: 43.7112, lng: -79.7544, supplies: ["2 bags", "Gloves", "Grabbers"], estimatedPeople: 1, estimatedMinutes: 35, reportedBy: "user_3", reportedAt: "2024-05-13T16:20:00Z", status: "active" },
  { id: "s13", title: "Pallet debris in field", description: "Smashed wooden pallets posing a hazard in the open green space.", severity: "medium", lat: 43.7468, lng: -79.7214, supplies: ["Work gloves", "3 heavy duty bags"], estimatedPeople: 2, estimatedMinutes: 50, reportedBy: "user_4", reportedAt: "2024-05-14T09:15:00Z", status: "active" },
  { id: "s14", title: "Abandoned encampment mess", description: "Old tents, sleeping bags, and significant trash left behind.", severity: "large", lat: 43.6811, lng: -79.7711, supplies: ["Hazmat/thick gloves", "10 bags", "Rakes", "Grabbers"], estimatedPeople: 5, estimatedMinutes: 120, reportedBy: "user_2", reportedAt: "2024-05-12T14:40:00Z", status: "active" },
  { id: "s15", title: "Receipts and plastic near ATM", description: "Small localized pile of banking receipts and some plastic cups.", severity: "small", lat: 43.6850, lng: -79.7555, supplies: ["1 bag"], estimatedPeople: 1, estimatedMinutes: 10, reportedBy: "user_5", reportedAt: "2024-05-14T11:05:00Z", status: "active" },
];

let mockSquads: Squad[] = [
  { id: "sq1", name: "Brampton Cleaners", neighborhood: "Downtown", members: 8, streak: 5, totalKg: 420.5, color: "#B8FF3C" },
  { id: "sq2", name: "The 905 Crew", neighborhood: "Springdale", members: 12, streak: 14, totalKg: 1205.0, color: "#FF3C7A" },
  { id: "sq3", name: "FlowerCity Force", neighborhood: "Heart Lake", members: 5, streak: 2, totalKg: 185.2, color: "#3C93FF" },
  { id: "sq4", name: "Peel Street Team", neighborhood: "Bramalea", members: 6, streak: 8, totalKg: 650.8, color: "#FFB03C" },
];

export async function getDirtySpots() {
  return mockSpots;
}

export async function getSquads() {
  return mockSquads;
}

export async function getProfile() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return {
    id: session.email,
    username: session.email.split("@")[0] ?? "user",
    email: session.email,
    display_name: session.name,
    public_profile_image: "",
    joinedParties: [] as string[],
  };
}

export const getGoogleAccountInfo = async () => null;

export async function joinPartyWithID(partyId: string) {
  void partyId;
  return { success: true as const, alreadyJoined: false };
}

export async function createParty(data: {
  name: string;
  description: string;
  lat: number;
  lng: number;
}): Promise<Party> {
  const session = await getSession();
  const colors = ["#f43f5e", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    lat: data.lat,
    lng: data.lng,
    attendees: 1,
    color: randomColor,
    createdAt: new Date().toISOString(),
    user: session?.email ?? null,
  };
}

export async function confirmTrashSpot(spot: DirtySpot) {
  const session = await getSession();
  const by = session?.email ?? "anonymous";
  const enriched: DirtySpot = {
    ...spot,
    reportedBy: by,
    reportedAt: new Date().toISOString(),
  };
  mockSpots = [enriched, ...mockSpots];
  return enriched;
}

export async function submit311Report(spotId: string) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { success: true, message: "Auto-reported to Brampton 311 ✓", spotId };
}

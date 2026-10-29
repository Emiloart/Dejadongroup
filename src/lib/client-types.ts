export const processStatuses = ["pending", "processing", "completed"] as const;
export const withdrawalStatuses = ["pending", "processing", "successful"] as const;

export type ClientProcess = {
  id: string;
  title: string;
  detail: string;
  status: (typeof processStatuses)[number];
};

export type ClientWithdrawal = {
  id: string;
  amount: number;
  date: string;
  reference: string;
  note: string;
  status: (typeof withdrawalStatuses)[number];
};

export type ClientDetails = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  verified: boolean;
  propertyName: string;
  propertyLocation: string;
  propertyReference: string;
  investmentName: string;
  investmentDetails: string;
  investmentProgress: number;
  actualDateLabel: string;
  actualDate: string;
  balance: number | null;
  processes: ClientProcess[];
  withdrawals: ClientWithdrawal[];
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
};

export type AdminClient = ClientDetails & {
  tokenStatus: "not-issued" | "issued" | "expired" | "used";
  tokenExpiresAt: string | null;
};

export function clientMoney(value: number | null) {
  return value === null ? "Not provided" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value);
}

export function clientDate(value: string) {
  return value ? new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", { timeZone: "Africa/Casablanca", year: "numeric", month: "short", day: "numeric" }) : "Not provided";
}

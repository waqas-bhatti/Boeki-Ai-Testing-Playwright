export const TestData = {
  user: {
    firstName: "Akeem",
    lastName: "Duncan",
    email: `test_${Date.now()}@mailinator.com`,
    password: "Asdf@12345",
  },
  companies: [
    "Paper for Paper B.V.",
    "Paper Crown",
    "Paper Solutions",
    "Paper Story",
  ],

  manualCompany: {
    companyName: `Automation ${Date.now()}`,
    street: "Main Street 10",
    postalCode: "1011AB",
    city: "Amsterdam",
    country: "Netherlands",
    vat: "",
  },
  exactOnline: {
    email: "kvq3xlg7t1+13@gmail.com",
    password: "i^TL;cpGU-aR7NfT",
  },
  integration: {
    name: "e-Boekhouden.nl",
    apiKey: "QLF2tdGaGVZOpkiGMt_B2IMwAzRnEVDZl5rjORpICCFSFQxU2F",
  },
  payment: {
    email: "f9fmp8yzyl@ozsaip.com",
    cardNumber: "4242 4242 4242 4242",
    expiry: "11/33",
    cvc: "424",
    cardholderName: "zeeshan",
    country: "Netherlands",
  },
};

export const LoginData = {
  email: "cahucitoqu@mailinator.com",

  password: "Pa$$w0rd!",
};

// Small local random-data helper — no external dependency (like
// faker) needed for this. Picks from a fixed pool each run so names
// are realistic-looking but still randomized.

const FIRST_NAMES = [
  "Stewart",
  "Emma",
  "Liam",
  "Sophie",
  "Daan",
  "Mila",
  "Noah",
  "Anna",
  "Lucas",
  "Julia",
];

const LAST_NAMES = [
  "Turner",
  "Jansen",
  "de Vries",
  "Bakker",
  "Visser",
  "Smit",
  "Meijer",
  "Mulder",
  "de Boer",
  "Peters",
];

function pickRandom(list: string[]): string {
  const randomIndex = Math.floor(Math.random() * list.length);
  const value = list[randomIndex];

  if (value === undefined) {
    throw new Error("Random selection returned undefined.");
  }

  return value;
}

export function randomFirstName(): string {
  return pickRandom(FIRST_NAMES);
}

export function randomLastName(): string {
  return pickRandom(LAST_NAMES);
}

const COUNTRIES = ["Netherlands", "Belgium", "Germany", "France"];

export function randomCountry(): string {
  return pickRandom(COUNTRIES);
}

/** Generates a plausible-looking Dutch mobile number, randomized. */
export function randomPhoneNumber(): string {
  const digits = Math.floor(10000000 + Math.random() * 89999999);
  return `+31 6 ${digits}`;
}
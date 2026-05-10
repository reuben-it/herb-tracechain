import { AuthUser } from "@/contexts/AuthContext";

// Mock Users
export const mockUsers: Record<string, { user: AuthUser; password: string }> = {
  "collector@example.com": {
    user: {
      id: "user-collector-001",
      email: "collector@example.com",
      role: "collector",
      name: "John Collector",
    },
    password: "password",
  },
  "processor@example.com": {
    user: {
      id: "user-processor-001",
      email: "processor@example.com",
      role: "processor",
      name: "Jane Processor",
    },
    password: "password",
  },
  "admin@example.com": {
    user: {
      id: "user-admin-001",
      email: "admin@example.com",
      role: "admin",
      name: "Admin User",
    },
    password: "password",
  },
};

// Mock Herbs
export const mockHerbs = [
  {
    id: "herb-001",
    name: "Basil",
    species: "Ocimum basilicum",
    harvestDate: "2026-05-01",
    status: "VERIFIED",
    location: "Field A",
    collectorEmail: "collector@example.com",
    processorEmail: "processor@example.com",
    ethereumHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    verificationStatus: "verified" as const,
    notes: "High quality basil, organically grown",
    timeline: [
      {
        stage: "HARVESTED" as const,
        timestamp: "2026-05-01T08:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "PROCESSED" as const,
        timestamp: "2026-05-02T10:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "PACKAGED" as const,
        timestamp: "2026-05-03T14:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "DISTRIBUTED" as const,
        timestamp: "2026-05-04T09:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "VERIFIED" as const,
        timestamp: "2026-05-05T11:00:00Z",
        status: "completed" as const,
      },
    ],
  },
  {
    id: "herb-002",
    name: "Oregano",
    species: "Origanum vulgare",
    harvestDate: "2026-05-02",
    status: "DISTRIBUTED",
    location: "Field B",
    collectorEmail: "collector@example.com",
    processorEmail: "processor@example.com",
    ethereumHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    verificationStatus: "pending" as const,
    notes: "Dried oregano, ready for distribution",
    timeline: [
      {
        stage: "HARVESTED" as const,
        timestamp: "2026-05-02T08:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "PROCESSED" as const,
        timestamp: "2026-05-03T10:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "PACKAGED" as const,
        timestamp: "2026-05-04T14:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "DISTRIBUTED" as const,
        timestamp: "2026-05-05T09:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "VERIFIED" as const,
        timestamp: "2026-05-06T11:00:00Z",
        status: "future" as const,
      },
    ],
  },
  {
    id: "herb-003",
    name: "Thyme",
    species: "Thymus vulgaris",
    harvestDate: "2026-05-03",
    status: "PACKAGED",
    location: "Field C",
    collectorEmail: "collector@example.com",
    processorEmail: "processor@example.com",
    ethereumHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    verificationStatus: "pending" as const,
    notes: "Fresh thyme, packaged for shipment",
    timeline: [
      {
        stage: "HARVESTED" as const,
        timestamp: "2026-05-03T08:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "PROCESSED" as const,
        timestamp: "2026-05-04T10:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "PACKAGED" as const,
        timestamp: "2026-05-05T14:00:00Z",
        status: "current" as const,
      },
      {
        stage: "DISTRIBUTED" as const,
        timestamp: "2026-05-06T09:00:00Z",
        status: "future" as const,
      },
      {
        stage: "VERIFIED" as const,
        timestamp: "2026-05-07T11:00:00Z",
        status: "future" as const,
      },
    ],
  },
  {
    id: "herb-004",
    name: "Rosemary",
    species: "Rosmarinus officinalis",
    harvestDate: "2026-05-04",
    status: "PROCESSED",
    location: "Field D",
    collectorEmail: "collector@example.com",
    ethereumHash: "0xabcdef567890abcdef567890abcdef567890abcdef567890abcdef567890abcd",
    verificationStatus: "pending" as const,
    notes: "Rosemary in processing stage",
    timeline: [
      {
        stage: "HARVESTED" as const,
        timestamp: "2026-05-04T08:00:00Z",
        status: "completed" as const,
      },
      {
        stage: "PROCESSED" as const,
        timestamp: "2026-05-05T10:00:00Z",
        status: "current" as const,
      },
      {
        stage: "PACKAGED" as const,
        timestamp: "2026-05-06T14:00:00Z",
        status: "future" as const,
      },
      {
        stage: "DISTRIBUTED" as const,
        timestamp: "2026-05-07T09:00:00Z",
        status: "future" as const,
      },
      {
        stage: "VERIFIED" as const,
        timestamp: "2026-05-08T11:00:00Z",
        status: "future" as const,
      },
    ],
  },
  {
    id: "herb-005",
    name: "Mint",
    species: "Mentha piperita",
    harvestDate: "2026-05-05",
    status: "HARVESTED",
    location: "Field E",
    collectorEmail: "collector@example.com",
    ethereumHash: "0x890abcdef890abcdef890abcdef890abcdef890abcdef890abcdef890abcdef8",
    verificationStatus: "pending" as const,
    notes: "Fresh mint, just harvested",
    timeline: [
      {
        stage: "HARVESTED" as const,
        timestamp: "2026-05-05T08:00:00Z",
        status: "current" as const,
      },
      {
        stage: "PROCESSED" as const,
        timestamp: "2026-05-06T10:00:00Z",
        status: "future" as const,
      },
      {
        stage: "PACKAGED" as const,
        timestamp: "2026-05-07T14:00:00Z",
        status: "future" as const,
      },
      {
        stage: "DISTRIBUTED" as const,
        timestamp: "2026-05-08T09:00:00Z",
        status: "future" as const,
      },
      {
        stage: "VERIFIED" as const,
        timestamp: "2026-05-09T11:00:00Z",
        status: "future" as const,
      },
    ],
  },
];

// Generate mock JWT token
export function generateMockToken(userId: string): string {
  return `mock-jwt-token-${userId}-${Date.now()}`;
}

// Simulate API delay
export function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

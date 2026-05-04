export interface SupplierMaster {
  supplier_id: string;
  canonical_name: string;
  aliases: string[];
  status: 'active' | 'inactive';
}

export const supplierMaster: SupplierMaster[] = [
  { 
    supplier_id: "let'sgo", 
    canonical_name: "Let's Go (Zego)", 
    aliases: ["zego", "ซีโก้", "let's go", "lets go", "let go", "let' go", "letgo", "เล็ทโก", "เลทโก", "เล็ทส์โก"], 
    status: "active" 
  },
  { 
    supplier_id: "go365", 
    canonical_name: "Go365", 
    aliases: ["go365", "โก365", "go 365", "go-365"], 
    status: "active" 
  },
  { 
    supplier_id: "checkingroup", 
    canonical_name: "Check in Group", 
    aliases: ["checkin", "check in group", "เช็คอิน", "เชคอิน", "check-in"], 
    status: "active" 
  },
  { 
    supplier_id: "tourfactory", 
    canonical_name: "Tour Factory", 
    aliases: ["tour factory", "tourfactory", "ทัวร์แฟคทอรี่", "ทัวร์แฟคทอรี"], 
    status: "active" 
  }
];

export function getSupplierByAlias(alias: string): SupplierMaster | null {
  const normalizedAlias = alias.toLowerCase().trim();
  return supplierMaster.find(s => 
    s.aliases.some(a => a.toLowerCase() === normalizedAlias) || 
    s.canonical_name.toLowerCase() === normalizedAlias
  ) || null;
}

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const additionalModels = `

// ============================================
// AI Center Models (Phase 1 Additions)
// ============================================

model AiReviewQueue {
  id               String   @id @default(cuid())
  type             String   // price_check, link_check, supplier_check
  description      String
  payload          Json
  status           String   @default("pending") // pending, resolved
  resolvedById     String?
  createdAt        DateTime @default(now())

  @@map("ai_review_queue")
}

model AiCostLog {
  id               String   @id @default(cuid())
  model            String
  inputTokens      Int
  outputTokens     Int
  totalCostUsd     Float
  feature          String   // chat, search, vision, private_group
  createdAt        DateTime @default(now())

  @@map("ai_cost_logs")
}

model AiModelSetting {
  id               String   @id @default(cuid())
  feature          String   @unique // chat, search, vision, general
  model            String
  temperature      Float    @default(0.7)
  maxTokens        Int      @default(2048)
  isActive         Boolean  @default(true)
  updatedAt        DateTime @updatedAt

  @@map("ai_model_settings")
}

model AiGuardrail {
  id               String   @id @default(cuid())
  ruleName         String   @unique
  description      String?
  isActive         Boolean  @default(true)
  severity         String   @default("high") // high, medium, low
  updatedAt        DateTime @updatedAt

  @@map("ai_guardrails")
}
`;

fs.writeFileSync(schemaPath, schemaContent + additionalModels);
console.log("Successfully appended AI Center Phase 1 models to schema.prisma");

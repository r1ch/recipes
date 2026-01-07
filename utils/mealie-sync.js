import fs from "fs";
import YAML from "yaml";
import fetch from "node-fetch";

const {
  MEALIE_BASE_URL,
  MEALIE_API_KEY,
  YAML_PATH = "index.yml"
} = process.env;

if (!MEALIE_BASE_URL || !MEALIE_API_KEY) {
  throw new Error("Missing MEALIE_BASE_URL or MEALIE_API_KEY");
}

const headers = {
  Authorization: `Bearer ${MEALIE_API_KEY}`,
  "Content-Type": "application/json"
};

/**
 * Date helpers
 */
const today = new Date();
const endDate = new Date();
endDate.setDate(today.getDate() + 6);

const formatDate = d => d.toISOString().slice(0, 10);

const start = formatDate(today);
const end = formatDate(endDate);

/**
 * Load existing YAML (if it exists)
 */
let existing = [];
if (fs.existsSync(YAML_PATH)) {
  const raw = fs.readFileSync(YAML_PATH, "utf8");
  existing = YAML.parse(raw) ?? [];
}

/**
 * Index existing entries by date
 * NOTE: assumes one dinner per day
 */
const existingByDate = Object.fromEntries(
  existing.map(e => [e.date, e])
);

/**
 * Fetch meal plan entries (server-side filtered to dinner)
 */
const mealPlanRes = await fetch(
  `${MEALIE_BASE_URL}/api/households/mealplans` +
    `?start_date=${start}` +
    `&end_date=${end}` +
    `&per_page=50` +
    `&queryFilter=entryType%3Ddinner`,
  { headers }
);

if (!mealPlanRes.ok) {
  const text = await mealPlanRes.text();
  throw new Error(`Failed to fetch meal plan: ${text}`);
}

const mealPlanResponse = await mealPlanRes.json();
const items = mealPlanResponse.items ?? [];

if (!Array.isArray(items)) {
  throw new Error("Unexpected meal plan response shape");
}

const results = [];

/**
 * Process dinner entries
 */
for (const item of items) {
  if (!item.recipe) continue; // defensive

  const date = item.date;
  const title = item.recipe.name;

  // Reuse existing entry if present
  if (existingByDate[date]) {
    results.push(existingByDate[date]);
    continue;
  }

  // Generate a shared recipe link (valid for 14 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const shareRes = await fetch(
    `${MEALIE_BASE_URL}/api/shared/recipes`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        recipeId: item.recipe.id,
        expiresAt: expiresAt.toISOString()
      })
    }
  );

  if (!shareRes.ok) {
    const text = await shareRes.text();
    throw new Error(`Failed to share recipe "${title}": ${text}`);
  }

  const share = await shareRes.json();
  
  if (!share?.id) {
    throw new Error(`Share response missing id for recipe "${title}"`);
  }
  
  const link = `${MEALIE_BASE_URL}/g/home/shared/r/${share.id}`;
  
  results.push({
    date,
    title,
    link
  });
}

/**
 * Sort results by date
 */
results.sort((a, b) => a.date.localeCompare(b.date));

/**
 * Write YAML output
 */
fs.writeFileSync(
  YAML_PATH,
  `---
layout: mealie
---
${YAML.stringify(results)}`,
  "utf8"
);

console.log(`Updated ${YAML_PATH} with ${results.length} dinner recipes`);

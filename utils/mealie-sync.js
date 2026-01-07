import fs from "fs";
import YAML from "yaml";
import fetch from "node-fetch";

const {
  MEALIE_BASE_URL,
  MEALIE_API_KEY,
  YAML_PATH = "weekly-dinners.yml"
} = process.env;

if (!MEALIE_BASE_URL || !MEALIE_API_KEY) {
  throw new Error("Missing MEALIE_BASE_URL or MEALIE_API_KEY");
}

const headers = {
  "Authorization": `Bearer ${MEALIE_API_KEY}`,
  "Content-Type": "application/json"
};

const today = new Date();
const inSevenDays = new Date();
inSevenDays.setDate(today.getDate() + 6);

const formatDate = d => d.toISOString().slice(0, 10);

const start = formatDate(today);
const end = formatDate(inSevenDays);

// Load existing YAML (if any)
let existing = [];
if (fs.existsSync(YAML_PATH)) {
  existing = YAML.parse(fs.readFileSync(YAML_PATH, "utf8")) ?? [];
}

// Index by date for fast lookup
const existingByDate = Object.fromEntries(
  existing.map(e => [e.date, e])
);

// Fetch meal plan
const mealPlanRes = await fetch(
  `${MEALIE_BASE_URL}/api/meal-plans?start_date=${start}&end_date=${end}`,
  { headers }
);

if (!mealPlanRes.ok) {
  throw new Error("Failed to fetch meal plan");
}

const mealPlan = await mealPlanRes.json();

const results = [];

for (const day of mealPlan) {
  for (const entry of day.entries ?? []) {
    if (entry.entryType !== "Dinner" || !entry.recipe) continue;

    const date = day.date;
    const title = entry.recipe.name;

    // Reuse existing
    if (existingByDate[date]) {
      results.push(existingByDate[date]);
      continue;
    }

    // Generate share link
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const shareRes = await fetch(
      `${MEALIE_BASE_URL}/api/recipes/${entry.recipe.id}/share`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          expiresAt: expiresAt.toISOString()
        })
      }
    );

    if (!shareRes.ok) {
      throw new Error(`Failed to share recipe: ${title}`);
    }

    const share = await shareRes.json();

    results.push({
      date,
      title,
      link: share.url
    });
  }
}

// Sort by date
results.sort((a, b) => a.date.localeCompare(b.date));

// Write YAML
fs.writeFileSync(
  YAML_PATH,
  YAML.stringify(results),
  "utf8"
);

console.log(`Updated ${YAML_PATH}`);

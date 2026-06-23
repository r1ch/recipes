import fs from "fs";
import YAML from "yaml";
import fetch from "node-fetch";

const {
  MEALIE_BASE_URL,
  MEALIE_API_KEY,
  YAML_PATH = "_data/mealie.yml"
} = process.env;

if (!MEALIE_BASE_URL || !MEALIE_API_KEY) {
  throw new Error("Missing MEALIE_BASE_URL or MEALIE_API_KEY");
}

const headers = {
  Authorization: `Bearer ${MEALIE_API_KEY}`,
  "Content-Type": "application/json"
};

/**
 * Extract protein category from recipe metadata
 */
function extractProtein(recipe) {
  const title = (recipe.name || "").toLowerCase();
  const description = (recipe.description || "").toLowerCase();
  
  const tags = (recipe.tags || []).map(t => (typeof t === "object" ? t.name : t).toLowerCase());
  const categories = (recipe.recipeCategory || []).map(c => (typeof c === "object" ? c.name : c).toLowerCase());

  const proteinMap = {
    Chicken: ["chicken", "poultry", "turkey", "duck"],
    Beef: ["beef", "steak", "mince"],
    Pork: ["pork", "ham", "chorizo", "bacon", "gammon"],
    "Fish/Seafood": ["salmon", "trout", "fish", "tuna", "prawn", "seafood", "cod", "haddock", "sea bass", "sea-bass"],
    Lamb: ["lamb"]
  };

  for (const [protein, keywords] of Object.entries(proteinMap)) {
    for (const keyword of keywords) {
      if ([title, ...tags, ...categories].some(src => src.includes(keyword))) {
        return protein;
      }
    }
  }

  // Fallback to checking description
  for (const [protein, keywords] of Object.entries(proteinMap)) {
    for (const keyword of keywords) {
      if (description.includes(keyword)) {
        return protein;
      }
    }
  }

  return "";
}

/**
 * Load existing YAML (index by recipe ID for quick lookups)
 */
let existingRecipes = [];
if (fs.existsSync(YAML_PATH)) {
  const raw = fs.readFileSync(YAML_PATH, "utf8");
  existingRecipes = YAML.parse(raw) ?? [];
}
const existingById = Object.fromEntries(existingRecipes.map(r => [r.id, r]));

/**
 * Fetch ALL recipes from Mealie
 */
const recipesRes = await fetch(
  `${MEALIE_BASE_URL}/api/recipes?per_page=500`, // Adjust per_page if you have more recipes
  { headers }
);

if (!recipesRes.ok) {
  const text = await recipesRes.text();
  throw new Error(`Failed to fetch recipes: ${text}`);
}

const recipesData = await recipesRes.json();
const allRecipes = recipesData.items ?? [];

const results = [];
const today = new Date();

/**
 * Process all recipes
 */
for (const recipe of allRecipes) {
  const recipeId = recipe.id;
  const title = recipe.name;
  const protein = extractProtein(recipe);
  
  let existingEntry = existingById[recipeId];
  let needsNewLink = true;

  if (existingEntry && existingEntry.link && existingEntry.createdAt) {
    const createdDate = new Date(existingEntry.createdAt);
    
    // Max validity is 30 days. Let's see how many days are left.
    const maxExpiryDate = new Date(createdDate.getTime());
    maxExpiryDate.setDate(maxExpiryDate.getDate() + 30);
    
    const msLeft = maxExpiryDate.getTime() - today.getTime();
    const daysLeft = msLeft / (1000 * 60 * 60 * 24);

    // If the link is still valid for more than 7 days, reuse it
    if (daysLeft > 7) {
      existingEntry.protein = protein;
      results.push(existingEntry);
      needsNewLink = false;
    }
  }

  // Generate a new share link if needed
  if (needsNewLink) {
    // Set explicit expiry to 30 days on Mealie
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const shareRes = await fetch(
      `${MEALIE_BASE_URL}/api/shared/recipes`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          recipeId: recipeId,
          expiresAt: expiresAt.toISOString()
        })
      }
    );

    if (!shareRes.ok) {
      console.error(`Failed to share recipe "${title}": ${shareRes.statusText}`);
      // Fallback: If sharing fails, keep the old one temporarily if it exists
      if (existingEntry) {
        existingEntry.protein = protein;
        results.push(existingEntry);
      }
      continue;
    }

    const share = await shareRes.json();
    
    if (share?.id) {
      const link = `/g/home/shared/r/${share.id}`;
      results.push({
        id: recipeId,
        title,
        link,
        protein,
        createdAt: today.toISOString().slice(0, 10) // YYYY-MM-DD
      });
    } else if (existingEntry) {
      existingEntry.protein = protein;
      results.push(existingEntry);
    }
  }
}

/**
 * Sort results alphabetically by title
 */
results.sort((a, b) => a.title.localeCompare(b.title));

/**
 * Write updated YAML output
 */
fs.writeFileSync(
  YAML_PATH,
  YAML.stringify(results),
  "utf8"
);

console.log(`Updated ${YAML_PATH} with ${results.length} total recipes`);

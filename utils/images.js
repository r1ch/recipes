const fs = require("fs");
const path = require("path");

// Input + Output directories
const inputDir = path.join(__dirname, "..", "_data");   // where your .json files are
const outputDir = path.join(__dirname, "..", "_recipes"); // where .md files will go

// Loop through JSON files
fs.readdirSync(inputDir).forEach(file => {
  if (path.extname(file) === ".json") {
    const filePath = path.join(inputDir, file);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Extract values from JSON (customize these based on your schema)
    const title = jsonData.name || path.basename(file, ".json");
    const slug = `${path.basename(file, ".json")}`
    

    // Jekyll front matter
    const frontMatter = `---
layout: "recipe"
title: ${title}
slug: ${slug}
---\n`;

    // Write to output directory
    const outFile = path.join(outputDir, `${slug}.md`);
    fs.writeFileSync(outFile, frontMatter, "utf8");

    console.log(`✅ Wrote ${outFile}`);
  }
});

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { arrayBuffer } = require("stream/consumers");

// Input + Output directories
const inputDir = path.join(__dirname, "..", "_data");   // where your .json files are
const outputDir = path.join(__dirname, "..", "_images"); // where img files will go

async function scrape(){
  fs.readdirSync(inputDir).forEach(async file => {
    if (path.extname(file) === ".json") {
      const filePath = path.join(inputDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Extract values from JSON (customize these based on your schema)
      const URL = `https://media.greenchef.com/w_640,q_auto,f_auto,c_fill,fl_lossy/hellofresh_s3/${jsonData.imagePath}`
      const slug = `${path.basename(file, ".json")}`

      const {data: imgData} = await axios.get(URL, {responseType:"arraybuffer"})

      console.log("Got",imgData.length,outputDir)

      // Write to output directory
      const outFile = path.join(outputDir, `${slug}.jpg`);
      fs.writeFileSync(outFile, imgData, "utf8");

    }
  })
}

scrape()

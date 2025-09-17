const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

//---

const recipe = "kofta-rogan-josh-curry-62a74447a274505d77010ec2"
const URL = `https://www.greenchef.co.uk/recipes/${recipe}`


async function scrape(URL){
	try {
		const {data: html} = await axios.get(URL)
		const $ = cheerio.load(html)

		const scriptTag = $("#__NEXT_DATA__").html()

		if(scriptTag){
			const jsonData = JSON.parse(scriptTag)
			const recipe = jsonData
			.props.pageProps.ssrPayload.dehydratedState.queries
			.find(q=>q.queryKey.includes("recipe.byId"))
			
			fs.writeFileSync("recipe.json", JSON.stringify(recipe,null,2),"utf-8")
		} else {
			console.error("No script tag")
		}

	} catch (err){
		console.error("Scrape error",err.message)
	}
}

scrape(URL)

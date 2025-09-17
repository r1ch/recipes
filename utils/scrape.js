const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

const recipes = [
	"kofta-rogan-josh-curry-62a74447a274505d77010ec2",
	"miso-glazed-salmon-60ed8af58452130fbf4e14b6"
]
const URL = recipe => `https://www.greenchef.co.uk/recipes/${recipe}`


async function scrape(recipe){
	try {
		if(fs.existsSync(`../_data/${recipe}.json`)){
			console.log("Already have",recipe)
			return "OK"
		}
		const {data: html} = await axios.get(URL(recipe))
		const $ = cheerio.load(html)

		const scriptTag = $("#__NEXT_DATA__").html()

		if(scriptTag){
			const jsonData = JSON.parse(scriptTag)
			const recipeData = jsonData
			.props.pageProps.ssrPayload.dehydratedState.queries
			.find(q=>q.queryKey.includes("recipe.byId"))
			?.state?.data
			
			fs.writeFileSync(`../_data/${recipe}.json`, JSON.stringify(recipeData,null,2),"utf-8")
			console.log("Wrote",recipe)
			return "OK"
		} else {
			console.error("No script tag")
			return "Error"
		}

	} catch (err){
		console.error("Scrape error",err.message)
		return "Error"
	}
}

Promise.all(recipes.map(r=>scrape(r)))
.then(console.log)

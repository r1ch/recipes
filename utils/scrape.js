const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

const recipes = [
	"kofta-rogan-josh-curry-62a74447a274505d77010ec2",
	"miso-glazed-salmon-60ed8af58452130fbf4e14b6",
	"spiced-beef-larb-in-lettuce-cups-66acefdf155ad8a42f33891a",
	"one-pot-prawn-chicken-and-chorizo-paella-689cc4001597ca633109c31a",
	"honey-harissa-glazed-chicken-68a33cb9da1c2cdbdf51258b",
	"serrano-topped-chicken-breast-68937b1c464ec79ed46ff6db",
	"pesto-baked-chicken-breast-6890ca1cb6ffa7a20c3ce8c0",
	"one-pan-smoky-chicken-and-chickpea-chana-saag-687e0d517299475a5b05d9f0",
	"lemon-and-herb-roasted-salmon-686bacb56abf1607dadcc1ef",
	"pan-fried-sea-bass-and-salsa-verde-681ca49d35963fcd98f3f0f5",
	"pesto-baked-salmon-and-oregano-butternut-squash-67d1b8ffe4321b3b6ef33a96",
	"lamb-steak-and-peppercorn-sauce-689cc40483f90c073abac57a",
	"lamb-steak-and-biryani-inspired-rice-6880dc467299475a5b062d94",
	"21-day-aged-rump-steak-and-chimichurri-sauce-6867921e700c002ea14ffae0",
	"sweet-and-spicy-beef-bowl-689cc40d1597ca633109c32a",
	"harissa-and-chermoula-spiced-beef-687622325a587f17f458dda9",
	"beef-chilli-con-carne-68874443637c1fda3ad8acdf",
	"beef-rogan-josh-68762236a5a49c635d8b254e"
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

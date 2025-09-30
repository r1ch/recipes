---
layout: none
---
const { createApp, ref, computed } = Vue
  import {recipes, ingredientsByRecipe} from './recipes.js?revision={{site.github.build_revision}}'
  const app = createApp({
      setup() {
        const queryParams = new URLSearchParams(window.location.search)
        const pickedRaw = queryParams.getAll('r')
        const picked = ref(Object.keys(recipes).filter(id=>pickedRaw.includes(id)))
        const thisWeekLink = computed(()=>{
          return `/thisweek.html?${picked.value.map(v=>`r=${v}`).join("&")}`
        })
        const pickedRecipes = computed(()=>picked.value.map(id=>recipes[id]))
        const shoppingList = computed(()=>picked.value.map(id=>ingredientsByRecipe[id]).reduce((a,c)=>{
            c.forEach(i=>{
                if(a[i.type] && a[i.type].unit == i.unit){
                    a[i.type].amount += Number(i.amount)
                } else {
                    a[i.type] = {...i}
                    a[i.type].amount = Number(a[i.type].amount)
                    a[i.type].recipes = new Set()
                }
              a[i.type].recipes.add(i.recipeId)
            })
            return a
        },{}))
        return {
          recipes,
          ingredientsByRecipe,
          picked,
          pickedRecipes,
          shoppingList,
          thisWeekLink
        }
      }
    })
  app.config.compilerOptions.delimiters = ['((', '))']
  app.mount('#app')

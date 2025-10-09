---
layout: none
---
const { createApp, ref, computed } = Vue
  import {recipes, ingredientsByRecipe} from './recipes.js?revision={{site.github.build_revision}}'
  import {thisWeek} from './thisweek.js?revision={{site.github.build_revision}}'
  const app = createApp({
      setup() {
        const queryParams = new URLSearchParams(window.location.search)
        const thisWeekPage = window.location.pathname.includes("thisweek")
        const loadedFromQuery = queryParams.getAll('r').length > 0
        const pickedRaw = thisWeekPage ? (loadedFromQuery ? queryParams.getAll('r') : thisWeek) : []
        const picked = ref(Object.keys(recipes).filter(id=>pickedRaw.includes(id)))
        const queryString = computed(()=>picked.value.map(v=>`r=${v}`).join("&"))
        const thisWeekLink = computed(()=>{
          return `/thisweek.html?${queryString.value}`
        })
        const saveLink = computed(()=>{
          return `https://script.google.com/a/macros/bradi.sh/s/AKfycbzLTeCpe1OOytsgiqkS8hR01dMb0C1YC_NJVuIEUC2nShAEdbvxY8mukLYa7pf0kFr9/exec?${queryString.value}`
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
          thisWeekLink,
          saveLink,
          loadedFromQuery,
        }
      }
    })
  app.config.compilerOptions.delimiters = ['((', '))']
  app.mount('#app')

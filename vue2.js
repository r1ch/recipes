const { createApp, ref, computed } = Vue
  import {recipes, ingredientsByRecipe} from './recipes2.js'
  const app = createApp({
      setup() {
        const queryParams = new URLSearchParams(window.location.search)
        const chosen = queryParams.getAll('r')
        const recipes = Object.keys(r).filter(id=>chosen.includes(id)).map(id=>({...r[id],id:id}))
        const picked = ref([])
        const recipes = ref(r)
        const ingredientsByRecipe = ref(ibR)
        const thisWeekLink = computed(()=>{
          return `/thisweek.html?${picked.value.map(v=>`r=${v}`).join("&")}`
        })
        const shoppingList = computed(()=>picked.value.map(r=>ibR[r]).reduce((a,c)=>{
            c.forEach(i=>{
                if(a[i.type] && a[i.type].unit == i.unit){
                    a[i.type].amount += Number(i.amount)
                    a[i.type].recipes++
                } else {
                    a[i.type] = {...i}
                    a[i.type].amount = Number(a[i.type].amount)
                    a[i.type].recipes = 1
                }
            })
            return a
        },{}))
        return {
          recipes,
          ingredientsByRecipe,
          picked,
          shoppingList,
          thisWeekLink
        }
      }
    })
  app.config.compilerOptions.delimiters = ['((', '))']
  app.mount('#app')

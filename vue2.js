const { createApp, ref, computed } = Vue
  import {r, ibR} from './recipes.js'
  const app = createApp({
      setup() {
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

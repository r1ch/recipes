---
layout: none
---

const { createApp, ref, computed } = Vue
import { recipes, ingredientsByRecipe } from './recipes.js?revision={{site.github.build_revision}}'
import { thisWeek } from './thisweek.js?revision={{site.github.build_revision}}'

const app = createApp({
  setup() {
    // --- URL and context detection ---
    const queryParams = new URLSearchParams(window.location.search)
    const thisWeekPage = window.location.pathname.includes("thisweek")
    const justSaved = queryParams.get('just_saved')
    const loadedFromQuery = queryParams.getAll('r').length > 0

    // --- Determine which recipes are picked ---
    const pickedRaw = thisWeekPage
      ? (loadedFromQuery ? queryParams.getAll('r') : thisWeek)
      : []

    const picked = ref(
      Object.keys(recipes).filter(id => pickedRaw.includes(id))
    )

    // --- Computed properties ---
    const queryString = computed(() =>
      picked.value.map(v => `r=${v}`).join("&")
    )

    const thisWeekLink = computed(() =>
      `/thisweek.html?${queryString.value}`
    )

    const saveLink = computed(() =>
      `https://script.google.com/a/macros/bradi.sh/s/AKfycbzLTeCpe1OOytsgiqkS8hR01dMb0C1YC_NJVuIEUC2nShAEdbvxY8mukLYa7pf0kFr9/exec?${queryString.value}`
    )

    const pickedRecipes = computed(() =>
      picked.value.map(id => recipes[id])
    )

    // --- Copy function ---
    const copied = ref(false)
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shoppingList.value.map(i=>i.name).join("\n"))
        copied.value = true
        setTimeout(() => copied.value = false, 1500)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }

    // --- Build shopping list ---
    const filterStaples = ref(true)
    const staples = ["oil-various","water-various","salt-various","butter"]
    const shoppingList = computed(() =>
      Object.values(picked.value
        .map(id => ingredientsByRecipe[id])
        .reduce((acc, curr) => {
          curr.forEach(i => {
            if(filterStaples.value && staples.some(s=>i.type.startsWith(s))) return 
            const existing = acc[i.type]
            if (existing && existing.unit === i.unit) {
              existing.amount += Number(i.amount)
            } else {
              acc[i.type] = {
                ...i,
                amount: Number(i.amount),
                recipes: new Set(),
                link: `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(i.name)}`
              }
              delete acc[i.type].recipeId
            }
            acc[i.type].recipes.add(i.recipeId)
          })
          return acc
        }, {}))
        .sort((a,b)=>{
          let aS = staples.some(s=>a.type.startsWith(s))
          let bS = staples.some(s=>b.type.startsWith(s))
          if(aS && !bS) return 1
          if(bS && !aS) return -1
          if(a.name > b.name) return 1
          if(b.name > a.name) return -1
          return 0
        })
    )

    return {
      recipes,
      filterStaples,
      ingredientsByRecipe,
      picked,
      pickedRecipes,
      shoppingList,
      thisWeekLink,
      saveLink,
      loadedFromQuery,
      justSaved,
      copied,
      copyToClipboard
    }
  },
})

// --- Vue config and mount ---
app.config.compilerOptions.delimiters = ['((', '))']
app.mount('#app')

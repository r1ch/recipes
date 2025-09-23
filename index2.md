---
title: Main
layout: default
---
<script>
  const ingredientsByRecipe = {}
  const recipes = {}
{%- for recipe in site.recipes -%}
  {%- assign recipe_data = site.data[recipe.slug] -%}
  {% if recipe_data %}
  recipes["{{recipe.slug}}"] = {"title":"{{recipe.title}}","url":"{{recipe.url}}"};
  ingredientsByRecipe["{{recipe.slug}}"] = [
    {%- assign ingredients = recipe_data.ingredients -%}
    {%- assign yields = recipe_data.yields -%}
        {%- for yield in yields -%}
          {%- if yield.yields == 2 -%}
            {%- for ing in yield.ingredients -%}
              {% assign ingredient = ingredients | where: "id", ing.id | first %}
              {"type":"{{ingredient.type}}", "name":"{{ingredient.name}}", "amount","{{ing.amount}}", "unit":"{{ing.unit}}"},
            {%- endfor -%}
          {%- endif -%}
        {%- endfor -%}
  ];
  {%- endif -%}
{%- endfor -%}
</script>
<h1>Recipes</h1>
  <div class = "row" id="app">
    <div class = "col-sm-6">
      (( picked ))
    </div>
    <div class = "col-sm-6">
      <table class="table table-striped-columns">
        <thead>
          <tr>
            <th>Pick</th>
            <th>Title</th>
            <th>Image</th>
            <th>Time</th>
            <th>Number of ingredients</th>
          </tr>
          <script>
            ingredients = {}
          </script>
        </thead>
        <tbody>
          <tr v-for = "(recipe, ingredients) in ingredientsByRecipe" :key="recipe">
            <td><input type="checkbox" v-model="picked" value="recipe"></td>
            <td><a :href="recipes[recipe].url">((recipes[recipe].url))</a></td>
            <td><img style="max-width:100px" class="img-fluid" :src="/images/((recipe)).jpg"></td>
            <td>x</td>
            <td>y</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
<script>
  const { createApp, ref } = Vue
  const app = createApp({
      setup() {
        const picked = ref([])
        return {
          picked
        }
      }
    })
  app.config.compilerOptions.delimiters = ['((', '))']
  app.mount('#app')
</script>

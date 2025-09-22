---
title: Main
layout: default
---
<h1>Recipes</h1>
  <div class = "row" id="app">
    <div class = "col-sm-6">
      ((recipes))
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
        </thead>
        <tbody>
          {%- for recipe in site.recipes -%}
            {%- assign recipe_data = site.data[recipe.slug] -%}
            {%- if recipe_data -%}
              {%- assign ingredients = recipe_data.ingredients -%}
          <tr>
            <td><input type = "checkbox" @change = "addRecipe()"></td>
            <td><a href="{{ recipe.url | relative_url }}">{{ recipe.title }}</a></td>
            <td><img style="max-width:100px" class="img-fluid" src="/images/{{ recipe.slug }}.jpg"></td>
            <td>{{ recipe_data.totalTime | replace: "PT", "" | replace: "M", " minutes"  }}</td>
            <td>{{ ingredients | size }}</td>
          </tr>
            {%- endif -%}
          {%- endfor -%}
        </tbody>
      </table>
    </div>
  </div>
<script>
  const { createApp, ref } = Vue
  const app = createApp({
      setup() {
        const recipes = ref([])
        function addRecipe(event) {
          console.log(event)
          recipes.value.push(event)
        }
        return {
          addRecipe,
          recipes
        }
      }
    })
  app.config.compilerOptions.delimiters = ['((', '))']
  app.mount('#app')
</script>

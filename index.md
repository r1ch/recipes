---
title: Main
layout: default
---
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
          {%- for recipe in site.recipes -%}
            {%- assign recipe_data = site.data[recipe.slug] -%}
            {%- if recipe_data -%}
              {%- assign ingredients = recipe_data.ingredients -%}
          <script>
            ingredients["{{recipe.slug}}"] = "{{ingredients | jsonify}}"
          </script>
          <tr>
            <td><input type="checkbox" v-model="picked" value="{{ recipe.slug }}"></td>
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
        const picked = ref([])
        return {
          picked
        }
      }
    })
  app.config.compilerOptions.delimiters = ['((', '))']
  app.mount('#app')
</script>

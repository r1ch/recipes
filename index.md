---
title: Main
layout: default
---
<h1>Recipes</h1>
  <div class = "row">
    <div class = "col-sm-12">
      <table class="table table-striped-columns">
        <thead>
          <tr>
            <th>Title</th>
            <th>Time</th>
            <th>Number of ingredients</th>
          </tr>
        </thead>
        <tbody>
          {% for recipe in site.recipes %}
          {% assign recipe_data = site.data[recipe.slug] %}
            {% if recipe_data %}
              {% assign ingredients = recipe_data.ingredients %}
          <tr>
            <td><a href="{{ recipe.url | relative_url }}">{{ recipe.title }}</a></td>
            <td>{{ recipe_data.totalTime | replace: "PT", "" | replace: "M", "minutes"  }}</td>
            <td>{{ ingredients | size }}</td>
          </tr>
            {% endif %}
          {% endfor %}
        </tbody>
      </table>
    </div>

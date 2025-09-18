---
title: Main
layout: default
---
<h1>Recipes</h1>
  <div class = "row">
    <div class = "col-sm-6">
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
          {% assign recipe_data = site.data[recipe] %}
            {% if recipe_data %}
              {% assign ingredients = recipe_data.ingredients %}
              {% assign yields = recipe_data.yields %}
          <tr>
            <td><a href="{{ recipe.url | relative_url }}">{{ recipe.title }}</a></td>
            <td>{{ recipe_data }}</td>
            <td>{{ ingredients }}{{ yields }}</td>
          </tr>
            {% endif %}
          {% endfor %}
        </tbody>
      </table>
    </div>
</ul>

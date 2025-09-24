---
layout: none
---
  const ingredientsByRecipe = {}
  const recipes = {}
  {%- for recipe in site.recipes -%}
    {%- assign recipe_data = site.data[recipe.slug] -%}
    {% if recipe_data %}
  recipes["{{recipe.slug}}"] = {"id":"{{recipe.slug}}","title":"{{recipe.title}}","url":"{{recipe.url}}","totalTime":"{{recipe_data.totalTime | replace: "PT", "" | replace: "M", " minutes"  }}"};
  ingredientsByRecipe["{{recipe.slug}}"] = [
      {%- assign ingredients = recipe_data.ingredients -%}
      {%- assign yields = recipe_data.yields -%}
        {%- for yield in yields -%}
          {%- if yield.yields == 2 -%}
            {%- for ing in yield.ingredients -%}
              {% assign ingredient = ingredients | where: "id", ing.id | first %}
                {% assign ingredient_type = ingredient.type %}
                {% assign ingredient_name = ingredient.name %}
              
                {% if ingredient.type contains "water-" %}
                  {% assign ingredient_type = "water-various" %}
                  {% assign ingredient_name = "Water (various)" %}
                {% elsif ingredient.type contains "oil-" %}
                  {% assign ingredient_type = "oil-various" %}
                  {% assign ingredient_name = "Oil (various)" %}
                {% elsif ingredient.type contains "salt-" %}
                  {% assign ingredient_type = "salt-various" %}
                  {% assign ingredient_name = "Salt (various)" %}
                {% elsif ingredient.type contains "honey-" %}
                  {% assign ingredient_type = "honey-various" %}
                  {% assign ingredient_name = "Honey (various)" %}
                {% endif %}
              {"type":"{{ingredient_type}}", "name":"{{ingredient_name}}", "amount":"{{ing.amount}}", "unit":"{{ing.unit}}"},
            {%- endfor -%}
          {%- endif -%}
        {%- endfor -%}
  ];
    {%- endif -%}
  {%- endfor -%}

export {recipes, ingredientsByRecipe}

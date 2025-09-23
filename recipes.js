---
layout: none
---
  const ibR = {}
  const r = {}
  {%- for recipe in site.recipes -%}
    {%- assign recipe_data = site.data[recipe.slug] -%}
    {% if recipe_data %}
  r["{{recipe.slug}}"] = {"title":"{{recipe.title}}","url":"{{recipe.url}}","totalTime":"{{recipe_data.totalTime | replace: "PT", "" | replace: "M", " minutes"  }}"};
  ibR["{{recipe.slug}}"] = [
      {%- assign ingredients = recipe_data.ingredients -%}
      {%- assign yields = recipe_data.yields -%}
        {%- for yield in yields -%}
          {%- if yield.yields == 2 -%}
            {%- for ing in yield.ingredients -%}
              {% assign ingredient = ingredients | where: "id", ing.id | first %}
              {"type":"{{ingredient.type}}", "name":"{{ingredient.name}}", "amount":"{{ing.amount}}", "unit":"{{ing.unit}}"},
            {%- endfor -%}
          {%- endif -%}
        {%- endfor -%}
  ];
    {%- endif -%}
  {%- endfor -%}

export {r, ibR}

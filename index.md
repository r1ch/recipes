---
title: Main
layout: default
---
<h1>Recipes</h1>
<ul>
  {% for recipe in site.recipes %}
    <li>
      <a href="{{ recipe.url | relative_url }}">{{ recipe.title }}</a>
    </li>
  {% endfor %}
</ul>

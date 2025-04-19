I want a winemanager app which can be used on mobile devices as pwa.

It should have login component which sends username / password to <BACKEND>/login
it retrieves a token which then must be used for every call.

it should have two main screens: A) ui for the winecooler and B) a search input which then shows results as a nice polished list.

I want the whole app in Glassmorphism style.

For A)
 it should call: <BACKEND>/cooler/Petrus
 [
  {
    "name": "UpperChamber(A)",
    "layers": [
      {
        "id": 1,
        "name": "A-01",
        "rows": 2,
        "levels": 2,
        "matrix": [
          {
            "id": 14,
            "row": 1,
            "level": 1,
            "column": 1,
            "content": "Jean Bouchard Mercurey Rouge",
            "vintage_id": 3354017
          },
          {
            "id": 15,
            "row": 2,
            "level": 1,
            "column": 1,
            "content": "Jean Bouchard Mercurey Rouge",
            "vintage_id": 3354017
          }
        ],
        "columns": 6
      }
    ]
  },
  {
    "name": "LowerChamber(B)",
    "layers": [
      {
        "id": 5,
        "name": "B-01",
        "rows": 2,
        "levels": 2,
        "matrix": [
          {
            "id": 27,
            "row": 1,
            "level": 1,
            "column": 1,
            "content": "Clos du Moulin Aux Moines Pommard 1er Cru 'Clos Orgelot' (Monopole) 2016",
            "vintage_id": 143682659
          },
          {
            "id": 25,
            "row": 2,
            "level": 1,
            "column": 1,
            "content": "Clos du Moulin Aux Moines Pommard 1er Cru 'Clos Orgelot' (Monopole) 2016",
            "vintage_id": 143682659
          }
        ],
        "columns": 6
      }
    ]
  }
]

it should render a isomorphic winecooler - it has in this case a upper and lower chamber, each chamber can have a arbiatry number of layers, where each layer spans a 3D matrix and in each cell a bottle can be allocated. The matrix size is defined by: columns x row and for the z dimension we use level.

A bottle have a vintage relation whichs details can be obtained by <BACKEND>/vintage/159739090
{
  "name": "Domaine du Vieux Télégraphe Châteauneuf-du-Pape (La Crau) 2019",
  "name_seo": "vieux-telegraphe-chateauneuf-du-pape-la-crau-2019",
  "description": "Deep ruby with some purple nuances, this wine is medium to full-bodied and reveals notes of licorice, pepper, Asian spices, black cherry, raspberry, and currant, as well as a relatively big, sweet palate impression with moderate tannin in the finish.",
  "winery": "Domaine du Vieux Télégraphe",
  "grapes": "Garnacha",
  "foods": "Lamb, Pork, Poultry"
}

I want to be able to navigate through the wine cooler, means open the cooler, a chamber, a layer and then see the 3d matrix somehow and be able to see if a cell has a bottle assigned or select a empty cell to assign a non assigned bottle.

When click on a set cell a detail popup for that vintage should be shown.

This brings us to B) the serach compenent.
It should call <BACKEND>/search?term=Deo (with a debounce and min of 3 chars to start a search).
When click on a result in the list it should show the same detail compoent popup.

Please make it full working app, whith a fine tuned polished elegenat design in the style of Glassmorphism.


-------

Several things to adjust:

* I want the <BACKEND> to be configurable via a .env or similar.
* When reloading the page I do not want to be redirected to the login page - if the token is still set and valid.
  * if a 403 is received on a request - you can be redirect to the login page.
* SearchResult should be aligned with this reponse:
  [
    {
      "id": "89257903-418",
      "score": 12.14247458123167,
      "document": {
        "wine": {
          "vintage_id": 174465872,
          "name": "Deovlet Chardonnay 2021",
          "name_seo": "devolet-chardonnay-2021",
          "year": 2021,
          "winery": "Deovlet",
          "grapes": "Chardonnay",
          "foods": "Pork, Shellfish, Vegetarian, Poultry"
        },
        "cooler_position": {
          "layer_id": 7,
          "layer_name": "B-03",
          "column": 4,
          "row": 1,
          "level": 1
        }
      }
    }
  ]
* I open a chambers layer, which have more than one layer, the levels should be inversed because when standing in front of the cooler the level 1 are the bottles laying directly on the layer, the level 2 are the stacked bottles. The same principle applies for the row per layers-level. Row 1 is the front row, the 2nd row is behind the 1st.
The following result is the bottle in the lower left corner of a layer.
  {
    "id": 69,
    "row": 1,
    "level": 1,
    "column": 1,
    "content": "Tramin Rungg Cabernet - Merlot 2020",
    "vintage_id": 168691172
  },

* The tiles should show "content" as label.
* I want the main color palette for the Glassmorphism style to be definable as .env or similar as well.
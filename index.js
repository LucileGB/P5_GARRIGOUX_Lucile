const TITLE_URL = "http://localhost:8000/api/v1/titles/";
const URL_BEST = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score'
const URL_NEWISH = "http://localhost:8000/api/v1/titles/?year=&min_year=2000&sort_by=-imdb_score";
const URL_OLDIES = "http://localhost:8000/api/v1/titles/?year=&max_year=1999&sort_by=-imdb_score";
const URL_WORST = 'http://localhost:8000/api/v1/titles/?sort_by=imdb_score'

// Stock the loaded movie lists
let dataArrays = {};
/* For each category, Stocks the current API page reached and the index
of the last displayed movie in the corresponding dataArrays list */
let ocMoviePositionTracking = {};


function prettyList(list) {//Formats a list with a space after commas
  var listString = "";
  var listLenght = list.length;
  if (list.length == 1) {
    return list;
  }
  for (var i = 0; i < listLenght; i++) {
    var item = list[i];
    if (i == 0) {
      listString = listString + item;
    } else {
      listString = listString.concat(", ", item);
    }
  }
  return listString;
}


function formatIndex(movie) {// Formats movie cover for display on the index
  var title = movie["title"];
  var cover = movie["image_url"];
  var idMovie = movie["id"];
  var result = `<p><input type="image" class="cover-index" src="${cover}" alt="${title} - Cliquez pour en savoir plus !" id="${idMovie}" onclick="openModal('${TITLE_URL}${idMovie}')"/></p>`;
  return result;
}

function formatModal(cover, title, genres, year, rated, imdb_score, directors,
                    actors, duration, countries, boxOffice, summary) {
// Format the movie informations for display on the modal
  var data = { title: `<h2 class='mod-title'>${title}</h2>`,
              cover: `<p><img class="mod-cover" img src="${cover}" alt="Poster de ${title}"/></p>`,
              genres: `<b>Genres : </b>${genres}<br>`,
              summary: `<b>Résumé : </b>${summary}<br>`,
              year: `<b>Année : </b>${year}<br>`,
              rated: `<b>Score : </b>${rated}<br>`,
              imdb: `<b>Score Imdb : </b>${imdb_score}<br>`,
              directors: `<b>Réalisateur(s) : </b>${directors}<br>`,
              actors: `<b>Acteurs : </b>${actors}<br>`,
              duration: `<b>Durée : </b>${duration}<br>`,
              countries: `<b>Pays d'origine : </b>${countries}<br>`,
              boxOffice: `<b>Box-office : </b> ${boxOffice}`,
              };
  var template = `{{{ title }}}<div id="mod-data">{{{ cover }}}<p>{{{ genres }}} {{{ summary }}} {{{ year }}} {{{ rated }}} {{{ imdb }}}{{{ actors }}}{{{ duration }}}{{{ countries }}}{{{ boxOffice }}}</p></div>`;
  var result = Mustache.render(template, data);
  return result;
}

async function pageCount(path) {// Return the last API page accessed for a category
  var numberOfpages;
  await axios.get(path).then(
    (response) => {
      var result = response.data;
      numberOfpages = Math.ceil(result["count"] /= 5);

    },
    (error) => {
       alert("Une erreur est survenue pendant le chargement de la page. Veuillez actualiser.")
    }
  );
  return numberOfpages;
}



async function openModal(path) {
// Opens the modal with the necessary informations, when available.
  await axios.get(path).then(
    (response) => {
      var result = response.data;
      var rated = result["rated"];
      var worldwide = result["worldwide_gross_income"];
      var description = result["description"];
      var cover = result["image_url"];
      var duration = `${result["duration"]} minutes`;
      var genres = prettyList(result["genres"]);
      var directors = prettyList(result["directors"]);
      var actors = prettyList(result["actors"]);
      var countries = prettyList(result["countries"]);

      if (rated == "Not rated or unkown rating") {
        rated = "Information non disponible.";
      }
      if (worldwide == null) {
        worldwide = "Information non disponible.";
      }
      if (description == "Add a Plot »") {
        description = "Aucun résumé.";
      }
      if (typeof cover != "string") {
        cover = "Aucune image disponible.";
      }
      var listInfo = [cover, result["title"], genres,
                      result["year"], rated, result["imdb_score"], directors,
                      actors, duration, countries, worldwide, description];
      var modal = document.getElementById("myModal");
      var innerModal = document.getElementById('modal-content');
      var closebtn = document.getElementsByClassName("close")[0];
      innerModal.innerHTML = formatModal(...listInfo);
      modal.style.display = "block"; //opens the modal
      closebtn.onclick = function() {// close the modal upon clicking the button
        modal.style.display = "none";
      }
    },
    (error) => {
      document.getElementsByClassName('modal-content').innerHTML = error;
    }
  );
}

async function getTopMovie() {//Gets the best movie
  var movie = ""
    await axios.get(URL_BEST).then(
      (response) => {
        var result = response.data;
        movie = result["results"][0]["id"];
      },
      (error) => {
        movie = error;
      }
    );
    return movie;
}

async function showTopMovie(movieId) {//Show the best movie
  await axios.get(`${TITLE_URL}${movieId}`).then(
    (response) => {
      var movie = response.data;
      var title = movie["title"];
      var cover = movie["image_url"];
      var idMovie = movie["id"];
      var description = movie["description"];
      var data = {title: `<h3>${title}</h3>`,
                  button: `<p><input type="image" src="img/btn_play.png" alt="Cliquez ici pour streamer ${title}!" id="btn-play"/></p>`,
                  cover: `<p><input type="image" class="cover-index" src="${cover}" alt="${title} - Cliquez pour en savoir plus !" id="${idMovie}" onclick="openModal('${TITLE_URL}${idMovie}')"/></p>`,
                  description: `<p>${description}</p>`,
                };
      var template = `<div>{{{ title }}}{{{ button }}}{{{ description }}}</div><div>{{{ cover }}}</div>`;
      var formatted = Mustache.render(template, data);
      var formattedBloc = document.getElementById('top-movie');
      formattedBloc.innerHTML = formatted;
    },
    (error) => {
      formattedBloc.innerHTML = error;
    }
);
}

async function getMovies(path, page) {// Load movies.
  var listMovies = [];
  var listResults = "";
  var startPage = page;
  for (var i = 0; i < 14; i++) {
    startPage ++;
    var currentpath = `${path}&page=${startPage}`;
    await axios.get(currentpath).then(
        (response) => {
          var result = response.data;
          listResults = result["results"];
        },
        (error) => {
            return error;
                }
    );
    for (var j = 0; j < 5; j++){//Load all the movies inside a page
      if (listResults[j] == undefined) {//... While avoiding movies already loaded, if starting mid-page
        continue;
      } else {
      listMovies.push({'title': listResults[j]["title"],
                      'image_url': listResults[j]["image_url"],
                    'id': listResults[j]["id"]}
                  );
      }
    }
  }
  return listMovies;
}

function showMovies(list, div) {//Displays movies to the user
  var l = list.length;
  var movieDesc = "";
  var futureInner = "";
  var block = document.getElementById(div);

  if (l < 7) {
    for (var i = 0; i < l; i++) {
      movieDesc = formatIndex(list[i]);
      futureInner = futureInner.concat(" ", movieDesc);
    }
  } else {
    for (var i = 0; i < 7; i++) {
      movieDesc = formatIndex(list[i]);
      futureInner = futureInner.concat(" ", movieDesc);
    }
  }
  block.innerHTML = futureInner;
}

function onLoading() {//Loads the page, including the 70 first movies of each list
  Promise.all([getTopMovie(), getMovies(URL_BEST, 0), getMovies(URL_NEWISH, 0),
              getMovies(URL_OLDIES, 0), getMovies(URL_WORST, 0)])
  .then(([result1, result2, result3, result4, result5]) => {
    showTopMovie(result1);
    showMovies(result2, "best-rated");
    showMovies(result3, "newish");
    showMovies(result4, "oldies");
    showMovies(result5, "worst");
    dataArrays = {"best-rated": result2,
                  "newish": result3,
                  "oldies": result4,
                  "worst": result5};

    /* We save the current API page, and the index of the last loaded movie
    which is in the dataArrays list *///
    Promise.all([pageCount(TITLE_URL), pageCount(URL_NEWISH), pageCount(URL_OLDIES),
                pageCount(URL_WORST)])
    .then(([result1, result2, result3, result4]) => {
      ocMoviePositionTracking = {"best-rated-pos": [14, 6],
                      "newish-pos": [14, 6],
                      "oldies-pos": [14, 6],
                      "worst-pos": [14, 6],
                      "best-rated-count": result1,
                      "newish-count": result2,
                      "oldies-count": result3,
                      "worst-count": result4};
    },
    (error) => {
      alert(`Une erreur est survenue pour la raison suivante : ${error}. Merci de recharger la page.`);
    }
  );
  },
  (error) => {
  //NOTE : Peut-on gérer une erreur pour chaque catégorie sans avoir à C/C ?
    alert(`Une erreur est survenue pour la raison suivante : ${error}. Merci de recharger la page.`);
  }
  );

}

function previousPage(buttonId) {//Load previous page
  var lastLoadedIndex = ocMoviePositionTracking[`${buttonId}-pos`][1];

  if (lastLoadedIndex == 6) {
    return 0;
  } else {
    var toLoad = loadList(buttonId, lastLoadedIndex -= 14);
    showMovies(toLoad, buttonId);
    ocMoviePositionTracking[`${buttonId}-pos`][1] = lastLoadedIndex += 7;
  }
}

function loadList(list, movieIndex) {//Load a list for nextPage
  var result = [];
  var start = movieIndex += 1;
  for (var i = 0; i < 7; i++) {
    result.push(dataArrays[list][start]);
    start++;
  }
  return result;
}

function nextPage(buttonId, url) {
  var totalPages = ocMoviePositionTracking[`${buttonId}-count`];
  var lastAPIPage = ocMoviePositionTracking[`${buttonId}-pos`][0];
  var lastLoadedIndex = ocMoviePositionTracking[`${buttonId}-pos`][1];
  var listLength = dataArrays[buttonId].length;
  var toLoad = [];

  if (lastAPIPage == totalPages) {// If we reached the end, doesn't change
    return 0;
  } else {// Loads the next movies in the global
    toLoad = loadList(buttonId, lastLoadedIndex);
    showMovies(toLoad, buttonId);

//    if (lastLoadedIndex > (listLength -= 54) && lastLoadedIndex < (listLength -= 10))
    if (lastLoadedIndex > (listLength -= 10))
    {//Loads new movies if we're nearing the end of the loaded list
      Promise.all([getMovies(url, lastAPIPage)])
      .then(([result1]) => {
        dataArrays[buttonId] = dataArrays[buttonId].concat(result1);

        /* We update the new list values. Should we decide to use a number other than 70
        for the number of loaded movies, we'll have to use Math.floor and adjust page count. */
        var newListLength = dataArrays[buttonId].length;
        var newAPIPage = newListLength /= 5;
        ocMoviePositionTracking[`${buttonId}-pos`][0] = newAPIPage;
      },
      (error) => {
        alert(`Une erreur est survenue pour la raison suivante : ${error}. Merci de recharger la page.`);
      }
    );
    }
  }

//Updating the last loaded movie index
  ocMoviePositionTracking[`${buttonId}-pos`][1] = lastLoadedIndex + toLoad.length;
}

onLoading();

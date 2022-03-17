const TITLE_URL = "http://localhost:8000/api/v1/titles/";
const URL_BEST = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score'
const URL_NEWISH = "http://localhost:8000/api/v1/titles/?year=&min_year=2000&sort_by=-imdb_score";
const URL_OLDIES = "http://localhost:8000/api/v1/titles/?year=&max_year=1999&sort_by=-imdb_score";
const URL_WORST = 'http://localhost:8000/api/v1/titles/?sort_by=imdb_score'

// Stocks the loaded movie lists
let dataArrays = {};
/* For each category, stocks the current API page reached and the index
of the last displayed movie */
let ocMoviePositionTracking = {};


function formatMovieCover(movie) {// Formats movie covers for display on the index
  var title = movie["title"];
  var cover = movie["image_url"];
  var idMovie = movie["id"];
  var result = `<p><input type="image" class="cover-index" src="${cover}" alt="${title} - Cliquez pour en savoir plus !" id="${idMovie}" onclick="openModal('${TITLE_URL}${idMovie}')"/></p>`;
  return result;
}

function ifError(error) {//Shows an error message and hides the rest of the page
  var errorHead = document.getElementsByClassName("if-error")[0];
  var movieList = document.getElementsByClassName("movies-lists")[0];
  var bestMovie = document.getElementsByClassName("best-movie-section")[0];

  errorHead.style.display = "block";
  errorHead.innerHTML = `Désolés, mais nous avons rencontré l'erreur suivante :<br> ${error}`;
  movieList.style.display = "none";
  bestMovie.style.display = "none";
}

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

function formatModal(cover, title, genres, year, rated, imdb_score, directors,
                    actors, duration, countries, boxOffice, summary) {
// Formats the movie informations for display on the modal
  var data = { title: title,
              cover: cover,
              genres: genres,
              summary: summary,
              year: year,
              rated: rated,
              imdb: imdb_score,
              directors: directors,
              actors: actors,
              duration: duration,
              countries: countries,
              boxOffice: boxOffice,
              };
  var template =  document.getElementById('moustache-modal').innerHTML;
  var result = Mustache.render(template, data);
  return result;
}

async function pageCount(path) {// Returns the last API page accessed for a category
  var numberOfpages;
  await axios.get(path).then(
    (response) => {
      var result = response.data;
      numberOfpages = Math.ceil(result["count"] /= 5);

    },
    (error) => {
       ifError(error);
    }
  );
  return numberOfpages;
}



async function openModal(path) {
// Opens the modal with the available informations.
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
      innerModal.innerHTML = formatModal(...listInfo);

      var closebtn = document.getElementsByClassName("close")[0];
      modal.style.display = "flex";
      window.scrollTo(0, 0);
      closebtn.onclick = function() {
        modal.style.display = "none";
      }
    },
    (error) => {
      ifError(error);
    }
  );
}

/* API-related functions */
async function getTopMovie() {//Gets the best movie
  var movie = ""
    await axios.get(URL_BEST).then(
      (response) => {
        var result = response.data;
        movie = result["results"][0]["id"];
      },
      (error) => {
        ifError(error);
      }
    );
    return movie;
}

async function showTopMovie(movieId) {//Show the best movie
  await axios.get(`${TITLE_URL}${movieId}`).then(
    (response) => {
      var movie = response.data;
      var data = {title:  movie["title"],
                  cover: movie["image_url"],
                  idMovie: movie["id"],
                  url: `${TITLE_URL}${movie["id"]}`,
                  description: movie["description"]
                };
      var template = document.getElementById('moustache-best').innerHTML;
      var toFormats = document.getElementById('best-desc');
      var formatted = Mustache.render(template, data);

      toFormat.innerHTML = formatted;
    },
    (error) => {
      ifError(error);
    }
);
}

async function getMovies(path, page) {// Loads movies.
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
            ifError(error);
                }
    );
    for (var j = 0; j < 5; j++){//Loads all the movies inside a page
      if (listResults[j] == undefined) {
        //... While avoiding movies already loaded, if starting mid-page
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
      movieDesc = formatMovieCover(list[i]);
      futureInner = futureInner.concat(" ", movieDesc);
    }
  } else {
    for (var i = 0; i < 7; i++) {
      movieDesc = formatMovieCover(list[i]);
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
    var arrows = document.getElementsByClassName("arrow");
    for (var arrow of arrows) {
      arrow.style.display = "block";
    };

    /* Saves the current API page, and the index of the last loaded movie */
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
      ifError(error);
    }
  );
  },
  (error) => {
    ifError(error);
  }
  );
}

function previousPage(buttonId) {//Loads previous page
  var lastLoadedIndex = ocMoviePositionTracking[`${buttonId}-pos`][1];

  if (lastLoadedIndex == 6) {
    return 0;
  } else {
    var toLoad = loadList(buttonId, lastLoadedIndex -= 14);
    showMovies(toLoad, buttonId);
    ocMoviePositionTracking[`${buttonId}-pos`][1] = lastLoadedIndex += 7;
  }
}

function loadList(list, movieIndex) {//Loads a list for nextPage
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

  if (lastAPIPage == totalPages) {// If we reached the end, does nothing
    return 0;
  } else {// Loads the next movies in the global
    toLoad = loadList(buttonId, lastLoadedIndex);
    showMovies(toLoad, buttonId);

    if (lastLoadedIndex > (listLength -= 10))
    {//Loads new movies if we're nearing the end of the loaded list
      Promise.all([getMovies(url, lastAPIPage)])
      .then(([result1]) => {
        dataArrays[buttonId] = dataArrays[buttonId].concat(result1);

        /* Updates the new list values. Should we decide to use a number other
        than 70 per batch of loaded movies, we'll have to use Math.floor
        and adjust page count. */
        var newListLength = dataArrays[buttonId].length;
        var newAPIPage = newListLength /= 5;
        ocMoviePositionTracking[`${buttonId}-pos`][0] = newAPIPage;
      },
      (error) => {
        ifError(error);
      }
    );
    }
  }

//Updates the last loaded movie index
  ocMoviePositionTracking[`${buttonId}-pos`][1] = lastLoadedIndex + toLoad.length;
}

onLoading();

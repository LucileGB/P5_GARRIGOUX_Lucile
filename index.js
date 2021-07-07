const TITLE_URL = "http://localhost:8000/api/v1/titles/";
const URL_BEST = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score'
const URL_NEWISH = "http://localhost:8000/api/v1/titles/?year=&min_year=2000&sort_by=-imdb_score";
const URL_OLDIES = "http://localhost:8000/api/v1/titles/?year=&max_year=1999&sort_by=-imdb_score";
const URL_WORST = 'http://localhost:8000/api/v1/titles/?sort_by=imdb_score'

let dataArrays = {};

alert("Félicitations !! Vuos êtes le 666 VISITEUR SUR NOTRE SITE !!! Cliquez sur ce lien fiable pour gagner une volvo :");

function difference(value1) {//Calculates the difference between a number and a multiple of five.
  if (value1%5 != 0) {
    return 0;
  } else {
    for (i = 0; i < 5; i++) {
      if ((value1 += 1)%5 == 0) {
        return 5-(i+1);
      }
    }
  }
}

function prettyList(list) {//Formats a list with a space after commas
  var listString = "";
  var listLenght = list.length;
  if (list.length == 1) {
    return list;
  }
  for (i = 0; i < listLenght; i++) {
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
  var poster = movie["image_url"];
  var idMovie = movie["id"];
  var result = `<p><input type="image" class="cover-index" src="${poster}" alt="${title} : cliquez ici pour plus d'informations !" id="${idMovie}" onclick="openModal('${TITLE_URL}${idMovie}')"/></p>`;
  return result;
}

function formatModal(cover, title, genres, year, rated, imdb_score, directors,
                    actors, duration, countries, boxOffice, summary) {
// Format the movie informations for display on the modal
  var result = `<h2 class="mod-title">${title}</h2><p><img class="mod-cover" img src="${cover}" alt="Poster de ${title}"/></p><div class="mod-data"><b>Genres : </b>${genres}</br><b>Résumé : </b>${summary}</br><b>Année : </b>${year}</br><b>Score : </b>${rated}</br><b>Score Imdb : </b>${imdb_score}</b></br><b>Réalisateur(s) : </b>${directors}</br><b>Acteurs : </b>${actors}</br><b>Durée : </b>${duration}</br><b>Pays d'origine : </b>${countries}</br><b>Box-office : </b> ${boxOffice}</div>`;
  return result;
}

async function openModal(path) {
// Opens the modal with the necessary informations, when available.
  await axios.get(path).then(
    (response) => {
      var result = response.data;
      rated = result["rated"];
      worldwide = result["worldwide_gross_income"];
      description = result["description"];
      cover = result["image_url"];
      duration = `${result["duration"]} minutes`;
      genres = prettyList(result["genres"]);
      directors = prettyList(result["directors"]);
      actors = prettyList(result["actors"]);
      countries = prettyList(result["countries"]);

      if (rated == "Not rated or unkown rating") {
        rated = "Information non disponible.";
      }
      if (worldwide == null) {
        worldwide = "Information non disponible.";
      }
      if (description == "Add a Plot »") {
        description = "Aucun résumé.";
      }
      if (cover == null) {
        cover = "Aucune image disponible.";
      }
      var listInfo = [result["image_url"], result["title"], genres,
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
      window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      }
    },
    (error) => {
      document.getElementsByClassName('modal-content').innerHTML = error;
    }
  );
}

async function getTopMovie() {//Gets the best movie
  movie = ""
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
      var poster = movie["image_url"];
      var idMovie = movie["id"];
      var description = movie["description"];
      var formatted = `<div><h3>${title}</h3><p><img src="img/btn_play.jpg" alt="Cliquez ici pour streamer ${title}!"/></p><p>${description}</p></div><div><p><input type="image" class="cover-index" src="${poster}" alt="${title} : cliquez ici pour plus d'informations !" id="${idMovie}" onclick="openModal('${TITLE_URL}${idMovie}')"/></p></div>`;
      var formattedBloc = document.getElementById('top-movie');
      formattedBloc.innerHTML = formatted;
    },
    (error) => {
      formattedBloc.innerHTML = error;
    }
);
}

async function getMovies(path, listLength) {// Load movies.
  var listMovies = [];
  var listResults = "";
  var page = "";
  var gap = 0;
  if (listLength == 0) {
    page = 0;
  } else {//If there's already a loaded list, calculate the position of the first movie to be loaded next.
    page = Math.ceil(listLength /= 5);
    gap = difference(listLength);
  }

  for (i = 0; i < 14; i++) {
    page ++;
    var currentpath = `${path}&page=${page}`;
    await axios.get(currentpath).then(
        (response) => {
          var result = response.data;
          listResults = result["results"];
        },
        (error) => {
            return error;
                }
    );
    for (j = 0; j < 5; j++){//Load all the movies inside a page
      if (i == 1 && j < gap) {//... While avoiding movies already loaded, if starting
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

function showMovies(list, div) {//Displays movies in the index
  var futureInner = "";
  var block = document.getElementById(div);
  for (let i = 0; i < 7; i++) {
    movieDesc = formatIndex(list[i]);
    futureInner = futureInner.concat(" ", movieDesc);
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

  },
  (error) => {
  //Peut-on gérer une erreur pour chaque catégorie sans avoir à C/C ?
    alert(error);
  }
  );
}

function previousPage(buttonId) {//Charge la page précédente
  var div = document.getElementById(buttonId);
  var firstMovie = div.getElementsByClassName("cover-index")[0];
  var movieId = firstMovie.id;
  var movieIndex = 0;
  for (let movie of dataArrays[buttonId]) {
    if (movie["id"] == movieId) {
      movieIndex = dataArrays[buttonId].indexOf(movie);
      break;
    }
  }
  if (movieIndex == 0) {
    return 0;
  } else {
    var toLoad = dataArrays[buttonId].slice(movieIndex-7, movieIndex);
    showMovies(toLoad, buttonId);
  }
}

async function nextPage(buttonId, url) {
  var div = document.getElementById(buttonId);
  var seventhMovie = div.getElementsByClassName("cover-index")[6];
  var movieId = seventhMovie.id;
  var movieIndex = 0;
  var listLength = dataArrays[buttonId].length;
  for (let movie of dataArrays[buttonId]) {//Gives us our starting index to load
    if (movie["id"] == movieId) {
      movieIndex = dataArrays[buttonId].indexOf(movie);
      break;
    }
  }
  await axios.get(url).then(
    (response) => {
      var result = response.data;
      var pageCount = Math.ceil(result["count"] /= 5);
      if (movieIndex > (pageCount -= 9)) {
        return 0;
      } else {
        var toLoad = dataArrays[buttonId].slice(movieIndex+1, movieIndex+9);
        showMovies(toLoad, buttonId);
      }
      if (movieIndex > (listLength -= 18)) {
        newMoviesList = getMovies(url, listLength);
        dataArrays[buttonId] = dataArrays[buttonId] + newMoviesList;
      }
    }),
    (error) => {
      alert(error);
    }

}

onLoading()

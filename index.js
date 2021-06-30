const TITLE_URL = "http://localhost:8000/api/v1/titles/";
const TITLE_NEWISH = "http://localhost:8000/api/v1/titles/?year=&min_year=2000&sort_by=-imdb_score";
let dataArrays = {};

// Format the title and movie cover for display on the index
function formatIndex(valueOne, valueTwo, classOne, classTwo, idMovie) {
  var result = `<h3 class=${classOne}>${valueOne}</3><p><input type="image" src="${valueTwo}" alt="Cliquez ici pour plus d'informations !" id="${classTwo}" onclick="openModal('${TITLE_URL}${idMovie}')"/></p>`;
  return result;
}

// Format the movie informations for display on the modal
function formatModal(cover, title, genres, year, rated, imdbScore, directors,
                    actors, duration, countries, boxOffice, summary) {
  var result = `<h2 class="mod-title">${title}</h2><p><img class="mod-cover" img src="${cover}" alt="Poster de ${title}"/></p><div class="mod-data"><b>Genres : </b>${genres}</br><b>Résumé : </b>${summary}</br><b>Année : </b>${year}</br><b>Score : </b>${rated}</br><b>Score Imdb : </b>${imdbScore}</b></br><b>Réalisateur(s) : </b>${directors}</br><b>Acteurs : </b>${actors}</br><b>Durée : </b>${duration}</br><b>Pays d'origine : </b>${countries}</br><b>Box-office : </b> ${boxOffice}</div>`;
  return result;
}

// Function to open the modal with the necessary informations
async function openModal(path) {
  await axios.get(path).then(
    (response) => {
      var result = response.data;
      var listInfo = [result["image_url"], result["title"], result["genres"],
                      result["year"], result["rated"], result["imdbScore"],
                    result["directors"], result["actors"], result["duration"],
                  result["countries"], result["woldwide_gross_income"],
                result["description"]];
      var modal = document.getElementById("myModal")
      var innerModal = document.getElementById('modal-content')
      innerModal.innerHTML = formatModal(...listInfo);
    },
    (error) => {
      document.getElementsByClassName('modal-content').innerHTML = error;
    }
  );
}

//Gets and display the best movie
async function getTopMovie(path) {
    await axios.get(path).then(
        (response) => {
            var result = response.data;
            var title = result["results"][0]["title"];
            var poster = result["results"][0]["image_url"];
            var idMovie = result["results"][0]["id"]
            var formattedBloc = document.getElementById('top-movie')
            formattedBloc.innerHTML = formatIndex(title, poster,
                                  "best_title", "best_cover", idMovie);
        },
        (error) => {
            return error;
        }
    );
}

async function getMovies(path) {
  var listMovies = [];
  var page = 1 // Devra changer selon la longueur de la liste
  var listResults = ""
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
    for (j = 0; j < 5; j++){
      listMovies.push({'title': 'listResults[j]["title"]',
                      'cover': 'listResults[j]["title"]'});
    }
  }
}


const bestRated = getTopMovie('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score');
const listings = getMovies(TITLE_NEWISH);

const MAIN_URL = 'http://localhost:8000/api/v1/titles'
let movies = {[], [], []}

function formatIndex(valueOne, valueTwo, classOne, classTwo) {
  var result = `<h3 class=${classOne}>${valueOne}</3><p><img src="${valueTwo}" alt="Poster de ${valueOne}" class="${classTwo}"/></p>`;
  return result
}

async function topMovie(path) {
    await axios.get(path).then(
        (response) => {
            var result = response.data;
            var title = result["results"][0]["title"];
            var poster = result["results"][0]["image_url"];
            var formattedBloc = document.getElementById('top-movie')
            formattedBloc.innerHTML = formatIndex(title, poster,
                                  "best_title", "best_cover");
        },
        (error) => {
            return error;
        }
    );
}

async function getMovies(path) {
    await axios.get(path).then(
        (response) => {
            var result = response.data;
            var title = result["results"][0]["title"];
            var poster = result["results"][0]["image_url"];
            var formattedBloc = document.getElementById('top-movie')
            formattedBloc.innerHTML = formatIndex(title, poster,
                                  "best_title", "best_cover");
        },
        (error) => {
            return error;
        }
    );
}

const bestRated = topMovie('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score');

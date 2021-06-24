const MAIN_URL = 'http://localhost:8000/api/v1/titles'

function top_movie(path) {
    axios.get(path).then(
        (response) => {
            var result = response.data;
            let title = result["results"][0]["title"];
            let cover = result["results"][0]["image_url"];
            let formattedBloc = document.getElementById('top-movie')
            formattedBloc.innerHTML = title;
            return result;
        },
        (error) => {
            return error;
        }
    );
}

let best_rated = top_movie('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score');
//document.getElementById('oldies').innerHTML = '${test["image_url"]}';
//document.getElementById('best-rated').innerHTML = test["image_url"];

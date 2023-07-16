
document.getElementById('translate-button').addEventListener('click', translate);
document.getElementById('search-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      translate();
    }
  });
  

function translate() {
    const sourceText = document.getElementById('search-input').value;
    const sourceLang = 'nl';
    
    // Define an array of target languages
    const targetLanguages = ['en', 'ru', 'ur', 'ar', 'tr'];

    // Loop through the target languages and call the translateText function
    targetLanguages.forEach(function(targetLang) {
        translateText(sourceText, sourceLang, targetLang);
    });
    // Call the function to fetch and display related images
    fetchImages(sourceText);
    // Call the function to fetch and display Wikipedia article
    fetchArticle(sourceText, 'nl');   
}

function translateText(sourceText, sourceLang, targetLang) {
    console.log(sourceText);

    let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Get the corresponding element based on the target language
            let translatedWordElement = document.getElementById(`translated-word-${targetLang}`);
            translatedWordElement.textContent = data[0][0][0];
        })
        .catch(error => console.error('Error:', error));
}

function fetchImages(query) {
    const perPage = 5;
    const URL = `https://pixabay.com/api/?key=${{ API_KEY_PIXABAY }}&q=${encodeURIComponent(
        query
    )}&lang=nl&image_type=photo&safesearch=true&per_page=${perPage}`;

    fetch(URL)
        .then(response => response.json())
        .then(data => {
            if (data.hits.length > 0) {
                const imagesContainer = document.getElementById('images-container');
                imagesContainer.innerHTML = ''; // Clear existing content

                data.hits.forEach(hit => {
                    const imgElement = document.createElement('img');
                    imgElement.src = hit.webformatURL;
                    imgElement.alt = hit.tags;
                    imgElement.classList.add('image');
                    imagesContainer.appendChild(imgElement);
                });
            }
        })
        .catch(error => console.error('Error:', error));
}

function fetchArticle(query, lang) {
    const URL = `https://${lang}.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&format=json&exintro=&titles=${encodeURIComponent(
      query
    )}`;
  
    fetch(URL)
      .then(response => response.json())
      .then(data => {
        const pages = data.query.pages;
        const pageIds = Object.keys(pages);
        if (pageIds.length > 0) {
          const pageId = pageIds[0];
          const extract = pages[pageId].extract;
  
          const articleContainer = document.getElementById('article-container');
          articleContainer.innerHTML = extract;
        }
      })
      .catch(error => console.error('Error:', error));
  
  }

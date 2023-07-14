document.getElementById('translate-button').addEventListener('click', translate);

function translate() {
    const sourceText = document.getElementById('search-input').value;
    const sourceLang = 'nl';
    
    // Define an array of target languages
    const targetLanguages = ['en', 'ru', 'ur', 'ar'];

    // Loop through the target languages and call the translateText function
    targetLanguages.forEach(function(targetLang) {
        translateText(sourceText, sourceLang, targetLang);
    });
}

function translateText(sourceText, sourceLang, targetLang) {
    console.log(sourceText);

    let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Get the corresponding element based on the target language
            let translatedWordElement = document.getElementById('translated-word-' + targetLang);
            translatedWordElement.textContent = data[0][0][0];
        })
        .catch(error => console.error('Error:', error));
}
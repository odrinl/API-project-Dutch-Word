document.getElementById('translate-button').addEventListener('click', translate);

function translate() {
    translateEn();
    translateRu();
}

function translateEn() {
    var sourceText = document.getElementById('search-input').value;
    var sourceLang = 'nl';
    var targetLang = 'en';
    console.log(sourceText);

    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('translated-word-en').textContent = data[0][0][0];
        })
        .catch(error => console.error('Error:', error));
}

function translateRu() {
    var sourceText = document.getElementById('search-input').value;
    var sourceLang = 'nl';
    var targetLang = 'ru';
    console.log(sourceText);

    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('translated-word-ru').textContent = data[0][0][0];
        })
        .catch(error => console.error('Error:', error));
}

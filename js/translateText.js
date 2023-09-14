// Function to translate text
export async function translateText(sourceText, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    sourceText
  )}`;

  try {
    const fetchResponse = await fetch(url);
    const responseData = await fetchResponse.json();
    const translatedWordElement = document.getElementById(
      `translated-word-${targetLang}`
    );
    translatedWordElement.textContent = responseData[0][0][0];
  } catch (error) {
    console.error("Error:", error);
    // Re-throw the error to handle it in the parent function (main)
    throw new Error(`translateText ${sourceLang}-${targetLang}: ${error.message}.`); 
  }
}
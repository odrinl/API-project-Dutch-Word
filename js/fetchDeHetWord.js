// Function to fetch "de/het" word
export async function fetchDeHetWord(word) {
  const fetchDeHetWord = searchInput.value;

  // Construct the URL for fetching the "de/het" word
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=nl&dt=t&q=the ${fetchDeHetWord}`;

  try {
    const fetchResponse = await fetch(url);
    const responseData = await fetchResponse.json();
    const dehetContainer = document.getElementById("dehet-container");
    dehetContainer.textContent = responseData[0][0][0];

    // Highlight the first word in the "de/het" word
    const firstPageExtract = dehetContainer.textContent.trim();
    const firstWord = firstPageExtract.split(' ')[0];
    dehetContainer.innerHTML = firstPageExtract.replace(firstWord, `<span class="first-word">${firstWord}</span>`);
  } catch (error) {
    console.error("Error:", error);
    // Re-throw the error to handle it in the parent function (main)
    throw new Error(`fetchDeHetWord: ${error.message}.`); 
  }
}
var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
var wordsOfTheDay = JSON.parse(localStorage.getItem('wordsOfTheDay')) || [];

const unsplashAccessKey = 'YOUR_ACCESS_KEY';
function displayWordsOfTheDay(containerId, words) {
  var wordsContainer = document.getElementById(containerId);

  // Check if the container element exists
  if (!wordsContainer) {
    return;
  }

  wordsContainer.innerHTML = "";
  wordsContainer.style.textAlign = "center";
  wordsContainer.style.fontWeight= "bold";

  if (words.length > 0) {
    wordsContainer.innerHTML = "Words of the Day:<br><br>";
    words.forEach((word, index) => {
      var wordContainer = document.createElement("div");
      wordContainer.classList.add("word-container");
      var updateButton = document.createElement("button");
      updateButton.textContent = "Update";
      updateButton.onclick = function () {
        openUpdateDialog(index, wordContainer, word);
      };
      var deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = function () {
        deleteWord(index);
      };

      wordContainer.innerHTML = `${word}<br><br>`;
      wordContainer.appendChild(updateButton);
      wordContainer.appendChild(deleteButton);
      wordsContainer.appendChild(wordContainer);
    });
  }
}

function buttonClick() {
  localStorage.removeItem('addToWordsClicked');
  var query = document.getElementById("searchData").value;

  if (query.trim() !== "") {

    document.getElementById("searchData").value = "";

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (Array.isArray(data) && data.length > 0) {
          var wordData = data[0];
          var word = wordData.word;

          document.getElementById('imageGallery').innerHTML = '';
          document.getElementById("dict").innerHTML = `Word: ${word} `;
          document.getElementById("exp").innerHTML = "Meanings: ";
          document.getElementById("syn").innerHTML = "";
          document.getElementById('verb').innerHTML = `
        `;
          document.getElementById("sound").innerHTML = "Audio for the chosen word: <br>";

          var audioUrl = wordData.phonetics[0].audio;

          if (Array.isArray(wordData.meanings)) {
            // Clear existing content
            document.getElementById("examples").innerHTML = "Examples: ";
          
            wordData.meanings.forEach((meaning) => {
              var partOfSpeech = meaning.partOfSpeech;
              var definitions = meaning.definitions;
          
              // Display part of speech
              document.getElementById("exp").innerHTML += `<br><b>${partOfSpeech}:</b><br>`;
          
              // Track the number of definitions with examples
              var examplesCount = 0;
          
              definitions.forEach((definition) => {
                // Check if the count for examples has reached 3
                if (examplesCount < 3) {
                  document.getElementById("exp").innerHTML += `<ul><li><b>Meanings:</b> ${definition.definition}</li></ul>`;
          
                  // Check if the definition has an example
                  if (definition.example) {
                    document.getElementById("exp").innerHTML += `<ul><li><b>Example:</b> ${definition.example}</li></ul>`;
                    examplesCount++;
                  }
                }
              });
              // Fetch and display examples
              if (meaning.examples && meaning.examples.length > 0) {
                document.getElementById("examples").innerHTML += `<br><b>Examples (${partOfSpeech}):</b>`;
                meaning.examples.slice(0, 3).forEach((example) => {
                  document.getElementById("examples").innerHTML += `<br>${example}`;
                });
              }
            });
          } else {
            document.getElementById("exp").innerHTML = "No meanings found.";
          }
          
          document.getElementById('sound').innerHTML = `
          <audio controls>
            <source src="${data[0].phonetics[0].audio}" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
          <a href="${data[0].phonetics[0].audio}" target="_blank">Related URL</a>
        `;
          // Create an "Add" button for the user to choose whether to add the word
          var addButton = document.createElement("button");
          addButton.textContent = "Add to Words of the Day";
          addButton.onclick = function () {
            localStorage.setItem('addToWordsClicked', true);
            addToWordsOfTheDay(query);
          };
          document.getElementById("dict").appendChild(addButton);

          // Fetch images based on the word
          searchImages(query);

          fetch(`https://api.datamuse.com/words?rel_syn=${word}`)
            .then(response => response.json())
            .then(data => {
              var synonyms = data.map(word => word.word).join(', ');
              document.getElementById('syn').innerHTML += `<p><b>Synonyms:</b> <br>${synonyms}</p>`;
            })
            .catch(error => {
              console.error(error);
              alert('Error fetching synonyms. Please try again.');
            });

          fetch(`https://api.datamuse.com/words?rel_ant=${word}`)
            .then(response => response.json())
            .then(data => {
              var antonyms = data.map(word => word.word).join(', ');
              document.getElementById('syn').innerHTML += `<p><b>Antonyms:</b> <br>${antonyms}</p>`;
            })
            .catch(error => {
              console.error(error);
              alert('Error fetching antonyms. Please try again.');
            });
        } else {
          document.getElementById("dict").innerHTML = "Word not found";
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        document.getElementById("dict").innerHTML = "An error occurred.";
      });
  }
}

  function searchImages(query) {
    const unsplashAccessKey = 'Ls4zLeutdk_m_MtwiMFIdNPlcHjHFkX8IHbN3kLdA-Q'; // Replace with your Unsplash API key
    const apiUrl = `https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashAccessKey}`;
  
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          // Display only the first image in your imageGallery div
          const imageGallery = document.getElementById("imageGallery");
          const firstImage = data.results[0];
  
          const imgElement = document.createElement("img");
          imgElement.src = firstImage.urls.small;
          imgElement.alt = query; // You can set a more descriptive alt text if needed
  
          imageGallery.appendChild(imgElement);
        } else {
          document.getElementById("imageGallery").innerHTML = "No images found.";
        }
      })
      .catch(error => {
        console.error("Error fetching images:", error);
        document.getElementById("imageGallery").innerHTML = "Error fetching images.";
      });
  }
function addToWordsOfTheDay(word) {
  //console.log('Adding to Words of the Day:', word); // Debug
  var wordsOfTheDay = JSON.parse(localStorage.getItem('wordsOfTheDay')) || [];
  
  if (!wordsOfTheDay.includes(word)) {
    wordsOfTheDay.push(word);
    localStorage.setItem('wordsOfTheDay', JSON.stringify(wordsOfTheDay));

    // Store the detailed data in local storage
    localStorage.setItem(word + '_details', 'Successfully added to words of the day list ' );
    displayWordsOfTheDay();
    //console.log('Opening modal for:', word); // Debug
    // Open the modal and display word details
    openWordDetailsModal(word);

    document.addEventListener('modalClosed', function () {
      // Check if the button has been clicked
      if (localStorage.getItem('addToWordsClicked')) {
        // Create "View Words of the Day" button
        createViewWordsButton();
      }
      // Redirect to wordsOfTheDay.html after the modal is closed
      window.location.href = 'wordsOfTheDay.html';
    }); }
}

function displayImages(images) {
  // Assuming you have an HTML element with the ID 'imageGallery' to display images
  const imageGallery = document.getElementById('imageGallery');

  // Clear existing images
  imageGallery.innerHTML = '';

  // Display each image
  images.forEach(image => {
    const imgElement = document.createElement('img');
    imgElement.src = image.urls.small; // You can use 'regular', 'small', 'thumb', etc. based on your preference
    imgElement.alt = image.alt_description;
    imageGallery.appendChild(imgElement);
  });
}


// ... (other functions)

/*function addToWordsOfTheDay(word) {
  if (!wordsOfTheDay.includes(word)) {
    wordsOfTheDay.push(word);
    localStorage.setItem('wordsOfTheDay', JSON.stringify(wordsOfTheDay));

    // Store the detailed data in local storage
    storeDetailedData(word);

    displayWordsOfTheDay();

    // Open the modal and display word details
    openWordDetailsModal(word);

    // Use setTimeout to delay the redirection slightly
    setTimeout(function () {
      // Redirect to wordsOfTheDay.html after the modal is closed
      window.location.href = 'wordsOfTheDay.html';
    }, 2000); // You can adjust the delay (in milliseconds) as needed
  }
}*/



function createViewWordsButton() {
  var viewButton = document.createElement('button');
  viewButton.textContent = 'View Words of the Day';
  viewButton.onclick = function () {
    window.location.href = 'wordsOfTheDay.html';
  };
  document.getElementById('dict').appendChild(viewButton);
}

// ...

// ...

function openWordDetailsModal(word) {
  var modalWordTitle = document.getElementById("modalWordTitle");
  var modalWordDefinition = document.getElementById("modalWordDefinition");

  modalWordTitle.textContent = word;
  modalWordDefinition.innerHTML = localStorage.getItem(word + '_details');

  var modal = document.getElementById("wordDetailsModal");
  modal.style.display = "block";
}


function closeWordDetailsModal() {
  var modal = document.getElementById("wordDetailsModal");
  modal.style.display = "none";
}

// ...


document.addEventListener('DOMContentLoaded', function () {
  displayWordsOfTheDay();
});

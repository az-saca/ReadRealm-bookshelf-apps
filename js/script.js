
/* {
  id: string | number,
  title: string,
  author: string,
  year: number,
  isComplete: boolean,
} */

const books = [];
const RENDER_EVENT = "render"; // Custom event for rendering the book list
const SAVED_EVENT = "saved"; // Custom event for saving data to localStorage
const STORAGE_KEY = "BOOK_APPS"; //Key for storing data in localStorage
let slideIndex = 1; // Initial slide index for slideshow
nextSlide(slideIndex);

// Function to change the slide image
function changeImage(index) {
  nextSlide((slideIndex += index));
}

// Function to show the next or prev slide
function nextSlide(index) {
  let i;
  let slides = document.getElementsByClassName("slideshow");
  if (index > slides.length) {
    slideIndex = 1;
  }
  if (index < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}
// Automatically change the slide
setInterval(() => changeImage(1), 10000);

// Function to generate a unique ID based on the current timestamp
function generateId() {
  return +new Date();
}

// Function to create a book object
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// Function to check if localStorage is supported by the browser
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

// Function to save the book data to localStorage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

//Funtion to load book data from localStorage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Function to add a new book to the list
function addBook() {
  const title = document.getElementById("input-book-title").value;
  const author = document.getElementById("input-book-author").value;
  const year = document.getElementById("input-book-year").value;
  const isComplete = document.getElementById("input-book-isComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    isComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Function to create a DOM element for the book
function inputBook(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = bookObject.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(bookTitle, bookAuthor, bookYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    container.append(editButton, undoButton, trashButton);
  } else {
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    const checkButton = document.createElement("button");

    checkButton.classList.add("done-button");

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });
    container.append(editButton, checkButton);
  }

  return container;
}

// Function to mark a book as completed
function addBookToCompleted(bookID) {
    const book = books.find((book) => book.id === bookID);
    if (!book) return;
    book.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  
}

// Function to remove a completed book
function removeBookFromCompleted(bookID) {
  const bookIndex = books.findIndex((book) => book.id === bookID);
  if (bookIndex === -1) return;
  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Function to undo the completion of a book
function undoBookFromCompleted(bookID) {
  const book = books.find((book) => book.id === bookID);
  if (!book) return;
  book.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Function to edit the details of book
function editBook(bookID) {
  const book = books.find((book) => book.id === bookID);
  if (!book) return;

  Swal.fire({
    title: "Edit Book",
    html:
      `<input id="update-book-title" class="swal2-input" placeholder="Title" value="${book.title}">` +
      `<input id="update-book-author" class="swal2-input" placeholder="Author" value="${book.author}">` +
      `<input id="update-book-year" class="swal2-input" placeholder="Year" value="${book.year}">` +
      `<br><label for="update-book-isComplete">Completed</label>` +
      `<input id="update-book-isComplete" type="checkbox" ${
        book.isComplete ? "checked" : ""
      }>`,
    focusConfirm: false,
    preConfirm: () => {
      const title = document.getElementById("update-book-title").value;
      const author = document.getElementById("update-book-author").value;
      const year = document.getElementById("update-book-year").value;
      const isComplete = document.getElementById(
        "update-book-isComplete"
      ).checked;

      if (!title || !author || !year) {
        Swal.showValidationMessage("Please fill out all fields");
        return null;
      }

      return { title, author, year, isComplete };
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      book.title = result.value.title;
      book.author = result.value.author;
      book.year = result.value.year;
      book.isComplete = result.value.isComplete;
  
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }
  });
}

// Function to search for books by title
function searchBook() {
  const input = document.getElementById("book-search").value.toLowerCase();
  const searchResults = document.getElementById("search-result");
  const books = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  searchResults.innerHTML = "";

  if (input.trim() === "") {
    searchResults.style.display = "none";
    return;
  }

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(input)
  );

  const bookResult = document.createElement("li");
  bookResult.classList.add("search-result");

  filteredBooks.forEach((book) => {
    bookResult.textContent = `${book.title} by ${book.author} (${book.year})`;
    searchResults.appendChild(bookResult);
  });

  if (filteredBooks.length === 0) {
    bookResult.textContent = "No books found";
    searchResults.appendChild(bookResult);
  }

  searchResults.style.display = "block";
}

// Initial setup when the document is loaded
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("add-book");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Render the book list whenever the RENDER_EVENT is trigerred
document.addEventListener(RENDER_EVENT, function () {
  const bookOnRead = document.getElementById("on-read");
  const bookCompleted = document.getElementById("on-finished");
  bookOnRead.innerHTML = "";
  bookCompleted.innerHTML = "";

  for (const book of books) {
    const bookElement = inputBook(book);
    if (!book.isComplete) {
      bookOnRead.append(bookElement);
    } else {
      bookCompleted.append(bookElement);
    }
  }
});

// Log the saved data to console when the SAVED_EVENT is triggered
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});



// script.js

// Step 1: Quote data
let quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" },
    { text: "I can do all things through Christ who strengthens me.", category: "Faith" }
];

// Step 2: Display a random quote
function showRandomQuote() {
    // Select a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // Target container
    const quoteContainer = document.getElementById("quote-container");
    quoteContainer.innerHTML = ""; // clear previous quote

    // Create elements
    const quoteText = document.createElement("p");
    quoteText.textContent = `"${quote.text}"`;

    const quoteCategory = document.createElement("span");
    quoteCategory.textContent = `— ${quote.category}`;
    quoteCategory.style.fontStyle = "italic";
    quoteCategory.style.color = "#555";

    // Append to container
    quoteContainer.appendChild(quoteText);
    quoteContainer.appendChild(quoteCategory);
}

// Step 3: Create a form to add new quotes
function createAddQuoteForm() {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = ""; // clear any existing form

    // Create form element
    const form = document.createElement("form");

    // Quote text input
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Enter quote text";
    textInput.required = true;

    // Category input
    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter category";
    categoryInput.required = true;

    // Submit button
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Add Quote";
    submitBtn.type = "submit";

    // Append inputs to form
    form.appendChild(textInput);
    form.appendChild(categoryInput);
    form.appendChild(submitBtn);

    // Handle form submission
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Add new quote to array
        const newQuote = {
            text: textInput.value.trim(),
            category: categoryInput.value.trim()
        };

        if (newQuote.text && newQuote.category) {
            quotes.push(newQuote);
            alert("Quote added successfully!");
            textInput.value = "";
            categoryInput.value = "";
        }
    });

    // Append form to container
    formContainer.appendChild(form);
}

// Step 4: Event listeners
document.getElementById("show-quote-btn").addEventListener("click", showRandomQuote);
document.getElementById("add-quote-btn").addEventListener("click", createAddQuoteForm);

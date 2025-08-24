// Array to store quotes
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "A person who never made a mistake never tried anything new.", category: "Wisdom" }
];

// Function to display a random quote
function showRandomQuote() {
    const quoteContainer = document.getElementById("quoteDisplay");

    if (quotes.length === 0) {
        quoteContainer.textContent = "No quotes available.";
        return;
    }

    // Pick a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Display in DOM
    quoteContainer.innerHTML = `
        <p><strong>Quote:</strong> "${randomQuote.text}"</p>
        <p><em>Category:</em> ${randomQuote.category}</p>
    `;
}

// Function to add a new quote from form inputs
function addQuote() {
    const quoteTextInput = document.getElementById("newQuoteText");
    const categoryInput = document.getElementById("newQuoteCategory");
    const quoteContainer = document.getElementById("quoteDisplay");

    const newQuoteText = quoteTextInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    if (newQuoteText === "" || newQuoteCategory === "") {
        alert("Please enter both a quote and a category.");
        return;
    }

    // Add new quote to array
    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory
    };
    quotes.push(newQuote);

    // Update the DOM immediately to show the new quote
    quoteContainer.innerHTML = `
        <p><strong>Quote:</strong> "${newQuote.text}"</p>
        <p><em>Category:</em> ${newQuote.category}</p>
    `;

    // Clear input fields
    quoteTextInput.value = "";
    categoryInput.value = "";

    alert("Quote added successfully!");
}

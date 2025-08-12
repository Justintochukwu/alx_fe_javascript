

// ---------- Step 1: Load Quotes from Local Storage ----------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" },
    { text: "I can do all things through Christ who strengthens me.", category: "Faith" }
];

// Load last selected category filter
let lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";

// ---------- Step 2: Save Quotes ----------
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------- Step 3: Populate Categories Dynamically ----------
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // reset with default

    // Get unique categories
    const categories = [...new Set(quotes.map(q => q.category))].sort();

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category
    categoryFilter.value = lastSelectedCategory;
}

// ---------- Step 4: Filter Quotes ----------
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    lastSelectedCategory = selectedCategory;

    // Save the last selected filter to local storage
    localStorage.setItem("selectedCategory", selectedCategory);

    const quoteContainer = document.getElementById("quoteDisplay");
    quoteContainer.innerHTML = "";

    // Filter logic
    const filteredQuotes = selectedCategory === "all" 
        ? quotes 
        : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteContainer.innerHTML = "<p>No quotes available for this category.</p>";
        return;
    }

    filteredQuotes.forEach(quote => {
        const quoteText = document.createElement("p");
        quoteText.textContent = `"${quote.text}"`;

        const quoteCategory = document.createElement("span");
        quoteCategory.textContent = `— ${quote.category}`;
        quoteCategory.style.fontStyle = "italic";
        quoteCategory.style.color = "#555";

        quoteContainer.appendChild(quoteText);
        quoteContainer.appendChild(quoteCategory);
        quoteContainer.appendChild(document.createElement("hr"));
    });
}

// ---------- Step 5: Display a Random Quote ----------
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // Save last viewed quote in session storage
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));

    const quoteContainer = document.getElementById("quote-container");
    quoteContainer.innerHTML = "";

    const quoteText = document.createElement("p");
    quoteText.textContent = `"${quote.text}"`;

    const quoteCategory = document.createElement("span");
    quoteCategory.textContent = `— ${quote.category}`;
    quoteCategory.style.fontStyle = "italic";
    quoteCategory.style.color = "#555";

    quoteContainer.appendChild(quoteText);
    quoteContainer.appendChild(quoteCategory);
}

// ---------- Step 6: Create Add Quote Form ----------
function createAddQuoteForm() {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = "";

    const form = document.createElement("form");

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Enter quote text";
    textInput.required = true;

    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter category";
    categoryInput.required = true;

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Add Quote";
    submitBtn.type = "submit";

    form.appendChild(textInput);
    form.appendChild(categoryInput);
    form.appendChild(submitBtn);

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const newQuote = {
            text: textInput.value.trim(),
            category: categoryInput.value.trim()
        };

        if (newQuote.text && newQuote.category) {
            quotes.push(newQuote);
            saveQuotes();
            populateCategories(); // update dropdown if new category
            alert("Quote added successfully!");
            textInput.value = "";
            categoryInput.value = "";
        }
    });

    formContainer.appendChild(form);
}

// ---------- Step 7: Load Last Viewed Quote ----------
function loadLastViewedQuote() {
    const lastQuote = sessionStorage.getItem("lastViewedQuote");
    if (lastQuote) {
        const quote = JSON.parse(lastQuote);
        const quoteContainer = document.getElementById("quote-container");

        const quoteText = document.createElement("p");
        quoteText.textContent = `"${quote.text}"`;

        const quoteCategory = document.createElement("span");
        quoteCategory.textContent = `— ${quote.category}`;
        quoteCategory.style.fontStyle = "italic";
        quoteCategory.style.color = "#555";

        quoteContainer.innerHTML = "";
        quoteContainer.appendChild(quoteText);
        quoteContainer.appendChild(quoteCategory);
    }
}

// ---------- Step 8: Event Listeners ----------
document.getElementById("show-quote-btn").addEventListener("click", showRandomQuote);
document.getElementById("add-quote-btn").addEventListener("click", createAddQuoteForm);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// ---------- Step 9: Initialize ----------
window.addEventListener("DOMContentLoaded", () => {
    populateCategories();
    filterQuotes(); 
});

// script.js

// ---------- Step 1: Load Quotes from Local Storage ----------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" },
    { text: "I can do all things through Christ who strengthens me.", category: "Faith" }
];

// ---------- Step 2: Save Quotes to Local Storage ----------
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------- Step 3: Display a Random Quote ----------
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

// ---------- Step 4: Create Add Quote Form ----------
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
            alert("Quote added successfully!");
            textInput.value = "";
            categoryInput.value = "";
        }
    });

    formContainer.appendChild(form);
}

// ---------- Step 5: Load Last Viewed Quote ----------
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

// ---------- Step 6: Export Quotes to JSON ----------
function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes, null, 2); // Pretty print
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

// ---------- Step 7: Import Quotes from JSON ----------
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);

            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid file format: JSON must be an array of quotes.');
            }
        } catch (err) {
            alert('Error reading JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// ---------- Step 8: Event Listeners ----------
document.getElementById("show-quote-btn").addEventListener("click", showRandomQuote);
document.getElementById("add-quote-btn").addEventListener("click", createAddQuoteForm);
document.getElementById("export-json-btn").addEventListener("click", exportToJsonFile);

// ---------- Step 9: Initialize ----------
window.addEventListener("DOMContentLoaded", () => {
    loadLastViewedQuote();
});

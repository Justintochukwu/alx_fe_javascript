// Function to show notifications
function showNotification(message) {
    const notif = document.createElement("div");
    notif.textContent = message;
    notif.style.position = "fixed";
    notif.style.bottom = "20px";
    notif.style.right = "20px";
    notif.style.background = "#333";
    notif.style.color = "#fff";
    notif.style.padding = "10px 20px";
    notif.style.borderRadius = "5px";
    notif.style.zIndex = "9999";
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 3000); // Disappear after 3 seconds
}

// Function to simulate fetching quotes from a server
// Function to post a new quote to the mock server
async function postQuoteToServer(quote) {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST", // POST request
            headers: {
                "Content-Type": "application/json" // JSON format
            },
            body: JSON.stringify(quote) // Convert object to JSON string
        });

        const data = await response.json();
        console.log("Quote posted to server:", data);

        showNotification("Quote successfully posted to server!");
    } catch (error) {
        console.error("Error posting quote:", error);
        showNotification("Failed to post quote to server!");
    }
}
// Function to sync quotes between local storage and server
async function syncQuotes() {
    try {
        console.log("Starting quote sync...");

        // Fetch latest quotes from server
        const serverResponse = await fetch("https://jsonplaceholder.typicode.com/posts");
        const serverQuotes = await serverResponse.json();

        // Get local quotes
        let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

        // Conflict resolution: server's data takes precedence
        const updatedQuotes = [...serverQuotes];

        // Save updated list to local storage
        localStorage.setItem("quotes", JSON.stringify(updatedQuotes));

        console.log("Sync completed. Local quotes updated from server.");
        showNotification("Quotes synced with server!");
    } catch (error) {
        console.error("Error syncing quotes:", error);
        showNotification("Failed to sync quotes.");
    }
}


// Periodic sync
function startQuoteSync() {
    fetchQuotesFromServer();
    setInterval(fetchQuotesFromServer, 30000);
}

// Create a simple notification function
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = `notification ${type}`;

    // Style it quickly (could be moved to CSS file)
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.backgroundColor = type === "error" ? "#ff4d4d" : "#4caf50";
    notification.style.color = "white";
    notification.style.padding = "10px 15px";
    notification.style.borderRadius = "5px";
    notification.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    notification.style.zIndex = "9999";
    notification.style.fontSize = "14px";

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

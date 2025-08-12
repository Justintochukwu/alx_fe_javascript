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

// Periodic sync
function startQuoteSync() {
    fetchQuotesFromServer();
    setInterval(fetchQuotesFromServer, 30000);
}

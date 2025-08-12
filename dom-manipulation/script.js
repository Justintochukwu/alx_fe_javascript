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
async function fetchQuotesFromServer() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await response.json();

        const serverQuotes = data.slice(0, 5).map(post => ({
            text: post.title,
            author: `User ${post.userId}`,
            category: "Server"
        }));

        let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

        // Detect new quotes from server
        const newServerQuotes = serverQuotes.filter(
            sq => !localQuotes.some(lq => lq.text === sq.text)
        );

        // Merge (server takes precedence)
        const mergedQuotes = [...serverQuotes, ...localQuotes.filter(
            lq => !serverQuotes.some(sq => sq.text === lq.text)
        )];

        localStorage.setItem("quotes", JSON.stringify(mergedQuotes));

        // Update UI
        displayQuotes(mergedQuotes);

        // Show notification if new quotes were found
        if (newServerQuotes.length > 0) {
            showNotification(`📢 ${newServerQuotes.length} new quote(s) from server`);
        }

    } catch (error) {
        console.error("Error fetching quotes from server:", error);
    }
}

// Periodic sync
function startQuoteSync() {
    fetchQuotesFromServer();
    setInterval(fetchQuotesFromServer, 30000);
}

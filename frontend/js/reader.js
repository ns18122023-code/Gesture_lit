const urlParams = new URLSearchParams(window.location.search);

const book = urlParams.get("book") || "sample.pdf";
const bookTitle = urlParams.get("title") || book;

document.getElementById("readerTitle").innerText = bookTitle;

let pageNum = parseInt(urlParams.get("page")) || 1;

const pdfUrl = `http://127.0.0.1:5000/books/${encodeURIComponent(book)}`;
const pdfFrame = document.getElementById("pdfFrame");
const pageInfo = document.getElementById("pageInfo");

function renderPage(num) {
    if (!pdfFrame) {
        alert("PDF frame not found");
        return;
    }

    pdfFrame.src = "";

    setTimeout(() => {
        pdfFrame.src = pdfUrl + "#page=" + num + "&zoom=90";
        console.log("Opening PDF:", pdfFrame.src);
    }, 100);

    if (pageInfo) {
        pageInfo.innerText = "Page " + num;
    }

    saveContinueReading();
    saveReadingHistoryToMongo();
}

function nextPage() {
    pageNum++;
    renderPage(pageNum);
}

function prevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
}

function saveContinueReading() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    let continueBooks = JSON.parse(localStorage.getItem("continueReading")) || [];

    continueBooks = continueBooks.filter(item =>
        !(item.user === user.email && item.pdf === book)
    );

    continueBooks.push({
        user: user.email,
        book: bookTitle,
        pdf: book,
        page: pageNum
    });

    localStorage.setItem("continueReading", JSON.stringify(continueBooks));
}

function saveReadingHistoryToMongo() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const now = new Date();

    fetch("http://127.0.0.1:5000/save-reading-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: user.email,
            bookId: "",
            bookTitle: bookTitle,
            page: pageNum,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        })
    }).catch(err => console.log("History save error:", err));
}

function addBookmark() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Please login first");
        return;
    }

    const now = new Date();

    const bookmarkData = {
        user: user.email,
        email: user.email,
        book: book,
        pdf: book,
        bookTitle: bookTitle,
        page: pageNum,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    };

    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarks.push(bookmarkData);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    fetch("http://127.0.0.1:5000/save-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: user.email,
            bookId: "",
            bookTitle: bookTitle,
            page: pageNum,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        })
    })
    .then(res => res.json())
    .then(() => alert("Bookmark saved successfully"))
    .catch(() => alert("Bookmark saved locally, but not in admin database"));
}

function closeBook() {
    window.location.href = "home.html";
}

renderPage(pageNum);
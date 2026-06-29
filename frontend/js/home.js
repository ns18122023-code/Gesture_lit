const API_URL = "http://127.0.0.1:5000";

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}

document.getElementById("welcomeText").innerText = `Welcome, ${user.name}`;

loadBooks();

function loadBooks() {
    const container = document.getElementById("booksContainer");
    container.innerHTML = "";

    const defaultBooks = [
        {
            id: "default-1",
            title: "2 States",
            category: "Romance",
            image: "images/book1.jpg",
            pdf: "sample.pdf",
            softPrice: 99,
            hardPrice: 299
        },
        {
            id: "default-2",
            title: "Until Love Sets Us Apart",
            category: "Fiction",
            image: "images/book2.jpg",
            pdf: "Until_Love_Sets_Us_Apart_.pdf",
            softPrice: 99,
            hardPrice: 299
        }
    ];

    defaultBooks.forEach(book => addBookCard(book));

    fetch(`${API_URL}/get-books`)
        .then(res => res.json())
        .then(books => {
            books.forEach(book => {
                addBookCard({
                    id: book.id,
                    title: book.title,
                    category: book.category,
                    image: `${API_URL}/book-image/${book.image}`,
                    pdf: book.pdf,
                    softPrice: book.softPrice || 99,
                    hardPrice: book.hardPrice || 299
                });
            });
        })
        .catch(error => {
            console.log("MongoDB books not loaded", error);
        });
}

function addBookCard(book) {
    const container = document.getElementById("booksContainer");

    const card = document.createElement("div");
    card.className = "book-card";

    const safeBook = encodeURIComponent(JSON.stringify(book));

    card.innerHTML = `
        <img src="${book.image}" alt="Book">
        <h3>${book.title}</h3>
        <p>Category: ${book.category}</p>
        <button onclick="readBook('${book.pdf}', '${book.title}')">Read</button>
        <button onclick="purchaseBook('${safeBook}')">Purchase</button>
    `;

    container.appendChild(card);
}

function readBook(pdf, title) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const continueBooks = JSON.parse(localStorage.getItem("continueReading")) || [];

    const existingBook = continueBooks.find(item =>
        item.user === user.email &&
        item.pdf === pdf
    );

    if (!existingBook) {
        window.location.href = `reader.html?book=${encodeURIComponent(pdf)}&title=${encodeURIComponent(title)}&page=1`;
        return;
    }

    window.location.href = `reader.html?book=${encodeURIComponent(pdf)}&title=${encodeURIComponent(title)}&page=${existingBook.page}`;
}

function purchaseBook(encodedBook) {
    const book = JSON.parse(decodeURIComponent(encodedBook));
    localStorage.setItem("selectedBook", JSON.stringify(book));
    window.location.href = "purchase.html";
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

function searchBooks() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let cards = document.querySelectorAll(".book-card");

    cards.forEach(card => {
        let title = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = title.includes(input) ? "block" : "none";
    });
}
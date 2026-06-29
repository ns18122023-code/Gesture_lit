const loggedUser = JSON.parse(localStorage.getItem("user"));

if(loggedUser && loggedUser.role === "admin"){
    window.location.href = "admin.html";
}
const user = JSON.parse(localStorage.getItem("user"));

if(!user){
    window.location.href = "login.html";
}

document.getElementById("userName").innerText =
    user.name;

document.getElementById("userEmail").innerText =
    user.email;

function logout(){

    localStorage.removeItem("user");

    window.location.href = "login.html";
}

/* ---------------- DOCUMENT UPLOAD ---------------- */

let documents = JSON.parse(localStorage.getItem("documents")) || [];

displayDocuments();

function uploadDocument(){

    const fileInput = document.getElementById("fileInput");

    if(fileInput.files.length === 0){

        alert("Please select a file");

        return;
    }

    const fileName = fileInput.files[0].name;

    documents.push(fileName);

    localStorage.setItem(
        "documents",
        JSON.stringify(documents)
    );

    displayDocuments();

    alert("Document uploaded successfully");
}

function displayDocuments(){

    const documentList =
        document.getElementById("documentList");

    documentList.innerHTML = "";

    documents.forEach((doc, index) => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${doc}
            <button onclick="deleteDocument(${index})">
                Delete
            </button>
        `;

        documentList.appendChild(li);

    });

}

function deleteDocument(index){

    documents.splice(index, 1);

    localStorage.setItem(
        "documents",
        JSON.stringify(documents)
    );

    displayDocuments();

}
displayBookmarks();

function displayBookmarks(){
    const bookmarkList = document.getElementById("bookmarkList");

    if(!bookmarkList) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

    const userBookmarks = bookmarks.filter(item =>
        item.user === user.email || item.email === user.email
    );

    bookmarkList.innerHTML = "";

    if(userBookmarks.length === 0){
        bookmarkList.innerHTML = "<li>No bookmarks yet.</li>";
        return;
    }

    userBookmarks.forEach((bookmark, index) => {
        const li = document.createElement("li");

        const bookFile = bookmark.pdf || bookmark.book || "sample.pdf";
        const bookName = bookmark.bookTitle || bookmark.book || bookFile;

        li.innerHTML = `
            Book: ${bookName} |
            Page: ${bookmark.page} |
            Date: ${bookmark.date || "N/A"}

            <button onclick="openBookmark('${bookFile}', '${bookName}', ${bookmark.page})">
                Open
            </button>

            <button onclick="deleteBookmark(${index})">
                Delete
            </button>
        `;

        bookmarkList.appendChild(li);
    });
}

function openBookmark(bookFile, bookName, pageNumber){
    window.location.href =
        `reader.html?book=${encodeURIComponent(bookFile)}&title=${encodeURIComponent(bookName)}&page=${pageNumber}`;
}

function deleteBookmark(index){
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

    bookmarks.splice(index, 1);

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    displayBookmarks();
}

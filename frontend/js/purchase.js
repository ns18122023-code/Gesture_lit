let selectedBook = JSON.parse(localStorage.getItem("selectedBook"));

if (!selectedBook) {
    selectedBook = {
        id: "",
        title: "Selected Book",
        pdf: "sample.pdf",
        softPrice: 99,
        hardPrice: 299
    };
}

document.getElementById("bookName").innerText = selectedBook.title;

let currentPurchaseType = "";
let currentPurchasePrice = 0;

function showToast(message) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="success-toast">${message}</div>
    `);

    setTimeout(() => {
        const toast = document.querySelector(".success-toast");
        if (toast) toast.remove();
    }, 1500);
}

async function savePurchase(type, price, method) {
    const user = JSON.parse(localStorage.getItem("user")) || {
        email: "unknown@gmail.com",
        name: "Unknown User"
    };

    let purchases = JSON.parse(localStorage.getItem("purchases")) || [];

    purchases.push({
        user: user.email,
        userName: user.name,
        book: selectedBook.title,
        pdf: selectedBook.pdf,
        type: type,
        price: price,
        paymentMethod: method,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("purchases", JSON.stringify(purchases));

    const res = await fetch("http://127.0.0.1:5000/save-purchase", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user.email,
            bookId: selectedBook.id || "",
            bookTitle: selectedBook.title,
            purchaseType: type,
            amount: price
        })
    });

    const data = await res.json();
    console.log("Purchase saved to MongoDB:", data);
}

function openSoftcopyPayment() {
    currentPurchaseType = "Softcopy";
    currentPurchasePrice = Number(selectedBook.softPrice) || 99;

    document.getElementById("paymentAmount").innerText =
        "Amount: ₹" + currentPurchasePrice;

    document.getElementById("paymentMethod").value = "";
    document.getElementById("paymentDetail").value = "";
    document.getElementById("paymentDetail").style.display = "block";

    document.getElementById("paymentModal").style.display = "flex";
}

function openHardcopyPayment() {
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (address === "" || phone === "") {
        showToast("Please enter address and phone number");
        return;
    }

    currentPurchaseType = "Hardcopy";
    currentPurchasePrice = Number(selectedBook.hardPrice) || 299;

    document.getElementById("paymentAmount").innerText =
        "Amount: ₹" + currentPurchasePrice;

    document.getElementById("paymentMethod").value = "";
    document.getElementById("paymentDetail").value = "";
    document.getElementById("paymentDetail").style.display = "block";

    document.getElementById("paymentModal").style.display = "flex";
}

function closePaymentGateway() {
    document.getElementById("paymentModal").style.display = "none";
}

document.getElementById("paymentMethod").addEventListener("change", function () {
    const method = this.value;
    const detailInput = document.getElementById("paymentDetail");

    if (method === "COD") {
        detailInput.style.display = "none";
        detailInput.value = "";
    } else if (method === "UPI") {
        detailInput.style.display = "block";
        detailInput.placeholder = "Enter UPI ID";
    } else if (method === "Card") {
        detailInput.style.display = "block";
        detailInput.placeholder = "Enter Card Number";
    } else {
        detailInput.style.display = "block";
        detailInput.placeholder = "Enter UPI ID or Card Number";
    }
});

async function confirmPayment() {
    const method = document.getElementById("paymentMethod").value;
    const detail = document.getElementById("paymentDetail").value.trim();

    if (method === "") {
        alert("Please select payment method");
        return;
    }

    if (method !== "COD" && detail === "") {
        alert("Please enter payment details");
        return;
    }

    try {
        await savePurchase(currentPurchaseType, currentPurchasePrice, method);
    } catch (err) {
        console.log("Purchase save failed:", err);
        alert("Purchase not saved in database. Check backend.");
        return;
    }

    closePaymentGateway();

    if (currentPurchaseType === "Softcopy") {
        showToast("Softcopy purchased successfully!");

        setTimeout(() => {
            window.location.href =
                `reader.html?book=${encodeURIComponent(selectedBook.pdf)}&title=${encodeURIComponent(selectedBook.title)}&page=1`;
        }, 900);
    } else {
        showToast("Hardcopy order placed successfully!");

        setTimeout(() => {
            window.location.href = "home.html";
        }, 900);
    }
}
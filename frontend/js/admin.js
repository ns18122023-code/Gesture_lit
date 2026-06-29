const API = "http://localhost:5000";

window.onload = function () {
  loadAdminDashboard();
};

async function loadAdminDashboard() {
  loadUserAnalytics();
  loadBookRecords();
  loadReadingHistory();
  loadPurchases();
  loadRealAnalytics();
  loadUserActivity();
  loadBookmarks();
}

async function loadUserAnalytics() {
  const res = await fetch(`${API}/admin-user-analytics`);
  const data = await res.json();

  document.getElementById("analyticsCards").innerHTML = `
    <div class="analytics-card">Total Users<br><b>${data.totalUsers}</b></div>
    <div class="analytics-card">Total Books<br><b>${data.totalBooks}</b></div>
    <div class="analytics-card">Total Orders<br><b>${data.totalOrders}</b></div>
    <div class="analytics-card">Reading History<br><b>${data.totalReadingHistory}</b></div>
    <div class="analytics-card">Bookmarks<br><b>${data.totalBookmarks}</b></div>
    <div class="analytics-card">Revenue<br><b>₹${data.totalRevenue}</b></div>
  `;
}

async function loadBookRecords() {
  const res = await fetch(`${API}/admin-book-records`);
  const books = await res.json();

  const table = document.getElementById("bookRecords");
  table.innerHTML = "";

  if (books.length === 0) {
    table.innerHTML = `<tr><td colspan="7">No book records found</td></tr>`;
    return;
  }

  books.forEach(book => {
    table.innerHTML += `
      <tr>
        <td>${book.title}</td>
        <td>${book.category}</td>
        <td>₹${book.softPrice}</td>
        <td>₹${book.hardPrice}</td>
        <td>${book.readCount}</td>
        <td>${book.purchaseCount}</td>
        <td>${book.bookmarkCount}</td>
      </tr>
    `;
  });
}

async function loadReadingHistory() {
  const res = await fetch(`${API}/admin-reading-history`);
  const history = await res.json();

  const table = document.getElementById("readingHistory");
  table.innerHTML = "";

  if (history.length === 0) {
    table.innerHTML = `<tr><td colspan="5">No reading history found</td></tr>`;
    return;
  }

  history.forEach(item => {
    table.innerHTML += `
      <tr>
        <td>${item.email}</td>
        <td>${item.bookTitle}</td>
        <td>${item.page}</td>
        <td>${item.date}</td>
        <td>${item.time}</td>
      </tr>
    `;
  });
}

async function loadPurchases() {
  const res = await fetch(`${API}/admin-orders`);
  const orders = await res.json();

  const table = document.getElementById("purchaseList");
  table.innerHTML = "";

  if (orders.length === 0) {
    table.innerHTML = `<tr><td colspan="5">No purchases found</td></tr>`;
    return;
  }

  orders.forEach(order => {
    table.innerHTML += `
      <tr>
        <td>${order.email}</td>
        <td>${order.bookTitle}</td>
        <td>${order.purchaseType}</td>
        <td>₹${order.amount}</td>
        <td>${order.status}</td>
      </tr>
    `;
  });
}

async function loadRealAnalytics() {
  const res = await fetch(`${API}/admin-real-analytics`);
  const data = await res.json();

  let html = `
    <h3>Most Read Books</h3>
    <ul>
  `;

  data.mostReadBooks.forEach(book => {
    html += `<li>${book.title} - ${book.reads} reads</li>`;
  });

  html += `
    </ul>
    <h3>Most Purchased Books</h3>
    <ul>
  `;

  data.mostPurchasedBooks.forEach(book => {
    html += `<li>${book.title} - ${book.purchases} purchases</li>`;
  });

  html += `</ul>`;

  document.getElementById("realAnalytics").innerHTML = html;
}

async function loadUserActivity() {
  const res = await fetch(`${API}/admin-user-activity`);
  const activity = await res.json();

  const table = document.getElementById("userActivity");
  table.innerHTML = "";

  if (activity.length === 0) {
    table.innerHTML = `<tr><td colspan="5">No user activity found</td></tr>`;
    return;
  }

  activity.forEach(user => {
    table.innerHTML += `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.totalReads}</td>
        <td>${user.totalPurchases}</td>
        <td>${user.totalBookmarks}</td>
      </tr>
    `;
  });
}

async function loadBookmarks() {
  const res = await fetch(`${API}/admin-bookmarks`);
  const bookmarks = await res.json();

  const table = document.getElementById("bookmarksList");
  table.innerHTML = "";

  if (bookmarks.length === 0) {
    table.innerHTML = `<tr><td colspan="5">No bookmarks found</td></tr>`;
    return;
  }

  bookmarks.forEach(item => {
    table.innerHTML += `
      <tr>
        <td>${item.email}</td>
        <td>${item.bookTitle}</td>
        <td>${item.page}</td>
        <td>${item.date}</td>
        <td>${item.time}</td>
      </tr>
    `;
  });
}
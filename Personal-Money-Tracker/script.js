const API_URL = "http://localhost:8080";

async function saveTransaction(event) {
  event.preventDefault();

  let friendName = document.getElementById("friendName").value;
  let amount = document.getElementById("amount").value;
  let type = document.getElementById("type").value;
  let purpose = document.getElementById("purpose").value;
  let notes = document.getElementById("notes").value;

  if (friendName === "" || amount === "" || purpose === "") {
    alert("Please fill friend name, amount and purpose");
    return;
  }

  let transaction = {
    friendName: friendName,
    amount: Number(amount),
    type: type,
    purpose: purpose,
    notes: notes
  };

  try {
    let response = await fetch(`${API_URL}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(transaction)
    });

    if (response.ok) {
      alert("Transaction saved successfully!");
      window.location.href = "history.html";
    } else {
      alert("Failed to save transaction");
    }
  } catch (error) {
    console.error(error);
    alert("Backend connection failed");
  }
}

async function loadHistory() {
  let historyBody = document.getElementById("historyBody");

  if (!historyBody) {
    return;
  }

  try {
    let response = await fetch(`${API_URL}/api/transactions`);
    let transactions = await response.json();

    historyBody.innerHTML = "";

    transactions.slice().reverse().forEach((transaction, index) => {
      historyBody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${transaction.date}</td>
          <td>${transaction.friendName}</td>
          <td>₹${transaction.amount}</td>
          <td>${transaction.type}</td>
          <td>${transaction.purpose}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error(error);

    historyBody.innerHTML = `
      <tr>
        <td colspan="6">Failed to load transactions</td>
      </tr>
    `;
  }
}

async function loadBalance() {
  let balanceBody = document.getElementById("balanceBody");

  if (!balanceBody) {
    return;
  }

  try {
    let response = await fetch(`${API_URL}/api/transactions`);
    let transactions = await response.json();

    let balances = {};

    transactions.forEach(transaction => {
      let friend = transaction.friendName;

      if (!balances[friend]) {
        balances[friend] = {
          sent: 0,
          returned: 0
        };
      }

      if (transaction.type === "sent") {
        balances[friend].sent += transaction.amount;
      } else {
        balances[friend].returned += transaction.amount;
      }
    });

    balanceBody.innerHTML = "";

    for (let friend in balances) {
      let sent = balances[friend].sent;
      let returned = balances[friend].returned;
      let pending = sent - returned;

      balanceBody.innerHTML += `
        <tr>
          <td>${friend}</td>
          <td>₹${sent}</td>
          <td>₹${returned}</td>
          <td>₹${pending}</td>
        </tr>
      `;
    }
  } catch (error) {
    console.error(error);

    balanceBody.innerHTML = `
      <tr>
        <td colspan="4">Failed to load balance</td>
      </tr>
    `;
  }
}

async function loadDashboard() {
  let totalSentElement = document.getElementById("totalSent");

  if (!totalSentElement) {
    return;
  }

  try {
    let response = await fetch(`${API_URL}/api/transactions`);
    let transactions = await response.json();

    let totalSent = 0;
    let totalReturned = 0;

    transactions.forEach(transaction => {
      if (transaction.type === "sent") {
        totalSent += transaction.amount;
      } else {
        totalReturned += transaction.amount;
      }
    });

    document.getElementById("totalSent").innerText = `₹${totalSent}`;
    document.getElementById("totalReturned").innerText = `₹${totalReturned}`;
    document.getElementById("balancePending").innerText =
      `₹${totalSent - totalReturned}`;
  } catch (error) {
    console.error(error);

    document.getElementById("totalSent").innerText = "Error";
    document.getElementById("totalReturned").innerText = "Error";
    document.getElementById("balancePending").innerText = "Error";
  }
}

async function addFriend(event) {
  event.preventDefault();

  let friendName = document.getElementById("friendName").value.trim();

  if (friendName === "") {
    alert("Please enter friend name");
    return;
  }

  try {
    let response = await fetch(`${API_URL}/api/friends`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: friendName
      })
    });

    if (response.ok) {
      alert("Friend added successfully!");
      document.getElementById("friendName").value = "";
      loadFriends();
    } else {
      alert("Failed to add friend");
    }
  } catch (error) {
    console.error(error);
    alert("Backend connection failed");
  }
}

async function loadFriends() {
  let friendsList = document.getElementById("friendsList");

  if (!friendsList) {
    return;
  }

  try {
    let response = await fetch(`${API_URL}/api/friends`);
    let friends = await response.json();

    friendsList.innerHTML = "";

    friends.forEach(friend => {
      friendsList.innerHTML += `
        <div class="friend-card">
          <a href="friend-details.html?name=${friend.name}" class="friend-link">
            ${friend.name}
          </a>
        </div>
      `;
    });
  } catch (error) {
    console.error(error);
    friendsList.innerHTML = "Failed to load friends";
  }
}

async function loadFriendDropdown() {
  let friendSelect = document.getElementById("friendName");

  if (!friendSelect || friendSelect.tagName !== "SELECT") {
    return;
  }

  try {
    let response = await fetch(`${API_URL}/api/friends`);
    let friends = await response.json();

    friendSelect.innerHTML = `<option value="">Select Friend</option>`;

    friends.forEach(friend => {
      friendSelect.innerHTML += `
        <option value="${friend.name}">${friend.name}</option>
      `;
    });
  } catch (error) {
    console.error(error);
    friendSelect.innerHTML =
      `<option value="">Failed to load friends</option>`;
  }
}

async function loadFriendDetails() {
  let title = document.getElementById("friendTitle");

  if (!title) {
    return;
  }

  let params = new URLSearchParams(window.location.search);
  let friendName = params.get("name");

  title.innerText = friendName;

  try {
    let response = await fetch(`${API_URL}/api/transactions`);
    let transactions = await response.json();

    let sent = 0;
    let returned = 0;

    let tableBody = document.getElementById("friendTransactionBody");
    tableBody.innerHTML = "";

    transactions.forEach(transaction => {
      if (transaction.friendName !== friendName) {
        return;
      }

      if (transaction.type === "sent") {
        sent += transaction.amount;
      } else {
        returned += transaction.amount;
      }

      tableBody.innerHTML += `
        <tr>
          <td>${transaction.date}</td>
          <td>₹${transaction.amount}</td>
          <td>${transaction.type}</td>
          <td>${transaction.purpose}</td>
        </tr>
      `;
    });

    document.getElementById("friendSent").innerText = `₹${sent}`;
    document.getElementById("friendReturned").innerText = `₹${returned}`;
    document.getElementById("friendPending").innerText = `₹${sent - returned}`;
  } catch (error) {
    console.error(error);
  }
}

loadHistory();
loadBalance();
loadDashboard();
loadFriends();
loadFriendDropdown();
loadFriendDetails();
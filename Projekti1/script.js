const input = document.getElementById("goal-input");
const dateInput = document.getElementById("goal-date");
const addBtn = document.getElementById("add-btn");
const goalList = document.getElementById("goal-list");
const reminderText = document.getElementById("reminder");

let goals = JSON.parse(localStorage.getItem("goals")) || [];

let chart;

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

function updateChart() {
  const done = goals.filter(g => g.completed).length;
  const pending = goals.length - done;

  if (chart) chart.destroy();
  const ctx = document.getElementById("goalChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Valmiit", "Kesken"],
      datasets: [{
        data: [done, pending],
        backgroundColor: ["#4CAF50", "#ccc"],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

function renderGoals() {
  goalList.innerHTML = "";
  let reminder = "";

  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.classList.add("goal");
    if (goal.completed) li.classList.add("completed");

    const dueDate = new Date(goal.date);
    const today = new Date();
    let dateColor = "#888";

    if (!goal.completed && dueDate < today) {
      dateColor = "red";
      reminder = "⚠️ Sinulla on vanhentuneita tavoitteita!";
    } else if (!goal.completed && (dueDate - today) / (1000 * 60 * 60 * 24) <= 2) {
      dateColor = "orange";
    } else if (goal.completed) {
      dateColor = "green";
    }

    li.innerHTML = `
      <span>${goal.text}</span>
      <small class="goal-date" style="color:${dateColor}">${goal.date}</small>
      <div>
        <button class="action" onclick="toggleGoal(${index})">✔️</button>
        <button class="action" onclick="deleteGoal(${index})">🗑️</button>
      </div>
    `;
    goalList.appendChild(li);
  });

  reminderText.textContent = reminder;
  updateChart();
}

function addGoal() {
  const text = input.value.trim();
  const date = dateInput.value;

  if (text === "" || date === "") return alert("Täytä tavoite ja päivämäärä!");
  goals.push({ text, date, completed: false });
  input.value = "";
  dateInput.value = "";

  saveGoals();
  renderGoals();
}

function toggleGoal(index) {
  goals[index].completed = !goals[index].completed;
  saveGoals();
  renderGoals();
}

function deleteGoal(index) {
  goals.splice(index, 1);
  saveGoals();
  renderGoals();
}

addBtn.addEventListener("click", addGoal);
renderGoals();

// 🔔 Muistutusominaisuus
if (Notification.permission !== "denied") {
  Notification.requestPermission();
}

function checkReminders() {
  const overdue = goals.filter(g => !g.completed && new Date(g.date) < new Date());
  if (overdue.length > 0 && Notification.permission === "granted") {
    new Notification("Tavoiteseuranta", {
      body: `Sinulla on ${overdue.length} vanhentunutta tavoitetta!`,
    });
  }
}

setInterval(checkReminders, 30000);

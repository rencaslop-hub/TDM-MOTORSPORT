/**
 * TDM MOTORSPORT - Formula 5 Client Application Logic
 * Clean Vanilla JavaScript Architecture
 */

// --- Global Application State ---
const state = {
    currentUser: { username: "Guest", isAdmin: false, isEditor: false },
    usersRegistry: [
        { usuario: "admin", esAdmin: true },
        { usuario: "alex_tdm", esAdmin: true },
        { usuario: "mario_eng", esAdmin: false }
    ],
    roster: [
        { id: 1, name: "Carlos Mendoza", role: "Chief Engineer", bio: "Vehicle dynamics specialist.", photo: "https://via.placeholder.com/100" },
        { id: 2, name: "Sofia Rivera", role: "Telemetry & Electronics", bio: "DAQ and sensors developer.", photo: "https://via.placeholder.com/100" }
    ],
    documents: [
        { id: 101, title: "F5 Chassis Stress Analysis", type: "PDF", system: "Chasis", uploader: "alex_tdm", date: "2026-10-12" },
        { id: 102, title: "Engine ECU Wiring Map", type: "DOCX", system: "Powertrain", uploader: "mario_eng", date: "2026-10-18" }
    ],
    systems: [
        {
            id: "SYS-01",
            name: "Chasis & Frame",
            function: "Structural tubular spaceframe designed for high torsional stiffness.",
            image: "https://via.placeholder.com/300x150",
            components: [
                { name: "Front Roll Hoop", function: "Driver overhead safety protection.", mfg: "In-House Welded", manualUrl: "#", photo: "https://via.placeholder.com/150" },
                { name: "Impact Attenuator", function: "Frontal crash kinetic energy absorption.", mfg: "Purchased - FIA Spec", manualUrl: "#", photo: "https://via.placeholder.com/150" }
            ]
        },
        {
            id: "SYS-02",
            name: "Powertrain & ECU",
            function: "Engine assembly and custom electronic control mapping.",
            image: "https://via.placeholder.com/300x150",
            components: [
                { name: "Throttle Body", function: "Air intake actuation control.", mfg: "Purchased OEM", manualUrl: "#", photo: "https://via.placeholder.com/150" }
            ]
        }
    ],
    tasks: [
        { id: "TSK-01", title: "Frame TIG Welding", assignee: "Carlos M.", dates: "Nov 01 - Nov 10", status: "In Progress", pct: 60 },
        { id: "TSK-02", title: "ECU Harness Bench Test", assignee: "Sofia R.", dates: "Nov 05 - Nov 12", status: "Pending", pct: 15 }
    ],
    inventory: [
        { id: 1, material: "4130 Chromoly Steel Tubing (m)", available: 18, required: 40, supplier: "Tubing Direct" },
        { id: 2, material: "Carbon Fiber Sheet (m2)", available: 25, required: 20, supplier: "Composite Co" }
    ],
    auditLogs: []
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    renderRoster();
    renderDocuments();
    renderSystems();
    renderTasks();
    renderInventory();
    renderAdminUserList();
    initCharts();
    initCalendar();
    logAudit("System initialized in Guest Mode.");
});

// --- Auth & Access Control ---
function initAuth() {
    updateAccessUI();
}

function authenticateUser() {
    const input = document.getElementById("authUsernameInput").value.trim();
    if (!input) return;

    const match = state.usersRegistry.find(u => u.usuario.toLowerCase() === input.toLowerCase());
    
    if (match) {
        state.currentUser = {
            username: match.usuario,
            isAdmin: match.esAdmin,
            isEditor: true
        };
        logAudit(`User authenticated: ${match.usuario} (Admin: ${match.esAdmin})`);
    } else {
        alert("User handle not authorized. Granted Public View Access.");
        state.currentUser = { username: input, isAdmin: false, isEditor: false };
    }
    
    updateAccessUI();
    toggleAuthModal();
}

function logout() {
    state.currentUser = { username: "Guest", isAdmin: false, isEditor: false };
    logAudit("User logged out.");
    updateAccessUI();
    switchSection('overview-section');
    toggleAuthModal();
}

function updateAccessUI() {
    const badge = document.getElementById("roleBadge");
    const nameDisp = document.getElementById("usernameDisplay");
    
    nameDisp.textContent = state.currentUser.username;
    badge.className = "role-badge " + (state.currentUser.isAdmin ? "admin" : state.currentUser.isEditor ? "editor" : "guest");
    badge.textContent = state.currentUser.isAdmin ? "ADMIN" : state.currentUser.isEditor ? "EDITOR" : "GUEST MODE";

    // Toggle nav routing permissions
    document.querySelectorAll(".private-route").forEach(el => {
        if (state.currentUser.isEditor) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    });

    document.querySelectorAll(".admin-only").forEach(el => {
        if (state.currentUser.isAdmin) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    });

    document.querySelectorAll(".editor-only").forEach(el => {
        el.style.display = state.currentUser.isEditor ? "inline-flex" : "none";
    });
}

function switchSection(sectionId) {
    document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    
    document.getElementById(sectionId).classList.add("active");
    const activeNav = document.querySelector(`[data-section="${sectionId}"]`);
    if(activeNav) activeNav.classList.add("active");
}

function toggleAuthModal() {
    document.getElementById("authModal").classList.toggle("active");
}

// --- Team Roster Functions ---
function renderRoster() {
    const grid = document.getElementById("rosterGrid");
    grid.innerHTML = state.roster.map(m => `
        <div class="card">
            <div class="card-body d-flex gap-3 align-center">
                <img src="${m.photo}" alt="${m.name}" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">
                <div>
                    <h4>${m.name}</h4>
                    <small style="color:var(--primary-blue); font-weight:bold;">${m.role}</small>
                    <p class="text-sm mt-1">${m.bio}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleEditTeamStory() {
    const disp = document.getElementById("storyDisplay");
    const edit = document.getElementById("storyEditor");
    disp.classList.toggle("hidden");
    edit.classList.toggle("hidden");

    if(!edit.classList.contains("hidden")) {
        document.getElementById("missionInput").value = document.getElementById("missionText").textContent;
        document.getElementById("historyInput").value = document.getElementById("historyText").textContent;
    }
}

function saveTeamStory() {
    document.getElementById("missionText").textContent = document.getElementById("missionInput").value;
    document.getElementById("historyText").textContent = document.getElementById("historyInput").value;
    toggleEditTeamStory();
    logAudit("Updated team mission & vision overview.");
}

// --- Tech Documents Functions ---
function renderDocuments() {
    const filter = document.getElementById("docSystemFilter") ? document.getElementById("docSystemFilter").value : "ALL";
    const tbody = document.getElementById("docsTableBody");
    
    const filtered = filter === "ALL" ? state.documents : state.documents.filter(d => d.system === filter);
    
    tbody.innerHTML = filtered.map(d => `
        <tr>
            <td><strong>${d.title}</strong></td>
            <td><span class="stock-badge stock-ok">${d.type}</span></td>
            <td>${d.system}</td>
            <td>${d.uploader}</td>
            <td>${d.date}</td>
            <td>
                <button class="btn btn-secondary" onclick="alert('Downloading ${d.title}...')"><i class="fa-solid fa-download"></i></button>
                ${state.currentUser.isEditor ? `<button class="btn btn-danger" onclick="deleteDoc(${d.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
            </td>
        </tr>
    `).join('');
}

function filterDocuments() { renderDocuments(); }

function deleteDoc(id) {
    if(confirm("Are you sure you want to delete this technical document?")) {
        state.documents = state.documents.filter(d => d.id !== id);
        renderDocuments();
        logAudit(`Deleted document ID: ${id}`);
    }
}

// --- Car Systems Functions ---
function renderSystems() {
    const grid = document.getElementById("systemsGrid");
    grid.innerHTML = state.systems.map(sys => `
        <div class="card">
            <img src="${sys.image}" style="width:100%; height:140px; object-fit:cover;">
            <div class="card-header">${sys.name}</div>
            <div class="card-body">
                <p class="text-sm mb-3">${sys.function}</p>
                <h5>Components Spec List:</h5>
                <ul style="list-style:none; margin-top:0.5rem;">
                    ${sys.components.map((comp, idx) => `
                        <li style="padding:0.3rem 0; border-bottom:1px solid var(--border-color);">
                            <a href="#" onclick="openComponentModal('${sys.id}', ${idx})" style="color:var(--primary-blue); font-weight:600; text-decoration:none;">
                                <i class="fa-solid fa-microchip"></i> ${comp.name}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function openComponentModal(sysId, compIndex) {
    const system = state.systems.find(s => s.id === sysId);
    const comp = system.components[compIndex];
    
    document.getElementById("compSpecName").textContent = comp.name;
    document.getElementById("compSpecBody").innerHTML = `
        <div class="d-flex gap-3 mb-3">
            <img src="${comp.photo}" style="width:120px; height:120px; border-radius:8px; object-fit:cover;">
            <div>
                <p><strong>System Parent:</strong> ${system.name}</p>
                <p><strong>Function:</strong> ${comp.function}</p>
                <p><strong>Manufacturing Spec:</strong> ${comp.mfg}</p>
                <p class="mt-2"><a href="${comp.manualUrl}" target="_blank" style="color:var(--primary-blue);"><i class="fa-solid fa-link"></i> Technical Datasheet / Spec PDF</a></p>
            </div>
        </div>
    `;
    document.getElementById("componentSpecModal").classList.add("active");
}

function closeComponentModal() {
    document.getElementById("componentSpecModal").classList.remove("active");
}

// --- Tasks & Analytics ---
function renderTasks() {
    const tbody = document.getElementById("tasksTableBody");
    tbody.innerHTML = state.tasks.map(t => `
        <tr>
            <td><code>${t.id}</code></td>
            <td>${t.title}</td>
            <td>${t.assignee}</td>
            <td>${t.dates}</td>
            <td><span class="stock-badge stock-ok">${t.status}</span></td>
            <td>${t.pct}%</td>
            <td class="editor-only">
                <button class="btn btn-secondary" onclick="deleteTask('${t.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function initCharts() {
    const ctx1 = document.getElementById('weeklyPerfChart').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
            datasets: [{ label: 'Tasks Completed', data: [3, 7, 5, 12], borderColor: '#0039a6', tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctx2 = document.getElementById('ganttSimChart').getContext('2d');
    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Chasis', 'Powertrain', 'Aero', 'Electronics'],
            datasets: [{ label: '% Progress', data: [85, 60, 40, 75], backgroundColor: '#0039a6' }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
    });
}

function initCalendar() {
    const calendarEl = document.getElementById('calendarContainer');
    if(!calendarEl) return;
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev,next', center: 'title', right: 'dayGridMonth' },
        events: [
            { title: 'Chassis TIG Rollout', start: '2026-11-10' },
            { title: 'Engine Dyno Test', start: '2026-11-18' }
        ]
    });
    calendar.render();
}

// --- Inventory Management ---
function renderInventory() {
    const tbody = document.getElementById("inventoryTableBody");
    tbody.innerHTML = state.inventory.map(item => {
        const isLow = item.available < item.required;
        return `
            <tr>
                <td><strong>${item.material}</strong></td>
                <td>${item.available}</td>
                <td>${item.required}</td>
                <td>
                    <span class="stock-badge ${isLow ? 'stock-low' : 'stock-ok'}">
                        ${isLow ? 'DEFICIT ALERT' : 'OPTIMAL'}
                    </span>
                </td>
                <td>${item.supplier}</td>
                <td class="editor-only">
                    <button class="btn btn-secondary" onclick="deleteInventoryItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function exportInventoryCSV() {
    const csv = Papa.unparse(state.inventory);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tdm_inventory_report.csv';
    a.click();
    logAudit("Exported inventory to CSV.");
}

// --- Admin Controls & Audit Log ---
function renderAdminUserList() {
    const container = document.getElementById("userListContainer");
    if(!container) return;
    container.innerHTML = state.usersRegistry.map((u, i) => `
        <div class="d-flex justify-between align-center mb-1">
            <span>${u.usuario} ${u.esAdmin ? '<strong>(Admin)</strong>' : ''}</span>
            <button class="btn btn-danger" style="padding:0.1rem 0.4rem; font-size:0.7rem;" onclick="removeUser(${i})">Remove</button>
        </div>
    `).join('');
}

function addUserManual() {
    const u = document.getElementById("newUsername").value.trim();
    const isAdmin = document.getElementById("newUserAdmin").checked;
    if(!u) return;

    state.usersRegistry.push({ usuario: u, esAdmin: isAdmin });
    document.getElementById("newUsername").value = '';
    renderAdminUserList();
    logAudit(`Added user: ${u}`);
}

function removeUser(idx) {
    const removed = state.usersRegistry.splice(idx, 1);
    renderAdminUserList();
    logAudit(`Removed user: ${removed[0].usuario}`);
}

function logAudit(eventText) {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[${timestamp}] ${eventText}`;
    state.auditLogs.unshift(logMsg);
    
    const box = document.getElementById("auditLogBox");
    if(box) {
        box.innerHTML = state.auditLogs.map(l => `<div>${l}</div>`).join('');
    }
}

// Modal helper controls
function closeGenericModal() {
    document.getElementById("genericFormModal").classList.remove("active");
}
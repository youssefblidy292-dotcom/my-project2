let timer;
let timeRemaining = 25 * 60;
let isRunning = false;
let prayerTimes = {};
let notifiedPrayers = new Set();

const alertSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
const adhanSound = new Audio('https://www.islamcan.com/common/azan/azan1.mp3');

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

const digitalTimer = document.getElementById('digitalTimer');
const graphicalTimer = document.getElementById('graphicalTimer');
const ctx = graphicalTimer.getContext('2d');

function updateDisplay() {
    let m = Math.floor(timeRemaining / 60);
    let s = timeRemaining % 60;
    digitalTimer.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    drawCircle();
}

function drawCircle() {
    const total = document.getElementById('sessionTime').value * 60;
    const progress = timeRemaining / total;
    ctx.clearRect(0,0,250,250);

    ctx.beginPath();
    ctx.arc(125,125,90,0,Math.PI*2);
    ctx.strokeStyle="#e2e8f0";
    ctx.lineWidth=10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(125,125,90,-Math.PI/2,(Math.PI*2*progress)-Math.PI/2);
    ctx.strokeStyle="#007BFF";
    ctx.stroke();
}

document.getElementById('startBtn').onclick = () => {
    if (isRunning) return;
    isRunning = true;
    timer = setInterval(()=>{
        if (timeRemaining>0){
            timeRemaining--;
            updateDisplay();
        } else {
            clearInterval(timer);
            alertSound.play();
            new Notification("انتهى الوقت");
            isRunning=false;
        }
    },1000);
};

document.getElementById('pauseBtn').onclick = () => {
    clearInterval(timer);
    isRunning=false;
};

document.getElementById('resetBtn').onclick = () => {
    clearInterval(timer);
    timeRemaining = document.getElementById('sessionTime').value*60;
    updateDisplay();
    isRunning=false;
};

document.getElementById('addTaskBtn').onclick = () => {
    const v = taskInput.value;
    if(!v) return;
    const li = document.createElement('li');
    li.innerHTML = `${v} <button onclick="this.parentElement.remove()">✖</button>`;
    taskList.appendChild(li);
    taskInput.value="";
};

document.getElementById('digitalBtn').onclick = ()=>{
    digitalTimer.classList.add('active');
    graphicalTimer.classList.remove('active');
};

document.getElementById('graphicalBtn').onclick = ()=>{
    graphicalTimer.classList.add('active');
    digitalTimer.classList.remove('active');
    updateDisplay();
};

document.getElementById('themeToggle').onclick = ()=>{
    document.body.classList.toggle('dark');
};

function fetchPrayerTimes(){
    navigator.geolocation.getCurrentPosition(pos=>{
        fetch(`https://api.aladhan.com/v1/timings?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&method=5`)
        .then(r=>r.json())
        .then(d=>{
            const t=d.data.timings;
            prayerTimes={
                "الفجر":t.Fajr,
                "الظهر":t.Dhuhr,
                "العصر":t.Asr,
                "المغرب":t.Maghrib,
                "العشاء":t.Isha
            };
            locationStatus.textContent="📍 مواقيت الصلاة حسب موقعك";
            prayerTimesList.innerHTML=Object.entries(prayerTimes)
            .map(([n,t])=>`<li>${n}<span>${t}</span></li>`).join('');
        });
    });
}

fetchPrayerTimes();
updateDisplay();

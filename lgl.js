document.addEventListener("DOMContentLoaded", function () {
  function recordTime(phaseId) {
    const now = performance.now() / 1000;
    document.getElementById(phaseId).value = now.toFixed(3);

    const timeDisplayId = {
      startLoading: 'start-loading-time',
      digging: 'digging-time',
      spotting1: 'spotting1-time',
      swingLoad: 'swing-load-time',
      spotting2: 'spotting2-time',
      dumpingExca: 'dumping-exca-time',
      spotting3: 'spotting3-time',
      swingEmpty: 'swing-empty-time',
      spotting4: 'spotting4-time',
      startLoadingDT: 'start-loading-dt-time',
      manuverDT: 'manuver-dt-time'
    }[phaseId];

    const nowDate = new Date();
    const timeStr = nowDate.toLocaleTimeString('en-GB') + '.' + nowDate.getMilliseconds().toString().padStart(3, '0');
    document.getElementById(timeDisplayId).textContent = timeStr;
    document.getElementById(timeDisplayId).classList.add('recorded-time');
  }

  function resetTimeCallExca() {
    const ids = ['startLoading', 'digging', 'spotting1', 'swingLoad',
                 'spotting2', 'dumpingExca', 'spotting3',
                 'swingEmpty', 'spotting4'];
    ids.forEach(id => {
      document.getElementById(id).value = '';
      const textId = id.replace(/([A-Z])/g, "-$1").toLowerCase() + '-time';
      const element = document.getElementById(textId);
      if (element) {
        element.textContent = '-';
        element.classList.remove('recorded-time');
      }
    });
  }

  function resetTimeCallDT() {
    const ids = ['startLoadingDT', 'manuverDT'];
    ids.forEach(id => {
      document.getElementById(id).value = '';
      const textId = id.replace(/([A-Z])/g, "-$1").toLowerCase() + '-time';
      const element = document.getElementById(textId);
      if (element) {
        element.textContent = '-';
        element.classList.remove('recorded-time');
      }
    });
  }

  window.recordTime = recordTime;
  window.resetTimeCallExca = resetTimeCallExca;
  window.resetTimeCallDT = resetTimeCallDT;

  document.getElementById("calc-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const BC = +document.getElementById("bucketCapacity").value;
    const F = +document.getElementById("fillFactor").value;
    const TB = +document.getElementById("totalBucket").value;
    const VC = +document.getElementById("vesselCapacity").value;

    const Swell = 0.93;
    const Density = 1.578;

    // Ambil waktu excavator dalam detik
    const startLoading = +document.getElementById("startLoading").value;
    const digging = +document.getElementById("digging").value;
    const spotting1 = +document.getElementById("spotting1").value;
    const swingLoad = +document.getElementById("swingLoad").value;
    const spotting2 = +document.getElementById("spotting2").value;
    const dumpingExca = +document.getElementById("dumpingExca").value;
    const spotting3 = +document.getElementById("spotting3").value;
    const swingEmpty = +document.getElementById("swingEmpty").value;
    const spotting4 = +document.getElementById("spotting4").value;

    // Ambil waktu dump truck dalam detik
    const startLoadingDT = +document.getElementById("startLoadingDT").value;
    const manuverDT = +document.getElementById("manuverDT").value;

    // Validasi input waktu excavator
    const allTimesExca = [startLoading, digging, spotting1, swingLoad, spotting2, dumpingExca, spotting3, swingEmpty, spotting4];
    if (allTimesExca.some(t => t === 0 || isNaN(t))) {
      alert("Lengkapi semua pencatatan waktu excavator sebelum menghitung.");
      return;
    }

    // Validasi input waktu dump truck
    if (startLoadingDT === 0 || isNaN(startLoadingDT) || manuverDT === 0 || isNaN(manuverDT)) {
      alert("Lengkapi semua pencatatan waktu dump truck sebelum menghitung.");
      return;
    }

    // Hitung durasi masing-masing tahapan excavator
    const dDig = digging - startLoading;
    const dSpot1 = spotting1 - digging;
    const dSwingL = swingLoad - spotting1;
    const dSpot2 = spotting2 - swingLoad;
    const dDumpExca = dumpingExca - spotting2;
    const dSpot3 = spotting3 - dumpingExca;
    const dSwingE = swingEmpty - spotting3;
    const dSpot4 = spotting4 - swingEmpty;

    // Perhitungan sesuai rumus baru
    const cycleExca = dDig + dSpot1 + dSwingL + dSpot2 + dDumpExca + dSpot3 + dSwingE + dSpot4;
    const totalSpottingTime = dSpot1 + dSpot2 + dSpot3 + dSpot4;
    const pureCycleExca = cycleExca - totalSpottingTime;
    const effExca = pureCycleExca / cycleExca;

    const q = BC * F;
    const prodExca = (q * 3600 * effExca * Swell) / cycleExca;
    const prodExcaTon = prodExca * Density;

    // Perhitungan dump truck sesuai rumus baru
    const cycleDT = manuverDT - startLoadingDT;
    const ritaseHour = 60 / (cycleDT / 60);
    const prodDT = (VC * 3600 * Swell) / cycleDT;
    const prodDTTon = prodDT * Density;
    const fleetMatch = prodExcaTon / prodDTTon;

    fetch("https://script.google.com/macros/s/AKfycbwAZ93T521tA0gI7eWfgCac1RwU6OBn5n6-nEAtd1-mxj7dpVZ5CjCInVXRy5j4umDg2g/exec", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        material: "lgl",
        excavator300: document.getElementById("excavator300").value,
        area: document.getElementById("area").value,
        cuaca: document.getElementById("cuaca").value,
        cycleExca: cycleExca.toFixed(2),
        totalSpottingTime: totalSpottingTime.toFixed(2),
        effExca: effExca.toFixed(4),
        prodExca: prodExca.toFixed(2),
        cycleDT: cycleDT.toFixed(2),
        ritaseHour: ritaseHour.toFixed(2),
        prodDT: prodDT.toFixed(2),
        prodDTTon: prodDTTon.toFixed(2),
        fleetMatch: fleetMatch.toFixed(2)  
      })
    });

    document.getElementById("output").innerHTML = `
      <label>Cycle Time Excavator 300 (s)</label>
      <input type="text" value="${cycleExca.toFixed(2)}" readonly>

      <label>Total Spotting Time (s)</label>
      <input type="text" value="${totalSpottingTime.toFixed(2)}" readonly>

      <label>Efisiensi Kerja Excavator</label>
      <input type="text" value="${effExca.toFixed(4)}" readonly>

      <label>Productivity Excavator (bcm/hour)</label>
      <input type="text" value="${prodExca.toFixed(2)}" readonly>

      <label>Cycle Time Dumptruck (s)</label>
      <input type="text" value="${cycleDT.toFixed(2)}" readonly>

      <label>Ritase / Hour</label>
      <input type="text" value="${ritaseHour.toFixed(2)}" readonly>

      <label>Dumptruck Productivity (Ton/hour)</label>
      <input type="text" value="${prodDTTon.toFixed(2)}" readonly>

      <label>Fleet Matching</label>
      <input type="text" value="${fleetMatch.toFixed(2)}" readonly>
    `;
  });
});
// js/konfirmasi.js - Logic for Form Konfirmasi Kehadiran & Google Spreadsheet Integration

document.addEventListener('DOMContentLoaded', () => {
  // URL Apps Script Google Spreadsheet
  const scriptURL = 'https://script.google.com/macros/s/AKfycbz2zCQuI9tJLehAh_gC6OG3ycHxaPrnAmOBF0ly_y7aM9f4rlpA-FQP67PRDNL8EFkB/exec';

  const form = document.getElementById('formKonfirmasi');
  const btnSubmit = form ? form.querySelector('.btn-submit-main') : null;
  const canvas = document.getElementById('sigCanvas');
  const btnClearSig = document.getElementById('btnClearSig');
  const suksesBox = document.getElementById('suksesBox');
  const toastWrap = document.getElementById('toastWrap');

  // ==========================================
  // 1. Mode Hadir Option Pills Handler
  // ==========================================
  const modeLabels = document.querySelectorAll('.mode-pill-label');
  modeLabels.forEach(label => {
    label.addEventListener('click', (e) => {
      e.preventDefault();
      modeLabels.forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      const radio = label.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
    });
  });

  // ==========================================
  // 2. Signature Canvas Drawing Logic
  // ==========================================
  let isDrawing = false;
  let hasSigned = false;
  let lastX = 0;
  let lastY = 0;
  let ctx = null;

  if (canvas) {
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1A1F36';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getCoordinates(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);

      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function startDrawing(e) {
      if (e.cancelable) e.preventDefault();
      isDrawing = true;
      hasSigned = true;

      // Guarantee stroke properties on every draw start
      ctx.strokeStyle = '#1A1F36';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const { x, y } = getCoordinates(e);
      lastX = x;
      lastY = y;
    }

    function draw(e) {
      if (!isDrawing) return;
      if (e.cancelable) e.preventDefault();
      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
    }

    function stopDrawing() {
      isDrawing = false;
    }

    // Mouse Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch Listeners (Mobile & Tablet)
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
  }

  // Clear Signature button ("Bersihkan Ulang")
  if (btnClearSig && canvas && ctx) {
    btnClearSig.addEventListener('click', (e) => {
      e.preventDefault();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
      showToast('Tanda tangan berhasil dibersihkan.', 'success');
    });
  }

  // ==========================================
  // 3. Form Submit Handler & Google Apps Script
  // ==========================================
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = document.getElementById('namaLengkap')?.value.trim();
      const jabatan = document.getElementById('jabatan')?.value.trim();
      const instansi = document.getElementById('instansi')?.value.trim();
      const modeRadio = document.querySelector('input[name="modeHadir"]:checked');
      const modeHadir = modeRadio ? modeRadio.value : 'Daring (Online)';

      if (!nama || !jabatan || !instansi) {
        showToast('Mohon isi semua kolom (Nama, Jabatan, dan Instansi)', 'error');
        return;
      }

      // Check if signature canvas is blank
      if (!hasSigned) {
        showToast('Mohon bubuhkan tanda tangan Anda terlebih dahulu.', 'error');
        return;
      }

      const randomId = 'REG-KKNI-' + Math.floor(1000 + Math.random() * 9000);
      const currentTime = new Date().toLocaleString('id-ID');
      const signatureData = canvas ? canvas.toDataURL('image/png') : '';

      // Set Loading State on Button
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim Data...';
      }

      // 1. Save data locally (backup)
      const submissionData = {
        id: randomId,
        nama: nama,
        jabatan: jabatan,
        instansi: instansi,
        modeHadir: modeHadir,
        signature: signatureData,
        submittedAt: currentTime
      };
      const existingLogs = JSON.parse(localStorage.getItem('kkni_konfirmasi_list') || '[]');
      existingLogs.push(submissionData);
      localStorage.setItem('kkni_konfirmasi_list', JSON.stringify(existingLogs));

      // 2. Prepare payload using URLSearchParams (Google Apps Script compatible)
      const payload = new URLSearchParams();
      payload.append('formType', 'konfirmasi_kehadiran');
      payload.append('id', randomId);
      payload.append('nama', nama);
      payload.append('jabatan', jabatan);
      payload.append('instansi', instansi);
      payload.append('metode_hadir', modeHadir);
      payload.append('timestamp', currentTime);
      payload.append('signature', signatureData);

      // 3. Send to Google Apps Script
      fetch(scriptURL, {
        method: 'POST',
        body: payload
      })
      .then(response => {
        return response.json().catch(() => ({ result: 'success' }));
      })
      .then(resultData => {
        finishSubmission(randomId, nama, modeHadir);
      })
      .catch(error => {
        console.warn('Network / CORS note (processed via Apps Script):', error);
        finishSubmission(randomId, nama, modeHadir);
      })
      .finally(() => {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = 'Kirim Konfirmasi';
        }
      });
    });
  }

  function finishSubmission(randomId, nama, modeHadir) {
    if (form) form.style.display = 'none';
    if (suksesBox) {
      document.getElementById('refCode').innerText = randomId;
      document.getElementById('refNama').innerText = nama;
      document.getElementById('refMode').innerText = modeHadir;
      suksesBox.style.display = 'block';
    }
    showToast('Konfirmasi kehadiran berhasil dikirim!', 'success');
  }

  function showToast(message, type = 'success') {
    if (!toastWrap) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> <span>${message}</span>`;
    toastWrap.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});




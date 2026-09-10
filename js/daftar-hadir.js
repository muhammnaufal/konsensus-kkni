// js/daftar-hadir.js - Logic & Signature Pad Canvas for Form Daftar Hadir

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formDaftarHadir');
  const tglInput = document.getElementById('tglPresensi');
  const canvas = document.getElementById('signatureCanvas');
  const btnClearSig = document.getElementById('btnClearSig');
  const suksesBox = document.getElementById('suksesAbsenBox');
  const toastWrap = document.getElementById('toastWrap');

  // Set real-time datetime string
  if (tglInput) {
    const now = new Date();
    tglInput.value = now.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  }

  // Signature Canvas Logic
  let isDrawing = false;
  let hasSigned = false;
  let ctx = null;

  if (canvas) {
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F2C59';

    // Mouse & Touch events
    const startDrawing = (e) => {
      isDrawing = true;
      hasSigned = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      ctx.beginPath();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
  }

  if (btnClearSig && canvas && ctx) {
    btnClearSig.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
      showToast('Tanda tangan dibersihkan.', 'success');
    });
  }

  // Form Submit Handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        showToast('Mohon isi seluruh field wajib bertanda (*)', 'error');
        return;
      }

      if (!hasSigned) {
        showToast('Tanda tangan digital wajib diisi pada kotak canvas!', 'error');
        return;
      }

      const nama = document.getElementById('namaPesensus').value;
      const sesi = document.getElementById('sesiSidang').value;
      const unsur = document.getElementById('unsurPesensus').value;
      const timestamp = tglInput ? tglInput.value : new Date().toLocaleTimeString();

      const absCode = 'ABS-KKNI-' + Math.floor(1000 + Math.random() * 9000);

      // Save submission to localStorage
      const absData = {
        id: absCode,
        nama,
        sesi,
        unsur,
        timestamp,
        signature: canvas ? canvas.toDataURL() : null
      };

      const existingAbs = JSON.parse(localStorage.getItem('kkni_absensi_list') || '[]');
      existingAbs.push(absData);
      localStorage.setItem('kkni_absensi_list', JSON.stringify(existingAbs));

      // UI Switch to Success State
      form.style.display = 'none';
      if (suksesBox) {
        document.getElementById('absenNama').innerText = nama;
        document.getElementById('absenSesi').innerText = sesi;
        document.getElementById('absenKode').innerText = absCode;
        document.getElementById('absenWaktu').innerText = timestamp;
        suksesBox.style.display = 'block';
      }

      showToast('Presensi kehadiran berhasil dicatat!', 'success');
    });
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
    }, 4000);
  }
});

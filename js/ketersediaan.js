// js/ketersediaan.js - Logic for Form Surat Ketersediaan Berkontribusi

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formKetersediaan');
  const canvas = document.getElementById('sigKetersediaanCanvas');
  const btnClear = document.getElementById('btnClearSigPerumus');
  const suksesBox = document.getElementById('suksesKetersediaanBox');
  const toastWrap = document.getElementById('toastWrap');

  let isDrawing = false;
  let hasSigned = false;
  let ctx = null;

  if (canvas) {
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F2C59';

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

  if (btnClear && canvas && ctx) {
    btnClear.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
      showToast('Tanda tangan dibersihkan.', 'success');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        showToast('Mohon lengkapi seluruh kolom wajib bertanda (*)', 'error');
        return;
      }

      if (!hasSigned) {
        showToast('Tanda tangan digital kesediaan wajib diisi!', 'error');
        return;
      }

      const nama = document.getElementById('namaPerumus').value;
      const instansi = document.getElementById('instansiPerumus').value;
      const keahlian = document.getElementById('bidangKeahlian').value;
      const peran = document.querySelector('input[name="peran"]:checked')?.value || 'Tim Perumus';
      const fileInput = document.getElementById('fileUpload');
      const fileName = fileInput?.files[0] ? fileInput.files[0].name : 'Tidak ada lampiran';

      const randomId = 'KTM-KKNI-' + Math.floor(1000 + Math.random() * 9000);
      const currentTime = new Date().toLocaleString('id-ID');

      const dataPerumus = {
        id: randomId,
        nama,
        instansi,
        keahlian,
        peran,
        fileName,
        submittedAt: currentTime
      };

      const existingList = JSON.parse(localStorage.getItem('kkni_ketersediaan_list') || '[]');
      existingList.push(dataPerumus);
      localStorage.setItem('kkni_ketersediaan_list', JSON.stringify(existingList));

      // Switch view
      form.style.display = 'none';
      if (suksesBox) {
        document.getElementById('perumusID').innerText = randomId;
        document.getElementById('perumusNama').innerText = nama + ' (' + instansi + ')';
        document.getElementById('perumusPeran').innerText = peran;
        document.getElementById('perumusKeahlian').innerText = keahlian;
        suksesBox.style.display = 'block';
      }

      showToast('Surat ketersediaan berkontribusi berhasil dikirim!', 'success');
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

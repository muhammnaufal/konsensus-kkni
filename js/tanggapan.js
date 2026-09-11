// js/tanggapan.js - Upload Lembar Tanggapan Logic

document.addEventListener('DOMContentLoaded', () => {
  // Menggunakan URL Web App terbaru Anda
  const scriptURL = 'https://script.google.com/macros/s/AKfycbz2zCQuI9tJLehAh_gC6OG3ycHxaPrnAmOBF0ly_y7aM9f4rlpA-FQP67PRDNL8EFkB/exec';

  const form = document.getElementById("formUpload");
  const btnSubmit = document.getElementById("btnSubmit");
  const suksesBox = document.getElementById("suksesBox");
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("fileUpload");
      const file = fileInput ? fileInput.files[0] : null;

      if (!file) {
        showToast("Mohon pilih file dokumen (PDF / Word) terlebih dahulu.", "error");
        return;
      }

      // Batasi ukuran file (Max 3MB)
      if (file.size > 3 * 1024 * 1024) {
        showToast("Ukuran file terlalu besar! Maksimal 3MB.", "error");
        return;
      }

      const namaVal = document.getElementById('nama')?.value || '';
      const instVal = document.getElementById('institusi')?.value || '';
      const kelVal = document.getElementById('kelompok')?.value || '';

      if (!namaVal || !instVal || !kelVal) {
        showToast("Mohon isi semua kolom (Nama, Institusi, dan Kelompok).", "error");
        return;
      }

      if (btnSubmit) {
        btnSubmit.innerHTML = "⏳ Sedang Mengunggah Dokumen...";
        btnSubmit.disabled = true;
      }

      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';

      const reader = new FileReader();
      reader.onload = function (event) {
        const base64Data = event.target.result;

        const dataToSend = new URLSearchParams();
        dataToSend.append('formType', 'upload_tanggapan');
        dataToSend.append('nama', namaVal);
        dataToSend.append('institusi', instVal);
        dataToSend.append('kelompok', kelVal);
        dataToSend.append('fileName', file.name);
        dataToSend.append('mimeType', file.type);
        dataToSend.append('fileData', base64Data);

        // Backup lokal
        const localLog = {
          nama: namaVal,
          institusi: instVal,
          kelompok: kelVal,
          fileName: file.name,
          submittedAt: new Date().toLocaleString('id-ID')
        };
        const existingLogs = JSON.parse(localStorage.getItem('kkni_tanggapan_list') || '[]');
        existingLogs.push(localLog);
        localStorage.setItem('kkni_tanggapan_list', JSON.stringify(existingLogs));

        fetch(scriptURL, {
          method: 'POST',
          mode: 'no-cors',
          body: dataToSend
        })
          .then(() => {
            if (successMessage) successMessage.style.display = 'block';
            if (errorMessage) errorMessage.style.display = 'none';
            finishSubmission(namaVal, instVal, kelVal);
          })
          .catch(error => {
            console.error(error);
            if (errorMessage) errorMessage.style.display = 'block';
          })
          .finally(() => {
            if (btnSubmit) {
              btnSubmit.innerHTML = "📤 Upload Dokumen";
              btnSubmit.disabled = false;
            }
          });
      };

      reader.readAsDataURL(file);
    });
  }

  function finishSubmission(nama, institusi, kelompok) {
    if (form) {
      form.reset();
      form.style.display = 'none';
    }

    if (suksesBox) {
      const refNama = document.getElementById('refNama');
      const refInst = document.getElementById('refInstitusi');
      const refKel = document.getElementById('refKelompok');

      if (refNama) refNama.innerText = nama;
      if (refInst) refInst.innerText = institusi;
      if (refKel) refKel.innerText = kelompok;

      suksesBox.style.display = 'block';
    }
  }

  function showToast(message, type = 'success') {
    const toastWrap = document.getElementById('toastWrap');
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

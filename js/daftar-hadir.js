// js/daftar-hadir.js - Logic for Form Daftar Hadir & Admin PDF Generator

document.addEventListener('DOMContentLoaded', () => {
  // Google Apps Script Web App URL
  const scriptURL = 'https://script.google.com/macros/s/AKfycbzpjn-vyzxbJHCxRbWiQHAQqtZj2uRz7zARuNMM7lPIUVRUsLuJFl_mDRCEffPh9_rU/exec';

  const formDaftarHadir = document.getElementById('formDaftarHadir');
  const submitBtn = document.getElementById('submitBtn');
  const canvas = document.getElementById('sigCanvas');
  const btnClearSig = document.getElementById('btnClearSig');
  const suksesBox = document.getElementById('suksesBox');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const toastWrap = document.getElementById('toastWrap');

  // Elements for Dynamic Kelompok Field
  const kategoriSelect = document.getElementById('kategori');
  const kelompokWrapper = document.getElementById('kelompokWrapper');
  const kelompokSelect = document.getElementById('kelompok');

  // Dynamic Kelompok dropdown display
  if (kategoriSelect && kelompokWrapper && kelompokSelect) {
    kategoriSelect.addEventListener('change', function () {
      if (this.value === 'Kelompok') {
        kelompokWrapper.style.display = 'block';
        kelompokSelect.setAttribute('required', 'required');
      } else {
        kelompokWrapper.style.display = 'none';
        kelompokSelect.removeAttribute('required');
        kelompokSelect.value = '';
      }
    });
  }

  // ==========================================
  // 1. Signature Canvas Drawing Logic
  // ==========================================
  let isDrawing = false;
  let hasSigned = false;
  let lastX = 0;
  let lastY = 0;
  let ctx = null;

  if (canvas) {
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1A1F36';
    ctx.lineWidth = 2.5;
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
      if (e.cancelable && e.type.includes('touch')) e.preventDefault();
      isDrawing = true;
      hasSigned = true;

      // Re-assert stroke properties
      ctx.strokeStyle = '#1A1F36';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const { x, y } = getCoordinates(e);
      lastX = x;
      lastY = y;
    }

    function draw(e) {
      if (!isDrawing) return;
      if (e.cancelable && e.type.includes('touch')) e.preventDefault();
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
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch Listeners (Mobile & Tablet)
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
  }

  // Clear Signature button ("Hapus Tanda Tangan")
  if (btnClearSig && canvas && ctx) {
    btnClearSig.addEventListener('click', (e) => {
      e.preventDefault();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
      showToast('Tanda tangan berhasil dibersihkan.', 'success');
    });
  }

  // ==========================================
  // 2. Form Submit Handler & Google Apps Script
  // ==========================================
  if (formDaftarHadir) {
    formDaftarHadir.addEventListener('submit', (e) => {
      e.preventDefault();

      // Check canvas blank state
      const blank = document.createElement('canvas');
      blank.width = canvas ? canvas.width : 650;
      blank.height = canvas ? canvas.height : 180;

      if (!hasSigned || (canvas && canvas.toDataURL() === blank.toDataURL())) {
        showToast('Mohon isi Tanda Tangan Anda terlebih dahulu.', 'error');
        alert('Mohon isi Tanda Tangan Anda terlebih dahulu.');
        return;
      }

      const kategori = document.getElementById('kategori')?.value;
      const kelompok = document.getElementById('kelompok')?.value;
      const kkni = document.getElementById('kkni')?.value;
      const tanggal = document.getElementById('tanggal')?.value;
      const nama = document.getElementById('nama')?.value.trim();
      const instansi = document.getElementById('instansi')?.value.trim();

      if (!kategori || !kkni || !tanggal || !nama || !instansi) {
        showToast('Mohon isi semua kolom wajib bertanda (*)', 'error');
        return;
      }

      if (kategori === 'Kelompok' && !kelompok) {
        showToast('Mohon pilih Kelompok untuk Kategori Kelompok', 'error');
        return;
      }

      // Show submit loading indicator
      if (submitBtn) {
        submitBtn.innerHTML = '⏳ Sedang Mengirim Data...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
      }

      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';

      const randomId = 'ABS-KKNI-' + Math.floor(1000 + Math.random() * 9000);
      const currentTime = new Date().toLocaleString('id-ID');
      const signatureData = canvas ? canvas.toDataURL('image/png') : '';

      // Prepare payload using URLSearchParams
      const formData = new FormData(formDaftarHadir);
      const dataToSend = new URLSearchParams();
      for (const pair of formData) {
        dataToSend.append(pair[0], pair[1]);
      }
      dataToSend.append('formType', 'daftar_hadir');
      dataToSend.append('id', randomId);
      dataToSend.append('timestamp', currentTime);
      dataToSend.append('signature', signatureData);

      // Save locally first (backup)
      const submissionData = {
        id: randomId,
        kategori: kategori,
        kelompok: kelompok,
        kkni: kkni,
        tanggal: tanggal,
        nama: nama,
        instansi: instansi,
        signature: signatureData,
        submittedAt: currentTime
      };
      const existingLogs = JSON.parse(localStorage.getItem('kkni_absensi_list') || '[]');
      existingLogs.push(submissionData);
      localStorage.setItem('kkni_absensi_list', JSON.stringify(existingLogs));

      // Post data to Google Apps Script
      fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        body: dataToSend
      })
        .then(() => {
          if (successMessage) successMessage.style.display = 'block';
          if (errorMessage) errorMessage.style.display = 'none';
          finishSubmission(randomId, nama, kategori, kkni);
        })
        .catch(error => {
          console.error('Submission Error:', error);
          if (errorMessage) errorMessage.style.display = 'block';
          if (successMessage) successMessage.style.display = 'none';
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.innerHTML = '✅ Kirim Daftar Hadir';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
          }
        });
    });
  }

  function finishSubmission(randomId, nama, kategori, bidang) {
    if (formDaftarHadir) {
      formDaftarHadir.reset();
      formDaftarHadir.style.display = 'none';
    }
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSigned = false;
    if (kelompokWrapper) kelompokWrapper.style.display = 'none';

    if (suksesBox) {
      document.getElementById('refNama').innerText = nama;
      document.getElementById('refKategori').innerText = kategori;
      document.getElementById('refBidang').innerText = bidang;
      suksesBox.style.display = 'block';
    }
    showToast('✅ Data presensi daftar hadir berhasil dikirim!', 'success');
  }

  // =========================================================================
  // 3. LOGIKA ADMIN (TARIK DATA DARI GOOGLE SPREADSHEET & GENERATE PDF)
  // =========================================================================
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');

  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', async () => {
      try {
        const kategori = document.getElementById('pdfKategori')?.value;
        const kkni = document.getElementById('pdfKkni')?.value;
        const tanggal = document.getElementById('pdfTanggal')?.value;

        if (!kategori || !kkni || !tanggal) {
          alert('Mohon lengkapi isian Kategori, KKNI Bidang, dan Tanggal untuk menarik data.');
          return;
        }

        btnDownloadPdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghubungi Server...';
        btnDownloadPdf.disabled = true;

        let pesertaRows = [];

        // 1. Try Google Apps Script API fetch first
        try {
          // Format date variations (YYYY-MM-DD vs DD/MM/YYYY vs D/M/YYYY)
          const dateParts = tanggal.split('-');
          let altTanggal = tanggal;
          let altTanggalSingle = tanggal;
          if (dateParts.length === 3) {
            altTanggal = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // 22/09/2026
            altTanggalSingle = `${parseInt(dateParts[2], 10)}/${parseInt(dateParts[1], 10)}/${dateParts[0]}`; // 22/9/2026
          }

          const url = `${scriptURL}?action=getDaftarHadir&kategori=${encodeURIComponent(kategori)}&kkni=${encodeURIComponent(kkni)}&tanggal=${encodeURIComponent(tanggal)}&tglAlt=${encodeURIComponent(altTanggal)}&tglSingle=${encodeURIComponent(altTanggalSingle)}`;
          const response = await fetch(url);
          const textData = await response.text();

          let data = JSON.parse(textData);
          if (data && data.result === 'success' && Array.isArray(data.data) && data.data.length > 0) {
            pesertaRows = data.data;
          }
        } catch (apiErr) {
          console.warn('Apps Script API fetch note (attempting local fallback):', apiErr);
        }

        // 2. Local Storage Fallback & Flexible Matching
        if (pesertaRows.length === 0) {
          const localData = JSON.parse(localStorage.getItem('kkni_absensi_list') || '[]');

          if (localData.length > 0) {
            // Filter local submissions with flexible string matching
            const matchedLocal = localData.filter(item => {
              const itemKategori = (item.kategori || item.kategoriKonvensi || '').toLowerCase();
              const targetKategori = kategori.toLowerCase();

              const itemKkni = (item.kkni || item.kkniBidang || '').toLowerCase();
              const targetKkni = kkni.toLowerCase();

              const itemTanggal = (item.tanggal || item.tglPelaksanaan || '').toLowerCase();
              const targetTanggal = tanggal.toLowerCase();

              const matchKategori = !targetKategori || itemKategori.includes(targetKategori) || targetKategori.includes(itemKategori);
              const matchKkni = !targetKkni || itemKkni.includes(targetKkni) || targetKkni.includes(itemKkni) || (itemKkni.includes('pengawasan') && targetKkni.includes('pengawasan'));
              const matchTanggal = !targetTanggal || itemTanggal === targetTanggal || itemTanggal.includes(targetTanggal) || targetTanggal.includes(itemTanggal);

              return matchKategori && matchKkni && matchTanggal;
            });

            // Map local submission objects into table rows format: [timestamp, kategori, kelompok, kkni, tanggal, nama, instansi, signature]
            const targetList = matchedLocal.length > 0 ? matchedLocal : localData;
            pesertaRows = targetList.map(item => [
              item.submittedAt || new Date().toLocaleTimeString(),
              item.kategori || item.kategoriKonvensi || kategori,
              item.kelompok || '-',
              item.kkni || item.kkniBidang || kkni,
              item.tanggal || item.tglPelaksanaan || tanggal,
              item.nama || item.namaPesensus || 'Peserta',
              item.instansi || item.instansiPesensus || 'Instansi',
              item.signature || ''
            ]);
          }
        }

        if (pesertaRows.length > 0) {
          btnDownloadPdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyusun Dokumen PDF...';
          generatePDF(pesertaRows, kategori, kkni, tanggal);
        } else {
          alert('⚠️ Data tidak ditemukan. Pastikan sudah ada peserta yang mengisi form pada tanggal dan filter tersebut.');
          btnDownloadPdf.innerHTML = '📄 Tampilkan & Simpan PDF ke Drive';
          btnDownloadPdf.disabled = false;
        }

      } catch (err) {
        alert('❌ Terdapat Error pada Sistem: ' + err.message);
        console.error(err);
        btnDownloadPdf.innerHTML = '📄 Tampilkan & Simpan PDF ke Drive';
        btnDownloadPdf.disabled = false;
      }
    });
  }

  // FUNGSI RENDER PDF DAN UPLOAD KE GOOGLE DRIVE
  function generatePDF(pesertaData, kategori, kkni, tanggal) {
    if (!window.jspdf) {
      alert('Library jsPDF belum termuat dengan sempurna. Pastikan koneksi internet stabil.');
      btnDownloadPdf.disabled = false;
      btnDownloadPdf.innerHTML = '📄 Tampilkan & Simpan PDF ke Drive';
      return;
    }

    window.jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DAFTAR HADIR PESERTA KONSENSUS KKNI', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Kategori Konsensus', 14, 32);
    doc.text(':', 58, 32);
    doc.text(`${kategori}`, 62, 32);

    doc.text('KKNI Bidang', 14, 38);
    doc.text(':', 58, 38);
    doc.text(`${kkni}`, 62, 38);

    doc.text('Tanggal', 14, 44);
    doc.text(':', 58, 44);
    doc.text(`${tanggal}`, 62, 44);

    const tableBody = [];
    pesertaData.forEach((row, index) => {
      tableBody.push([index + 1, row[5] || '-', row[6] || '-', '']);
    });

    doc.autoTable({
      startY: 52,
      head: [['No', 'Nama Lengkap', 'Instansi / Unit Kerja', 'Tanda Tangan']],
      body: tableBody,
      headStyles: { fillColor: [99, 91, 255], halign: 'center' },
      styles: { valign: 'middle', lineColor: [200, 200, 200], lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 65 },
        3: { cellWidth: 40, minCellHeight: 20 }
      },
      didDrawCell: function (data) {
        if (data.column.index === 3 && data.cell.section === 'body') {
          const rowIndex = data.row.index;
          const base64Img = pesertaData[rowIndex][7];
          if (base64Img && base64Img.startsWith('data:image')) {
            doc.addImage(base64Img, 'PNG', data.cell.x + 2, data.cell.y + 2, 35, 16);
          }
        }
      }
    });

    // Display PDF in Iframe & setup download link
    const pdfBase64 = doc.output('datauristring');
    let safeFileName = `Daftar_Hadir_${kkni.replace(/[^a-z0-9]/gi, '_')}_${tanggal}.pdf`;

    const pdfViewer = document.getElementById('pdfViewer');
    const pdfContainer = document.getElementById('pdfContainer');
    const directDl = document.getElementById('directDownloadBtn');

    if (pdfViewer) pdfViewer.src = pdfBase64;
    if (pdfContainer) pdfContainer.style.display = 'block';

    if (directDl) {
      directDl.href = pdfBase64;
      directDl.download = safeFileName;
    }

    // Upload copy to Google Drive
    btnDownloadPdf.innerHTML = '⏳ Menyimpan ke Google Drive...';

    const uploadData = new FormData();
    uploadData.append('action', 'upload_pdf');
    uploadData.append('fileName', safeFileName);
    uploadData.append('pdfBase64', pdfBase64);

    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: uploadData })
      .then(() => {
        alert(`✅ PDF Dibuat!\n\nSalinan otomatis tersimpan di Folder "Konsensus KKNI" di Google Drive.\nAnda juga bisa melihat pratinjaunya di bagian bawah.`);
      })
      .catch(error => {
        console.error('Drive upload error:', error);
        alert('❌ Pratinjau PDF berhasil, namun gagal upload ke Drive.');
      })
      .finally(() => {
        btnDownloadPdf.innerHTML = '📄 Tampilkan & Simpan PDF ke Drive';
        btnDownloadPdf.disabled = false;
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
    }, 3500);
  }
});

window.addEventListener('load', async () => {
  const video = document.getElementById('video');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
  } catch (err) {
    console.error("Erro ao acessar a câmera: ", err);
    alert("Erro ao acessar a câmera: " + err.message);
    return;
  }

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
    console.log("Modelos carregados com sucesso!");
  } catch (err) {
    console.error("Erro ao carregar modelos: ", err);
    alert("Erro ao carregar modelos de detecção facial.");
    return;
  }

  window.enviarPresenca = async function () {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

    if (detections.length > 0) {
      const nome = prompt("Reconhecimento facial detectado. Digite o nome para registrar:");

      if (nome) {
        const url = 'https://script.google.com/a/macros/edu.campos.rj.gov.br/s/AKfycbxVebTOg-k9nEjedinRO0E2GbO1QP6cv_PFIQpB8zk3Ksx5q5tWiSEd7rfJn9PMywVK/exec';
        const data = {
          nome: nome,
          hora: new Date().toLocaleTimeString(),
          data: new Date().toLocaleDateString()
        };

        fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        alert("Presença registrada com sucesso!");
      }
    } else {
      alert("Nenhum rosto detectado. Tente novamente.");
    }
  };
});

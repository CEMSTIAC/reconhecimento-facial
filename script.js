window.onload = async function () {
  console.log("Página carregada!");

  const video = document.getElementById('video');

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    console.log("Modelos carregados com sucesso!");
  } catch (err) {
    console.error("Erro ao carregar modelos: ", err);
    alert("Erro ao carregar modelos de detecção facial.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
  } catch (err) {
    console.error("Erro ao acessar a câmera: ", err);
    alert("Erro ao acessar a câmera: " + err.message);
    return;
  }

  window.enviarPresenca = async function () {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

    if (detections.length > 0) {
      const nome = prompt("Reconhecimento facial detectado. Digite o nome para registrar:");

      if (nome) {
        const url = 'https://script.google.com/macros/s/AKfycbz9ZQ7xexs7iqxOvfX8XQiHEFMFVscvs4LBMSmNCYwxJnS9QXcxy64AsHEUexxubf1X/exec';
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
};

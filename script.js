document.addEventListener("DOMContentLoaded", async () => {
  const video = document.getElementById('video');

  // Aguarda o carregamento dos modelos
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  console.log("Modelos carregados!");

  // Inicia a câmera
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("Erro ao acessar a câmera:", err));

  // Função global para o botão
  window.enviarPresenca = async () => {
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

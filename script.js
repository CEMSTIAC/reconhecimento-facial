async function carregarModelos() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  console.log("Modelos carregados!");
}

async function iniciarVideo() {
  const video = document.getElementById('video');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
  } catch (err) {
    console.error("Erro ao acessar a câmera:", err);
  }
}

async function main() {
  await carregarModelos();
  iniciarVideo();
}

main();

// Função global para ser chamada no botão
async function enviarPresenca() {
  const video = document.getElementById('video');
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

  if (detections.length > 0) {
    const nome = prompt("Reconhecimento facial detectado. Digite o nome:");
    if (nome) {
      const url = 'https://script.google.com/macros/s/AKfycbxVebTOg-k9nEjedinRO0E2GbO1QP6cv_PFIQpB8zk3Ksx5q5tWiSEd7rfJn9PMywVK/exec';
      const data = {
        nome: nome,
        hora: new Date().toLocaleTimeString(),
        data: new Date().toLocaleDateString()
      };

      fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      alert("Presença registrada com sucesso!");
    }
  } else {
    alert("Nenhum rosto detectado.");
  }
}

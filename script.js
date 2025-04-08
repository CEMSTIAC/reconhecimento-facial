const video = document.getElementById('video');

async function carregarModelos() {
  const MODEL_URL = './models'; // pasta local com os modelos

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  console.log("Modelos carregados!");
}

async function iniciarVideo() {
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

async function enviarPresenca() {
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
}

// Chama a função principal
main();

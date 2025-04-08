const video = document.getElementById('video');

async function carregarModelos() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
}

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
  } catch (err) {
    console.error('Erro ao acessar a câmera:', err);
    alert('Erro ao acessar a câmera: ' + err.message);
  }
}

async function main() {
  await carregarModelos();
  await startVideo();
}

main();

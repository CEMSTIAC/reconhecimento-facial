const video = document.getElementById('video');

async function carregarModelos() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/modelos');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/modelos');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/modelos');
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/modelos');
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

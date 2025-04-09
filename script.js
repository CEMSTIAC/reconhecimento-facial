const video = document.getElementById('video');
const statusEl = document.getElementById('status');

const PLANILHA_DADOS_URL = 'https://script.google.com/macros/s/AKfycbz9ZQ7xexs7iqxOvfX8XQiHEFMFVscvs4LBMSmNCYwxJnS9QXcxy64AsHEUexxubf1X/exec';

let labeledDescriptors = [];

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
  } catch (error) {
    console.error('Erro ao acessar a câmera:', error);
  }
}

async function loadModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js/models';
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
}

async function loadAlunosFromPlanilha() {
  const response = await fetch(PLANILHA_DADOS_URL + '?action=alunos');
  const data = await response.json(); // espera algo tipo: [{ nome: 'Maria', foto: 'url' }, ...]

  const descriptors = await Promise.all(
    data.map(async aluno => {
      try {
        const img = await faceapi.fetchImage(aluno.foto);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (!detection) throw new Error(`Rosto não detectado para ${aluno.nome}`);
        return new faceapi.LabeledFaceDescriptors(aluno.nome, [detection.descriptor]);
      } catch (err) {
        console.warn(`Erro ao processar ${aluno.nome}:`, err);
        return null;
      }
    })
  );

  return descriptors.filter(Boolean); // remove nulls
}

function registrarPresenca(nome) {
  const payload = {
    nome: nome,
    data: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR')
  };

  fetch(PLANILHA_DADOS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(() => {
    statusEl.innerText = `Presença registrada para ${nome}`;
  }).catch(err => {
    console.error('Erro ao registrar presença:', err);
  });
}

async function main() {
  await loadModels();
  statusEl.innerText = 'Carregando alunos...';
  labeledDescriptors = await loadAlunosFromPlanilha();

  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
  statusEl.innerText = 'Iniciando câmera...';
  await startVideo();

  video.addEventListener('play', () => {
    statusEl.innerText = 'Sistema ativo. Procure a câmera.';

    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
        drawBox.draw(canvas);

        if (result.label !== 'unknown') {
          statusEl.innerText = `Reconhecido: ${result.label}`;
          registrarPresenca(result.label);
        }
      });
    }, 4000); // detecta a cada 4 segundos
  });
}

main();

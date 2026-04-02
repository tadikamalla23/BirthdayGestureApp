const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const msg = document.getElementById("msg");

function isHandOpen(landmarks) {
  let open = 0;
  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];

  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[pips[i]].y) open++;
  }
  return open >= 3;
}

function onResults(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks) {
    results.multiHandLandmarks.forEach((hand) => {
      drawConnectors(ctx, hand, HAND_CONNECTIONS, { color: "cyan" });
      drawLandmarks(ctx, hand, { color: "white" });

      if (isHandOpen(hand)) {
        msg.style.display = "block";
      } else {
        msg.style.display = "none";
      }
    });
  }
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0, // 🔥 VERY IMPORTANT FIX
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults(onResults);

const camera = new Camera(video, {
  onFrame: async () => {
    if (video.readyState >= 2) {
      try {
        await hands.send({ image: video });
      } catch (e) {
        console.log("MediaPipe error:", e);
      }
    }
  },
  width: 1280,
  height: 720,
});
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
  video.play();
});
camera.start();

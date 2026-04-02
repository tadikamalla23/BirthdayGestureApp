const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const msg = document.getElementById("msg");
const music = document.getElementById("music");

function isHandOpen(landmarks) {
  let open = 0;
  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];

  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[pips[i]].y) open++;
  }
  return open >= 3;
}
function isPinch(hand) {
  const thumb = hand[4];
  const index = hand[8];
  const wrist = hand[0];

  const pinchDist = Math.hypot(thumb.x - index.x, thumb.y - index.y);

  const handSize = Math.hypot(wrist.x - hand[9].x, wrist.y - hand[9].y);

  return pinchDist < handSize * 0.4;
}

let wasOpen = false;

// function onResults(results) {
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   let detectedOpen = false;
//   let handRef = null;
//   let openHands = 0;
//   let pinchDetected = false;

//   if (results.multiHandLandmarks) {
//     results.multiHandLandmarks.forEach((hand) => {
//       // drawConnectors(ctx, hand, HAND_CONNECTIONS, { color: "cyan" });
//       // drawLandmarks(ctx, hand, { color: "white" });
//       if (isPinch(hand)) {
//         pinchDetected = true;
//       }

//       if (isHandOpen(hand)) {
//         detectedOpen = true;
//         handRef = hand; // save for confetti position
//         openHands++;
//       }
//       if (pinchDetected) {
//         msg.innerText = "🎁 Surprise!";
//       } else if (openHands === 2) {
//         msg.innerText = "🎉 DOUBLE MAGIC 🎂🔥";
//       } else if (openHands === 1) {
//         msg.innerText = "🎉 Happy Birthday 🎂";
//       }
//     });
//     if (openHands === 2) {
//       msg.innerText = "🎉 DOUBLE MAGIC 🎂🔥";
//       confetti({ particleCount: 200 });
//     } else if (openHands === 1) {
//       msg.innerText = "🎉 Happy Birthday 🎂";
//     }
//   }

//   // ✅ Trigger logic OUTSIDE loop
//   if (detectedOpen) {
//     msg.style.display = "block";

//     if (!wasOpen && handRef && window.confetti) {
//       const wrist = handRef[0];

//       confetti({
//         particleCount: 100,
//         spread: 70,
//         origin: {
//           x: 1 - wrist.x,
//           y: wrist.y,
//         },
//       });

//       music.currentTime = 0; // 🔥 restart song
//       music.play(); // 🔥 PLAY ONLY ONCE
//     }

//     wasOpen = true;
//   } else {
//     msg.style.display = "none";

//     // music.pause(); // 🔥 STOP when hand closed
//     // music.currentTime = 0; // optional reset

//     wasOpen = false;
//   }
// }
function onResults(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let detectedOpen = false;
  let handRef = null;
  let openHands = 0;
  let pinchDetected = false;

  if (results.multiHandLandmarks) {
    results.multiHandLandmarks.forEach((hand) => {

      if (isPinch(hand)) {
        pinchDetected = true;
      }

      if (isHandOpen(hand)) {
        detectedOpen = true;
        handRef = hand;
        openHands++;
      }

    });
  }

  // 🔥 ALL UI logic here (AFTER loop)

  if (pinchDetected) {
    msg.innerText = "🎁 Surprise!";
    msg.style.display = "block";
  } 
  else if (openHands === 2) {
    msg.innerText = "🎉 DOUBLE MAGIC 🎂🔥";
    msg.style.display = "block";
    confetti({ particleCount: 200 });
  } 
  else if (openHands === 1) {
    msg.innerText = "🎉 Happy Birthday 🎂";
    msg.style.display = "block";
  } 
  else {
    msg.style.display = "none";
  }

  // 🔥 confetti + music (only for open hand)
  if (detectedOpen) {
    if (!wasOpen && handRef && window.confetti) {
      const wrist = handRef[0];

      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          x: 1 - wrist.x,
          y: wrist.y,
        },
      });

      music.currentTime = 0;
      music.play();
    }

    wasOpen = true;
  } else {
    wasOpen = false;
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

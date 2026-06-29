let lastGestureTime = 0;

const videoElement = document.getElementById("video");
const gestureText = document.getElementById("gestureText");

function canGesture() {
    const now = Date.now();

    if (now - lastGestureTime > 1800) {
        lastGestureTime = now;
        return true;
    }

    return false;
}

function isIndexFingerOpen(landmarks) {
    const indexOpen = landmarks[8].y < landmarks[6].y;
    const middleClosed = landmarks[12].y > landmarks[10].y;
    const ringClosed = landmarks[16].y > landmarks[14].y;
    const pinkyClosed = landmarks[20].y > landmarks[18].y;

    return indexOpen && middleClosed && ringClosed && pinkyClosed;
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.75,
    minTrackingConfidence: 0.75
});

hands.onResults((results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        gestureText.innerText = "No hand detected";
        return;
    }

    const landmarks = results.multiHandLandmarks[0];

    if (!isIndexFingerOpen(landmarks)) {
        gestureText.innerText = "Show only index finger ☝️";
        return;
    }

    const indexX = landmarks[8].x;

    if (indexX < 0.25 && canGesture()) {
        gestureText.innerText = "Index finger left → Previous Page";

        if (typeof prevPage === "function") {
            prevPage();
        }

        return;
    }

    if (indexX > 0.75 && canGesture()) {
        gestureText.innerText = "Index finger right → Next Page";

        if (typeof nextPage === "function") {
            nextPage();
        }

        return;
    }

    gestureText.innerText = "Index finger detected ✅ Move left/right";
});

const camera = new Camera(videoElement, {
    onFrame: async () => {
        try {
            await hands.send({
                image: videoElement
            });
        } catch (error) {
            console.log("Gesture error ignored:", error);
        }
    },
    width: 500,
    height: 350
});

camera.start();
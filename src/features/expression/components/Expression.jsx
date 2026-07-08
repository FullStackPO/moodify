import { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import '../styles/expression.css' 

export default function EmotionDetector() {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [emotion, setEmotion] = useState("Click Detect Emotion");
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    initialize();

    return () => {
      stopDetection();
    };
  }, []);

  async function initialize() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        },
        runningMode: "VIDEO",
        outputFaceBlendshapes: true,
        numFaces: 1,
      }
    );
  }

  async function startDetection() {
    if (isDetecting) return;

    setLoading(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = stream;

    await videoRef.current.play();

    setLoading(false);
    setIsDetecting(true);

    detectEmotion();
  }

  function detectEmotion() {
    if (
      !videoRef.current ||
      !faceLandmarkerRef.current
    ) {
      return;
    }

    const result = faceLandmarkerRef.current.detectForVideo(
      videoRef.current,
      performance.now()
    );

    if (
      result.faceBlendshapes &&
      result.faceBlendshapes.length > 0
    ) {
      const blendShapes = result.faceBlendshapes[0].categories;

      const getScore = (name) =>
        blendShapes.find((b) => b.categoryName === name)?.score || 0;

      const smileLeft = getScore("mouthSmileLeft");
      const smileRight = getScore("mouthSmileRight");

      const browRaise = getScore("browInnerUp");

      const jawOpen = getScore("jawOpen");

      const frownLeft = getScore("mouthFrownLeft");
      const frownRight = getScore("mouthFrownRight");

      if (smileLeft > 0.5 && smileRight > 0.5) {
        setEmotion("😊 Happy");
      } else if (jawOpen > 0.4 && browRaise > 0.3) {
        setEmotion("😲 Surprised");
      } else if (frownLeft > 0.001 && frownRight > 0.001) {
        setEmotion("😢 Sad");
      } else {
        setEmotion("😐 Neutral");
      }
    } else {
      setEmotion("No Face Detected");
    }

    animationFrameRef.current = requestAnimationFrame(detectEmotion);
  }

  function stopDetection() {
    setIsDetecting(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setEmotion("Detection Stopped");
  }

  return (
    <div className="frame">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={640}
        height={480}
        />

      {loading ? (<h2>Loading...</h2>) : (<h2>{emotion}</h2>)}

      <div className="buttons">
        <button onClick={startDetection}>
          Start Detection
        </button>

        <button onClick={stopDetection}>
          Stop Detection
        </button>
      </div>

    </div>
  );
}
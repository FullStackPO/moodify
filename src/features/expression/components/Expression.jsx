import { useEffect, useRef, useState } from "react";
import { initialize, getEmotion } from "../utils/utils";
import "../styles/expression.css";

export default function EmotionDetector() {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const detectingRef = useRef(false);

  const [emotion, setEmotion] = useState("Click Start Detection");
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const landmarker = await initialize();
        faceLandmarkerRef.current = landmarker;
        console.log("Model Loaded");
      } catch (err) {
        console.error(err);
        setEmotion("Failed to load model");
      } finally {
        setLoading(false);
      }
    };

    loadModel();

    return () => {
      detectingRef.current = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const detectEmotion = () => {
    if (!detectingRef.current) return;

    if (!videoRef.current || !faceLandmarkerRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectEmotion);
      return;
    }

    const result = faceLandmarkerRef.current.detectForVideo(
      videoRef.current,
      performance.now()
    );

    setEmotion(getEmotion(result));

    animationFrameRef.current = requestAnimationFrame(detectEmotion);
  };

  const startDetection = async () => {
    if (detectingRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      detectingRef.current = true;
      setIsDetecting(true);

      detectEmotion();
    } catch (err) {
      console.error(err);
      setEmotion("Camera Permission Denied");
    }
  };

  const stopDetection = () => {
    detectingRef.current = false;
    setIsDetecting(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());

      videoRef.current.srcObject = null;
    }

    setEmotion("Detection Stopped");
  };

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

      <h2>
        {loading ? "Loading AI Model..." : emotion}
      </h2>

      <div className="buttons">
        <button
          onClick={startDetection}
          disabled={loading || isDetecting}
        >
          Start Detection
        </button>

        <button
          onClick={stopDetection}
          disabled={!isDetecting}
        >
          Stop Detection
        </button>
      </div>
    </div>
  );
}
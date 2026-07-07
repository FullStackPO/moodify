import { useEffect, useRef, useState } from "react";
import {
    FilesetResolver,
    FaceLandmarker
} from "@mediapipe/tasks-vision";

export default function EmotionDetector() {

    const videoRef = useRef(null);

    const [emotion, setEmotion] = useState("Detecting...");
    const [loading, setLoading] = useState(true);

    let faceLandmarker;

    useEffect(() => {

        async function initialize() {

            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            faceLandmarker = await FaceLandmarker.createFromOptions(
                vision,
                {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
                    },
                    runningMode: "VIDEO",
                    outputFaceBlendshapes: true,
                    numFaces: 1
                }
            );

            startCamera();
        }

        initialize();

    }, []);

    async function startCamera() {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {

            videoRef.current.play();

            setLoading(false);

            requestAnimationFrame(detectEmotion);
        };
    }

    function detectEmotion() {

        if (!videoRef.current || !faceLandmarker) {
            requestAnimationFrame(detectEmotion);
            return;
        }

        const result = faceLandmarker.detectForVideo(
            videoRef.current,
            performance.now()
        );

        if (
            result.faceBlendshapes &&
            result.faceBlendshapes.length > 0
        ) {

            const blendShapes =
                result.faceBlendshapes[0].categories;

            const smile =
                blendShapes.find(
                    b => b.categoryName === "mouthSmileLeft"
                )?.score || 0;

            const smileRight =
                blendShapes.find(
                    b => b.categoryName === "mouthSmileRight"
                )?.score || 0;

            const jawOpen =
                blendShapes.find(
                    b => b.categoryName === "jawOpen"
                )?.score || 0;

            const browRaise =
                blendShapes.find(
                    b => b.categoryName === "browInnerUp"
                )?.score || 0;

            if (smile > 0.6 && smileRight > 0.6) {
                setEmotion("😊 Happy");
            }
            else if (jawOpen > 0.65 && browRaise > 0.5) {
                setEmotion("😲 Surprised");
            }
            else if (jawOpen > 0.6) {
                setEmotion("😮 Talking");
            }
            else {
                setEmotion("😐 Neutral");
            }

        }

        requestAnimationFrame(detectEmotion);
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                width={640}
                height={480}
            />

            {loading ? (
                <h2>Loading...</h2>
            ) : (
                <h2>{emotion}</h2>
            )}
        </div>
    );
}
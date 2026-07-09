import {
  FilesetResolver,
  FaceLandmarker,
} from "@mediapipe/tasks-vision";

export async function initialize() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  return await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
    },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    numFaces: 1,
  });
}

export function getEmotion(result) {
  if (
    !result.faceBlendshapes ||
    result.faceBlendshapes.length === 0
  ) {
    return "No Face Detected";
  }

  const blendShapes = result.faceBlendshapes[0].categories;

  const getScore = (name) =>
    blendShapes.find(
      (item) => item.categoryName === name
    )?.score || 0;

  const smileLeft = getScore("mouthSmileLeft");
  const smileRight = getScore("mouthSmileRight");

  const browRaise = getScore("browInnerUp");
  const jawOpen = getScore("jawOpen");

  const frownLeft = getScore("mouthFrownLeft");
  const frownRight = getScore("mouthFrownRight");

  if (smileLeft > 0.5 && smileRight > 0.5) {
    return "😊 Happy";
  }

  if (jawOpen > 0.3 && browRaise > 0.2) {
    return "😲 Surprised";
  }

  if (frownLeft > 0.001 && frownRight > 0.001) {
    return "😢 Sad";
  }

  return "😐 Neutral";
}
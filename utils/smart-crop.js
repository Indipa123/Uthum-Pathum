import { clamp, readImage } from './card-art'

const version = '0.10.17'
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
let detectorPromise

async function getDetector() {
  const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision')
  const localFiles = await FilesetResolver.forVisionTasks('/vision')
  return FaceDetector.createFromOptions(localFiles, {
    baseOptions: { modelAssetPath: modelUrl, delegate: 'CPU' },
    runningMode: 'IMAGE',
    minDetectionConfidence: 0.55,
  }).catch(async () => {
    const files = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@' + version + '/wasm')
    return FaceDetector.createFromOptions(files, {
      baseOptions: { modelAssetPath: modelUrl, delegate: 'CPU' },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.55,
    })
  })
}

export async function suggestCrop(src) {
  detectorPromise ||= getDetector().catch(error => {
    detectorPromise = undefined
    throw error
  })
  const [detector, image] = await Promise.all([detectorPromise, readImage(src)])
  const faces = detector.detect(image).detections.map(item => item.boundingBox).filter(Boolean)
  if (!faces.length) return null
  const left = Math.min(...faces.map(face => face.originX))
  const right = Math.max(...faces.map(face => face.originX + face.width))
  const top = Math.min(...faces.map(face => face.originY))
  const bottom = Math.max(...faces.map(face => face.originY + face.height))
  return {
    photoX: clamp(Math.round((left + right) * 50 / image.width), 0, 100),
    photoY: clamp(Math.round((top + bottom) * 50 / image.height), 0, 100),
    zoom: 1,
  }
}

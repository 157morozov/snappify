import {useCallback, useEffect, useRef, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'

import {api} from '../../../api'
import {useSystemModal} from '../../../components/system/modal/context'

import './style.css'

const CAMERA_CONSTRAINTS = [
  { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
  { video: { facingMode: { ideal: 'environment' } }, audio: false },
  { video: true, audio: false },
]

async function waitVideoReady(video) {
  if (!video) return
  if (video.readyState >= 2 && video.videoWidth > 0) return
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Камера не успела инициализироваться.')), 4000)
    const onLoaded = () => {
      clearTimeout(timeout)
      video.removeEventListener('loadedmetadata', onLoaded)
      resolve()
    }
    video.addEventListener('loadedmetadata', onLoaded)
  })
}

export default function CameraPage() {
  const { code } = useParams()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const navigate = useNavigate()
  const {showMessage} = useSystemModal()

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Камера не поддерживается этим браузером')
    }

    stopStream()

    let lastError = null
    for (const constraints of CAMERA_CONSTRAINTS) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
          await waitVideoReady(videoRef.current)
        }
        return
      } catch (err) {
        lastError = err
      }
    }

    throw new Error(lastError?.message || 'Не удалось получить доступ к камере')
  }, [stopStream])

  const init = useCallback(async () => {
    setStarting(true)
    setError('')
    try {
      let found = null
      try {
        const events = await api.events()
        found = events.find(item => item.code === code)
      } catch {
        // guest mode
      }
      if (!found) found = await api.publicEvent(code)
      if (!found) throw new Error('Мероприятие не найдено')

      const now = Date.now()
      const start = found.start_at ? new Date(found.start_at).getTime() : null
      const end = found.end_at ? new Date(found.end_at).getTime() : null
      if (start && now < start) throw new Error('Съемка будет доступна после старта мероприятия')
      if (end && now > end) throw new Error('Мероприятие завершено. Новые фото добавлять нельзя')

      setEvent(found)
      await startCamera()
    } catch (err) {
      setError(err.message || 'Не удалось открыть камеру')
    } finally {
      setStarting(false)
      setLoading(false)
    }
  }, [code, startCamera])

  useEffect(() => {
    init()
    return () => stopStream()
  }, [init, stopStream])

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current || !event) return
    const guestKey = sessionStorage.getItem(`guest_key_${code}`)
    if (!guestKey) { showMessage({title:'Нет гостевого доступа', text:'Сначала присоединитесь к мероприятию по коду.', type:'error'}); return }

    if (videoRef.current.videoWidth < 2 || videoRef.current.videoHeight < 2) {
      setError('Камера еще не готова. Подождите секунду и попробуйте снова.')
      return
    }

    setUploading(true)
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      if (event.film_filter) {
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = img.data
        for (let i = 0; i < d.length; i += 4) {
          const avg = (d[i] + d[i + 1] + d[i + 2]) / 3
          d[i] = avg * 1.02
          d[i + 1] = avg * 0.95
          d[i + 2] = avg * 0.82
        }
        ctx.putImageData(img, 0, 0)
      }
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
      if (!blob) throw new Error('Не удалось подготовить изображение для загрузки')
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
      await api.uploadPhoto({ code, guestKey, file, filterName: event.film_filter ? 'film' : 'none' })
      showMessage({title:'Фото добавлено', text:'Снимок успешно загружен в мероприятие.', type:'success'})
      navigate(`/event/${code}`)
    } catch (err) {
      setError(err.message || 'Ошибка загрузки фото')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className='user-home'><div className='skeleton-card'/></div>

  if (error) {
    return <div className='user-home camera-error'>
      <h3>Не удалось открыть камеру</h3>
      <p>{error}</p>
      <button className='button' onClick={init} disabled={starting}>{starting ? 'Пробуем снова...' : 'Повторить попытку'}</button>
      <Link className='button button__outline' to={`/event/${code}`}>Вернуться к мероприятию</Link>
    </div>
  }

  return <div className='user-camera'>
    <Link className='link' to={`/event/${code}`}>Назад к мероприятию</Link>
    <h2>Камера мероприятия</h2>
    <video ref={videoRef} autoPlay playsInline muted className='user-camera-video' />
    <canvas ref={canvasRef} hidden />
    <button className='button' disabled={uploading || starting} onClick={capture}>{uploading ? 'Загружаем...' : 'Сделать фото'}</button>
  </div>
}

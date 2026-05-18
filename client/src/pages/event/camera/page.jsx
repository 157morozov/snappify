import {useEffect, useRef, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'

import {api} from '../../../api'
import {useSystemModal} from '../../../components/system/modal/context'

import './style.css'

export default function CameraPage() {
  const { code } = useParams()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const {showMessage} = useSystemModal()

  useEffect(() => {
    let stream
    const run = async () => {
      try {
        const events = await api.events()
        const found = events.find(item => item.code === code)
        if (!found) throw new Error('Мероприятие не найдено')
        const now = Date.now()
        const start = found.start_at ? new Date(found.start_at).getTime() : null
        const end = found.end_at ? new Date(found.end_at).getTime() : null
        if (start && now < start) throw new Error('Съемка будет доступна после старта мероприятия')
        if (end && now > end) throw new Error('Мероприятие завершено. Новые фото добавлять нельзя')
        setEvent(found)
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) { setError(err.message) } finally { setLoading(false) }
    }
    run()
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [code])

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current || !event) return
    const guestKey = sessionStorage.getItem(`guest_key_${code}`)
    if (!guestKey) { showMessage({title:'Нет гостевого доступа', text:'Сначала присоединитесь к мероприятию по коду.', type:'error'}); return }
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
        for (let i = 0; i < d.length; i += 4) { const avg = (d[i] + d[i + 1] + d[i + 2]) / 3; d[i] = avg * 1.02; d[i + 1] = avg * 0.95; d[i + 2] = avg * 0.82 }
        ctx.putImageData(img, 0, 0)
      }
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
      await api.uploadPhoto({ code, guestKey, file, filterName: event.film_filter ? 'film' : 'none' })
      showMessage({title:'Фото добавлено', text:'Снимок успешно загружен в мероприятие.', type:'success'})
      navigate(`/event/${code}`)
    } catch (err) { setError(err.message) } finally { setUploading(false) }
  }

  if (loading) return <div className='user-home'><div className='skeleton-card'/></div>
  if (error) return <div className='user-home camera-error'><h3>Не удалось открыть камеру</h3><p>{error}</p><Link className='button button__outline' to={`/event/${code}`}>Вернуться к мероприятию</Link></div>

  return <div className='user-camera'>
    <Link className='link' to={`/event/${code}`}>Назад к мероприятию</Link>
    <h2>Камера мероприятия</h2>
    <video ref={videoRef} autoPlay playsInline muted className='user-camera-video' />
    <canvas ref={canvasRef} hidden />
    <button className='button' disabled={uploading} onClick={capture}>{uploading ? 'Загружаем...' : 'Сделать фото'}</button>
  </div>
}

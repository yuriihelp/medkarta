import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload as UploadIcon, FileText, X, CheckCircle2, Loader2 } from 'lucide-react'
import { recordsApi } from '../api/client'

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

interface FileItem {
  file: File
  status: UploadStatus
  recordId?: string
}

export default function Upload() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((file) => ({ file, status: 'idle' as UploadStatus })),
    ])
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files))
  }

  async function uploadFile(index: number) {
    const item = files[index]
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'uploading' } : f)),
    )
    try {
      const fd = new FormData()
      fd.append('file', item.file)
      const res = await recordsApi.upload(fd)
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'done', recordId: res.data.id } : f,
        ),
      )
    } catch {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: 'error' } : f)),
      )
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadAll() {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'idle') await uploadFile(i)
    }
  }

  const pending = files.filter((f) => f.status === 'idle').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Загрузка документов</h1>
        <p className="text-sm text-slate-500 mt-1">
          PDF, фото бланков анализов, выписки, рецепты — ИИ автоматически распознает данные
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-teal-500 bg-teal-50'
            : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.heic"
          multiple
          onChange={onInputChange}
        />
        <UploadIcon size={36} className={`mx-auto mb-3 ${dragging ? 'text-teal-500' : 'text-slate-400'}`} />
        <p className="font-semibold text-slate-700">Перетащите файлы сюда</p>
        <p className="text-sm text-slate-400 mt-1">или нажмите для выбора · PDF, JPG, PNG, HEIC</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{files.length} файл(а)</span>
            {pending > 0 && (
              <button onClick={uploadAll} className="btn-primary text-sm">
                Загрузить все ({pending})
              </button>
            )}
          </div>

          {files.map((item, index) => (
            <div key={index} className="card flex items-center gap-3">
              <div className="bg-slate-100 rounded-lg p-2 flex-shrink-0">
                <FileText size={18} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{item.file.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {(item.file.size / 1024).toFixed(0)} KB
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'idle' && (
                  <button
                    onClick={() => uploadFile(index)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Загрузить
                  </button>
                )}
                {item.status === 'uploading' && (
                  <Loader2 size={16} className="text-teal-500 animate-spin" />
                )}
                {item.status === 'done' && (
                  <CheckCircle2 size={16} className="text-green-500" />
                )}
                {item.status === 'error' && (
                  <span className="text-xs text-red-500">Ошибка</span>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual entry hint */}
      <div className="card bg-slate-50 border-slate-200">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">Нет файла?</span> Введите результаты вручную —
          форма ручного ввода будет доступна в следующем обновлении.
        </p>
      </div>
    </div>
  )
}

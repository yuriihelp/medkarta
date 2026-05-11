import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Platform, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { Card } from '@/components/ui/Card'
import { recordsApi } from '@/src/api/client'

type FileStatus = 'idle' | 'uploading' | 'done' | 'error'
interface FileItem { name: string; size?: number; status: FileStatus }

export default function UploadScreen() {
  const [files, setFiles] = useState<FileItem[]>([])

  async function pickDocument() {
    if (Platform.OS === 'web') {
      // Web: trigger file input
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf,.jpg,.jpeg,.png,.heic'
      input.multiple = true
      input.onchange = (e) => {
        const picked = Array.from((e.target as HTMLInputElement).files || [])
        setFiles((prev) => [
          ...prev,
          ...picked.map((f) => ({ name: f.name, size: f.size, status: 'idle' as FileStatus })),
        ])
      }
      input.click()
    } else {
      try {
        const { getDocumentAsync } = await import('expo-document-picker')
        const res = await getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          multiple: true,
          copyToCacheDirectory: true,
        })
        if (!res.canceled) {
          setFiles((prev) => [
            ...prev,
            ...res.assets.map((a) => ({ name: a.name, size: a.size, status: 'idle' as FileStatus })),
          ])
        }
      } catch {
        Alert.alert('Ошибка', 'Не удалось открыть файл')
      }
    }
  }

  async function pickCamera() {
    try {
      const { launchCameraAsync, requestCameraPermissionsAsync } = await import('expo-image-picker')
      const { granted } = await requestCameraPermissionsAsync()
      if (!granted) { Alert.alert('Нет доступа', 'Разрешите доступ к камере'); return }
      const res = await launchCameraAsync({ quality: 0.9 })
      if (!res.canceled) {
        const uri = res.assets[0].uri
        const name = uri.split('/').pop() || 'photo.jpg'
        setFiles((prev) => [...prev, { name, status: 'idle' }])
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось открыть камеру')
    }
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function uploadFile(idx: number) {
    setFiles((prev) => prev.map((f, i) => i === idx ? { ...f, status: 'uploading' } : f))
    try {
      const fd = new FormData()
      fd.append('file', files[idx].name) // simplified — real impl sends blob
      await recordsApi.upload(fd)
      setFiles((prev) => prev.map((f, i) => i === idx ? { ...f, status: 'done' } : f))
    } catch {
      setFiles((prev) => prev.map((f, i) => i === idx ? { ...f, status: 'error' } : f))
    }
  }

  const pending = files.filter((f) => f.status === 'idle').length

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <View>
        <Text style={styles.title}>Загрузка</Text>
        <Text style={styles.subtitle}>PDF, фото бланков — ИИ распознает данные автоматически</Text>
      </View>

      {/* Upload area */}
      <TouchableOpacity style={styles.dropZone} onPress={pickDocument} activeOpacity={0.8}>
        <Ionicons name="cloud-upload-outline" size={40} color={colors.teal} />
        <Text style={styles.dropTitle}>
          {Platform.OS === 'web' ? 'Нажмите для выбора файлов' : 'Выбрать из галереи / файлов'}
        </Text>
        <Text style={styles.dropHint}>PDF, JPG, PNG, HEIC · до 20 МБ</Text>
      </TouchableOpacity>

      {/* Camera button (mobile only) */}
      {Platform.OS !== 'web' && (
        <TouchableOpacity style={styles.cameraBtn} onPress={pickCamera} activeOpacity={0.85}>
          <Ionicons name="camera-outline" size={20} color={colors.teal} />
          <Text style={styles.cameraBtnText}>Сфотографировать бланк</Text>
        </TouchableOpacity>
      )}

      {/* File list */}
      {files.length > 0 && (
        <View style={styles.fileSection}>
          <View style={styles.fileHeader}>
            <Text style={styles.fileCount}>{files.length} файл(а)</Text>
            {pending > 0 && (
              <TouchableOpacity
                style={styles.uploadAllBtn}
                onPress={() => files.forEach((_, i) => { if (files[i].status === 'idle') uploadFile(i) })}
                activeOpacity={0.85}
              >
                <Text style={styles.uploadAllText}>Загрузить все ({pending})</Text>
              </TouchableOpacity>
            )}
          </View>

          {files.map((f, idx) => (
            <Card key={idx} style={styles.fileItem}>
              <View style={styles.fileIcon}>
                <Ionicons name="document-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                {f.size != null && (
                  <Text style={styles.fileSize}>{(f.size / 1024).toFixed(0)} KB</Text>
                )}
              </View>
              <View style={styles.fileActions}>
                {f.status === 'idle' && (
                  <TouchableOpacity onPress={() => uploadFile(idx)}>
                    <Text style={styles.uploadOne}>Загрузить</Text>
                  </TouchableOpacity>
                )}
                {f.status === 'uploading' && (
                  <Ionicons name="sync-outline" size={18} color={colors.teal} />
                )}
                {f.status === 'done' && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                )}
                {f.status === 'error' && (
                  <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>Ошибка</Text>
                )}
                <TouchableOpacity onPress={() => removeFile(idx)} style={{ marginLeft: 8 }}>
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Hint */}
      <Card style={styles.hint}>
        <Ionicons name="information-circle-outline" size={18} color={colors.info} />
        <Text style={styles.hintText}>
          После загрузки ИИ-ассистент автоматически расшифрует показатели и занесёт их в медкарту
        </Text>
      </Card>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },

  dropZone: {
    borderWidth: 2,
    borderColor: colors.teal,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.tealLight,
  },
  dropTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  dropHint: { fontSize: fontSize.sm, color: colors.textMuted },

  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    borderWidth: 1,
    borderColor: colors.teal,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  cameraBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.teal },

  fileSection: { gap: spacing.sm },
  fileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fileCount: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  uploadAllBtn: {
    backgroundColor: colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  uploadAllText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },

  fileItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  fileSize: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  fileActions: { flexDirection: 'row', alignItems: 'center' },
  uploadOne: { fontSize: fontSize.sm, fontWeight: '600', color: colors.teal },

  hint: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.infoBg,
    borderColor: '#bfdbfe',
  },
  hintText: { flex: 1, fontSize: fontSize.sm, color: '#1e3a5f', lineHeight: 20 },
})

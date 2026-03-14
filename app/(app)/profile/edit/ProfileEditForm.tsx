'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updateProfileAction, uploadPhotoAction, deletePhotoAction } from './actions'

interface Profile {
  nickname: string
  bio: string
  region: string
  interests: string[]
  photos: string[]
}

interface Props {
  profile: Profile | null
  interestOptions: string[]
}

export default function ProfileEditForm({ profile, interestOptions }: Props) {
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState<string[]>(profile?.photos ?? [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSave(formData: FormData) {
    setError(null)
    setSaving(true)
    const result = await updateProfileAction(formData)
    setSaving(false)
    if (result?.error) {
      setError(result.error)
    } else {
      showToast('プロフィールを保存しました')
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 5) {
      setError('写真は最大5枚までです')
      return
    }
    setError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('photo', file)
    const result = await uploadPhotoAction(fd)
    setUploading(false)
    if (result?.error) {
      setError(result.error)
    } else if (result?.url) {
      setPhotos(prev => [...prev, result.url!])
      showToast('写真をアップロードしました')
    }
    e.target.value = ''
  }

  async function handleDeletePhoto(url: string) {
    const result = await deletePhotoAction(url)
    if (result?.error) {
      setError(result.error)
    } else {
      setPhotos(prev => prev.filter(p => p !== url))
    }
  }

  return (
    <div className="space-y-6">
      {/* 写真セクション */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-2">
          プロフィール写真（最大5枚・1枚以上必須）
        </h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {photos.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden">
              <Image src={url} alt={`photo-${i}`} fill className="object-cover" />
              <button
                onClick={() => handleDeletePhoto(url)}
                className="absolute top-0.5 right-0.5 bg-black/50 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-rose-400 transition-colors">
              <span className="text-2xl text-gray-400">{uploading ? '⏳' : '+'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* プロフィール情報フォーム */}
      <form action={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ニックネーム <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nickname"
            defaultValue={profile?.nickname ?? ''}
            maxLength={20}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            居住地域
          </label>
          <input
            type="text"
            name="region"
            defaultValue={profile?.region ?? ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            placeholder="例：東京都"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            自己紹介（300文字以内）
          </label>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ''}
            maxLength={300}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            placeholder="自分のことを教えてください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            趣味・興味
          </label>
          <div className="flex flex-wrap gap-2">
            {(profile?.interests ?? []).map(interest => (
              <input key={interest} type="hidden" name="interests" value={interest} />
            ))}
            {/* クライアントサイドのタグ選択はシンプルにチェックボックスで実装 */}
            {/* interests は ProfileEditFormClient に切り出して管理 */}
          </div>
          <InterestTags
            options={['映画', '音楽', '読書', '旅行', 'スポーツ', 'ゲーム',
                      '料理', 'アウトドア', 'ファッション', 'アート', 'カフェ', 'ペット']}
            defaultSelected={profile?.interests ?? []}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold rounded-lg py-2 transition-colors"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </form>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function InterestTags({
  options,
  defaultSelected,
}: {
  options: string[]
  defaultSelected: string[]
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected)

  function toggle(tag: string) {
    setSelected(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selected.map(tag => (
        <input key={tag} type="hidden" name="interests" value={tag} />
      ))}
      {options.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            selected.includes(tag)
              ? 'bg-rose-500 text-white border-rose-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-rose-400'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}

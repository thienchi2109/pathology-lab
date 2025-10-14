'use client'

import { useAuth } from '@/lib/auth'
import { SignOutButton } from '@/components/auth'
import { EditorOnly } from '@/components/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Đang tải...</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-2xl w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Hệ thống quản lý mẫu phòng lab
            </CardTitle>
            <CardDescription>
              Lab Sample Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Vai trò:</strong>{' '}
                <span className={role === 'editor' ? 'text-blue-400 font-medium' : 'text-purple-400 font-medium'}>
                  {role === 'editor' ? 'Biên tập viên (Editor)' : 'Người xem (Viewer)'}
                </span>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Quyền truy cập:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Xem danh sách mẫu và kit</li>
                <li>✓ Xem chi tiết mẫu và hình ảnh</li>
                <li>✓ Xem dashboard và báo cáo</li>
                <li>✓ Xuất dữ liệu</li>
                {role === 'editor' && (
                  <>
                    <li className="text-blue-400">✓ Tạo và chỉnh sửa mẫu</li>
                    <li className="text-blue-400">✓ Upload hình ảnh</li>
                    <li className="text-blue-400">✓ Nhập kết quả test</li>
                    <li className="text-blue-400">✓ Quản lý tồn kho kit</li>
                  </>
                )}
              </ul>
            </div>

            <EditorOnly>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-blue-400 bg-blue-50 border border-blue-200 rounded-md p-3">
                  Bạn có quyền biên tập viên - có thể tạo và chỉnh sửa dữ liệu
                </p>
              </div>
            </EditorOnly>

            <div className="pt-4">
              <SignOutButton variant="outline" className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

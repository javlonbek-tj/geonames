import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Button, Result, Spin } from 'antd';
import {
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TagOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router';
import { publicApi } from '@/api/public.api';
import { useCitizenStore } from '@/store/citizenStore';
import dayjs from 'dayjs';

export default function DiscussionPage() {
  const { id } = useParams<{ id: string }>();
  const discussionId = Number(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const citizen = useCitizenStore((s) => s.citizen);

  const { data: discussion, isLoading } = useQuery({
    queryKey: ['public-discussion', discussionId],
    queryFn: () => publicApi.getDiscussion(discussionId).then((r) => r.data.data),
    enabled: discussionId > 0,
  });

  const voteMutation = useMutation({
    mutationFn: (vote: 'support' | 'oppose') =>
      publicApi.submitVote({ discussionId, vote }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['public-discussion', discussionId] });
      void queryClient.invalidateQueries({ queryKey: ['public-discussions'] });
      void message.success('Ovozingiz qabul qilindi');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      void message.error(err.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-32'>
        <Spin size='large' />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-16'>
        <Result status='404' title='Muhokama topilmadi' />
      </div>
    );
  }

  const left = dayjs(discussion.endsAt).diff(dayjs(), 'day');
  const isActive = left >= 0;

  return (
    <>
      {/* Breadcrumb bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e3e8f0' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-500'>
          <button
            onClick={() => void navigate('/')}
            className='hover:text-blue-700 cursor-pointer border-0 bg-transparent p-0'
          >
            Bosh sahifa
          </button>
          <span>/</span>
          <button
            onClick={() => void navigate('/')}
            className='hover:text-blue-700 cursor-pointer border-0 bg-transparent p-0'
          >
            Muhokamalar
          </button>
          <span>/</span>
          <span className='text-gray-900 font-medium truncate max-w-48'>{discussion.proposedNameUz}</span>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

          {/* ─ Main ─ */}
          <div className='lg:col-span-2 flex flex-col gap-6'>

            {/* Back */}
            <button
              className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 cursor-pointer border-0 bg-transparent p-0 self-start'
              onClick={() => void navigate('/')}
            >
              <ArrowLeftOutlined style={{ fontSize: 12 }} />
              Orqaga
            </button>

            {/* Title card */}
            <div style={{ background: '#fff', border: '1px solid #e3e8f0', borderRadius: 16, padding: '28px 32px' }}>
              <div className='flex items-start gap-3 mb-4'>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                  {isActive ? 'Faol muhokama' : 'Tugagan'}
                </span>
              </div>

              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f1f3d', marginBottom: 6, lineHeight: 1.2 }}>
                {discussion.proposedNameUz}
              </h1>
              {discussion.proposedNameKrill && (
                <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 20 }}>
                  {discussion.proposedNameKrill}
                </p>
              )}

              <div className='flex flex-wrap gap-3'>
                {discussion.category && (
                  <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium' style={{ background: '#e8efff', color: '#1565c0' }}>
                    <TagOutlined style={{ fontSize: 12 }} />
                    {discussion.category}
                  </span>
                )}
                <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium' style={{ background: '#f3f4f6', color: '#4b5563' }}>
                  <TagOutlined style={{ fontSize: 12 }} />
                  {discussion.objectType}
                </span>
                {discussion.districtName && (
                  <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium' style={{ background: '#f0fdf4', color: '#166534' }}>
                    <EnvironmentOutlined style={{ fontSize: 12 }} />
                    {discussion.districtName}
                  </span>
                )}
              </div>
            </div>

            {/* Vote results bar */}
            <div style={{ background: '#fff', border: '1px solid #e3e8f0', borderRadius: 16, padding: '24px 32px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f1f3d', marginBottom: 20 }}>
                Ovoz natijasi
              </h3>

              <div className='flex items-center gap-4 mb-4'>
                <div style={{ flex: 1 }}>
                  <div className='flex justify-between text-sm mb-1'>
                    <span style={{ color: '#166534', fontWeight: 600 }}>
                      <LikeFilled style={{ marginRight: 4 }} />
                      {discussion.voteCount} ta qo'llaydi
                    </span>
                    <span style={{ color: '#991b1b', fontWeight: 600 }}>
                      0 ta qo'llamaydi
                      <DislikeFilled style={{ marginLeft: 4 }} />
                    </span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: '#f3f4f6', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg,#16a34a,#22c55e)',
                        width: discussion.voteCount > 0 ? '100%' : '0%',
                        transition: 'width .4s ease',
                      }}
                    />
                  </div>
                  <div className='text-center text-sm text-gray-400 mt-2'>
                    Jami: {discussion.voteCount} ovoz
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ─ Sidebar ─ */}
          <div className='flex flex-col gap-5'>

            {/* Vote action */}
            <div style={{ background: '#fff', border: '1px solid #e3e8f0', borderRadius: 16, padding: '24px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f1f3d', marginBottom: 16 }}>
                Ovoz bering
              </h3>

              {!citizen ? (
                <div>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                    Ovoz berish uchun tizimga kirishingiz kerak.
                  </p>
                  <Button
                    type='primary'
                    block
                    style={{ borderRadius: 10, background: '#1565c0', height: 40 }}
                    onClick={() => void navigate('/login')}
                  >
                    Telegram orqali kirish
                  </Button>
                </div>
              ) : !isActive ? (
                <div
                  className='rounded-xl p-4 text-center'
                  style={{ background: '#f3f4f6', color: '#6b7280', fontSize: 13 }}
                >
                  Muhokama muddati tugagan
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  <button
                    onClick={() => voteMutation.mutate('support')}
                    disabled={voteMutation.isPending}
                    className='flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all text-left'
                    style={{
                      border: discussion.myVote === 'support' ? '2px solid #16a34a' : '2px solid #e3e8f0',
                      background: discussion.myVote === 'support' ? '#f0fdf4' : '#fff',
                      color: '#374151',
                    }}
                  >
                    <div className='w-9 h-9 rounded-lg flex items-center justify-center' style={{ background: '#dcfce7' }}>
                      {discussion.myVote === 'support' ? (
                        <LikeFilled style={{ color: '#16a34a', fontSize: 16 }} />
                      ) : (
                        <LikeOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {discussion.myVote === 'support' ? "Qo'llab ovoz berdingiz" : "Qo'llayman"}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Nom uchun ovoz</div>
                    </div>
                  </button>

                  <button
                    onClick={() => voteMutation.mutate('oppose')}
                    disabled={voteMutation.isPending}
                    className='flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all text-left'
                    style={{
                      border: discussion.myVote === 'oppose' ? '2px solid #dc2626' : '2px solid #e3e8f0',
                      background: discussion.myVote === 'oppose' ? '#fef2f2' : '#fff',
                      color: '#374151',
                    }}
                  >
                    <div className='w-9 h-9 rounded-lg flex items-center justify-center' style={{ background: '#fee2e2' }}>
                      {discussion.myVote === 'oppose' ? (
                        <DislikeFilled style={{ color: '#dc2626', fontSize: 16 }} />
                      ) : (
                        <DislikeOutlined style={{ color: '#dc2626', fontSize: 16 }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {discussion.myVote === 'oppose' ? "Rad ovozi berdingiz" : "Qo'llamayman"}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Nom uchun qarshi ovoz</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ background: '#fff', border: '1px solid #e3e8f0', borderRadius: 16, padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f1f3d', marginBottom: 14 }}>
                Muhokama ma'lumoti
              </h3>
              <div className='flex flex-col gap-3'>
                {[
                  {
                    icon: <CalendarOutlined />,
                    label: 'Tugash sanasi',
                    value: dayjs(discussion.endsAt).format('DD MMMM YYYY'),
                  },
                  {
                    icon: <ClockCircleOutlined />,
                    label: 'Qolgan vaqt',
                    value: isActive
                      ? left === 0 ? 'Bugun tugaydi' : `${left} kun`
                      : 'Tugagan',
                    danger: isActive && left <= 3,
                  },
                  {
                    icon: <LikeOutlined />,
                    label: 'Jami ovozlar',
                    value: `${discussion.voteCount} ta`,
                  },
                ].map((row) => (
                  <div key={row.label} className='flex items-center justify-between'>
                    <span className='flex items-center gap-2 text-sm text-gray-500'>
                      <span style={{ color: '#1565c0' }}>{row.icon}</span>
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: row.danger ? '#dc2626' : '#0f1f3d',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

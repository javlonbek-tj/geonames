import { useState } from 'react';
import { App, Button, Form, Input } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { publicApi } from '@/api/public.api';
import { useCitizenStore } from '@/store/citizenStore';
import logoSvg from '@/assets/logo.svg';

type Step = 'phone' | 'otp';

export default function TelegramLoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const setAuth = useCitizenStore((s) => s.setAuth);
  const citizen = useCitizenStore((s) => s.citizen);

  const [step, setStep] = useState<Step>('phone');
  const [sessionId, setSessionId] = useState('');
  const [phone, setPhone] = useState('');

  const [phoneForm] = Form.useForm<{ phone: string }>();
  const [otpForm] = Form.useForm<{ code: string }>();

  const requestOtp = useMutation({
    mutationFn: (values: { phone: string }) =>
      publicApi.requestOtp(values.phone),
    onSuccess: (res, variables) => {
      setSessionId(res.data.data.sessionId);
      setPhone(variables.phone);
      setStep('otp');
      void message.success('Telegram orqali tasdiqlash kodi yuborildi');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      void message.error(err.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });

  const verifyOtp = useMutation({
    mutationFn: (values: { code: string }) =>
      publicApi.verifyOtp(sessionId, values.code),
    onSuccess: (res) => {
      const { accessToken, citizen: c } = res.data.data;
      setAuth(accessToken, c);
      void message.success('Muvaffaqiyatli kirdingiz');
      void navigate('/');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      void message.error(err.response?.data?.message ?? "Noto'g'ri kod");
    },
  });

  if (citizen) {
    void navigate('/');
    return null;
  }

  return (
    <div
      style={{
        background: '#f9fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 40px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div className='flex flex-col items-center mb-8'>
          <img
            src={logoSvg}
            alt='Geonames'
            style={{ height: 28, marginBottom: 14 }}
          />
          <p
            style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Avval{' '}
            <a
              href='https://t.me/geonomlar_bot'
              target='_blank'
              rel='noreferrer'
              style={{ color: '#1565c0', fontWeight: 700 }}
            >
              @geonomlar_bot
            </a>{' '}
            telegram botni ishga tushiring va telefon raqamingizni ulashing.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #e3e8f0',
            padding: '36px 36px',
            boxShadow: '0 4px 24px rgba(0,0,0,.06)',
          }}
        >
          {/* Steps indicator */}
          <div className='flex items-center gap-2 mb-8'>
            {(['phone', 'otp'] as Step[]).map((s, i) => (
              <div key={s} className='flex items-center gap-2 flex-1'>
                <div
                  className='flex items-center justify-center rounded-full text-xs font-bold shrink-0'
                  style={{
                    width: 28,
                    height: 28,
                    background:
                      step === s
                        ? '#1565c0'
                        : i === 0 && step === 'otp'
                          ? '#dcfce7'
                          : '#f3f4f6',
                    color:
                      step === s
                        ? '#fff'
                        : i === 0 && step === 'otp'
                          ? '#16a34a'
                          : '#9ca3af',
                  }}
                >
                  {i === 0 && step === 'otp' ? '✓' : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: step === s ? '#1565c0' : '#9ca3af',
                    fontWeight: step === s ? 600 : 400,
                    flex: 1,
                  }}
                >
                  {s === 'phone' ? 'Telefon raqam' : 'Tasdiqlash kodi'}
                </span>
                {i === 0 && (
                  <div
                    style={{
                      width: 24,
                      height: 2,
                      background: step === 'otp' ? '#1565c0' : '#e3e8f0',
                      borderRadius: 2,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 'phone' ? (
            <>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0f1f3d',
                  marginBottom: 6,
                  textAlign: 'center',
                }}
              >
                Tizimga kirish
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: '#6b7280',
                  marginBottom: 24,
                  lineHeight: 1.6,
                  textAlign: 'center',
                }}
              >
                Telegram bot orqali bir martalik kod yuboriladi.
              </p>

              <Form
                form={phoneForm}
                layout='vertical'
                onFinish={(v) => requestOtp.mutate({ phone: '+998' + String(v.phone).replace(/\D/g, '') })}
              >
                <Form.Item
                  name='phone'
                  label={
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      Telefon raqam
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Telefon raqam kiriting' },
                    {
                      pattern: /^\d{9}$/,
                      message: '9 ta raqam kiriting (901234567)',
                    },
                  ]}
                >
                  <Input
                    addonBefore={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontWeight: 600 }}>
                        <PhoneOutlined style={{ fontSize: 14, color: '#1565c0' }} />
                        +998
                      </span>
                    }
                    placeholder='901234567'
                    size='large'
                    maxLength={9}
                    style={{ borderRadius: 10 }}
                    autoComplete='off'
                  />
                </Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  size='large'
                  loading={requestOtp.isPending}
                  style={{
                    borderRadius: 10,
                    background: '#1565c0',
                    border: 'none',
                    fontWeight: 700,
                    height: 44,
                    marginTop: 4,
                  }}
                >
                  Kod yuborish
                </Button>
              </Form>
            </>
          ) : (
            <>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0f1f3d',
                  marginBottom: 6,
                }}
              >
                Kodni kiriting
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: '#6b7280',
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                <strong>{phone}</strong> raqamingizga Telegram orqali 6 xonali
                kod yuborildi.
              </p>

              <Form
                form={otpForm}
                layout='vertical'
                onFinish={(v) => verifyOtp.mutate(v)}
              >
                <Form.Item
                  name='code'
                  label={
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      Tasdiqlash kodi
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Kodni kiriting' },
                    { len: 6, message: '6 xonali kod kiriting' },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                    placeholder='• • • • • •'
                    size='large'
                    maxLength={6}
                    style={{ borderRadius: 10, letterSpacing: 6, fontSize: 18 }}
                  />
                </Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  size='large'
                  loading={verifyOtp.isPending}
                  style={{
                    borderRadius: 10,
                    background: '#1565c0',
                    border: 'none',
                    fontWeight: 700,
                    height: 44,
                    marginTop: 4,
                  }}
                >
                  Tasdiqlash
                </Button>
                <Button
                  block
                  size='large'
                  onClick={() => {
                    setStep('phone');
                    otpForm.resetFields();
                  }}
                  style={{ marginTop: 10, borderRadius: 10, height: 44 }}
                >
                  Raqamni o'zgartirish
                </Button>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

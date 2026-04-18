import { useEffect, useState } from 'react';
import { Input, Button, Spin } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/hooks/auth/useLogin';
import { loginSchema, type LoginSchema } from '@/lib/schemas/auth.schema';

const inputClass =
  'bg-transparent border-0 border-b-2 border-b-[#CBDDF1] rounded-none shadow-none text-[#e0e0ff] pl-0';

export default function LoginPage() {
  const { mutate, isPending, retryAfter, clearRetryAfter } = useLogin();
  const [countdown, setCountdown] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (!retryAfter) return;
    setCountdown(retryAfter);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          clearRetryAfter();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfter]);

  const isBlocked = countdown !== null;
  const onSubmit = handleSubmit((values) => {
    if (!isBlocked) mutate(values);
  });

  const buttonLabel = () => {
    if (isPending) return <Spin size='small' />;
    if (isBlocked) return `${countdown} s`;
    return 'Kirish';
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#1a1a2e] p-6'>
      <div className='w-full max-w-105 bg-[#16213e] border border-[#0f3460] rounded-xl px-10 py-12'>
        <h1 className='text-center text-lg font-bold tracking-widest uppercase text-white mb-8'>
          Tizimga kirish
        </h1>

        <form onSubmit={onSubmit} noValidate className='flex flex-col gap-6'>
          <div className='flex flex-col gap-1'>
            <label
              htmlFor='username'
              className='text-[11px] tracking-widest uppercase text-[#8a8aaa]'
            >
              Login
            </label>
            <Controller
              name='username'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  autoComplete='off'
                  className={inputClass}
                  id='username'
                  disabled={isBlocked}
                />
              )}
            />
            {errors.username && (
              <span className='text-xs text-red-400'>
                {errors.username.message}
              </span>
            )}
          </div>

          <div className='flex flex-col gap-1'>
            <label
              htmlFor='password'
              className='text-[11px] tracking-widest uppercase text-[#8a8aaa]'
            >
              Parol
            </label>
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  autoComplete='current-password'
                  className={inputClass}
                  id='password'
                  disabled={isBlocked}
                  iconRender={(visible) =>
                    visible ? (
                      <EyeOutlined style={{ color: '#CBDDF1' }} />
                    ) : (
                      <EyeInvisibleOutlined style={{ color: '#CBDDF1' }} />
                    )
                  }
                />
              )}
            />
            {errors.password && (
              <span className='text-xs text-red-400'>
                {errors.password.message}
              </span>
            )}
          </div>

          {isBlocked && (
            <p className='text-xs text-red-400 text-center -mt-2'>
              Juda ko&apos;p urinish. {countdown} soniyadan keyin qayta urinib ko&apos;ring.
            </p>
          )}

          <div className='flex justify-end'>
            <Button
              htmlType='submit'
              disabled={isPending || isBlocked}
              className='w-24 bg-transparent border border-[#CBDDF1] text-[#CBDDF1] tracking-widest rounded-none uppercase'
            >
              {buttonLabel()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

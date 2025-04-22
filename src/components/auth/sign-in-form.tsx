'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>();

  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string>('');

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setSuccessMessage('');

      try {
        console.log('Đang đăng nhập với tài khoản:', values.email);
        const { data, error } = await authService.login(values);

        if (error) {
          console.error('Lỗi đăng nhập:', error);
          setError('root', { type: 'server', message: error });
          setIsPending(false);
          return;
        }

        console.log('Đăng nhập thành công, dữ liệu người dùng:', data);
        
        // Show success message
        setSuccessMessage(`Đăng nhập thành công. Xin chào ${data?.fullName || 'admin'}`);

        // Make sure to wait for the session check to complete BEFORE navigation
        if (checkSession) {
          console.log('Đang kiểm tra phiên làm việc trước khi chuyển hướng');
          await checkSession();
          console.log('Kiểm tra phiên làm việc hoàn tất');
        } else {
          console.warn('Hàm kiểm tra phiên làm việc không khả dụng');
        }

        // Wait a moment to ensure user context is updated
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log(
          'Trạng thái người dùng sau khi đăng nhập:',
          authService.getCurrentUser(),
          'Đã xác thực:',
          authService.isAuthenticated()
        );

        // Only navigate if we're properly authenticated
        if (authService.isAuthenticated()) {
          console.log('Xác thực thành công, đang chuyển hướng đến trang chủ');

          // Use replace instead of push to avoid history issues
          router.replace(paths.dashboard.overview);
        } else {
          console.error('Xác thực thất bại mặc dù phản hồi đăng nhập thành công');
          setError('root', {
            type: 'server',
            message: 'Xác thực thất bại. Vui lòng thử lại.',
          });
          setIsPending(false);
        }
      } catch (err) {
        console.error('Lỗi không mong đợi trong quá trình đăng nhập:', err);
        setError('root', {
          type: 'server',
          message: 'Đã xảy ra lỗi không mong đợi. Vui lòng thử lại.',
        });
        setIsPending(false);
      }
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Hmes-Dashboard</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Tài khoản đăng nhập</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Mật khẩu</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Quên mật khẩu
            </Link>
          </div>
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          {successMessage ? <Alert color="success">{successMessage}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            Đăng nhập
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}

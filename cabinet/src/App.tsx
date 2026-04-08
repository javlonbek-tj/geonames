import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntApp, ConfigProvider } from 'antd';
import AppRouter from '@/router';
import { queryClient } from '@/lib/queryClient';

const theme = {
  token: {
    fontFamily: "'Inter Variable', sans-serif",
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StyleProvider layer>
        <ConfigProvider theme={theme}>
          <AntApp>
            <AppRouter />
          </AntApp>
        </ConfigProvider>
      </StyleProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

import { RightOutlined, GlobalOutlined } from '@ant-design/icons';

interface Crumb {
  label: string;
  onClick?: () => void;
}

interface Props {
  crumbs: Crumb[];
}

export default function MapBreadcrumb({ crumbs }: Props) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 text-xs font-medium">
      <GlobalOutlined className="text-[#1565c0] mr-0.5" />
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <RightOutlined style={{ fontSize: 9, color: '#9ca3af' }} />}
          {crumb.onClick ? (
            <button
              onClick={crumb.onClick}
              className="text-[#1565c0] hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="text-gray-700">{crumb.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

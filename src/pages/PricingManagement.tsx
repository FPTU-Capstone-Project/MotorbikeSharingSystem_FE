import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  EyeIcon,
  PlayCircleIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import pricingConfigService, { PricingConfigSearchParams } from '../services/pricingConfigService';
import {
  FareTierDto,
  PricingConfigDto,
  PricingConfigStatus,
  CreatePricingConfigPayload,
} from '../types/pricing.types';

type StatusFilter = PricingConfigStatus | 'all';

const defaultTiers: FareTierDto[] = [
  { tierLevel: 1, minKm: 0, maxKm: 5, amount: 10000, description: '0-5km' },
  { tierLevel: 2, minKm: 5, maxKm: 10, amount: 15000, description: '5-10km' },
  { tierLevel: 3, minKm: 10, maxKm: 25, amount: 20000, description: '10-25km' },
];

export default function PricingManagement() {
  const [configs, setConfigs] = useState<PricingConfigDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selected, setSelected] = useState<PricingConfigDto | null>(null);

  const [draftForm, setDraftForm] = useState<CreatePricingConfigPayload>({
    systemCommissionRate: 0.1,
    changeReason: 'Thiết lập biểu giá mặc định',
    fareTiers: defaultTiers,
  });

  const statusChips: { label: string; value: StatusFilter; color: string }[] = [
    { label: 'Tất cả', value: 'all', color: 'bg-gray-100 text-gray-700' },
    { label: 'Nháp', value: 'DRAFT', color: 'bg-slate-100 text-slate-700' },
    { label: 'Đã lên lịch', value: 'SCHEDULED', color: 'bg-amber-100 text-amber-700' },
    { label: 'Đang áp dụng', value: 'ACTIVE', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Lưu trữ', value: 'ARCHIVED', color: 'bg-gray-200 text-gray-600' },
  ];

  const stats = useMemo(() => {
    const active = configs.filter((c) => c.status === 'ACTIVE').length;
    const scheduled = configs.filter((c) => c.status === 'SCHEDULED').length;
    const draft = configs.filter((c) => c.status === 'DRAFT').length;
    return [
      { label: 'Đang áp dụng', value: active, icon: CheckCircleIcon, tone: 'from-emerald-500 to-teal-600' },
      { label: 'Đã lên lịch', value: scheduled, icon: ClockIcon, tone: 'from-amber-500 to-orange-600' },
      { label: 'Nháp', value: draft, icon: PlusIcon, tone: 'from-indigo-500 to-purple-600' },
    ];
  }, [configs]);

  const loadConfigs = async (params?: Partial<PricingConfigSearchParams>) => {
    try {
      setLoading(true);
      const response = await pricingConfigService.list({
        page,
        size: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        ...params,
      });
      setConfigs(response.data || []);
      setTotalPages(response.pagination?.total_pages ?? 1);
      setTotalRecords(response.pagination?.total_records ?? response.data?.length ?? 0);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || 'Không tải được biểu giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter]);

  const handleCreateDraft = async () => {
    try {
      setLoading(true);
      const payload = {
        ...draftForm,
        systemCommissionRate: Number(draftForm.systemCommissionRate),
        fareTiers: draftForm.fareTiers.map((t) => ({
          ...t,
          amount: Number(t.amount),
        })),
      };
      await pricingConfigService.create(payload);
      toast.success('Đã tạo cấu hình nháp');
      setDraftForm({
        systemCommissionRate: payload.systemCommissionRate,
        changeReason: payload.changeReason,
        fareTiers: [...payload.fareTiers],
      });
      loadConfigs({ page: 0 });
      setPage(0);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || 'Không thể tạo biểu giá');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (id: number) => {
    if (!window.confirm('Lên lịch kích hoạt biểu giá này?')) return;
    try {
      setLoading(true);
      await pricingConfigService.schedule(id);
      toast.success('Đã lên lịch biểu giá');
      loadConfigs();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || 'Không thể lên lịch');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!window.confirm('Lưu trữ biểu giá này?')) return;
    try {
      setLoading(true);
      await pricingConfigService.archive(id);
      toast.success('Đã lưu trữ biểu giá');
      loadConfigs();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || 'Không thể lưu trữ');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status: PricingConfigStatus) => {
    const map: Record<PricingConfigStatus, string> = {
      ACTIVE: 'text-emerald-700 bg-emerald-50',
      SCHEDULED: 'text-amber-700 bg-amber-50',
      DRAFT: 'text-slate-700 bg-slate-50',
      ARCHIVED: 'text-gray-600 bg-gray-100',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cấu hình giá</h1>
          <p className="mt-2 text-gray-600">Quản lý phiên bản biểu giá, bậc giá và lịch kích hoạt</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => loadConfigs()}
            className="btn-secondary inline-flex items-center gap-2"
            disabled={loading}
          >
            <ArrowPathIcon className="h-5 w-5" />
            Làm mới
          </button>
          <button
            onClick={handleCreateDraft}
            className="btn-primary inline-flex items-center gap-2"
            disabled={loading}
          >
            <PlusIcon className="h-5 w-5" />
            Tạo cấu hình nháp
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white shadow-sm rounded-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.tone} text-white flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {statusChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setStatusFilter(chip.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                statusFilter === chip.value ? 'bg-indigo-600 text-white' : chip.color
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Tổng số: <span className="font-semibold text-gray-900">{totalRecords}</span> cấu hình
        </div>
      </div>

      {/* Draft form (quick create) */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tạo cấu hình nháp nhanh</h3>
            <p className="text-sm text-gray-500">Điều chỉnh hoa hồng và mức giá cơ bản trước khi lưu nháp</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm">
              Hoa hồng hệ thống (%):
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={draftForm.systemCommissionRate}
                onChange={(e) =>
                  setDraftForm((prev) => ({ ...prev, systemCommissionRate: Number(e.target.value) }))
                }
                className="input-field w-28"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              Lý do thay đổi:
              <input
                type="text"
                value={draftForm.changeReason || ''}
                onChange={(e) => setDraftForm((prev) => ({ ...prev, changeReason: e.target.value }))}
                className="input-field w-64"
                placeholder="VD: Điều chỉnh khung giá T5"
              />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {draftForm.fareTiers.map((tier, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">Bậc {tier.tierLevel}</span>
                <span className="text-xs text-gray-500">
                  {tier.minKm} - {tier.maxKm} km
                </span>
              </div>
              <input
                type="number"
                min={0}
                value={tier.amount}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setDraftForm((prev) => {
                    const updated = [...prev.fareTiers];
                    updated[idx] = { ...updated[idx], amount: value };
                    return { ...prev, fareTiers: updated };
                  });
                }}
                className="input-field w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phiên bản</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hiệu lực từ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hiệu lực đến</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoa hồng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số bậc</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.pricingConfigId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{config.version || 'N/A'}</div>
                    <div className="text-xs text-gray-500">ID: {config.pricingConfigId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderStatus(config.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {config.validFrom ? new Date(config.validFrom).toLocaleString() : 'Chưa đặt'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {config.validUntil ? new Date(config.validUntil).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(config.systemCommissionRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {config.fareTiers?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelected(config)}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" /> Xem
                    </button>
                    {config.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSchedule(config.pricingConfigId)}
                        className="text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
                      >
                        <PlayCircleIcon className="h-4 w-4" /> Lên lịch
                      </button>
                    )}
                    {config.status !== 'ACTIVE' && config.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleArchive(config.pricingConfigId)}
                        className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1"
                      >
                        <ArchiveBoxIcon className="h-4 w-4" /> Lưu trữ
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          loading={loading}
        />
      </div>

      {/* Drawer / modal for tiers */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="w-full max-w-xl bg-white shadow-2xl h-full overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Chi tiết biểu giá</h3>
                  <p className="text-sm text-gray-500">Phiên bản: {selected.version}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-800 text-sm"
                >
                  Đóng
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  {renderStatus(selected.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Hiệu lực từ</span>
                  <span className="font-medium text-gray-900">
                    {selected.validFrom ? new Date(selected.validFrom).toLocaleString() : 'Chưa đặt'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Hiệu lực đến</span>
                  <span className="font-medium text-gray-900">
                    {selected.validUntil ? new Date(selected.validUntil).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Hoa hồng hệ thống</span>
                  <span className="font-medium text-gray-900">
                    {(selected.systemCommissionRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Bậc giá</h4>
                  <div className="space-y-2">
                    {selected.fareTiers
                      ?.sort((a, b) => (a.tierLevel || 0) - (b.tierLevel || 0))
                      .map((tier) => (
                        <div
                          key={tier.tierLevel}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Bậc {tier.tierLevel}</p>
                            <p className="text-xs text-gray-500">
                              {tier.minKm} - {tier.maxKm} km
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {tier.amount?.toLocaleString('vi-VN')} ₫
                            </p>
                            <p className="text-xs text-gray-500">{tier.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Reports/index.jsx — API-backed operational reports
// ============================================================

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { reportsApi } from '../../services/api';
import { useTransit } from '../../context/TransitContext';

export default function Reports() {
  const { routes, showToast } = useTransit();
  const [period, setPeriod] = useState('weekly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortCol, setSortCol] = useState('passengers');
  const [sortAsc, setSortAsc] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const load = async (p = period) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.get(p);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const tableData = useMemo(() => {
    const rows = (report?.busiestRoutes || []).map((r) => {
      const routeMeta = routes.find((x) => x.id === r.routeId || x.code === r.routeCode);
      return {
        routeNum: r.routeCode || '—',
        routeName: r.routeName || '—',
        trips: report?.completedTrips ?? 0,
        passengers: r.passengers ?? 0,
        onTime: report?.onTimePercentage ?? 0,
        avgDelay: report?.delays ?? 0,
        peakStop: (report?.busiestStops?.[0]?.name) || '—',
        status: routeMeta?.status || 'Active',
      };
    });
    return [...rows].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [report, routes, sortCol, sortAsc]);

  useEffect(() => {
    if (!chartRef.current || !window.Chart || !report?.dailySeries) return undefined;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    const series = report.dailySeries;
    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: series.map((d) => d.day || d.date),
        datasets: [
          {
            label: 'Passengers',
            data: series.map((d) => d.passengers ?? 0),
            borderColor: '#1D9E75',
            backgroundColor: 'rgba(29,158,117,0.15)',
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: '#1E3048' } },
          y: { ticks: { color: '#64748b' }, grid: { color: '#1E3048' } },
        },
      },
    });
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [report]);

  const handleExportCSV = async () => {
    try {
      const csv = await reportsApi.exportCsv(period);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transitops-report-${period}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast?.('Report exported', 'success');
    } catch (err) {
      showToast?.(err.message || 'Export failed', 'error');
    }
  };

  const toggleSort = (col) => {
    if (sortCol === col) setSortAsc((v) => !v);
    else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Operational Reports</h2>
          <p className="section-subtitle">
            {report
              ? `${report.startDate} → ${report.endDate}`
              : 'Live aggregates from TripMetric'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold capitalize border',
                period === p
                  ? 'bg-primary text-white border-primary'
                  : 'border-surface-border text-slate-400 hover:border-primary/40'
              )}
            >
              {p}
            </button>
          ))}
          <button type="button" className="btn-ghost text-xs font-bold flex items-center gap-1" onClick={handleExportCSV}>
            <ArrowDownTrayIcon className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {loading && (
        <div className="card text-slate-400 text-sm">Loading report from API…</div>
      )}
      {error && (
        <div className="card space-y-2">
          <p className="text-status-critical text-sm">{error}</p>
          <button type="button" className="btn-primary w-fit" onClick={() => load(period)}>Retry</button>
        </div>
      )}

      {report && !loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Ridership', value: report.ridership },
              { label: 'Completed Trips', value: report.completedTrips },
              { label: 'On-Time %', value: `${report.onTimePercentage}%` },
              { label: 'Avg Speed', value: `${report.averageSpeed} km/h` },
            ].map((c) => (
              <div key={c.label} className="card">
                <p className="text-slate-500 text-xs uppercase tracking-wide">{c.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{c.value ?? '—'}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="text-slate-100 font-semibold">Daily ridership series</h3>
            </div>
            <canvas ref={chartRef} height={120} />
          </div>

          <div className="card overflow-x-auto">
            <h3 className="text-slate-100 font-semibold mb-4">Busiest routes</h3>
            {tableData.length === 0 ? (
              <p className="text-slate-500 text-sm">No route metric rows for this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 text-xs uppercase border-b border-surface-border">
                    {[
                      ['routeNum', 'Route'],
                      ['passengers', 'Passengers'],
                      ['onTime', 'On-Time %'],
                      ['status', 'Status'],
                    ].map(([key, label]) => (
                      <th key={key} className="py-2 pr-3 cursor-pointer" onClick={() => toggleSort(key)}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.routeNum + row.routeName} className="border-b border-surface-border/60">
                      <td className="py-3 pr-3 text-slate-200 font-medium">
                        {row.routeNum}
                        <span className="block text-xs text-slate-500">{row.routeName}</span>
                      </td>
                      <td className="py-3 pr-3 text-slate-300">{row.passengers}</td>
                      <td className="py-3 pr-3 text-slate-300">{row.onTime}</td>
                      <td className="py-3">
                        <span className={row.status === 'Active' ? 'badge-active' : 'badge-delayed'}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

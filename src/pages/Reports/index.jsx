// ============================================================
// Reports/index.jsx — KNUST System Operational Reports
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowDownTrayIcon,
  PrinterIcon,
  CalendarIcon,
  ArrowLongUpIcon,
  ArrowLongDownIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTransit } from '../../context/TransitContext';

const INITIAL_TABLE_DATA = [
  { routeNum: 'K-01', routeName: 'Tech Junction – Katanga Circular', trips: 340, passengers: 4210, onTime: 92, avgDelay: 2.1, peakStop: 'Continental Roundabout', status: 'Active' },
  { routeNum: 'K-02', routeName: 'Halls Circular — North', trips: 280, passengers: 3480, onTime: 89, avgDelay: 3.4, peakStop: 'Unity Hall / Conti', status: 'Active' },
  { routeNum: 'K-03', routeName: 'Faculty Express', trips: 240, passengers: 2950, onTime: 94, avgDelay: 1.8, peakStop: 'College of Engineering', status: 'Active' },
  { routeNum: 'K-04', routeName: 'Commercial Shuttle', trips: 220, passengers: 2100, onTime: 85, avgDelay: 4.2, peakStop: 'Commercial Area / Market', status: 'Active' },
  { routeNum: 'K-05', routeName: 'New Site Connector', trips: 140, passengers: 1350, onTime: 78, avgDelay: 5.8, peakStop: 'New Site Terminal', status: 'Inactive' },
  { routeNum: 'K-06', routeName: 'Library – Stadium Loop', trips: 180, passengers: 1780, onTime: 91, avgDelay: 2.5, peakStop: 'Prempeh II Library', status: 'Active' },
];

export default function Reports() {
  const { routes } = useTransit();
  const [tableData, setTableData] = useState(INITIAL_TABLE_DATA);

  // Date picker state
  const [fromDate, setFromDate] = useState('2026-07-20');
  const [toDate, setToDate] = useState('2026-07-27');
  const [isDateFiltered, setIsDateFiltered] = useState(false);

  // Table sorting state
  const [sortCol, setSortCol] = useState('routeNum');
  const [sortAsc, setSortAsc] = useState(true);

  // Chart refs
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Date filters apply handler
  const handleApplyDateFilter = () => {
    if (!fromDate || !toDate) return;
    setIsDateFiltered(true);

    // Fluctuate the data values randomly by 10-25% when date range is applied
    setTableData(
      INITIAL_TABLE_DATA.map((row) => {
        const factor = 0.75 + Math.random() * 0.2;
        return {
          ...row,
          trips: Math.floor(row.trips * factor),
          passengers: Math.floor(row.passengers * factor),
        };
      })
    );
  };

  const handleResetDateFilter = () => {
    setFromDate('2026-07-20');
    setToDate('2026-07-27');
    setIsDateFiltered(false);
    setTableData(INITIAL_TABLE_DATA);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = 'Route,Total Trips,Passengers,On-Time %,Avg Delay (min),Peak Stop,Status\n';
    const rows = tableData
      .map((row) => {
        return `"${row.routeNum} - ${row.routeName}",${row.trips},${row.passengers},${row.onTime}%,${row.avgDelay},"${row.peakStop}",${row.status}\n`;
      })
      .join('');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'knust_route_performance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF (window print trigger)
  const handleExportPDF = () => {
    window.print();
  };

  // Table Sort logic
  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortCol(colKey);
      setSortAsc(true);
    }
  };

  const sortedTableData = useMemo(() => {
    return [...tableData].sort((a, b) => {
      let aVal = a[sortCol];
      let bVal = b[sortCol];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
    });
  }, [tableData, sortCol, sortAsc]);

  // Render sort indicator arrows
  const renderSortIndicator = (colKey) => {
    if (sortCol !== colKey) return null;
    return sortAsc
      ? <ArrowLongUpIcon className="w-3.5 h-3.5 inline ml-1 text-primary" />
      : <ArrowLongDownIcon className="w-3.5 h-3.5 inline ml-1 text-primary" />;
  };

  // Initialize and update Chart.js
  useEffect(() => {
    if (!window.Chart || !chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Generate daily ridership datasets based on route color
    const datasets = routes.map((r) => {
      let baseVal = 400;
      if (r.number === 'K-01') baseVal = 820;
      else if (r.number === 'K-02') baseVal = 680;
      else if (r.number === 'K-03') baseVal = 580;
      else if (r.number === 'K-04') baseVal = 450;
      else if (r.number === 'K-05') baseVal = 280;
      else if (r.number === 'K-06') baseVal = 320;

      // Adjust based on date picker range if applied
      const multiplier = isDateFiltered ? 0.8 : 1.0;

      const data = labels.map(() => {
        return Math.floor((baseVal + Math.random() * 120) * multiplier);
      });

      return {
        label: r.number,
        data: data,
        backgroundColor: r.color,
        borderColor: r.color,
        borderWidth: 1,
        borderRadius: 4,
      };
    });

    const config = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: {
                family: 'Inter',
                size: 11,
              },
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              color: '#1e293b',
              drawBorder: false,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'Inter',
              },
            },
          },
          y: {
            grid: {
              color: '#1e293b',
              drawBorder: false,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'Inter',
              },
            },
          },
        },
      },
    };

    chartInstanceRef.current = new window.Chart(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [routes, isDateFiltered]);

  return (
    <div className="space-y-6">
      
      {/* Print styled CSS styles overrides */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          aside, header, #sidebar, #topnav-notifications, #topnav-user-menu, button, .no-print {
            display: none !important;
          }
          #main-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .card {
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            color: #000000 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          tr {
            border-bottom: 1px solid #cbd5e1 !important;
          }
          h2, h3, p, th, td, span, div {
            color: #000000 !important;
          }
        }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap no-print">
        <div>
          <h2 className="section-title">System Performance Reports</h2>
          <p className="section-subtitle">
            Generate and export weekly ridership stats, route efficiency logs, and schedules
          </p>
        </div>
      </div>

      {/* ── SECTION A: Summary Stats Row ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Trips This Week</p>
          <p className="text-2xl font-bold mt-1 text-white">1,847</p>
          <p className="text-slate-500 text-[10px] mt-0.5">Standard network runs</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Passengers This Week</p>
          <p className="text-2xl font-bold mt-1 text-white">22,340</p>
          <p className="text-primary text-[10px] font-semibold mt-0.5">↑ +12% vs last week</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Average On-Time Rate</p>
          <p className="text-2xl font-bold mt-1 text-status-active">88%</p>
          <p className="text-slate-500 text-[10px] mt-0.5">Within compliance target</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Most Used Route</p>
          <p className="text-2xl font-bold mt-1 text-primary">K-01</p>
          <p className="text-slate-500 text-[10px] mt-0.5">Tech Jct–Katanga (34%)</p>
        </div>
      </div>

      {/* ── SECTION B: Route Performance Table ──────────────── */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-surface-border bg-slate-900/40">
          <h3 className="text-slate-100 font-bold text-sm">Route Efficiency Performance Log</h3>
        </div>
        
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-slate-900/50">
                <th className="px-5 py-3 text-slate-500 font-bold text-xs uppercase cursor-pointer select-none" onClick={() => handleSort('routeNum')}>
                  Route {renderSortIndicator('routeNum')}
                </th>
                <th className="px-5 py-3 text-slate-500 font-bold text-xs uppercase cursor-pointer select-none" onClick={() => handleSort('trips')}>
                  Total Trips {renderSortIndicator('trips')}
                </th>
                <th className="px-5 py-3 text-slate-500 font-bold text-xs uppercase cursor-pointer select-none" onClick={() => handleSort('passengers')}>
                  Passengers {renderSortIndicator('passengers')}
                </th>
                <th className="px-5 py-3 text-slate-500 font-bold text-xs uppercase cursor-pointer select-none" onClick={() => handleSort('onTime')}>
                  On-Time % {renderSortIndicator('onTime')}
                </th>
                <th className="px-5 py-3 text-slate-500 font-bold text-xs uppercase cursor-pointer select-none" onClick={() => handleSort('avgDelay')}>
                  Avg Delay {renderSortIndicator('avgDelay')}
                </th>
                <th className="px-5 py-3 text-slate-500 font-bold text-xs uppercase cursor-pointer select-none" onClick={() => handleSort('peakStop')}>
                  Peak Stop {renderSortIndicator('peakStop')}
                </th>
                <th className="px-5 py-3 text-slate-500 font-bold text-xs uppercase cursor-pointer select-none" onClick={() => handleSort('status')}>
                  Status {renderSortIndicator('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTableData.map((row) => (
                <tr key={row.routeNum} className="border-b border-surface-border last:border-0 hover:bg-surface-light/40 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-200">
                    <span className="text-primary mr-1.5 font-bold">{row.routeNum}</span>
                    <span className="text-xs text-slate-400 font-medium">{row.routeName}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-300">{row.trips}</td>
                  <td className="px-5 py-3 font-mono text-slate-300">{row.passengers.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-200 font-bold">
                    <span className={clsx(
                      row.onTime >= 90 ? 'text-primary' : row.onTime >= 80 ? 'text-status-delayed' : 'text-status-critical'
                    )}>
                      {row.onTime}%
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-400">{row.avgDelay} min</td>
                  <td className="px-5 py-3 text-slate-300 text-xs font-semibold">{row.peakStop}</td>
                  <td className="px-5 py-3">
                    <span className={clsx(
                      'text-[10px] font-bold px-2 py-0.5 rounded border',
                      row.status === 'Active' ? 'bg-status-active/10 text-primary border-primary/20' : 'bg-status-critical/10 text-status-critical border-status-critical/20'
                    )}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION C: Ridership Chart ──────────────────────── */}
      <div className="card">
        <h3 className="text-slate-100 font-bold text-sm mb-4">7-Day Grouped Daily Ridership</h3>
        <div className="h-72 relative">
          <canvas ref={chartRef} />
        </div>
      </div>

      {/* ── SECTION D: Export & Actions ──────────────────────── */}
      <div className="card flex flex-wrap items-center justify-between gap-4 py-4 no-print">
        
        {/* Date Range Picker inputs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4.5 h-4.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-surface border border-surface-border text-xs rounded-lg p-2 text-slate-300 focus:outline-none"
            />
            <span className="text-xs text-slate-500">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-surface border border-surface-border text-xs rounded-lg p-2 text-slate-300 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary py-2 px-4 text-xs font-bold bg-primary text-white border-none cursor-pointer"
              onClick={handleApplyDateFilter}
            >
              Apply Filter
            </button>
            {isDateFiltered && (
              <button
                type="button"
                className="btn-ghost py-2 px-3 text-xs font-bold cursor-pointer"
                onClick={handleResetDateFilter}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Exporters */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-ghost py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            onClick={handleExportCSV}
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
          <button
            type="button"
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-primary text-white border-none"
            onClick={handleExportPDF}
          >
            <PrinterIcon className="w-4 h-4" />
            Print Report
          </button>
        </div>

      </div>

    </div>
  );
}

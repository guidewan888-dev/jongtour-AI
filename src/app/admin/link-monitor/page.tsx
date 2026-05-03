"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Play, Wrench, FileDown, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

export default function LinkMonitorDashboard() {
  const [runs, setRuns] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, CRITICAL, HIGH

  useEffect(() => {
    fetchRuns();
  }, []);

  useEffect(() => {
    if (selectedRunId) {
      fetchItems(selectedRunId);
    }
  }, [selectedRunId]);

  const fetchRuns = async () => {
    const res = await fetch('/api/admin/link-monitor');
    if (res.ok) {
      const data = await res.json();
      setRuns(data);
      if (data.length > 0 && !selectedRunId) {
        setSelectedRunId(data[0].id);
      }
    }
  };

  const fetchItems = async (runId: string) => {
    const res = await fetch(`/api/admin/link-monitor?runId=${runId}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/admin/link-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_audit' })
      });
      if (res.ok) {
        await fetchRuns();
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoFix = async () => {
    if (!selectedRunId) return;
    setIsFixing(true);
    try {
      const res = await fetch('/api/admin/link-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_fix', runId: selectedRunId })
      });
      if (res.ok) {
        alert("Auto-fix completed successfully!");
        fetchItems(selectedRunId);
      }
    } finally {
      setIsFixing(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + items.map(e => `${e.pageUrl},${e.issueType},${e.severity},${e.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "link_audit_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'ALL') return true;
    return item.severity === activeTab;
  });

  const selectedRun = runs.find(r => r.id === selectedRunId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="text-blue-600" />
            Link Health Monitor
          </h1>
          <p className="text-gray-500 text-sm mt-1">ตรวจจับลิงก์เสีย, ลิงก์จองทัวร์ผิด, และตรวจสอบความสัมพันธ์แบบอัตโนมัติ</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleStartScan}
            disabled={isScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isScanning ? 'กำลังสแกน...' : 'Start Scan'}
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Links Checked</div>
          <div className="text-3xl font-bold text-gray-900">{selectedRun?.totalLinks || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Broken Links</div>
          <div className="text-3xl font-bold text-orange-600">{selectedRun?.brokenLinks || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-red-200 bg-red-50 shadow-sm">
          <div className="text-red-600 text-sm font-medium mb-1 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Critical Issues
          </div>
          <div className="text-3xl font-bold text-red-700">{selectedRun?.criticalIssues || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Last Scan</div>
          <div className="text-lg font-bold text-gray-900 truncate">
            {selectedRun?.finishedAt ? new Date(selectedRun.finishedAt).toLocaleString('th-TH') : '-'}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4 flex justify-between items-center">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('ALL')} className={`font-medium px-2 pb-1 ${activeTab === 'ALL' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>All Issues</button>
            <button onClick={() => setActiveTab('CRITICAL')} className={`font-medium px-2 pb-1 ${activeTab === 'CRITICAL' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>Critical</button>
            <button onClick={() => setActiveTab('HIGH')} className={`font-medium px-2 pb-1 ${activeTab === 'HIGH' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}>High</button>
          </div>
          <button 
            onClick={handleAutoFix}
            disabled={isFixing || items.filter(i => i.canAutoFix && i.status === 'UNRESOLVED').length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            {isFixing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
            Auto Fix All Possible
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Page / Tour ID</th>
                <th className="py-3 px-4 font-semibold">Issue Type</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Suggested Fix</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No issues found in this category
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium max-w-xs truncate" title={item.pageUrl}>{item.pageUrl}</td>
                    <td className="py-3 px-4 text-gray-600">{item.issueType}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        item.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 truncate max-w-xs" title={item.suggestedFix}>{item.suggestedFix}</td>
                    <td className="py-3 px-4 text-center">
                      {item.status === 'AUTO_FIXED' ? (
                        <span className="text-emerald-600 font-bold flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4"/> Fixed</span>
                      ) : item.canAutoFix ? (
                        <span className="text-blue-600 text-xs font-bold border border-blue-200 bg-blue-50 px-2 py-1 rounded">Can Auto-Fix</span>
                      ) : (
                        <span className="text-gray-500 text-xs flex items-center justify-center gap-1"><XCircle className="w-4 h-4"/> Manual</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

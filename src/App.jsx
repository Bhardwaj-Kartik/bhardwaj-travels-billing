import logo from './assets/logo.png'
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BUSINESS = {
  name: "Bhardwaj Travels", tagline: "CARZ A RENT SAFE RIDE",
  deals: "Deals in: Etios, Dzire & Innova Crysta etc.",
  address: "#218-O, Victoria City / Enclave, Bhabat, Zirakpur, Mohali, Punjab-140603",
  phones: ["94175-66648", "98159-70070"], email: "bhardwajtravels999@gmail.com",
  gstin: "03BJZPB5991C1Z1",
  bank: { name: "Canara Bank", acc: "120000614457", ifsc: "CNRB0001625", holder: "Bhardwaj Travel's", upi: "9815970070@CNRB" },
  terms: ["E. & O.E.", "All disputes subject to Mohali jurisdiction.", "Kilometer & Time will be charged garage to garage.", "Luggage/Goods being carried at owner's risk."]
};

const RATES_DEFAULT = [{ id: 1, name: "Etios Local", type: "per_km", rate: 12 }, { id: 2, name: "Innova Crysta Local", type: "per_km", rate: 18 }, { id: 3, name: "Dzire Local", type: "per_km", rate: 11 }, { id: 4, name: "Etios Outstation", type: "per_km", rate: 14 }];
const DEFAULT_CHARGES = [{ id: "toll", label: "Toll / Parking / Entry Tax" }, { id: "extraKm", label: "Extra KM" }, { id: "extraHrs", label: "Extra Hours" }, { id: "da", label: "DA (Driver Allowance)" }, { id: "nightCharges", label: "Night Charges" }];
const DEFAULT_GST = [{ id: "cgst", label: "CGST", pct: 2.5, enabled: true }, { id: "sgst", label: "SGST", pct: 2.5, enabled: true }, { id: "igst", label: "IGST", pct: 5, enabled: false }];

const UPI_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=upi://pay?pa=9815970070@CNRB%26pn=Bhardwaj%20Travels`;

function numToWords(n) {
  if (!n || isNaN(n)) return "";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const num = Math.round(parseFloat(n));
  if (num === 0) return "Zero";
  const cv = x => {
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    if (x < 1000) return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + cv(x % 100) : "");
    if (x < 100000) return cv(Math.floor(x / 1000)) + " Thousand" + (x % 1000 ? " " + cv(x % 1000) : "");
    if (x < 10000000) return cv(Math.floor(x / 100000)) + " Lakh" + (x % 100000 ? " " + cv(x % 100000) : "");
    return cv(Math.floor(x / 10000000)) + " Crore" + (x % 10000000 ? " " + cv(x % 10000000) : "");
  };
  return cv(num) + " Rupees Only";
}

const emptyRow = () => ({ id: Date.now() + Math.random(), date: "", particulars: "", rate: "", amount: "" });
const emptyBill = (ct, gt) => ({ invoiceNo: "", dutySlipNo: "", cabNo: "", date: new Date().toISOString().slice(0, 10), clientName: "", clientPhone: "", clientAddress: "", clientGstin: "", dutyType: "local", rows: [emptyRow(), emptyRow(), emptyRow(), emptyRow(), emptyRow()], charges: ct.map(c => ({ id: c.id, label: c.label, mode: "none", value: "" })), gstLines: gt.map(g => ({ ...g })), paid: false });

function calcBill(bill) {
  const rowTotal = (bill.rows || []).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const chargeTotal = (bill.charges || []).reduce((s, c) => s + (c.mode === "value" ? (parseFloat(c.value) || 0) : 0), 0);
  const subtotal = rowTotal + chargeTotal;
  const gstAmt = (bill.gstLines || []).filter(g => g.enabled).reduce((s, g) => s + subtotal * (parseFloat(g.pct) || 0) / 100, 0);
  return { rowTotal, chargeTotal, subtotal, gstAmt, grand: subtotal + gstAmt };
}

function BillA4({ b }) {
  const c = calcBill(b);
  return (
    <div style={{ background: "#fff", color: "#000", fontSize: "11pt", width: "210mm", minHeight: "297mm", boxSizing: "border-box", padding: 0, fontFamily: "Arial,sans-serif", pageBreakAfter: "always", position: "relative" }}>
      {/* WATERMARK */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, pointerEvents: "none" }}>
        <img src={logo} style={{ width: 320, height: 320, objectFit: "contain", opacity: 0.07 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "#185FA5", height: 8 }} />
        <div style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <img src={logo} style={{ width: 80, height: 80, objectFit: 'contain', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "15pt" }}>{BUSINESS.name}</div>
                <div style={{ fontSize: "10pt", fontStyle: "italic", fontWeight: 700 }}>{BUSINESS.tagline}</div>
                <div style={{ fontSize: "9pt", color: "#333" }}>{BUSINESS.deals}</div>
                <div style={{ fontSize: "9pt", color: "#333" }}>{BUSINESS.address}</div>
                <div style={{ fontSize: "9pt" }}>Mob: {BUSINESS.phones.join(" / ")} | {BUSINESS.email}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20pt", fontWeight: 700, color: "#185FA5" }}>TAX INVOICE</div>
              <div style={{ fontSize: "9pt" }}>GSTIN: {BUSINESS.gstin}</div>
              <div style={{ fontSize: "10pt", fontWeight: 700, display: "flex", flexWrap: "wrap", gap: "4px 16px", alignItems: "baseline", justifyContent: "flex-end" }}>
                <span>Invoice No: {b.invoiceNo}</span>
                <span style={{ fontWeight: 700 }}>Duty Slip No: {b.dutySlipNo || "—"}</span>
              </div>
              <div style={{ fontSize: "9pt" }}>Date: {b.date}</div>
              {b.cabNo && <div style={{ fontSize: "9pt" }}>Cab No: {b.cabNo}</div>}
              <div style={{ fontSize: "9pt" }}>Duty: {b.dutyType === "local" ? "Local Duty" : b.dutyType === "outstation" ? "Outstation" : b.dutyType}</div>
            </div>
          </div>
          <div style={{ borderTop: "2px solid #185FA5", borderBottom: "1px solid #185FA5", padding: "7px 0", marginBottom: 10 }}>
            <div style={{ fontSize: "9pt", color: "#555" }}>Bill To:</div>
            <div style={{ fontWeight: 700, fontSize: "13pt" }}>{b.clientName}</div>
            {b.clientPhone && <div style={{ fontSize: "9pt" }}>{b.clientPhone}</div>}
            {b.clientAddress && <div style={{ fontSize: "9pt" }}>{b.clientAddress}</div>}
            {b.clientGstin && <div style={{ fontSize: "9pt" }}>GSTIN: {b.clientGstin}</div>}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt", marginBottom: 8 }}>
            <thead>
              <tr style={{ background: "#185FA5", color: "#fff" }}>
                {["Date of Travel", "Particulars", "Rate", "Amount (₹)"].map((h, i) => <th key={i} style={{ padding: "6px 8px", textAlign: i > 1 ? "right" : "left", border: "1px solid #185FA5", fontWeight: 600 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(b.rows || []).filter(r => r.particulars || r.amount).map((r, ri) => (
                <tr key={ri} style={{ borderBottom: "0.5px solid #ddd" }}>
                  <td style={{ padding: "5px 8px", border: "0.5px solid #ddd", whiteSpace: "nowrap" }}>{r.date}</td>
                  <td style={{ padding: "5px 8px", border: "0.5px solid #ddd", whiteSpace: "pre-wrap" }}>{r.particulars}</td>
                  <td style={{ padding: "5px 8px", textAlign: "right", border: "0.5px solid #ddd" }}>{r.rate && r.rate !== "custom" ? `₹${r.rate}` : ""}</td>
                  <td style={{ padding: "5px 8px", textAlign: "right", border: "0.5px solid #ddd" }}>{r.amount ? `₹${parseFloat(r.amount).toFixed(2)}` : ""}</td>
                </tr>
              ))}
              {(b.charges || []).filter(c => c.mode !== "none").map((c, i) => (
                <tr key={i}><td colSpan={2} style={{ padding: "5px 8px", border: "0.5px solid #ddd" }}>{c.label}</td><td></td><td style={{ padding: "5px 8px", textAlign: "right", border: "0.5px solid #ddd" }}>{c.mode === "nil" ? "Nil" : `₹${parseFloat(c.value || 0).toFixed(2)}`}</td></tr>
              ))}
              {Array.from({ length: Math.max(0, 8 - (b.rows || []).filter(r => r.particulars || r.amount).length - (b.charges || []).filter(c => c.mode !== "none").length) }).map((_, i) => (
                <tr key={"e" + i}><td style={{ padding: "5px 8px", border: "0.5px solid #ddd", height: 22 }}>&nbsp;</td><td style={{ border: "0.5px solid #ddd" }}></td><td style={{ border: "0.5px solid #ddd" }}></td><td style={{ border: "0.5px solid #ddd" }}></td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f0f0f0" }}><td colSpan={3} style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700, border: "0.5px solid #ddd" }}>Total</td><td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700, border: "0.5px solid #ddd" }}>₹{c.subtotal.toFixed(2)}</td></tr>
              {(b.gstLines || []).filter(g => g.enabled).map(g => (
                <tr key={g.id}><td colSpan={3} style={{ padding: "5px 8px", textAlign: "right", border: "0.5px solid #ddd" }}>{g.label} @ {g.pct}%</td><td style={{ padding: "5px 8px", textAlign: "right", border: "0.5px solid #ddd" }}>₹{(c.subtotal * (parseFloat(g.pct) || 0) / 100).toFixed(2)}</td></tr>
              ))}
              <tr style={{ background: "#185FA5", color: "#fff" }}><td colSpan={3} style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: "1px solid #185FA5" }}>Grand Total</td><td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: "1px solid #185FA5" }}>₹{c.grand.toFixed(2)}</td></tr>
              <tr><td colSpan={4} style={{ padding: "5px 8px", fontSize: "9pt", fontStyle: "italic", border: "0.5px solid #ddd" }}>Amount in words: {numToWords(c.grand)}</td></tr>
            </tfoot>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", marginTop: 10, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "10pt", marginBottom: 4 }}>Payment Info:</div>
              <div>Bank: {BUSINESS.bank.name} | A/C: {BUSINESS.bank.acc}</div>
              <div>IFSC: {BUSINESS.bank.ifsc} | A/C Name: {BUSINESS.bank.holder}</div>
              <div>UPI: {BUSINESS.bank.upi}</div>
              <div style={{ marginTop: 6 }}>
                <img src={UPI_QR_URL} style={{ width: 80, height: 80 }} crossOrigin="anonymous" />
                <div style={{ fontSize: "7pt", color: "#555", textAlign: "left", marginTop: 2 }}>Scan to Pay</div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "cursive", fontSize: "13pt", marginBottom: 4 }}>Thanks For Visit</div>
              <div style={{ marginTop: 28, borderTop: "1px solid #000", paddingTop: 4, fontSize: "10pt", fontWeight: 700, textAlign: "right"  }}>For Bhardwaj Travels</div>
              <div style={{ fontSize: "9pt", textAlign: "right", marginTop: 8  }}>Prop.</div>
            </div>
          </div>
          <div style={{ marginTop: 10, borderTop: "0.5px solid #ccc", paddingTop: 6 }}>
            {BUSINESS.terms.map((t, i) => <div key={i} style={{ fontSize: "8.5pt", color: "#555" }}>{t}</div>)}
          </div>
        </div>
        <div style={{ background: "#185FA5", height: 8 }} />
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("login");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [rates, setRates] = useState(RATES_DEFAULT);
  const [chargeTypes, setChargeTypes] = useState(DEFAULT_CHARGES);
  const [gstTypes, setGstTypes] = useState(DEFAULT_GST);
  const [entries, setEntries] = useState([emptyBill(DEFAULT_CHARGES, DEFAULT_GST)]);
  const [activeEntry, setActiveEntry] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyKey, setHistoryKey] = useState("clientName");
  const [checklistSearch, setChecklistSearch] = useState("");
  const [checklistSearchKey, setChecklistSearchKey] = useState("clientName");
  const [checklistFilter, setChecklistFilter] = useState("all");
  const [summaryFrom, setSummaryFrom] = useState("");
  const [summaryTo, setSummaryTo] = useState("");
  const [summaryClient, setSummaryClient] = useState("");
  const [newRate, setNewRate] = useState({ name: "", type: "per_km", rate: "" });
  const [showRates, setShowRates] = useState(false);
  const [newCharge, setNewCharge] = useState("");
  const [newGst, setNewGst] = useState({ label: "", pct: "" });
  const [inlineBillCharge, setInlineBillCharge] = useState({});
  const [inlineBillGst, setInlineBillGst] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [viewingBill, setViewingBill] = useState(null);
  const billsRef = useRef();
  const viewBillRef = useRef();

  const loadData = async () => {
    setLoading(true);
    const [{ data: billsData }, { data: ratesData }, { data: chargesData }, { data: gstData }] = await Promise.all([
      supabase.from("bills").select("*").order("saved_at", { ascending: false }),
      supabase.from("rates").select("*"),
      supabase.from("charge_types").select("*"),
      supabase.from("gst_types").select("*"),
    ]);
    if (billsData) {
  setBills(billsData.map(b => ({
    ...b,
    rows: b.rows || [],
    charges: b.charges || [],
    gstLines: b.gst_lines || [],
    dutySlipNo: b.Duty_Slip_No || b.duty_slip_no || "",
  })));
  if (billsData.length > 0) {
    const lastInvoice = parseInt(billsData[0].invoice_no) || 0;
    const lastDutySlip = parseInt(billsData[0].Duty_Slip_No ?? billsData[0].duty_slip_no) || 0;
    setEntries([emptyBill(DEFAULT_CHARGES, DEFAULT_GST)]);
    setEntries(es => es.map((e, i) => i === 0 ? { ...e, invoiceNo: String(lastInvoice + 1), dutySlipNo: String(lastDutySlip + 1) } : e));
  }
}
    if (ratesData && ratesData.length > 0) setRates(ratesData);
    if (chargesData && chargesData.length > 0) setChargeTypes(chargesData);
    if (gstData && gstData.length > 0) setGstTypes(gstData);
    setLoading(false);
  };

  const login = async () => {
    if (loginUser.trim().toUpperCase() === "BHARDWAJ123" && loginPass.trim() === "BHARDWAJ999GTA") {
      setLoginErr("");
      await loadData();
      setPage("home");
    } else setLoginErr("Invalid username or password.");
  };

  const saveBill = async () => {
    const valid = entries.every(e => e.invoiceNo && e.clientName);
    if (!valid) { alert("Please fill Invoice No and Client Name for all entries."); return; }
    setLoading(true);
    try {
      for (const e of entries) {
        const { data, error } = await supabase.from("bills").insert({
          invoice_no: e.invoiceNo,
          cab_no: e.cabNo,
          date: e.date,
          client_name: e.clientName,
          client_phone: e.clientPhone,
          client_address: e.clientAddress,
          client_gstin: e.clientGstin,
          duty_type: e.dutyType,
          duty_slip_no: e.dutySlipNo || "",
          rows: e.rows,
          charges: e.charges,
          gst_lines: e.gstLines,
          paid: e.paid || false,
        });
        if (error) {
          console.error("Supabase insert error:", error);
          return;
        }
      }
      await loadData();
      alert("Bills saved successfully!");
      setEntries([emptyBill(chargeTypes, gstTypes)]);
      setActiveEntry(0);
      setPreviewMode(false);
    } finally {
      setLoading(false);
    }
  };

  const togglePaid = async (id) => {
    const bill = bills.find(b => b.id === id);
    await supabase.from("bills").update({ paid: !bill.paid }).eq("id", id);
    setBills(prev => prev.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    await supabase.from("bills").delete().eq("id", id);
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const saveRates = async (newRates) => {
    setRates(newRates);
    await supabase.from("rates").delete().neq("id", 0);
    for (const r of newRates) await supabase.from("rates").upsert({ name: r.name, type: r.type, rate: r.rate });
  };

  const saveChargeTypes = async (newTypes) => {
    setChargeTypes(newTypes);
    await supabase.from("charge_types").delete().neq("id", "x");
    for (const c of newTypes) await supabase.from("charge_types").upsert({ id: c.id, label: c.label });
  };

  const saveGstTypes = async (newTypes) => {
    setGstTypes(newTypes);
    await supabase.from("gst_types").delete().neq("id", "x");
    for (const g of newTypes) await supabase.from("gst_types").upsert({ id: g.id, label: g.label, pct: g.pct, enabled: g.enabled });
  };

  const generatePDF = async () => {
    if (!billsRef.current) return;
    setPdfLoading(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pages = billsRef.current.querySelectorAll(".bill-page");
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 3, useCORS: true, backgroundColor: "#ffffff", width: 794, height: 1123, windowWidth: 794 });
        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      }
      pdf.save(`BhardwajTravels_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) { alert("PDF generation failed. Please try printing instead."); }
    setPdfLoading(false);
  };

  const generateSinglePDF = async (invoiceNo) => {
    if (!viewBillRef.current) return;
    setPdfLoading(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const canvas = await html2canvas(viewBillRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff", width: 794, height: 1123, windowWidth: 794 });
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`BhardwajTravels_${invoiceNo}.pdf`);
    } catch (e) { alert("PDF generation failed. Please try printing instead."); }
    setPdfLoading(false);
  };

  const openBill = (b, fromPage) => {
    setViewingBill({ ...b, _fromPage: fromPage });
    setPage("viewBill");
  };

  const autoFill = (idx, name) => {
    const prev = bills.find(b => b.client_name?.toLowerCase() === name.toLowerCase());
    if (prev) setEntries(es => es.map((e, i) => i === idx ? { ...e, clientPhone: prev.client_phone || e.clientPhone, clientAddress: prev.client_address || e.clientAddress, clientGstin: prev.client_gstin || e.clientGstin } : e));
  };

  const upE = (idx, k, v) => setEntries(es => es.map((e, i) => i === idx ? { ...e, [k]: v } : e));
  const upR = (ei, ri, k, v) => setEntries(es => es.map((e, i) => i === ei ? { ...e, rows: e.rows.map((r, j) => j === ri ? { ...r, [k]: v } : r) } : e));
  const addRow = (idx) => setEntries(es => es.map((e, i) => i === idx ? { ...e, rows: [...e.rows, emptyRow()] } : e));
  const remRow = (ei, ri) => setEntries(es => es.map((e, i) => i === ei ? { ...e, rows: e.rows.filter((_, j) => j !== ri) } : e));
  const addEntry = () => { setEntries(es => [...es, emptyBill(chargeTypes, gstTypes)]); setActiveEntry(entries.length); };
  const upC = (ei, cid, k, v) => setEntries(es => es.map((e, i) => i === ei ? { ...e, charges: e.charges.map(c => c.id === cid ? { ...c, [k]: v } : c) } : e));
  const upG = (ei, gid, k, v) => setEntries(es => es.map((e, i) => i === ei ? { ...e, gstLines: e.gstLines.map(g => g.id === gid ? { ...g, [k]: v } : g) } : e));

  const filteredHistory = bills.filter(b => {
    if (!historySearch) return true;
    const keyMap = { clientName: "client_name", invoiceNo: "invoice_no", cabNo: "cab_no", clientGstin: "client_gstin", dutyType: "duty_type" };
    return (b[keyMap[historyKey]] || "").toLowerCase().includes(historySearch.toLowerCase());
  });

  const groupByMonth = (list) => {
    const g = {};
    list.forEach(b => {
      const d = new Date(b.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "long", year: "numeric" });
      if (!g[key]) g[key] = { label, bills: [], total: 0 };
      g[key].bills.push(b);
      g[key].total += calcBill(b).grand;
    });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0])).map(([, v]) => v);
  };

  const summaryBills = bills.filter(b => {
    let ok = true;
    if (summaryFrom) ok = ok && b.date >= summaryFrom;
    if (summaryTo) ok = ok && b.date <= summaryTo;
    if (summaryClient) ok = ok && b.client_name?.toLowerCase().includes(summaryClient.toLowerCase());
    return ok;
  });

  const summaryCalc = summaryBills.reduce((acc, b) => {
    const c = calcBill(b);
    const gb = {};
    (b.gstLines || []).filter(g => g.enabled).forEach(g => { gb[g.label] = (gb[g.label] || 0) + c.subtotal * (parseFloat(g.pct) || 0) / 100; });
    return { count: acc.count + 1, grand: acc.grand + c.grand, subtotal: acc.subtotal + c.subtotal, gstBreak: Object.fromEntries([...new Set([...Object.keys(acc.gstBreak), ...Object.keys(gb)])].map(k => [k, (acc.gstBreak[k] || 0) + (gb[k] || 0)])) };
  }, { count: 0, grand: 0, subtotal: 0, gstBreak: {} });

  const s = { fontFamily: "system-ui,sans-serif", minHeight: "100vh", background: "#f5f5f5" };
  const card = { background: "#fff", borderRadius: 12, border: "0.5px solid #e0e0e0", padding: "1rem 1.25rem", marginBottom: 12 };
  const inp = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "0.5px solid #ccc", fontSize: 13, background: "#fff", color: "#000" };
  const btn = (bg = "#185FA5", col = "#fff") => ({ padding: "8px 18px", borderRadius: 8, background: bg, color: col, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 });
  const lbl = { fontSize: 12, color: "#666", marginBottom: 4, display: "block" };

  if (page === "login") return (
    <div style={{ ...s, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ ...card, width: 320, textAlign: "center" }}>
        <img src={logo} style={{ width: 64, height: 64, margin: "0 auto 12px", objectFit: 'contain' }} />
        <div style={{ fontSize: 18, fontWeight: 500 }}>Bhardwaj Travel's</div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>Billing Software</div>
        <input style={{ ...inp, marginBottom: 10 }} placeholder="Username" value={loginUser} onChange={e => setLoginUser(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input style={{ ...inp, paddingRight: 36 }} type={showPass ? "text" : "password"} placeholder="Password" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          <span onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16, userSelect: "none" }}>{showPass ? "🙈" : "👁️"}</span>
        </div>
        {loginErr && <div style={{ fontSize: 12, color: "red", marginBottom: 8 }}>{loginErr}</div>}
        <button style={{ ...btn(), width: "100%" }} onClick={login}>{loading ? "Loading..." : "Login"}</button>
      </div>
    </div>
  );

  if (page === "home") return (
    <div style={s}>
      <div style={{ background: "#185FA5", color: "#fff", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <div><div style={{ fontWeight: 500, fontSize: 15 }}>Bhardwaj Travel's</div><div style={{ fontSize: 11, opacity: 0.8 }}>Billing Software</div></div>
        </div>
        <button style={{ ...btn("rgba(255,255,255,0.2)", "#fff"), fontSize: 12 }} onClick={() => setPage("login")}>Logout</button>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[{ icon: "📄", label: "Create Bill", page: "create", color: "#E6F1FB", border: "#185FA5", text: "#185FA5" }, { icon: "📁", label: "History", page: "history", color: "#EAF3DE", border: "#3B6D11", text: "#3B6D11" }, { icon: "✅", label: "Checklist", page: "checklist", color: "#FAEEDA", border: "#854F0B", text: "#854F0B" }, { icon: "📊", label: "Summary", page: "summary", color: "#FBEAF0", border: "#993556", text: "#993556" }].map(item => (
            <div key={item.page} onClick={() => setPage(item.page)} style={{ background: item.color, border: `1.5px solid ${item.border}`, borderRadius: 16, padding: "24px 16px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 500, color: item.text, fontSize: 15 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Quick Stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 500, color: "#185FA5" }}>{bills.length}</div><div style={{ fontSize: 11, color: "#666" }}>Total Bills</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 500, color: "#3B6D11" }}>{bills.filter(b => b.paid).length}</div><div style={{ fontSize: 11, color: "#666" }}>Paid</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 500, color: "#A32D2D" }}>{bills.filter(b => !b.paid).length}</div><div style={{ fontSize: 11, color: "#666" }}>Unpaid</div></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (page === "viewBill" && viewingBill) {
    const vb = {
      invoiceNo: viewingBill.invoice_no,
      cabNo: viewingBill.cab_no,
      date: viewingBill.date,
      clientName: viewingBill.client_name,
      clientPhone: viewingBill.client_phone,
      clientAddress: viewingBill.client_address,
      clientGstin: viewingBill.client_gstin,
      dutyType: viewingBill.duty_type,
      dutySlipNo: viewingBill.Duty_Slip_No || viewingBill.duty_slip_no || "",
      rows: viewingBill.rows || [],
      charges: viewingBill.charges || [],
      gstLines: viewingBill.gst_lines || [],
    };
    return (
      <div style={s}>
        <div style={{ background: "#185FA5", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...btn("rgba(255,255,255,0.2)", "#fff"), padding: "4px 10px" }} onClick={() => { setPage(viewingBill._fromPage || "history"); setViewingBill(null); }}>← Back</button>
          <span style={{ fontWeight: 500 }}>Bill #{viewingBill.invoice_no} — {viewingBill.client_name}</span>
          <button style={{ ...btn("#fff", "#185FA5"), marginLeft: "auto", fontSize: 12, opacity: pdfLoading ? 0.6 : 1 }} onClick={() => generateSinglePDF(viewingBill.invoice_no)} disabled={pdfLoading}>{pdfLoading ? "Generating..." : "⬇ Download PDF"}</button>
        </div>
        <div style={{ padding: 12, overflowX: "auto" }}>
          <div ref={viewBillRef}>
            <BillA4 b={vb} />
          </div>
        </div>
      </div>
    );
  }

  if (page === "create") {
    const bill = entries[activeEntry];
    const calc = calcBill(bill);
    return (
      <div style={s}>
        <div style={{ background: "#185FA5", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...btn("rgba(255,255,255,0.2)", "#fff"), padding: "4px 10px" }} onClick={() => { setPreviewMode(false); setPage("home"); }}>← Back</button>
          <span style={{ fontWeight: 500 }}>Create Bill</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={{ ...btn("rgba(255,255,255,0.2)", "#fff"), fontSize: 12 }} onClick={() => setShowRates(!showRates)}>⚙ Settings</button>
            <button style={{ ...btn("#fff", "#185FA5"), fontSize: 12 }} onClick={() => setPreviewMode(!previewMode)}>{previewMode ? "Edit" : "Preview"}</button>
          </div>
        </div>

        {showRates && (
          <div style={{ ...card, margin: 12 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 14, color: "#185FA5" }}>Rates</div>
            {rates.map(r => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "0.5px solid #eee", fontSize: 12 }}>
                <span>{r.name} — ₹{r.rate}/{r.type === "per_km" ? "km" : "hr"}</span>
                <button style={{ ...btn("#FCEBEB", "#A32D2D"), padding: "2px 8px", fontSize: 11 }} onClick={() => saveRates(rates.filter(x => x.id !== r.id))}>Remove</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <input style={{ ...inp, width: 110 }} placeholder="Name" value={newRate.name} onChange={e => setNewRate(n => ({ ...n, name: e.target.value }))} />
              <select style={{ ...inp, width: 95 }} value={newRate.type} onChange={e => setNewRate(n => ({ ...n, type: e.target.value }))}><option value="per_km">Per KM</option><option value="per_hr">Per Hr</option></select>
              <input style={{ ...inp, width: 70 }} placeholder="₹" type="number" value={newRate.rate} onChange={e => setNewRate(n => ({ ...n, rate: e.target.value }))} />
              <button style={btn()} onClick={() => { if (newRate.name && newRate.rate) { saveRates([...rates, { id: Date.now(), ...newRate, rate: parseFloat(newRate.rate) }]); setNewRate({ name: "", type: "per_km", rate: "" }); } }}>Add</button>
            </div>
            <div style={{ fontWeight: 500, margin: "14px 0 8px", fontSize: 14, color: "#185FA5" }}>Additional Charge Types</div>
            {chargeTypes.map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "0.5px solid #eee", fontSize: 12 }}>
                <span>{c.label}</span>
                {!DEFAULT_CHARGES.find(d => d.id === c.id) && <button style={{ ...btn("#FCEBEB", "#A32D2D"), padding: "2px 8px", fontSize: 11 }} onClick={() => saveChargeTypes(chargeTypes.filter(x => x.id !== c.id))}>Remove</button>}
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="New charge name" value={newCharge} onChange={e => setNewCharge(e.target.value)} />
              <button style={btn()} onClick={() => { if (newCharge.trim()) { const nc = { id: "custom_" + Date.now(), label: newCharge.trim() }; saveChargeTypes([...chargeTypes, nc]); setNewCharge(""); } }}>Add</button>
            </div>
            <div style={{ fontWeight: 500, margin: "14px 0 8px", fontSize: 14, color: "#185FA5" }}>GST Types</div>
            {gstTypes.map(g => (
              <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "0.5px solid #eee", fontSize: 12 }}>
                <span style={{ minWidth: 60 }}>{g.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="number" style={{ ...inp, width: 60, fontSize: 12 }} value={g.pct} onChange={e => saveGstTypes(gstTypes.map(x => x.id === g.id ? { ...x, pct: parseFloat(e.target.value) || 0 } : x))} />
                  <span style={{ fontSize: 11 }}>%</span>
                </div>
                {!DEFAULT_GST.find(d => d.id === g.id) && <button style={{ ...btn("#FCEBEB", "#A32D2D"), padding: "2px 8px", fontSize: 11 }} onClick={() => saveGstTypes(gstTypes.filter(x => x.id !== g.id))}>Remove</button>}
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <input style={{ ...inp, flex: 1 }} placeholder="GST name (e.g. UTGST)" value={newGst.label} onChange={e => setNewGst(n => ({ ...n, label: e.target.value }))} />
              <input type="number" style={{ ...inp, width: 70 }} placeholder="%" value={newGst.pct} onChange={e => setNewGst(n => ({ ...n, pct: e.target.value }))} />
              <button style={btn()} onClick={() => { if (newGst.label.trim() && newGst.pct) { saveGstTypes([...gstTypes, { id: "gst_" + Date.now(), label: newGst.label.trim(), pct: parseFloat(newGst.pct), enabled: true }]); setNewGst({ label: "", pct: "" }); } }}>Add</button>
            </div>
          </div>
        )}

        <div style={{ padding: "8px 12px", display: "flex", gap: 6, overflowX: "auto" }}>
          {entries.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button style={{ ...btn(i === activeEntry ? "#185FA5" : "#eee", i === activeEntry ? "#fff" : "#000"), whiteSpace: "nowrap", fontSize: 12 }} onClick={() => setActiveEntry(i)}>
                Bill {i + 1}{e.invoiceNo ? ` #${e.invoiceNo}` : ""}
              </button>
              {entries.length > 1 && <button style={{ ...btn("#FCEBEB", "#A32D2D"), padding: "4px 7px", fontSize: 11 }} onClick={() => { const u = entries.filter((_, j) => j !== i); setEntries(u); setActiveEntry(Math.min(activeEntry, u.length - 1)); }}>✕</button>}
            </div>
          ))}
          <button style={{ ...btn("#EAF3DE", "#3B6D11"), fontSize: 12, whiteSpace: "nowrap" }} onClick={addEntry}>+ Add Entry</button>
        </div>

        {!previewMode ? (
          <div style={{ padding: "0 12px 80px" }}>
            <div style={card}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#185FA5" }}>Bill Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
  <label style={lbl}>Invoice No *</label>
  <div style={{ display: "flex", gap: 4 }}>
    <input style={{ ...inp, flex: 1 }} value={bill.invoiceNo} onChange={e => upE(activeEntry, "invoiceNo", e.target.value)} placeholder="e.g. 1086" />
    <button style={{ ...btn(), padding: "8px 10px", fontSize: 16 }} onClick={() => upE(activeEntry, "invoiceNo", String((parseInt(bill.invoiceNo) || 0) + 1))}>+</button>
  </div>
</div>
<div>
  <label style={lbl}>Duty Slip No</label>
  <div style={{ display: "flex", gap: 4 }}>
    <input style={{ ...inp, flex: 1 }} value={bill.dutySlipNo} onChange={e => upE(activeEntry, "dutySlipNo", e.target.value)} placeholder="e.g. 1086" />
    <button style={{ ...btn(), padding: "8px 10px", fontSize: 16 }} onClick={() => upE(activeEntry, "dutySlipNo", String((parseInt(bill.dutySlipNo) || 0) + 1))}>+</button>
  </div>
</div>
                <div><label style={lbl}>Date *</label><input style={inp} type="date" value={bill.date} onChange={e => upE(activeEntry, "date", e.target.value)} /></div>
                <div>
  <label style={lbl}>Cab No</label>
  <select style={inp} value={["PB01A7826","PB01C1838","PB01G1080"].includes(bill.cabNo) ? bill.cabNo : "custom"} onChange={e => { if (e.target.value === "custom") upE(activeEntry, "cabNo", ""); else upE(activeEntry, "cabNo", e.target.value); }}>
    <option value="PB01A7826">PB01A7826</option>
    <option value="PB01C1838">PB01C1838</option>
    <option value="PB01G1080">PB01G1080</option>
    <option value="custom">Custom...</option>
  </select>
  {!["PB01A7826","PB01C1838","PB01G1080"].includes(bill.cabNo) && <input style={{ ...inp, marginTop: 4 }} placeholder="Enter Cab No" value={bill.cabNo} onChange={e => upE(activeEntry, "cabNo", e.target.value)} />}
</div>
                <div><label style={lbl}>Duty Type</label>
                  <select style={inp} value={["local", "outstation"].includes(bill.dutyType) ? bill.dutyType : "custom"} onChange={e => { if (e.target.value === "custom") upE(activeEntry, "dutyType", "custom_"); else upE(activeEntry, "dutyType", e.target.value); }}>
                    <option value="local">Local Duty</option>
                    <option value="outstation">Outstation</option>
                    <option value="custom">Custom...</option>
                  </select>
                  {!["local", "outstation"].includes(bill.dutyType) && bill.dutyType !== "" && <input style={{ ...inp, marginTop: 4 }} placeholder="Enter duty type" value={bill.dutyType === "custom_" ? "" : bill.dutyType} onChange={e => upE(activeEntry, "dutyType", e.target.value || "custom_")} />}
                </div>
              </div>
            </div>
            <div style={card}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#185FA5" }}>Client Details</div>
              <div><label style={lbl}>Client Name *</label><input style={{ ...inp, marginBottom: 8 }} value={bill.clientName} onChange={e => { upE(activeEntry, "clientName", e.target.value); autoFill(activeEntry, e.target.value); }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={lbl}>Phone</label><input style={inp} value={bill.clientPhone} onChange={e => upE(activeEntry, "clientPhone", e.target.value)} /></div>
                <div><label style={lbl}>Client GSTIN</label><input style={inp} value={bill.clientGstin} onChange={e => upE(activeEntry, "clientGstin", e.target.value)} /></div>
              </div>
              <div style={{ marginTop: 8 }}><label style={lbl}>Address</label><input style={inp} value={bill.clientAddress} onChange={e => upE(activeEntry, "clientAddress", e.target.value)} /></div>
            </div>
            <div style={card}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#185FA5" }}>Trip Details</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ background: "#E6F1FB" }}>
                    {["Date of Travel", "Particulars", "Rate", "Amount (₹)", ""].map((h, i) => <th key={i} style={{ padding: "6px 8px", textAlign: "left", color: "#185FA5", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {bill.rows.map((row, ri) => (
                      <tr key={row.id} style={{ borderBottom: "0.5px solid #eee" }}>
                        <td style={{ padding: "4px" }}><input type="date" style={{ ...inp, width: 120, fontSize: 11 }} value={row.date} onChange={e => upR(activeEntry, ri, "date", e.target.value)} /></td>
                        <td style={{ padding: "4px" }}><textarea rows={2} style={{ ...inp, minWidth: 140, fontSize: 11, resize: "vertical" }} value={row.particulars} onChange={e => upR(activeEntry, ri, "particulars", e.target.value)} onKeyDown={e => { if (e.key === "Enter") e.stopPropagation(); }} placeholder="Route / Description" /></td>
                        <td style={{ padding: "4px" }}>
                          <select style={{ ...inp, width: 130, fontSize: 11 }} value={rates.find(r => String(r.rate) === String(row.rate)) ? "preset_" + row.rate : row.rate === "" ? "" : "custom"} onChange={e => { if (e.target.value === "custom") upR(activeEntry, ri, "rate", "custom"); else if (e.target.value === "") upR(activeEntry, ri, "rate", ""); else upR(activeEntry, ri, "rate", e.target.value.replace("preset_", "")); }}>
                            <option value="">Select</option>
                            {rates.map(r => <option key={r.id} value={"preset_" + r.rate}>₹{r.rate}/{r.type === "per_km" ? "km" : "hr"} {r.name}</option>)}
                            <option value="custom">Custom...</option>
                          </select>
                          {(row.rate === "custom" || (!rates.find(r => String(r.rate) === String(row.rate)) && row.rate !== "" && row.rate !== "custom")) && <input type="number" style={{ ...inp, width: 130, fontSize: 11, marginTop: 3 }} placeholder="Enter rate" value={row.rate === "custom" ? "" : row.rate} onChange={e => upR(activeEntry, ri, "rate", e.target.value)} />}
                        </td>
                        <td style={{ padding: "4px" }}><input type="number" style={{ ...inp, width: 80, fontSize: 11 }} value={row.amount} onChange={e => upR(activeEntry, ri, "amount", e.target.value)} placeholder="0" /></td>
                        <td style={{ padding: "4px" }}><button style={{ ...btn("#FCEBEB", "#A32D2D"), padding: "2px 6px", fontSize: 11 }} onClick={() => remRow(activeEntry, ri)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button style={{ ...btn("#EAF3DE", "#3B6D11"), marginTop: 8, fontSize: 12 }} onClick={() => addRow(activeEntry)}>+ Add Row</button>
            </div>

            {(() => {
              const ibc = inlineBillCharge[activeEntry] || {};
              const setIbc = val => setInlineBillCharge(p => ({ ...p, [activeEntry]: { ...(p[activeEntry] || {}), ...val } }));
              return (
                <div style={card}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#185FA5" }}>Additional Charges</div>
                  {(bill.charges || []).map((c, ci) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#666", minWidth: 170 }}>{c.label}</span>
                      <select style={{ ...inp, width: 90, fontSize: 12 }} value={c.mode} onChange={e => upC(activeEntry, c.id, "mode", e.target.value)}>
                        <option value="none">None</option><option value="nil">Nil</option><option value="value">Enter ₹</option>
                      </select>
                      {c.mode === "value" && <input type="number" style={{ ...inp, width: 80, fontSize: 12 }} value={c.value} onChange={e => upC(activeEntry, c.id, "value", e.target.value)} placeholder="₹" />}
                      <button style={{ ...btn("#FCEBEB", "#A32D2D"), padding: "3px 8px", fontSize: 11 }} onClick={() => upE(activeEntry, "charges", (bill.charges || []).filter((_, i) => i !== ci))}>✕</button>
                    </div>
                  ))}
                  <div style={{ borderTop: "0.5px solid #eee", paddingTop: 10, marginTop: 4 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <select style={{ ...inp, flex: 1, fontSize: 12 }} value={ibc.selected || ""} onChange={e => setIbc({ selected: e.target.value, customName: "" })}>
                        <option value="" disabled>Select charge to add...</option>
                        {chargeTypes.filter(ct => !(bill.charges || []).find(c => c.id === ct.id)).map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
                        <option value="__custom__">+ Custom (one-time)</option>
                      </select>
                      <button style={{ ...btn("#EAF3DE", "#3B6D11"), fontSize: 12 }} onClick={() => {
                        if (!ibc.selected) return;
                        if (ibc.selected === "__custom__") { const name = (ibc.customName || "").trim(); if (!name) return; upE(activeEntry, "charges", [...(bill.charges || []), { id: "oc_" + Date.now(), label: name, mode: "none", value: "" }]); }
                        else { const ct = chargeTypes.find(c => c.id === ibc.selected); if (ct) upE(activeEntry, "charges", [...(bill.charges || []), { id: ct.id, label: ct.label, mode: "none", value: "" }]); }
                        setIbc({ selected: "", customName: "" });
                      }}>+ Add</button>
                    </div>
                    {ibc.selected === "__custom__" && <div style={{ marginTop: 6 }}><input style={{ ...inp, fontSize: 12 }} placeholder="Enter custom charge name" value={ibc.customName || ""} onChange={e => setIbc({ customName: e.target.value })} /></div>}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const gst = inlineBillGst[activeEntry] || {};
              const setGst = val => setInlineBillGst(p => ({ ...p, [activeEntry]: { ...(p[activeEntry] || {}), ...val } }));
              return (
                <div style={card}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#185FA5" }}>GST</div>
                  {(bill.gstLines || []).map((g, gi) => (
                    <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", minWidth: 60 }}>
                        <input type="checkbox" checked={g.enabled} onChange={e => upG(activeEntry, g.id, "enabled", e.target.checked)} />{g.label}
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input type="number" style={{ ...inp, width: 65, fontSize: 12 }} value={g.pct} onChange={e => upG(activeEntry, g.id, "pct", parseFloat(e.target.value) || 0)} />
                        <span style={{ fontSize: 12, color: "#666" }}>%</span>
                      </div>
                      {g.enabled && <span style={{ fontSize: 11, color: "#185FA5" }}>= ₹{(calc.subtotal * (parseFloat(g.pct) || 0) / 100).toFixed(2)}</span>}
                      <button style={{ ...btn("#FCEBEB", "#A32D2D"), padding: "3px 8px", fontSize: 11 }} onClick={() => upE(activeEntry, "gstLines", (bill.gstLines || []).filter((_, i) => i !== gi))}>✕</button>
                    </div>
                  ))}
                  <div style={{ borderTop: "0.5px solid #eee", paddingTop: 10, marginTop: 4 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <select style={{ ...inp, flex: 1, fontSize: 12 }} value={gst.selected || ""} onChange={e => setGst({ selected: e.target.value, customLabel: "", customPct: "" })}>
                        <option value="" disabled>Select GST to add...</option>
                        {gstTypes.filter(gt => !(bill.gstLines || []).find(g => g.id === gt.id)).map(gt => <option key={gt.id} value={gt.id}>{gt.label} @ {gt.pct}%</option>)}
                        <option value="__custom__">+ Custom (one-time)</option>
                      </select>
                      <button style={{ ...btn("#EAF3DE", "#3B6D11"), fontSize: 12 }} onClick={() => {
                        if (!gst.selected) return;
                        if (gst.selected === "__custom__") { const name = (gst.customLabel || "").trim(); const pct = parseFloat(gst.customPct) || 0; if (!name) return; upE(activeEntry, "gstLines", [...(bill.gstLines || []), { id: "og_" + Date.now(), label: name, pct, enabled: true }]); }
                        else { const gt = gstTypes.find(g => g.id === gst.selected); if (gt) upE(activeEntry, "gstLines", [...(bill.gstLines || []), { ...gt, enabled: true }]); }
                        setGst({ selected: "", customLabel: "", customPct: "" });
                      }}>+ Add</button>
                    </div>
                    {gst.selected === "__custom__" && (
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <input style={{ ...inp, flex: 1, fontSize: 12 }} placeholder="GST name (e.g. UTGST)" value={gst.customLabel || ""} onChange={e => setGst({ customLabel: e.target.value })} />
                        <input type="number" style={{ ...inp, width: 70, fontSize: 12 }} placeholder="%" value={gst.customPct || ""} onChange={e => setGst({ customPct: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div style={{ ...card, background: "#E6F1FB", border: "1px solid #185FA5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>Subtotal</span><span>₹{calc.subtotal.toFixed(2)}</span></div>
              {(bill.gstLines || []).filter(g => g.enabled).map(g => (
                <div key={g.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{g.label} @ {g.pct}%</span><span>₹{(calc.subtotal * (parseFloat(g.pct) || 0) / 100).toFixed(2)}</span></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 500, borderTop: "1px solid #185FA5", paddingTop: 8, marginTop: 4 }}><span>Grand Total</span><span>₹{calc.grand.toFixed(2)}</span></div>
              <div style={{ fontSize: 11, color: "#185FA5", marginTop: 4 }}>{numToWords(calc.grand)}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button style={{ ...btn(), flex: 1 }} onClick={() => setPreviewMode(true)}>Preview Bill</button>
              <button style={{ ...btn("#3B6D11"), flex: 1 }} onClick={saveBill}>{loading ? "Saving..." : "Save All Bills"}</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "12px" }}>
            <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={{ ...btn("#eee", "#000") }} onClick={() => setPreviewMode(false)}>← Edit</button>
              <button style={{ ...btn(), opacity: pdfLoading ? 0.6 : 1 }} onClick={generatePDF} disabled={pdfLoading}>{pdfLoading ? "Generating..." : "Download PDF"}</button>
              <button style={btn("#3B6D11")} onClick={saveBill}>{loading ? "Saving..." : "Save Bills"}</button>
            </div>
            <div ref={billsRef}>
              {entries.map((b, bi) => (
                <div key={bi} className="bill-page" style={{ marginBottom: 24 }}><BillA4 b={b} /></div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (page === "history") {
    const groups = groupByMonth(filteredHistory);
    return (
      <div style={s}>
        <div style={{ background: "#185FA5", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...btn("rgba(255,255,255,0.2)", "#fff"), padding: "4px 10px" }} onClick={() => setPage("home")}>← Back</button>
          <span style={{ fontWeight: 500 }}>Bill History</span>
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <select style={{ ...inp, width: 130, fontSize: 12 }} value={historyKey} onChange={e => setHistoryKey(e.target.value)}>
              <option value="clientName">Client Name</option><option value="invoiceNo">Invoice No</option><option value="cabNo">Cab No</option><option value="clientGstin">Client GSTIN</option><option value="dutyType">Duty Type</option>
            </select>
            <input style={{ ...inp, flex: 1 }} placeholder="Search..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
          </div>
          {groups.length === 0 && <div style={{ textAlign: "center", color: "#666", padding: 40 }}>No bills found.</div>}
          {groups.map((g, gi) => (
            <div key={gi}>
              <div style={{ background: "#E6F1FB", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 500, color: "#185FA5", fontSize: 14 }}>{g.label}</span>
                <span style={{ fontSize: 12, color: "#185FA5" }}>Total: ₹{g.total.toFixed(2)}</span>
              </div>
              {g.bills.map(b => {
                const c = calcBill(b);
                const initials = (b.client_name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={b.id} style={{ ...card, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#185FA5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 13, flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{b.client_name}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>#{b.invoice_no} · {b.date} · {b.cab_no}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, background: b.duty_type === "local" ? "#EAF3DE" : "#FAEEDA", color: b.duty_type === "local" ? "#3B6D11" : "#854F0B", borderRadius: 4, padding: "1px 6px" }}>{b.duty_type === "local" ? "Local" : b.duty_type === "outstation" ? "Outstation" : b.duty_type}</span>
                        <span style={{ fontSize: 10, background: b.paid ? "#EAF3DE" : "#FCEBEB", color: b.paid ? "#3B6D11" : "#A32D2D", borderRadius: 4, padding: "1px 6px" }}>{b.paid ? "Paid" : "Unpaid"}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>₹{c.grand.toFixed(2)}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <button style={{ ...btn("#E6F1FB", "#185FA5"), padding: "2px 6px", fontSize: 10 }} onClick={() => openBill(b, "history")}>👁 View</button>
                        <button style={{ ...btn("#FCEBEB", "#A32D2D"), padding: "2px 6px", fontSize: 10 }} onClick={() => deleteBill(b.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "checklist") {
    const keyMap = { clientName: "client_name", invoiceNo: "invoice_no", cabNo: "cab_no", clientGstin: "client_gstin", dutyType: "duty_type" };
    const filtered = bills.filter(b => {
      const matchFilter = checklistFilter === "all" ? true : checklistFilter === "paid" ? b.paid : !b.paid;
      const matchSearch = !checklistSearch || (b[keyMap[checklistSearchKey]] || "").toLowerCase().includes(checklistSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    return (
      <div style={s}>
        <div style={{ background: "#185FA5", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...btn("rgba(255,255,255,0.2)", "#fff"), padding: "4px 10px" }} onClick={() => setPage("home")}>← Back</button>
          <span style={{ fontWeight: 500 }}>Payment Checklist</span>
        </div>
        <div style={{ padding: 12 }}>
          {/* Search Bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <select style={{ ...inp, width: 130, fontSize: 12 }} value={checklistSearchKey} onChange={e => setChecklistSearchKey(e.target.value)}>
              <option value="clientName">Client Name</option>
              <option value="invoiceNo">Invoice No</option>
              <option value="cabNo">Cab No</option>
              <option value="clientGstin">Client GSTIN</option>
              <option value="dutyType">Duty Type</option>
            </select>
            <input style={{ ...inp, flex: 1 }} placeholder="Search..." value={checklistSearch} onChange={e => setChecklistSearch(e.target.value)} />
          </div>
          {/* Filter Buttons */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {["all", "paid", "unpaid"].map(f => <button key={f} style={{ ...btn(checklistFilter === f ? "#185FA5" : "#eee", checklistFilter === f ? "#fff" : "#000"), fontSize: 12, textTransform: "capitalize" }} onClick={() => setChecklistFilter(f)}>{f}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, ...card, textAlign: "center", padding: "10px" }}><div style={{ fontSize: 18, fontWeight: 500, color: "#3B6D11" }}>{bills.filter(b => b.paid).length}</div><div style={{ fontSize: 11, color: "#666" }}>Paid</div></div>
            <div style={{ flex: 1, ...card, textAlign: "center", padding: "10px" }}><div style={{ fontSize: 18, fontWeight: 500, color: "#A32D2D" }}>{bills.filter(b => !b.paid).length}</div><div style={{ fontSize: 11, color: "#666" }}>Unpaid</div></div>
            <div style={{ flex: 1, ...card, textAlign: "center", padding: "10px" }}><div style={{ fontSize: 18, fontWeight: 500, color: "#185FA5" }}>₹{bills.filter(b => !b.paid).reduce((s, b) => s + calcBill(b).grand, 0).toFixed(0)}</div><div style={{ fontSize: 11, color: "#666" }}>Due</div></div>
          </div>
          {sorted.length === 0 && <div style={{ textAlign: "center", color: "#666", padding: 40 }}>No bills found.</div>}
          {sorted.map(b => { const c = calcBill(b); return (
            <div key={b.id} style={{ ...card, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
              <input type="checkbox" checked={b.paid} onChange={() => togglePaid(b.id)} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{b.client_name}</div>
                <div style={{ fontSize: 11, color: "#666" }}>#{b.invoice_no} · {b.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 500, fontSize: 13, color: b.paid ? "#3B6D11" : "#A32D2D" }}>₹{c.grand.toFixed(2)}</div>
                <div style={{ fontSize: 10, color: b.paid ? "#3B6D11" : "#A32D2D" }}>{b.paid ? "Paid" : "Unpaid"}</div>
                <button style={{ ...btn("#E6F1FB", "#185FA5"), padding: "2px 6px", fontSize: 10, marginTop: 4 }} onClick={() => openBill(b, "checklist")}>👁 View</button>
              </div>
            </div>
          ); })}
        </div>
      </div>
    );
  }

  if (page === "summary") {
    return (
      <div style={s}>
        <div style={{ background: "#185FA5", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...btn("rgba(255,255,255,0.2)", "#fff"), padding: "4px 10px" }} onClick={() => setPage("home")}>← Back</button>
          <span style={{ fontWeight: 500 }}>Summary</span>
        </div>
        <div style={{ padding: 12 }}>
          <div style={card}>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#185FA5" }}>Filter</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div><label style={lbl}>From Date</label><input type="date" style={inp} value={summaryFrom} onChange={e => setSummaryFrom(e.target.value)} /></div>
              <div><label style={lbl}>To Date</label><input type="date" style={inp} value={summaryTo} onChange={e => setSummaryTo(e.target.value)} /></div>
            </div>
            <div><label style={lbl}>Client Name (optional)</label><input style={inp} value={summaryClient} placeholder="Leave blank for all" onChange={e => setSummaryClient(e.target.value)} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[["Total Bills", summaryCalc.count, "#185FA5"], ["Grand Total", `₹${summaryCalc.grand.toFixed(2)}`, "#3B6D11"], ["Taxable Amount", `₹${summaryCalc.subtotal.toFixed(2)}`, "#854F0B"], ...Object.entries(summaryCalc.gstBreak).map(([k, v]) => [`${k} Collected`, `₹${v.toFixed(2)}`, "#993556"])].map(([l, v, col]) => (
              <div key={l} style={{ ...card, textAlign: "center", padding: "12px 8px" }}><div style={{ fontSize: 18, fontWeight: 500, color: col }}>{v}</div><div style={{ fontSize: 11, color: "#666" }}>{l}</div></div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8, color: "#185FA5" }}>Bills in Range ({summaryBills.length})</div>
            {summaryBills.length === 0 && <div style={{ color: "#666", fontSize: 13 }}>No bills in selected range.</div>}
            {summaryBills.map(b => { const c = calcBill(b); return (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "0.5px solid #eee", fontSize: 12 }}>
                <div><span style={{ fontWeight: 500 }}>{b.client_name}</span><span style={{ color: "#666", marginLeft: 8 }}>#{b.invoice_no} · {b.date}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 500 }}>₹{c.grand.toFixed(2)}</span>
                  <button style={{ ...btn("#E6F1FB", "#185FA5"), padding: "2px 6px", fontSize: 10 }} onClick={() => openBill(b, "summary")}>👁 View</button>
                </div>
              </div>
            ); })}
          </div>
        </div>
      </div>
    );
  }
}
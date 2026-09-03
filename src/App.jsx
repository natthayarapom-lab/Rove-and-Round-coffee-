import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ReferenceLine
} from "recharts";
import {
  Coffee, Plus, Trash2, TrendingUp, TrendingDown, Wallet,
  LayoutDashboard, ClipboardList, Banknote, PiggyBank, Cookie, Users, Target, Building2, Package, Calculator,
  Image as ImageIcon, X, Download, FileDown, Lock, BarChart3, Pencil, FileText
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ---------- ระบบดึงสรุปข้อมูลเป็นรูปภาพ / PDF ----------
async function captureNode(node) {
  return html2canvas(node, {
    backgroundColor: "#FBF3E1", scale: 2, useCORS: true,
    ignoreElements: (el) => el.getAttribute && el.getAttribute("data-html2canvas-ignore") === "true",
  });
}
async function exportNodeAsImage(node, filename) {
  if (!node) return;
  const canvas = await captureNode(node);
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
async function exportNodeAsPDF(node, filename) {
  if (!node) return;
  const canvas = await captureNode(node);
  const imgData = canvas.toDataURL("image/png");
  const orientation = canvas.width > canvas.height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${filename}.pdf`);
}

function ExportButtons({ targetRef, filename, label }) {
  const [busy, setBusy] = useState(false);
  const run = async (fn) => {
    if (!targetRef.current || busy) return;
    setBusy(true);
    try { await fn(targetRef.current, filename); } catch (e) { console.error(e); }
    setBusy(false);
  };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }} data-html2canvas-ignore="true">
      {label && <span style={{ fontSize: 12.5, color: "#8A6E45" }}>{label}</span>}
      <button
        onClick={() => run(exportNodeAsImage)}
        disabled={busy}
        style={{ ...primaryBtnGhost, opacity: busy ? 0.6 : 1 }}
      >
        <ImageIcon size={14} /> รูปภาพ
      </button>
      <button
        onClick={() => run(exportNodeAsPDF)}
        disabled={busy}
        style={{ ...primaryBtnGhost, opacity: busy ? 0.6 : 1 }}
      >
        <FileDown size={14} /> PDF
      </button>
    </div>
  );
}

// ---------- Design tokens ----------
// ink:   #2E1F0D   paper: #FBF3E1   panel: #FFFFFF
// leaf:  #4A320F (primary)   amber: #E3A730 (secondary)
// rust:  #B23A2E (expense)   line:  #EADFC4

const LOGO_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAIAAAAErfB6AAARYElEQVR42u2daZBcV3XHzzn3bb3OqtG+WLYlWbIWC9kGbBRhY7DBlFNUXATsQIqYEIpKIKGoChRZ+ACELIZQgaSI+UCowhAqOFRZxuwY2wpYAlnIlhfJtqSRRpq9Z6b7rfeekw/dI4/kTbKnZ1qt+6/+0DPTPe+983v33HvOPe9eHNh5C1i1r8iawAK2soCtLGArC9jKAraygK0sYAvYygK2soCtLGArC9jKAraygC1gKwvYygK2soCtLGArC9jKAraygC1gKwvYygK2soCtLGArC9jKAraArSxgKwvYygK2soCtLGCrl5VjTTAnQgAAxBf5i7AFPAd2lxm/kbP9tsArfRjrUEUMsmHRIAIg00dBBETHb5xGWwOexSuUVz5WvSWJgLCIATEzTkAA8SwwI4AAKkT1En8nAACTMqcChF6Bgj4v36f8DnLLIA3GOhpJxx9DEzePcQsAFgGYPTfVwPPSRudMdCIioAJ0AvK6lFsSYEZAABJhyUAY5QX+VGbeigJIrEOOx850vIgAKDoUQVVcEvRuCnq2eOXlKuglt/zCkxp5+BPp2H508k3y1c7841U+kMLTHKS8OCQEEQAQbLjW0+0uIIBgMpT0zK83jB6xsJNf6HducLvXOOXVTq5H+V2k8qd9XIwIo7ysXxEGUtHAA2N7/4lmskESkwprr3dTYcVN/sLXqTOgNlz0zBNr7jh3PgEjktZhed378ovfBKLrl4ov5mexTvcVHDADuRMH7oqP/4KcwgyjKzGxCLs9l+eW35Dvu0r5nS97Wg6+sr8UAARyz/D8nFVVcVlp7W35pW/GOrnGaWDjGl7GwbSnixZAt8PJ9c1a2EdBvZk3gkAUTqecjouKa96bX/wmrHvp55vRtN3PrRcHEAak5z+JKCCS1YLlb+lY/6dO/QYSBsRGv3BBh0liAASEX7OzYkA6zVuyNmxKl/xBec1t5BZmGP3lm9HZtLBT/0EQkVkbNh3rP1i+5Nbn8WNL5BhaYRSNjRe+Nt8lM7AhgU6Qgu4tf1ZYen0zjY4swgzdmz5aWPFWEAbAFkHbvnEwIphMVNB95aeD3s0gpnntCQHEJJ2bP1ZYfgOIgZeKmuZP1H50RTQqv+eqU3RVs8Y1SCarldbcXmxVum0IGAHEmM4tf+X3bG620Tmd8hddW17znukxF1jATZfJqsU17w4Wvb7JdBEAMNfXsfGO08dcLac26oORBMTt3VpYtqOeaWpuNw+Q79s280cLeC78c2nVO3BOzS0t23bbchSNc96WsMUtYif821x2wn9u3Pi8NXcLuDlE5VSu+/QB9qk0+FzNOlxIgE+bqkNAaEy8I84yWqSZ/1M4bdRvkHca1yYX61w4gGca/YXzxLN6AyEConCWjD+VjD7O1edMXGFdA2AAUiqPQYcqrvS71rgdl77CrKUFfHZG52m0nE48l00c0tWjJh5nTutIcgu3FVbc1GDzmg/EnNaO/DDs/2E2dQRMQoJACED1egQNLCIgUiWXcj1e76bCyrcJigX82oxu4rD/p+Gxn2RTRzgLSQzWmzISp5PkuIUVN83KgZKpw5V9X85G9yvlKvLBdV84yJquRGFIxsOj90cnHiTykPzmuWunvenGI49WDnzNVA4hKlI+uYUZs/REIOjkZsMzUzz++Ojuz0E8orxyY3pb5KWH0wDoOG4HiAGdNjUR5rQx3Vr/j8d+92USrdySNIxuzvzYa206AohZ9djY7s9iUkG3eOYhXm5kYGZ/HHBBJDrqdAd3jT/6RYVEKidimucDRUxl/1ckGkMnd9Z0507tB1gASUdDE7/7dyJFoJoYjQgDYDTwUDL8W/LyLUi3DQGLCABMHrxbwpNInkAzY01EYT11eCeQalmDUJvhRaS0diweeJDcJjcpYQBMJw7pypOqmcNgC/jMYWo88JAkk3NTQJOM7BUTYQvPB7cXYEQRHQ/9BufAZyICQDr2NIGSFjZJGwEWAUAdDurqUST3xcLQ2XUVyDrU4TEkp8nHsoBn+GdTOw7pFJA6h6dAX604rkAyCdTSNmy3UbQOT4rops/EiQCATsfYRAA0BzeTBdyQqQ3NncPUkbBu5Yq7NgTMOpy7ugnWCNLiBmm7TBanc1YZw5yKtHpVZfulKnFOj9TqRZW2qrLdZQFbwFYWsJUFbGUBW1nAVhawlQVsAVtZwFYWsJUFbGUBW1nAVhawBXwhSgAA1PNvz/nrBGKXUWptwojuq/+6EwACtHZZ1gXuol9TASbKeXCFtg+2fbDVSzV/PA9OsjX2TZqFpRSml506Z79Z38lHzrErFQA5L+7C+QeMyp2dJfeRAADRPSfLC8cAeM7PmuL02Fvk3HbDu9AAI2IWD6ZTh8VkCNh4IF8A63ujyPSqf8ICAqhA6ktwAAgANbZSwsbTQQLkmXQCz/peQaQsGdfpBIg5tydQhAEdnYzV/XQrt2Uc2HnL/J6ANomYBMUgeeTmRRiRxKSsI1R+fW9BcouIxFmIREiBACOQmAgQAV028fStQOTmz8UVCKBiJ/eqGCGybuq2g+d9C0ZEY9Lc6ncG3ZvBROHAQ9ngI8rxWUeQX9y55g+98iUiOjyxK3z2HuC0vOXPs+H9ycADyivptJq/9FZCNzrxf13rP4DKQ/JMOjWx707QEeBZPj6KwEzp5Ku+gpbdqqElRtECKCYrLNquCku0jru3fcpffI1JKtSxZsG1XyK/t/bc98NjPy+uuKnr9Z8xOkZQxXV/xKCANbrF0prbTVRRfmew8KpkZH86tCcdfVTg1NZXZz3GQufVvs6DGGSeTxFBUDg++fDIAx8KBx4Klu/QJum84i/joUdGH/xodPS+8NDdw7/4kFtYWVx7++SBb6j8Ird3k4lHg8VvBJOE/T8gJ9DR0OQTX6889h9TT38LOAMR1jU5B68rr/Zl4+Czs6+T7yusfGeu74p08LduebWTXxge/I7jl8nrcII+yCaqz32vsOwtOjyeju4vrLyRTZZfdXM48CCkEwKigt6+6+9a+La7e679FwBAp+j1bj1rL20THU1sviBIJqvml17Xt+OrtaM/Cw/fq4Ju4Ew4Q1TALMCAjmQRkofKrR2+1+vd5Cy7ziksiQ7fT44PiKDj6uH7p579fnjsZ6Bjf8l2/+Jb3b6tkkXnhRdt6zhYBJ1c9ciP/M6LTToGJjS1QQFwF7wuPvRtlVsgJtUc5ZZck0wcVEjZ8KMmHO7Z+ol45FEz9QyqQERYh8mz94COwPEBFXu5oNA3NfoUObmWXb7qwnHRTMqHdHRs35e619/hLdpuwv7Jp77dtfHDwcXvApVDv7vrik+6nWurT36TnILoqfD4A57fFR69H7CeZGBy827fVe7iN6qejdS11vF6aof+t+N1n4CgFzg7D57hbetMFmbZhKhAD+2ZOPTd8uUfHJ08GD/7PxVOS2vfj2vfD6RMNDy666+l1o9OHsWkw3tqI1frsQOocqBj0SmbtHPLx5AcnVTGfvsF5kgVFoHJMOjk8ASeSpi8SBcBbd9Pz3OiQ0DALQIwZTGDoN8FWQgcG5OQW6L8YjCpqR1DYFQBCCMgI4LXg/FQY4tmVEwunqKla+D4yinraJDcEpioARJn7sfdWGYSAYGc9nbj852qBJJ4TNgYEEQA1oAE5ChyOB4zWQjAwBrdQr0VGslQCOOTgAqEGZiEkRzRVQUo9ayyznQ2iOSCDgUJREQMmBjRQTcPwgDCWUxBt5hM0onTVgm3gGc3lcU6ya15b37BNpE0HHgoPnq/Iod1SOVLuy57nyouB+FkdP/kE99QekpYFzd9JJt8Jj38A0SmzrWlte+p/Pozfvd6b8G2qX1fcrySALAOS5s/xrXjU0/+V2nrx3O9W0EMx6OTz3wvG96jnJwRLm36SH7J74lJqwe/Gx+5Fx2vlVerO3/DJBTOgp6NghiefKRj/Qdyy9+uo1HVvan3mn80ycTkvi9PPv41t7iy55ovsFNiTvyuy5zCUuFMhJVbzHVvBFKQRR2r3lHccIdOJhFJxLilFU5+oZjY71pnqicnD3w9i072Xv2ZYMWNJhzKLXlzYfkNI7s+VT14N5WWyEt20rYFz04vbJKRfZVf/61TXOIvurJ68FudW/6i1v+Tyd/8g/JLwGZk4KG+6+4qrXvf+O6/F5MAm+kkGIsOAQRJmaxWuOgWMFJ98i5AJSYR1oAibNLKk/HRH8XHf55OHe3c8MGT/T9iyQRAkKuHvkPkOX6HtC/geQ+TUITd0srShg/klmyPTuxyyqso6K4d3ukEXegUyO8klNpzO4MFW1DlZu4bK426RgByTTY1/KtPFy99V2Hd+00yhqiml/gVdALySk5uQXL8FyDs9m5O+n8W9v+075o7e7Z/RXVdziZp8dXqzlfA9d3AREdB37beqz879cw98eF7ySuBCAoLYmOYDciiUVAQRRAYABQigQjWx8NiyMnx+IHhXZ8sr709f+ltRtcASRo1NUoAEQQFBQBFUNeqe7849OBHheOeq/8G3BKwaddweb5bMBtU+drhndHgbgrKIBlXT0hWyy3bYaIRMIlkVW10YcX1ycTTmNVQBJ2cZDXOqkAKlFf32CKG3A4e2Tv8q7/r2nBH0L2RsxARAUR0DGkli4aDFW8FgXjsCe+im71l283w7sruz5NXcoorhNN2bcTzX7JD5DFyZe8/L77xOzzRHz7z3+NPfK33ik8hYHT8l+j4PZfcqvJLKnvvVG4+HPhl52V/nAzt5nikvP5PouE9nFSQPFIBiCG/kwd3jez5XN8bPgfkMAKBcrvX+qtu9hdfW1i6fXzvFyEe9ro2FJZfP5JO5Bfv4CzKqv1EbTuKVh+/bd08hknCqdO7xehqcuQ+wzq46KZkeC+PHkgqz+ZXvb248qbcsu2cTE785vMSniSvlI4fEHRKa9+bX3Z9Wnl66ndfJTAY9KjCknjgl8gZuYVs4mCWjJMTJMOPuuWLvc7VXvdGkayy79+yoV+5Xkc8spf83sIl7ya/PLnvX6Xaj8pr11B43kt2gFEhIAGzydjJESBJZkwkgMrvFTEmHnHIReWLMCBwFoNXQnI4HiPHRXAEAIRxeulIRGSTgVcUEwszCKMwc6rIRSdXT4+IjtEt1UuFyAlsmNRMHyJGdMjoAoAykZiUyUUgAoF0XEziqAAAWUdADooQOaJDAFDkiBAA4+klHCKC5EIWYr1YExUAkBOcSlUSELhFEA3kAno2VdnkZFYWu4te7y16I5u49tQ3vQVb/UVvADbR0R+a6GRx44cxmQoHHyksv8HEQ+noY/ll13E2FR1/0F+6QyFFJx8xo/tekIqSGTPBUsd++gieG+Wu0uaTDfM7ikbRieq81F/2lvDgd6Mj97mdlwVLd1QPfis+9uP86t9XpRUUdNVO7lJOAf1yeOJhCrpE5aITDwuIKiyNhvdKPIxEtnajJQEjsomd3o3Z4G6uPGlGH3eKy+KhPTzxTDq429SOOoWVyMrv3cyiySl6PZtAZ+SV3O51AkSAbudl6Bblgp/Vb1XAAqQ8M/6Eu3AblS9yO9ea2rGg7ypVusRdcKUqLDe14xwP1x77TwDMqkfCA18HoqzaHz37A+RETBwe2WnCASTHll+1ZJgEgsoztQFBzK18h1NeHR//Oegot+pGt2N1dPheDgfRK/LUEXRzgiK1E4Ce33O517MhmzxCQWfQdyXrGlePo3It4xYNkwBQdAjKA2FER0wM5IIwgoDyxaSofBAjYlB5wIZNiohILnMGAEgOom3BLRwmAQi6hfrTPtPvZbpAQ9Dx61tsI6n6G3Lz9RQ1OU4jV23ptjbgU5U08vx7eT6qfcEbPvM3Vq0aJllZwFYWsJUFbAFbWcBWFrCVBWxlAVtZwFYWsJUFbAFbWcBWFrCVBWxlAVtZwFYWsAVsZQFbWcBWFrCVBWxlAVtZwBawlQVsZQFbWcBWFrCVBWx1Lvp/119qvrW+MSgAAAAASUVORK5CYII=";

// ---------- Supabase config (Rove & Rounds Coffee) ----------
const SUPABASE_URL = "https://zibvmnlpqkwqwuicnasn.supabase.co";
const SUPABASE_KEY = "sb_publishable_BO2tqQBk4DaVZNyJmPxLvA_bfMiH33Q";

async function supaSignIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  return data; // { access_token, user, ... }
}

async function supaRest(path, token, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Supabase error ${res.status}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// แปลงข้อมูลระหว่างรูปแบบตาราง Supabase <-> รูปแบบที่แอปใช้
const revenueRowToApp = (r) => ({
  id: r.id, date: r.entry_date,
  total: { cash: Number(r.total_cash) || 0, transfer: Number(r.total_transfer) || 0, tip: Number(r.total_tip) || 0 },
  bakery: { cash: Number(r.bakery_cash) || 0, transfer: Number(r.bakery_transfer) || 0, tip: Number(r.bakery_tip) || 0 },
  food: { cash: Number(r.food_cash) || 0, transfer: Number(r.food_transfer) || 0, tip: Number(r.food_tip) || 0 },
});
const revenueAppToRow = (rec) => ({
  entry_date: rec.date,
  total_cash: rec.total.cash, total_transfer: rec.total.transfer, total_tip: rec.total.tip,
  bakery_cash: rec.bakery.cash, bakery_transfer: rec.bakery.transfer, bakery_tip: rec.bakery.tip,
  food_cash: rec.food.cash, food_transfer: rec.food.transfer, food_tip: rec.food.tip,
});
const expenseRowToApp = (r) => ({
  id: r.id, date: r.entry_date, category: r.category, subcategory: r.subcategory,
  amount: Number(r.amount) || 0, note: r.note || "",
  count: r.staff_count != null ? Number(r.staff_count) : undefined,
  unit: r.staff_unit || undefined,
  commission: r.commission != null ? Number(r.commission) : undefined,
  receiptImage: r.receipt_image_url || null,
});
const expenseAppToRow = (e) => ({
  entry_date: e.date, category: e.category, subcategory: e.subcategory || null,
  amount: e.amount, note: e.note || null,
  staff_count: e.count ?? null, staff_unit: e.unit ?? null, commission: e.commission ?? null,
  receipt_image_url: e.receiptImage ?? null,
});

const fmt = (n) =>
  new Intl.NumberFormat("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
  );
const todayStr = () => new Date().toISOString().slice(0, 10);
const monthKey = (d) => d.slice(0, 7);
const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("th-TH", { month: "long", year: "numeric" });
};

// ---- ยอดขาย 3 ส่วน: ยอดขายทั้งหมด / เบเกอรี่ / เมนูอาหาร — เมนูน้ำคำนวณจากส่วนต่าง ----
const grpSum = (g) => Number(g?.cash || 0) + Number(g?.transfer || 0) + Number(g?.tip || 0);
const computeDrinkGroup = (rec) => ({
  cash: Number(rec.total?.cash || 0) - Number(rec.bakery?.cash || 0) - Number(rec.food?.cash || 0),
  transfer: Number(rec.total?.transfer || 0) - Number(rec.bakery?.transfer || 0) - Number(rec.food?.transfer || 0),
  tip: Number(rec.total?.tip || 0) - Number(rec.bakery?.tip || 0) - Number(rec.food?.tip || 0),
});
const recTotalSum = (rec) => grpSum(rec.total);

// หมวดหมู่เมนู (ทั่วไป + เบเกอรี่แยกต่างหาก)
const defaultMenuCategories = ["อาหารเช้า", "อาหารเที่ยง", "เมนู Special", "กาแฟ", "มัทฉะ", "อื่นๆ"];
const BAKERY = "เบเกอรี่";

// ---- seed data: เมนู ----
const seedMenu = [
  { id: "m1", name: "ไข่ลวก 2 ฟอง", price: 30, cost: 14, category: "อาหารเช้า" },
  { id: "m2", name: "แซนวิชแฮมไก่ชีส", price: 69, cost: 20, category: "อาหารเช้า" },
  { id: "m3", name: "ข้าวกระเพราไก่ + ไข่ดาว", price: 89, cost: 35, category: "อาหารเที่ยง" },
  { id: "m4", name: "ซีซ่าร์สลัด + ไข่ต้ม", price: 119, cost: 45, category: "อาหารเที่ยง" },
  { id: "m5", name: "ลาเต้", price: 65, cost: 22, category: "กาแฟ" },
  { id: "m6", name: "อเมริกาโน่", price: 55, cost: 15, category: "กาแฟ" },
  { id: "m7", name: "มัทฉะลาเต้", price: 75, cost: 28, category: "มัทฉะ" },
  { id: "m8", name: "ไข่ต้ม 1 ฟอง", price: 20, cost: 8, category: "อื่นๆ" },
  { id: "m9", name: "บราวนี่", price: 65, cost: 25, category: BAKERY },
  { id: "m10", name: "ครัวซองต์เนย", price: 55, cost: 22, category: BAKERY },
  { id: "m11", name: "เค้กกล้วยหอม", price: 60, cost: 20, category: BAKERY },
];

// รายรับ: บันทึกเป็นยอดรวมต่อวัน 3 ส่วน (ยอดขายทั้งหมด / เบเกอรี่ / เมนูอาหาร) — เมนูน้ำคำนวณจากส่วนต่าง
const seedRevenue = [
  {
    id: "r1", date: todayStr(),
    total: { cash: 4200, transfer: 12800, tip: 200 },
    bakery: { cash: 900, transfer: 2600, tip: 0 },
    food: { cash: 1800, transfer: 5200, tip: 100 },
  },
];

// รายจ่าย: 6 หมวดหลักตามที่ร้านใช้จริง
const RENT = "ค่าเช่า";
const STAFF = "ค่าจ้างพนักงาน";
const UTILITIES = "ค่าสาธารณูปโภค";
const WORKING_CAPITAL = "เงินทุนหมุนเวียน";
const TAX = "ค่าภาษี";
const RESERVE = "เงินทุนสำรองและซ่อมแซม";
const WC_SUBS = ["บาร์", "ครัว", "เค้ก", "ส่วนกลาง"];

const expenseMainCategories = [
  { key: RENT, kind: "simple" },
  { key: STAFF, kind: "staff" },
  { key: UTILITIES, kind: "sub", subs: ["ค่าไฟ", "ค่าน้ำ", "อินเทอร์เน็ต"] },
  { key: WORKING_CAPITAL, kind: "sub", subs: WC_SUBS },
  { key: TAX, kind: "simple" },
  { key: RESERVE, kind: "simple" },
];

// 5 ตำแหน่งพนักงาน ค่าจ้าง+จำนวนตั้งต้น (แก้ไข/เพิ่ม/ลบได้ในหน้าบันทึกรายจ่าย) — unit: "คน" (รายเดือน) หรือ "วัน" (รายวัน)
const defaultStaffPositions = [
  { id: "p1", name: "ผู้จัดการ", rate: 15000, count: 1, unit: "คน", note: "" },
  { id: "p2", name: "แม่ครัว", rate: 9000, count: 1, unit: "คน", note: "" },
  { id: "p3", name: "ผู้ช่วยครัว", rate: 7000, count: 1, unit: "คน", note: "" },
  { id: "p4", name: "พนักงานบาร์", rate: 8000, count: 1, unit: "คน", note: "" },
  { id: "p5", name: "พนักงานพาร์ทไทม์", rate: 350, count: 3, unit: "วัน", note: "" },
];

const seedExpenses = [
  { id: "e1", date: todayStr(), category: RENT, subcategory: "", amount: 20000, note: "อาคาร 2 หลัง — จ่ายเรียบร้อย" },
  { id: "e2", date: todayStr(), category: STAFF, subcategory: "ผู้จัดการ", count: 1, unit: "คน", commission: 0, amount: 15000, note: "จ่ายเรียบร้อย" },
  { id: "e3", date: todayStr(), category: UTILITIES, subcategory: "ค่าไฟ", amount: 1632, note: "สรุปทุกวันที่ 19" },
];

// รายละเอียดต้นทุนวัตถุดิบ — 3 หมวด: บาร์ / ครัว / เบเกอรี่
const COST_BAR = "หมวดบาร์";
const COST_KITCHEN = "หมวดครัว";
const COST_BAKERY = "หมวดเบเกอรี่";
const costCategories = [COST_BAR, COST_KITCHEN, COST_BAKERY];

const seedCostItems = [
  { id: "c1", category: COST_BAR, name: "เมล็ดกาแฟคั่วกลาง", unit: "กิโลกรัม", brand: "Doi Chaang", pricePerUnit: 750, source: "ร้านค้าส่งกาแฟ" },
  { id: "c2", category: COST_BAR, name: "นมสด", unit: "ลิตร", brand: "หนองโพ", pricePerUnit: 65, source: "แม็คโคร" },
  { id: "c3", category: COST_KITCHEN, name: "ไก่สับ", unit: "กิโลกรัม", brand: "CP", pricePerUnit: 90, source: "ตลาดสด" },
  { id: "c4", category: COST_KITCHEN, name: "ไข่ไก่", unit: "แผง (30 ฟอง)", brand: "CP", pricePerUnit: 125, source: "แม็คโคร" },
  { id: "c5", category: COST_BAKERY, name: "แป้งสาลีอเนกประสงค์", unit: "กิโลกรัม", brand: "ตราว่าว", pricePerUnit: 32, source: "แม็คโคร" },
  { id: "c6", category: COST_BAKERY, name: "เนยจืด", unit: "กิโลกรัม", brand: "President", pricePerUnit: 280, source: "แม็คโคร" },
  { id: "c7", category: COST_BAR, name: "กาแฟ (คั่วบด)", unit: "กรัม", brand: "Doi Chaang", pricePerUnit: 0.75, source: "ร้านค้าส่งกาแฟ" },
  { id: "c8", category: COST_BAR, name: "น้ำเปล่า", unit: "กรัม", brand: "—", pricePerUnit: 0, source: "น้ำประปา/กรอง" },
  { id: "c9", category: COST_BAR, name: "แก้ว", unit: "ใบ", brand: "—", pricePerUnit: 1, source: "ร้านบรรจุภัณฑ์" },
  { id: "c10", category: COST_BAR, name: "ฝา", unit: "ใบ", brand: "—", pricePerUnit: 1, source: "ร้านบรรจุภัณฑ์" },
  { id: "c11", category: COST_BAR, name: "หลอด", unit: "หลอด", brand: "—", pricePerUnit: 1, source: "ร้านบรรจุภัณฑ์" },
];

// การแปลงหน่วย — ให้เลือกหน่วยที่ใช้ในสูตรต่างจากหน่วยที่ตั้งไว้ในรายละเอียดต้นทุนได้
const weightUnits = ["กิโลกรัม", "กรัม"];
const volumeUnits = ["ลิตร", "มิลลิลิตร"];
const getUnitOptions = (baseUnit) => {
  if (weightUnits.includes(baseUnit)) return weightUnits;
  if (volumeUnits.includes(baseUnit)) return volumeUnits;
  return [baseUnit];
};
const pricePerConvertedUnit = (item, targetUnit) => {
  if (!item) return 0;
  if (item.unit === targetUnit) return item.pricePerUnit;
  if (item.unit === "กิโลกรัม" && targetUnit === "กรัม") return item.pricePerUnit / 1000;
  if (item.unit === "กรัม" && targetUnit === "กิโลกรัม") return item.pricePerUnit * 1000;
  if (item.unit === "ลิตร" && targetUnit === "มิลลิลิตร") return item.pricePerUnit / 1000;
  if (item.unit === "มิลลิลิตร" && targetUnit === "ลิตร") return item.pricePerUnit * 1000;
  return item.pricePerUnit;
};

const seedRecipes = [
  {
    id: "rc1", name: "Americano", category: COST_BAR,
    ingredients: [
      { id: "ing1", costItemId: "c7", qty: 20, unit: "กรัม" },
      { id: "ing2", costItemId: "c8", qty: 110, unit: "กรัม" },
      { id: "ing3", costItemId: "c9", qty: 1, unit: "ใบ" },
      { id: "ing4", costItemId: "c10", qty: 1, unit: "ใบ" },
      { id: "ing5", costItemId: "c11", qty: 1, unit: "หลอด" },
    ],
  },
];

const PIE_COLORS = ["#4A320F", "#E3A730", "#B23A2E", "#9C6B3A", "#C98A4A", "#C9752F", "#D9B979"];
const DAILY_TARGET = 10000;
const MONTHLY_TARGET = 300000;

// ---------- small UI atoms ----------
function StatCard({ label, value, icon: Icon, tone = "leaf", sub }) {
  const toneMap = {
    leaf: { bg: "#4A320F", ring: "#4A320F22" },
    amber: { bg: "#E3A730", ring: "#E3A73022" },
    rust: { bg: "#B23A2E", ring: "#B23A2E22" },
    ink: { bg: "#2E1F0D", ring: "#2E1F0D22" },
  };
  const t = toneMap[tone];
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, color: "#6B4F2A", fontWeight: 500 }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: t.ring, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={t.bg} />
        </div>
      </div>
      <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 28, fontWeight: 600, color: "#2E1F0D", lineHeight: 1 }}>฿{fmt(value)}</div>
      {sub && <span style={{ fontSize: 13, color: "#8A6E45" }}>{sub}</span>}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
      border: "none", background: active ? "#4A320F" : "transparent", color: active ? "#FBF3E1" : "#3A2712",
      fontSize: 15, fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left",
    }}>
      <Icon size={17} />{label}
    </button>
  );
}

// ---------- date range control (shared) ----------
function RangePicker({ range, setRange, customFrom, setCustomFrom, customTo, setCustomTo }) {
  const rangeLabel = { today: "วันนี้", "7d": "7 วันล่าสุด", "30d": "30 วันล่าสุด", all: "ทั้งหมด", custom: "กำหนดเอง" };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 6, background: "#FFFFFF", padding: 4, borderRadius: 10, border: "1px solid #EADFC4" }}>
        {["today", "7d", "30d", "all", "custom"].map((r) => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: "6px 12px", borderRadius: 7, border: "none", fontSize: 14,
            background: range === r ? "#2E1F0D" : "transparent", color: range === r ? "#FBF3E1" : "#6B4F2A",
            cursor: "pointer", fontWeight: 500,
          }}>{rangeLabel[r]}</button>
        ))}
      </div>
      {range === "custom" && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={inputStyle} />
          <span style={{ color: "#8A6E45", fontSize: 14 }}>ถึง</span>
          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={inputStyle} />
        </div>
      )}
    </div>
  );
}

// ---------- main app ----------
function CafeManager({ token, userEmail, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [menu, setMenu] = useState(seedMenu);
  const [menuCats, setMenuCats] = useState(defaultMenuCategories);
  const [costItems, setCostItems] = useState(seedCostItems);
  const [recipes, setRecipes] = useState(seedRecipes);
  const [revenue, setRevenue] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [staffPositions, setStaffPositions] = useState(defaultStaffPositions);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState("");

  // โหลดข้อมูลยอดขาย + รายจ่ายจาก Supabase ตอนล็อกอินสำเร็จ
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSyncing(true);
      setSyncError("");
      try {
        const [revRows, expRows] = await Promise.all([
          supaRest("revenue_entries?select=*&order=entry_date.desc", token),
          supaRest("expenses?select=*&order=entry_date.desc", token),
        ]);
        if (cancelled) return;
        setRevenue((revRows || []).map(revenueRowToApp));
        setExpenses((expRows || []).map(expenseRowToApp));
      } catch (err) {
        if (!cancelled) setSyncError("โหลดข้อมูลจาก Supabase ไม่สำเร็จ: " + err.message);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  // เพิ่ม/ลบ ยอดขายรายวัน — sync กับ Supabase
  const addRevenueSynced = async (rec) => {
    const tempId = `tmp${Date.now()}`;
    setRevenue((prev) => [{ ...rec, id: tempId }, ...prev]);
    try {
      const [row] = await supaRest("revenue_entries", token, {
        method: "POST",
        body: JSON.stringify(revenueAppToRow(rec)),
      });
      setRevenue((prev) => prev.map((r) => (r.id === tempId ? revenueRowToApp(row) : r)));
    } catch (err) {
      setSyncError("บันทึกยอดขายไม่สำเร็จ: " + err.message);
      setRevenue((prev) => prev.filter((r) => r.id !== tempId));
    }
  };
  const removeRevenueSynced = async (id) => {
    const prevState = revenue;
    setRevenue((prev) => prev.filter((r) => r.id !== id));
    try {
      await supaRest(`revenue_entries?id=eq.${id}`, token, { method: "DELETE", prefer: "return=minimal" });
    } catch (err) {
      setSyncError("ลบยอดขายไม่สำเร็จ: " + err.message);
      setRevenue(prevState);
    }
  };

  // เพิ่ม/ลบ รายจ่าย — sync กับ Supabase
  const addExpenseSynced = async (rec) => {
    const tempId = `tmp${Date.now()}`;
    setExpenses((prev) => [{ ...rec, id: tempId }, ...prev]);
    try {
      const [row] = await supaRest("expenses", token, {
        method: "POST",
        body: JSON.stringify(expenseAppToRow(rec)),
      });
      setExpenses((prev) => prev.map((e) => (e.id === tempId ? expenseRowToApp(row) : e)));
    } catch (err) {
      setSyncError("บันทึกรายจ่ายไม่สำเร็จ: " + err.message);
      setExpenses((prev) => prev.filter((e) => e.id !== tempId));
    }
  };
  const removeExpenseSynced = async (id) => {
    const prevState = expenses;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await supaRest(`expenses?id=eq.${id}`, token, { method: "DELETE", prefer: "return=minimal" });
    } catch (err) {
      setSyncError("ลบรายจ่ายไม่สำเร็จ: " + err.message);
      setExpenses(prevState);
    }
  };
  const updateExpenseSynced = async (id, rec) => {
    const prevState = expenses;
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...rec } : e)));
    try {
      await supaRest(`expenses?id=eq.${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(expenseAppToRow(rec)),
        prefer: "return=minimal",
      });
    } catch (err) {
      setSyncError("แก้ไขรายจ่ายไม่สำเร็จ: " + err.message);
      setExpenses(prevState);
    }
  };

  const [range, setRange] = useState("today");
  const [customFrom, setCustomFrom] = useState(todayStr());
  const [customTo, setCustomTo] = useState(todayStr());

  const { cutoff, upper } = useMemo(() => {
    const d = new Date();
    if (range === "today") return { cutoff: todayStr(), upper: todayStr() };
    if (range === "7d") { d.setDate(d.getDate() - 6); return { cutoff: d.toISOString().slice(0, 10), upper: todayStr() }; }
    if (range === "30d") { d.setDate(d.getDate() - 29); return { cutoff: d.toISOString().slice(0, 10), upper: todayStr() }; }
    if (range === "custom") return { cutoff: customFrom, upper: customTo };
    return { cutoff: "0000-00-00", upper: "9999-99-99" };
  }, [range, customFrom, customTo]);

  const filteredRevenue = revenue.filter((r) => r.date >= cutoff && r.date <= upper);
  const filteredExpenses = expenses.filter((e) => e.date >= cutoff && e.date <= upper);

  const sumGroup = (list, group) => ({
    cash: list.reduce((s, r) => s + Number(r[group]?.cash || 0), 0),
    transfer: list.reduce((s, r) => s + Number(r[group]?.transfer || 0), 0),
    tip: list.reduce((s, r) => s + Number(r[group]?.tip || 0), 0),
  });
  const totalSum = sumGroup(filteredRevenue, "total");
  const bakerySum = sumGroup(filteredRevenue, "bakery");
  const foodSum = sumGroup(filteredRevenue, "food");

  const totalCash = totalSum.cash;
  const totalTransfer = totalSum.transfer;
  const totalTip = totalSum.tip;
  const totalRevenue = totalCash + totalTransfer + totalTip;
  const bakeryTotal = bakerySum.cash + bakerySum.transfer + bakerySum.tip;
  const foodTotal = foodSum.cash + foodSum.transfer + foodSum.tip;
  const drinkTotal = totalRevenue - bakeryTotal - foodTotal;
  const generalTotal = totalRevenue - bakeryTotal; // เมนูทั่วไป = อาหาร + น้ำ (ไม่รวมเบเกอรี่)
  const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const rangeProps = { range, setRange, customFrom, setCustomFrom, customTo, setCustomTo };

  return (
    <div style={{ fontFamily: "'Roboto', 'Noto Sans Thai', sans-serif", background: "#FBF3E1", minHeight: "100vh", display: "flex", color: "#2E1F0D" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button, input, select { font-family: inherit; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #EADFC4; border-radius: 8px; }
      `}</style>

      <aside style={{ width: 220, flexShrink: 0, background: "#FFFFFF", borderRight: "1px solid #EADFC4", padding: "22px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          gap: 10, padding: "6px 8px 22px", marginBottom: 10,
        }}>
          <div style={{
            width: 92, height: 92, borderRadius: 20, overflow: "hidden", flexShrink: 0,
            boxShadow: "0 6px 18px rgba(74,50,15,0.28)", border: "3px solid #E3A730",
          }}>
            <img src={LOGO_DATA_URI} alt="Rove & Rounds Coffee" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 19, lineHeight: 1.25, color: "#4A320F" }}>
            Rove & Rounds
            <br />
            <span style={{ fontWeight: 500, fontSize: 13.5, color: "#8A6E45", letterSpacing: 1.5 }}>COFFEE</span>
          </span>
        </div>
        <NavItem icon={LayoutDashboard} label="แดชบอร์ด" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
        <NavItem icon={Building2} label="สรุปภาพรวมกิจการ" active={tab === "overview"} onClick={() => setTab("overview")} />
        <NavItem icon={Banknote} label="บันทึกยอดขายรายวัน" active={tab === "revenue"} onClick={() => setTab("revenue")} />
        <NavItem icon={Wallet} label="บันทึกรายจ่าย" active={tab === "expenses"} onClick={() => setTab("expenses")} />
        <NavItem icon={PiggyBank} label="สรุปรายได้-รายจ่าย" active={tab === "split"} onClick={() => setTab("split")} />
        <NavItem icon={BarChart3} label="วิเคราะห์ยอดขายรายสินค้า" active={tab === "analysis"} onClick={() => setTab("analysis")} />
        <NavItem icon={FileText} label="สลิปเงินเดือนพนักงาน" active={tab === "payroll"} onClick={() => setTab("payroll")} />
        <NavItem icon={ClipboardList} label="เมนู (ราคา/ต้นทุน)" active={tab === "menu"} onClick={() => setTab("menu")} />
        <NavItem icon={Package} label="รายละเอียดต้นทุน" active={tab === "cost"} onClick={() => setTab("cost")} />
        <NavItem icon={Calculator} label="คำนวณต้นทุนเมนู" active={tab === "recipe"} onClick={() => setTab("recipe")} />

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #EADFC4" }}>
          {syncError && (
            <div style={{ fontSize: 11.5, color: "#B23A2E", background: "#FBEFD6", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
              {syncError}
            </div>
          )}
          <div style={{ fontSize: 11.5, color: "#8A6E45", padding: "0 10px 8px" }}>
            {userEmail}
          </div>
          <button onClick={onLogout} style={{ ...primaryBtn, width: "100%", justifyContent: "center", background: "#FBF3E1", color: "#8A6E45", border: "1px solid #EADFC4" }}>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {syncing && (
          <div style={{ background: "#FBEFD6", border: "1px solid #F0D9A0", borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#8A4A12" }}>
            กำลังโหลดข้อมูลจาก Supabase...
          </div>
        )}
        {tab === "dashboard" && (
          <DashboardTab
            rangeProps={rangeProps}
            totalCash={totalCash} totalTransfer={totalTransfer} totalTip={totalTip}
            totalRevenue={totalRevenue} totalExpenses={totalExpenses} netProfit={netProfit}
            generalTotal={generalTotal} bakeryTotal={bakeryTotal}
            revenue={revenue} filteredExpenses={filteredExpenses}
          />
        )}
        {tab === "overview" && <OverviewTab revenue={revenue} expenses={expenses} />}
        {tab === "revenue" && <RevenueTab revenue={revenue} setRevenue={setRevenue} addRevenueSynced={addRevenueSynced} removeRevenueSynced={removeRevenueSynced} />}
        {tab === "expenses" && (
          <ExpensesTab
            expenses={expenses} setExpenses={setExpenses}
            addExpenseSynced={addExpenseSynced} removeExpenseSynced={removeExpenseSynced} updateExpenseSynced={updateExpenseSynced}
            staffPositions={staffPositions} setStaffPositions={setStaffPositions}
            rangeProps={rangeProps} totalRevenue={totalRevenue} filteredExpenses={filteredExpenses}
            revenue={revenue}
          />
        )}
        {tab === "split" && (
          <SplitTab
            rangeProps={rangeProps}
            generalTotal={generalTotal} bakeryTotal={bakeryTotal} foodTotal={foodTotal} drinkTotal={drinkTotal}
            totalRevenue={totalRevenue} totalExpenses={totalExpenses}
            menu={menu} revenue={revenue} expenses={expenses} filteredExpenses={filteredExpenses}
          />
        )}
        {tab === "analysis" && <AnalysisTab revenue={revenue} expenses={expenses} />}
        {tab === "payroll" && <PayrollTab staffPositions={staffPositions} />}
        {tab === "menu" && <MenuTab menu={menu} setMenu={setMenu} menuCats={menuCats} setMenuCats={setMenuCats} />}
        {tab === "cost" && <CostDetailTab costItems={costItems} setCostItems={setCostItems} />}
        {tab === "recipe" && <RecipeCostTab costItems={costItems} recipes={recipes} setRecipes={setRecipes} />}
      </main>
    </div>
  );
}

// ---------- Dashboard ----------
function DashboardTab({ rangeProps, totalCash, totalTransfer, totalTip, totalRevenue, totalExpenses, netProfit, generalTotal, bakeryTotal, revenue, filteredExpenses }) {
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      const dayRevenue = revenue.filter((r) => r.date === key).reduce((s, r) => s + recTotalSum(r), 0);
      days.push({ label, รายรับ: dayRevenue });
    }
    return days;
  }, [revenue]);

  const expenseByCategory = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const salesByGroup = [
    { name: "เมนูทั่วไป", value: generalTotal },
    { name: "เบเกอรี่", value: bakeryTotal },
  ].filter((g) => g.value > 0);

  const exportRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>ภาพรวมร้าน</h1>
          <p style={{ margin: "4px 0 0", color: "#8A6E45", fontSize: 15 }}>สรุปรายรับ-รายจ่าย</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <RangePicker {...rangeProps} />
          <ExportButtons targetRef={exportRef} filename="แดชบอร์ด" />
        </div>
      </div>

      <div style={{ background: "#4A320F", borderRadius: 16, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12, boxShadow: "0 4px 14px rgba(74,50,15,0.28)" }}>
        <div>
          <div style={{ color: "#FDF6E4", fontSize: 13, letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>รายได้ปัจจุบัน</div>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 38, fontWeight: 700, color: "#FFFFFF" }}>฿{fmt(totalRevenue)}</div>
          <div style={{ color: "#FDF6E4", fontSize: 13, marginTop: 4 }}>รวมเงินสด + เงินโอน + ทิป</div>
        </div>
        <TrendingUp size={44} color="#FDF6E4" strokeWidth={1.5} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="เงินสด" value={totalCash} icon={Banknote} tone="amber" />
        <StatCard label="เงินโอน" value={totalTransfer} icon={TrendingUp} tone="leaf" />
        <StatCard label="ทิป" value={totalTip} icon={TrendingUp} tone="ink" />
        <StatCard label="รายจ่ายรวม" value={totalExpenses} icon={TrendingDown} tone="rust" />
      </div>

      <div style={{ background: "#2E1F0D", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: "#E3A730", fontSize: 13, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>กำไรสุทธิ (รายรับ − รายจ่าย)</div>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 36, fontWeight: 600, color: netProfit >= 0 ? "#F4D793" : "#E8998C" }}>
            {netProfit >= 0 ? "+" : "−"}฿{fmt(Math.abs(netProfit))}
          </div>
        </div>
        <div style={{ textAlign: "right", color: "#D9B979", fontSize: 13, fontFamily: "monospace" }}>
          <div>ยอดขายเมนูทั่วไป ฿{fmt(generalTotal)}</div>
          <div>ยอดขายเบเกอรี่ ฿{fmt(bakeryTotal)}</div>
          <div>รวมรายจ่าย −฿{fmt(totalExpenses)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 16 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "20px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>ยอดรายรับ (7 วันล่าสุด)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#EADFC4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 13, fill: "#8A6E45" }} axisLine={{ stroke: "#EADFC4" }} tickLine={false} />
              <YAxis tick={{ fontSize: 13, fill: "#8A6E45" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #EADFC4", fontSize: 14 }} />
              <Legend wrapperStyle={{ fontSize: 14 }} />
              <Line type="monotone" dataKey="รายรับ" stroke="#4A320F" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <PieCard title="รายจ่ายแยกตามหมวด" data={expenseByCategory} empty="ยังไม่มีรายจ่ายในช่วงนี้" />
        <PieCard title="ยอดขายแยกตามหมวดหมู่" data={salesByGroup} empty="ยังไม่มียอดขายในช่วงนี้" />
      </div>
    </div>
  );
}

function PieCard({ title, data, empty }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "20px" }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>{title}</h3>
      {data.length === 0 && <p style={{ color: "#8A6E45", fontSize: 14 }}>{empty}</p>}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={62}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => `฿${fmt(v)}`} contentStyle={{ borderRadius: 8, border: "1px solid #EADFC4", fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
        {data.map((c, i) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span style={{ flex: 1, color: "#3A2712" }}>{c.name}</span>
            <span style={{ color: "#6B4F2A", fontWeight: 500 }}>฿{fmt(c.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Overview tab: เงินลงทุน / กำไรทั้งหมด / จุดคืนทุน (BEP) ----------
function OverviewTab({ revenue, expenses }) {
  const [investors, setInvestors] = useState([
    { id: "i1", name: "พี่แบงค์", amount: 760000, pct: 76, locked: true },
    { id: "i2", name: "พี่ต้น", amount: 240000, pct: 24, locked: true },
  ]);

  const totalInvestment = investors.reduce((s, i) => s + Number(i.amount || 0), 0);
  const investorPctTotal = investors.reduce((s, i) => s + Number(i.pct || 0), 0);

  const updateInvestor = (id, field, val) => {
    setInvestors(investors.map((i) => (i.id === id ? { ...i, [field]: field === "name" ? val : Number(val) || 0 } : i)));
  };
  const addInvestor = () => setInvestors([...investors, { id: `i${Date.now()}`, name: "ผู้ร่วมลงทุนใหม่", amount: 0, pct: 0, locked: false }]);
  const removeInvestor = (id) => setInvestors(investors.filter((i) => i.id !== id));

  // กำไรจริงรายเดือน (รายรับ − รายจ่ายที่บันทึกจริงทั้งหมด ไม่ใช้สูตรประมาณการ)
  const monthlyActual = useMemo(() => {
    const revMap = {};
    revenue.forEach((r) => {
      const key = monthKey(r.date);
      revMap[key] = (revMap[key] || 0) + recTotalSum(r);
    });
    const expMap = {};
    expenses.forEach((e) => { const key = monthKey(e.date); expMap[key] = (expMap[key] || 0) + Number(e.amount || 0); });
    const allKeys = [...new Set([...Object.keys(revMap), ...Object.keys(expMap)])].sort();
    let cumulative = 0;
    return allKeys.map((key) => {
      const rev = revMap[key] || 0;
      const exp = expMap[key] || 0;
      const profit = rev - exp;
      cumulative += profit;
      return { key, label: monthLabel(key), รายรับ: rev, รายจ่าย: exp, กำไร: profit, สะสม: cumulative };
    });
  }, [revenue, expenses]);

  const totalRevenueAllTime = monthlyActual.reduce((s, m) => s + m.รายรับ, 0);
  const totalExpenseAllTime = monthlyActual.reduce((s, m) => s + m.รายจ่าย, 0);
  const totalProfitAllTime = totalRevenueAllTime - totalExpenseAllTime;
  const monthsWithData = monthlyActual.length;
  const avgMonthlyProfit = monthsWithData ? totalProfitAllTime / monthsWithData : 0;

  const bepMonthIndex = monthlyActual.findIndex((m) => m.สะสม >= totalInvestment);
  const bepMonths = avgMonthlyProfit > 0 ? totalInvestment / avgMonthlyProfit : null;

  const currentCumulative = monthlyActual.length ? monthlyActual[monthlyActual.length - 1].สะสม : 0;
  const remainingToBreakEven = totalInvestment - currentCumulative;
  const alreadyBrokeEven = bepMonthIndex >= 0;
  const monthsRemaining = !alreadyBrokeEven && avgMonthlyProfit > 0 ? remainingToBreakEven / avgMonthlyProfit : null;
  const projectedMonthLabel = useMemo(() => {
    if (monthsRemaining === null) return null;
    const base = monthsWithData
      ? (() => { const [y, m] = monthlyActual[monthlyActual.length - 1].key.split("-").map(Number); return new Date(y, m - 1, 1); })()
      : new Date();
    base.setMonth(base.getMonth() + Math.ceil(monthsRemaining));
    return base.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
  }, [monthsRemaining, monthlyActual, monthsWithData]);

  const exportRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>สรุปภาพรวมกิจการ</h1>
        <ExportButtons targetRef={exportRef} filename="สรุปภาพรวมกิจการ" />
      </div>
      <p style={{ margin: "0 0 20px", color: "#8A6E45", fontSize: 15 }}>เงินลงทุน กำไรสะสมทั้งหมด และจุดคืนทุน (BEP) ของร้าน</p>

      {/* เงินลงทุน */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 10px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>เงินลงทุนทั้งหมด</h3>
        <button onClick={addInvestor} style={{ ...primaryBtn, padding: "6px 12px", fontSize: 13.5 }}><Plus size={14} /> เพิ่มผู้ลงทุน</button>
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 16, marginBottom: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {investors.map((i) => (
            <div key={i.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input type="text" value={i.name} onChange={(e) => updateInvestor(i.id, "name", e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
              <span style={{ fontSize: 13.5, color: "#8A6E45" }}>เงินลงทุน</span>
              <input
                type="number" min={0} value={i.amount}
                onChange={(e) => updateInvestor(i.id, "amount", e.target.value)}
                readOnly={i.locked}
                title={i.locked ? "ตัวเลขนี้ถูกล็อกไว้ ไม่สามารถแก้ไขได้" : ""}
                style={{ ...inputStyle, width: 120, textAlign: "right", background: i.locked ? "#F0EAD8" : inputStyle.background, color: i.locked ? "#8A6E45" : inputStyle.color, cursor: i.locked ? "not-allowed" : "text" }}
              />
              <span style={{ fontSize: 13.5, color: "#8A6E45" }}>บาท</span>
              {i.locked && <Lock size={13} color="#B99B6B" />}
              <span style={{ fontSize: 13.5, color: "#8A6E45" }}>สัดส่วน</span>
              <input type="number" min={0} max={100} value={i.pct} onChange={(e) => updateInvestor(i.id, "pct", e.target.value)} style={{ ...inputStyle, width: 60, textAlign: "right" }} />%
              {!i.locked && <DeleteBtn onClick={() => removeInvestor(i.id)} />}
            </div>
          ))}
        </div>
        {investorPctTotal !== 100 && (
          <p style={{ margin: "10px 0 0", color: "#B23A2E", fontSize: 13 }}>รวมสัดส่วนตอนนี้ {investorPctTotal}% — ควรรวมให้ครบ 100%</p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 26 }}>
        <StatCard label="เงินลงทุนทั้งหมด" value={totalInvestment} icon={Building2} tone="ink" />
        <StatCard label="กำไรทั้งหมด (สะสม)" value={totalProfitAllTime} icon={TrendingUp} tone={totalProfitAllTime >= 0 ? "leaf" : "rust"} sub={`จาก ${monthsWithData} เดือนที่มีข้อมูล`} />
        <StatCard label="กำไรเฉลี่ยต่อเดือน" value={avgMonthlyProfit} icon={TrendingUp} tone={avgMonthlyProfit >= 0 ? "leaf" : "rust"} />
      </div>

      {/* จุดคืนทุน */}
      <div style={{ background: "#2E1F0D", borderRadius: 14, padding: "20px 24px", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#E3A730", fontSize: 13, letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>
          <Target size={14} /> จุดคืนทุน (Break-Even Point)
        </div>
        {bepMonths === null ? (
          <div style={{ color: "#E8998C", fontSize: 18 }}>
            ยังคำนวณจุดคืนทุนไม่ได้ — กำไรเฉลี่ยต่อเดือนยังติดลบหรือเท่ากับศูนย์ ต้องทำให้ร้านมีกำไรเฉลี่ยเป็นบวกก่อน
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 36, fontWeight: 600, color: "#F4D793" }}>{bepMonths.toFixed(1)} เดือน</span>
            <span style={{ color: "#D9B979", fontSize: 14 }}>
              (≈ {(bepMonths / 12).toFixed(1)} ปี) — คำนวณจาก เงินลงทุน ฿{fmt(totalInvestment)} ÷ กำไรเฉลี่ย ฿{fmt(avgMonthlyProfit)}/เดือน
            </span>
          </div>
        )}
        {bepMonthIndex >= 0 && (
          <div style={{ color: "#F4D793", fontSize: 14, marginTop: 8 }}>
            ตามข้อมูลจริงที่บันทึกไว้ กำไรสะสมถึงจุดคืนทุนแล้วในเดือน <strong>{monthlyActual[bepMonthIndex].label}</strong>
          </div>
        )}
      </div>

      {/* สรุปคืนทุนภายในกี่เดือน เทียบข้อมูลปัจจุบัน */}
      <div style={{ background: alreadyBrokeEven ? "#FCEFC7" : "#FBEFD6", border: `1px solid ${alreadyBrokeEven ? "#EBD9A8" : "#F0D9A0"}`, borderRadius: 14, padding: "18px 24px", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: alreadyBrokeEven ? "#4A320F" : "#8A4A12", fontSize: 13, letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>
          <Target size={14} /> สรุปคืนทุนภายในกี่เดือน (เทียบข้อมูลปัจจุบัน)
        </div>
        {monthsWithData === 0 ? (
          <div style={{ color: "#6B4A26", fontSize: 15 }}>ยังไม่มีข้อมูลรายรับ-รายจ่ายเพียงพอสำหรับประเมิน</div>
        ) : alreadyBrokeEven ? (
          <div style={{ color: "#2E1F0D", fontSize: 16 }}>
            ✅ ร้านคืนทุนแล้ว ณ ตอนนี้ กำไรสะสม ฿{fmt(currentCumulative)} มากกว่าเงินลงทุน ฿{fmt(totalInvestment)} อยู่ ฿{fmt(currentCumulative - totalInvestment)}
          </div>
        ) : monthsRemaining !== null ? (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 30, fontWeight: 600, color: "#8A4A12" }}>อีกประมาณ {monthsRemaining.toFixed(1)} เดือน</span>
              <span style={{ color: "#6B4A26", fontSize: 14 }}>คาดว่าจะคืนทุนราวเดือน <strong>{projectedMonthLabel}</strong></span>
            </div>
            <div style={{ color: "#6B4A26", fontSize: 13.5, marginTop: 6 }}>
              กำไรสะสมตอนนี้ ฿{fmt(currentCumulative)} ยังขาดอีก ฿{fmt(remainingToBreakEven)} เทียบเงินลงทุน ฿{fmt(totalInvestment)} — ประเมินจากกำไรเฉลี่ย ฿{fmt(avgMonthlyProfit)}/เดือน
            </div>
          </div>
        ) : (
          <div style={{ color: "#B23A2E", fontSize: 15 }}>
            ยังประเมินไม่ได้ เพราะกำไรเฉลี่ยต่อเดือนติดลบหรือเท่ากับศูนย์ — ต้องทำให้ร้านมีกำไรเป็นบวกก่อนถึงจะประมาณเวลาคืนทุนได้
          </div>
        )}
      </div>

      {/* กราฟกำไรสะสมเทียบเงินลงทุน */}
      <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px", fontFamily: "'Roboto', sans-serif" }}>กราฟกำไรสะสมเทียบเงินลงทุน</h3>
      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "20px", marginBottom: 26 }}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyActual}>
            <CartesianGrid stroke="#EADFC4" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#8A6E45" }} axisLine={{ stroke: "#EADFC4" }} tickLine={false} />
            <YAxis tick={{ fontSize: 13, fill: "#8A6E45" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #EADFC4", fontSize: 14 }} formatter={(v) => `฿${fmt(v)}`} />
            <Legend wrapperStyle={{ fontSize: 14 }} />
            <ReferenceLine y={totalInvestment} stroke="#B23A2E" strokeDasharray="5 4" label={{ value: `เงินลงทุน ฿${fmt(totalInvestment)}`, position: "insideTopRight", fill: "#B23A2E", fontSize: 12 }} />
            <Line type="monotone" dataKey="สะสม" name="กำไรสะสม" stroke="#4A320F" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
        {monthlyActual.length === 0 && <p style={{ color: "#B99B6B", fontSize: 14, textAlign: "center", margin: "12px 0 0" }}>ยังไม่มีข้อมูลรายรับ-รายจ่ายเพียงพอสำหรับกราฟ</p>}
      </div>

      {/* คำแนะนำ */}
      <div style={{ background: "#FBEFD6", border: "1px solid #F0D9A0", borderRadius: 14, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#8A4A12", margin: "0 0 8px" }}>คำแนะนำในการดูข้อมูล BEP</h3>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#6B4A26", fontSize: 13.5, lineHeight: 1.7 }}>
          <li>BEP คำนวณจาก "เงินลงทุนทั้งหมด ÷ กำไรเฉลี่ยต่อเดือน" — ยิ่งกำไรเฉลี่ยต่อเดือนสูงและสม่ำเสมอ ตัวเลขนี้จะยิ่งแม่นยำ</li>
          <li>ช่วง 2-3 เดือนแรกที่เพิ่งเปิดร้านมักมีกำไรผันผวน แนะนำให้ดูค่าเฉลี่ยหลังร้านเปิดมาอย่างน้อย 3 เดือนขึ้นไป</li>
          <li>เส้น "กำไรสะสม" ในกราฟตัดกับเส้นประ "เงินลงทุน" ตรงไหน คือจุดที่ร้านคืนทุนได้จริงตามข้อมูลจริง (ไม่ใช่แค่ค่าเฉลี่ย)</li>
          <li>ถ้ากำไรเฉลี่ยติดลบ ให้ดูหน้า "สรุปรายได้-รายจ่าย" เพื่อหาว่าค่าใช้จ่ายหมวดไหนกินสัดส่วนสูงสุด แล้วปรับก่อนคำนวณ BEP ใหม่</li>
        </ul>
      </div>
    </div>
  );
}

// ---------- Revenue tab: 2 groups (ทั่วไป / เบเกอรี่) x เงินสด/โอน/ทิป, + สรุปรายเดือน ----------
function RevenueTab({ revenue, setRevenue, addRevenueSynced, removeRevenueSynced }) {
  const [date, setDate] = useState(todayStr());
  const [tCash, setTCash] = useState(""); const [tTransfer, setTTransfer] = useState(""); const [tTip, setTTip] = useState("");
  const [bCash, setBCash] = useState(""); const [bTransfer, setBTransfer] = useState(""); const [bTip, setBTip] = useState("");
  const [fCash, setFCash] = useState(""); const [fTransfer, setFTransfer] = useState(""); const [fTip, setFTip] = useState("");

  const addRevenue = () => {
    const hasAny = [tCash, tTransfer, tTip].some((v) => v !== "");
    if (!hasAny) return;
    addRevenueSynced({
      date,
      total: { cash: Number(tCash) || 0, transfer: Number(tTransfer) || 0, tip: Number(tTip) || 0 },
      bakery: { cash: Number(bCash) || 0, transfer: Number(bTransfer) || 0, tip: Number(bTip) || 0 },
      food: { cash: Number(fCash) || 0, transfer: Number(fTransfer) || 0, tip: Number(fTip) || 0 },
    });
    setTCash(""); setTTransfer(""); setTTip(""); setBCash(""); setBTransfer(""); setBTip(""); setFCash(""); setFTransfer(""); setFTip("");
  };
  const removeRevenue = (id) => removeRevenueSynced(id);
  const sorted = [...revenue].sort((a, b) => (a.date < b.date ? 1 : -1));

  // สรุปรายเดือนแบบเต็ม (ทุกเดือนที่มีข้อมูล) — ใช้กับกราฟ/กล่องสรุปทั้งหมดตั้งแต่เปิดร้าน
  const monthly = useMemo(() => {
    const map = {};
    revenue.forEach((r) => {
      const key = monthKey(r.date);
      if (!map[key]) map[key] = { bakery: 0, food: 0, drink: 0, total: 0 };
      map[key].bakery += grpSum(r.bakery);
      map[key].food += grpSum(r.food);
      map[key].drink += grpSum(computeDrinkGroup(r));
      map[key].total += recTotalSum(r);
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [revenue]);

  const allTimeTotal = useMemo(() => monthly.reduce((s, [, v]) => s + v.total, 0), [monthly]);

  const availableMonths = useMemo(() => monthly.map(([k]) => k).sort((a, b) => (a > b ? 1 : -1)), [monthly]);
  const [selectedMonth, setSelectedMonth] = useState(monthKey(todayStr()));
  const [dailyTarget, setDailyTarget] = useState(DAILY_TARGET);
  const [monthlyTarget, setMonthlyTarget] = useState(MONTHLY_TARGET);

  // ตัวกรองตาราง: เลือกเดือน หรือกำหนดช่วงวันที่เอง — ใช้กับทั้งตารางรายวันและตารางสรุปรายเดือน
  const [listUseCustomRange, setListUseCustomRange] = useState(false);
  const [listRangeFrom, setListRangeFrom] = useState(todayStr());
  const [listRangeTo, setListRangeTo] = useState(todayStr());

  const filteredSorted = useMemo(() => {
    if (listUseCustomRange) return sorted.filter((r) => r.date >= listRangeFrom && r.date <= listRangeTo);
    return sorted.filter((r) => monthKey(r.date) === selectedMonth);
  }, [sorted, listUseCustomRange, listRangeFrom, listRangeTo, selectedMonth]);

  // สรุปยอดขายรายเดือน (ตามตัวกรองด้านบน) + แถวรวมท้ายตาราง
  const filteredMonthlySummary = useMemo(() => {
    const map = {};
    filteredSorted.forEach((r) => {
      const key = monthKey(r.date);
      if (!map[key]) map[key] = { bakery: 0, food: 0, drink: 0, total: 0 };
      map[key].bakery += grpSum(r.bakery);
      map[key].food += grpSum(r.food);
      map[key].drink += grpSum(computeDrinkGroup(r));
      map[key].total += recTotalSum(r);
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filteredSorted]);
  const filteredGrandTotal = filteredMonthlySummary.reduce((acc, [, v]) => ({
    bakery: acc.bakery + v.bakery, food: acc.food + v.food, drink: acc.drink + v.drink, total: acc.total + v.total,
  }), { bakery: 0, food: 0, drink: 0, total: 0 });

  const dailyTotalMap = useMemo(() => {
    const map = {};
    revenue.forEach((r) => { map[r.date] = (map[r.date] || 0) + recTotalSum(r); });
    return map;
  }, [revenue]);

  const dailyChartData = useMemo(() => {
    if (!selectedMonth) return [];
    const [y, m] = selectedMonth.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedMonth}-${String(d).padStart(2, "0")}`;
      days.push({ day: String(d), ยอดขาย: dailyTotalMap[dateStr] || 0 });
    }
    return days;
  }, [selectedMonth, dailyTotalMap]);

  const monthlyChartData = useMemo(
    () => [...monthly].sort((a, b) => (a[0] > b[0] ? 1 : -1)).map(([key, v]) => ({ month: monthLabel(key), ยอดขาย: v.total })),
    [monthly]
  );

  const daysMeetingTarget = dailyChartData.filter((d) => d.ยอดขาย >= dailyTarget).length;
  const daysWithSales = dailyChartData.filter((d) => d.ยอดขาย > 0).length;
  const selectedMonthTotal = monthly.find(([k]) => k === selectedMonth)?.[1];
  const selectedMonthSum = selectedMonthTotal ? selectedMonthTotal.total : 0;
  const monthOptions = availableMonths.includes(selectedMonth) ? availableMonths : [...availableMonths, selectedMonth].sort();

  const exportRef = useRef(null);
  const monthlySummaryRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>บันทึกยอดขายรายวัน</h1>
        <ExportButtons targetRef={exportRef} filename="บันทึกยอดขายรายวัน" />
      </div>
      <p style={{ margin: "0 0 20px", color: "#8A6E45", fontSize: 15 }}>กรอกยอดขาย 3 ส่วน: ยอดขายทั้งหมด / เบเกอรี่ / เมนูอาหาร — ระบบคำนวณ "เมนูน้ำ" ให้อัตโนมัติจากส่วนต่าง</p>

      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18, marginBottom: 22 }}>
        <Field label="วันที่"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, marginBottom: 16, width: 200 }} /></Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#4A320F", margin: "0 0 10px" }}>ยอดขายทั้งหมด</h4>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Field label="เงินสด"><input type="number" min={0} value={tCash} onChange={(e) => setTCash(e.target.value)} style={{ ...inputStyle, width: 95 }} /></Field>
              <Field label="เงินโอน"><input type="number" min={0} value={tTransfer} onChange={(e) => setTTransfer(e.target.value)} style={{ ...inputStyle, width: 95 }} /></Field>
              <Field label="ทิป"><input type="number" min={0} value={tTip} onChange={(e) => setTTip(e.target.value)} style={{ ...inputStyle, width: 85 }} /></Field>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#E3A730", margin: "0 0 10px" }}>ยอดขายเบเกอรี่</h4>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Field label="เงินสด"><input type="number" min={0} value={bCash} onChange={(e) => setBCash(e.target.value)} style={{ ...inputStyle, width: 95 }} /></Field>
              <Field label="เงินโอน"><input type="number" min={0} value={bTransfer} onChange={(e) => setBTransfer(e.target.value)} style={{ ...inputStyle, width: 95 }} /></Field>
              <Field label="ทิป"><input type="number" min={0} value={bTip} onChange={(e) => setBTip(e.target.value)} style={{ ...inputStyle, width: 85 }} /></Field>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#B23A2E", margin: "0 0 10px" }}>ยอดขายเมนูอาหาร</h4>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Field label="เงินสด"><input type="number" min={0} value={fCash} onChange={(e) => setFCash(e.target.value)} style={{ ...inputStyle, width: 95 }} /></Field>
              <Field label="เงินโอน"><input type="number" min={0} value={fTransfer} onChange={(e) => setFTransfer(e.target.value)} style={{ ...inputStyle, width: 95 }} /></Field>
              <Field label="ทิป"><input type="number" min={0} value={fTip} onChange={(e) => setFTip(e.target.value)} style={{ ...inputStyle, width: 85 }} /></Field>
            </div>
          </div>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "#B99B6B" }}>เมนูน้ำ = ยอดขายทั้งหมด − (เบเกอรี่ + เมนูอาหาร) — ไม่ต้องกรอกเอง ระบบคำนวณให้อัตโนมัติ</p>
        <button onClick={addRevenue} style={{ ...primaryBtn, marginTop: 14 }}><Plus size={16} /> บันทึกยอดวันนี้</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, margin: "0 0 12px" }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>ตารางบันทึกยอดขายรายวัน</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, background: "#FFFFFF", padding: 4, borderRadius: 10, border: "1px solid #EADFC4" }}>
            <button
              onClick={() => setListUseCustomRange(false)}
              style={{ padding: "6px 12px", borderRadius: 7, border: "none", fontSize: 13, background: !listUseCustomRange ? "#2E1F0D" : "transparent", color: !listUseCustomRange ? "#FBF3E1" : "#6B4F2A", cursor: "pointer", fontWeight: 500 }}
            >ตามเดือน</button>
            <button
              onClick={() => setListUseCustomRange(true)}
              style={{ padding: "6px 12px", borderRadius: 7, border: "none", fontSize: 13, background: listUseCustomRange ? "#2E1F0D" : "transparent", color: listUseCustomRange ? "#FBF3E1" : "#6B4F2A", cursor: "pointer", fontWeight: 500 }}
            >กำหนดวันที่เอง</button>
          </div>
          {!listUseCustomRange ? (
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
              {monthOptions.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
            </select>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="date" value={listRangeFrom} onChange={(e) => setListRangeFrom(e.target.value)} style={inputStyle} />
              <span style={{ color: "#8A6E45", fontSize: 13 }}>ถึง</span>
              <input type="date" value={listRangeTo} onChange={(e) => setListRangeTo(e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>
      </div>
      <TableShell headers={["วันที่", "ยอดขายทั้งหมด", "เบเกอรี่", "อาหาร", "น้ำ (คำนวณ)", ""]}>
        {filteredSorted.map((r) => {
          const drink = computeDrinkGroup(r);
          return (
            <tr key={r.id}>
              <Td>{r.date}</Td>
              <Td style={{ fontWeight: 600 }}>฿{fmt(recTotalSum(r))}</Td>
              <Td>฿{fmt(grpSum(r.bakery))}</Td>
              <Td>฿{fmt(grpSum(r.food))}</Td>
              <Td style={{ color: "#4A320F" }}>฿{fmt(grpSum(drink))}</Td>
              <Td><DeleteBtn onClick={() => removeRevenue(r.id)} /></Td>
            </tr>
          );
        })}
        {filteredSorted.length === 0 && <EmptyRow colSpan={6} text="ไม่มีข้อมูลยอดขายในช่วงที่เลือก" />}
      </TableShell>

      <div ref={monthlySummaryRef}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, margin: "26px 0 12px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>สรุปยอดขายรายเดือน</h3>
          <ExportButtons targetRef={monthlySummaryRef} filename="สรุปยอดขายรายเดือน" />
        </div>

        <TableShell headers={["เดือน", "เบเกอรี่", "อาหาร", "น้ำ", "รวมทั้งสิ้น"]}>
          {filteredMonthlySummary.map(([key, v]) => (
            <tr key={key}>
              <Td>{monthLabel(key)}</Td>
              <Td>฿{fmt(v.bakery)}</Td>
              <Td>฿{fmt(v.food)}</Td>
              <Td>฿{fmt(v.drink)}</Td>
              <Td style={{ fontWeight: 600 }}>฿{fmt(v.total)}</Td>
            </tr>
          ))}
          {filteredMonthlySummary.length === 0 && <EmptyRow colSpan={5} text="ไม่มีข้อมูลในช่วงที่เลือก" />}
          {filteredMonthlySummary.length > 0 && (
            <tr style={{ background: "#FBF3E1" }}>
              <Td style={{ fontWeight: 700 }}>รวมทั้งหมด</Td>
              <Td style={{ fontWeight: 700 }}>฿{fmt(filteredGrandTotal.bakery)}</Td>
              <Td style={{ fontWeight: 700 }}>฿{fmt(filteredGrandTotal.food)}</Td>
              <Td style={{ fontWeight: 700 }}>฿{fmt(filteredGrandTotal.drink)}</Td>
              <Td style={{ fontWeight: 700 }}>฿{fmt(filteredGrandTotal.total)}</Td>
            </tr>
          )}
        </TableShell>
      </div>

      {/* สรุปยอดขายประจำเดือน (เดือนที่เลือก) */}
      <div style={{ background: "#2E1F0D", borderRadius: 14, padding: "18px 24px", margin: "26px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: "#E3A730", fontSize: 13, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>สรุปยอดขายประจำเดือน — {monthLabel(selectedMonth)}</div>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 36, fontWeight: 600, color: "#F4D793" }}>฿{fmt(selectedMonthSum)}</div>
          <div style={{ color: "#D9B979", fontSize: 13, marginTop: 4 }}>
            เบเกอรี่ ฿{fmt(selectedMonthTotal?.bakery || 0)} · อาหาร ฿{fmt(selectedMonthTotal?.food || 0)} · น้ำ ฿{fmt(selectedMonthTotal?.drink || 0)}
          </div>
          <div style={{ color: "#D9B979", fontSize: 13, marginTop: 2 }}>
            ยอดขายรวมทั้งหมดตั้งแต่เปิดร้าน ฿{fmt(allTimeTotal)} ({monthly.length} เดือน)
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#D9B979" }}>
            <Target size={13} /> Target รายวัน
            <input type="number" min={0} value={dailyTarget} onChange={(e) => setDailyTarget(Number(e.target.value) || 0)} style={{ ...inputStyle, width: 90, textAlign: "right", background: "#3A2712", color: "#FBF3E1", border: "1px solid #3A2712" }} />
            บาท/วัน
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#D9B979" }}>
            <Target size={13} /> Target รายเดือน
            <input type="number" min={0} value={monthlyTarget} onChange={(e) => setMonthlyTarget(Number(e.target.value) || 0)} style={{ ...inputStyle, width: 100, textAlign: "right", background: "#3A2712", color: "#FBF3E1", border: "1px solid #3A2712" }} />
            บาท/เดือน
          </div>
          <div style={{ fontSize: 13, color: selectedMonthSum >= monthlyTarget ? "#F4D793" : "#E8998C" }}>
            {selectedMonthSum >= monthlyTarget ? "ถึง Target รายเดือนแล้ว" : `ขาดอีก ฿${fmt(monthlyTarget - selectedMonthSum)}`}
          </div>
        </div>
      </div>

      {/* เลือกเดือนสำหรับกราฟรายวัน */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px", flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>กราฟยอดขายแต่ละวันในเดือนปัจจุบัน</h3>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
          {monthOptions.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
        </select>
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "20px", marginBottom: 26 }}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dailyChartData}>
            <CartesianGrid stroke="#EADFC4" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A6E45" }} axisLine={{ stroke: "#EADFC4" }} tickLine={false} />
            <YAxis tick={{ fontSize: 13, fill: "#8A6E45" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #EADFC4", fontSize: 14 }} formatter={(v) => `฿${fmt(v)}`} />
            <Line type="monotone" dataKey="ยอดขาย" stroke="#4A320F" strokeWidth={2.5} dot={{ r: 2.5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* กราฟยอดขายรายเดือน */}
      <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px", fontFamily: "'Roboto', sans-serif" }}>กราฟยอดขายรายเดือน</h3>
      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "20px", marginBottom: 26 }}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyChartData}>
            <CartesianGrid stroke="#EADFC4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8A6E45" }} axisLine={{ stroke: "#EADFC4" }} tickLine={false} />
            <YAxis tick={{ fontSize: 13, fill: "#8A6E45" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #EADFC4", fontSize: 14 }} formatter={(v) => `฿${fmt(v)}`} />
            <ReferenceLine y={monthlyTarget} stroke="#E3A730" strokeDasharray="5 4" label={{ value: `Target ฿${fmt(monthlyTarget)}`, position: "insideTopRight", fill: "#E3A730", fontSize: 12 }} />
            <Line type="monotone" dataKey="ยอดขาย" stroke="#4A320F" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* กราฟเทียบ Target รายวัน */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 4px", flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>กราฟสรุปยอดขายเทียบ Target แต่ละวัน</h3>
        <span style={{ fontSize: 13.5, color: "#8A6E45", display: "flex", alignItems: "center", gap: 6 }}>
          <Target size={13} /> Target ฿{fmt(dailyTarget)}/วัน
        </span>
      </div>
      <p style={{ margin: "0 0 12px", color: "#B99B6B", fontSize: 13 }}>
        {monthLabel(selectedMonth)}: ถึง Target {daysMeetingTarget} จาก {daysWithSales} วันที่มียอดขาย — รวมทั้งเดือน ฿{fmt(selectedMonthSum)} {selectedMonthSum >= monthlyTarget ? "(ถึง Target รายเดือนแล้ว)" : `(ขาดอีก ฿${fmt(monthlyTarget - selectedMonthSum)} ถึง Target รายเดือน)`}
      </p>
      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "20px" }}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dailyChartData}>
            <CartesianGrid stroke="#EADFC4" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A6E45" }} axisLine={{ stroke: "#EADFC4" }} tickLine={false} />
            <YAxis tick={{ fontSize: 13, fill: "#8A6E45" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #EADFC4", fontSize: 14 }} formatter={(v) => `฿${fmt(v)}`} />
            <ReferenceLine y={dailyTarget} stroke="#B23A2E" strokeDasharray="5 4" label={{ value: `Target ฿${fmt(dailyTarget)}`, position: "insideTopRight", fill: "#B23A2E", fontSize: 12 }} />
            <Bar dataKey="ยอดขาย" radius={[4, 4, 0, 0]}>
              {dailyChartData.map((d, i) => (
                <Cell key={i} fill={d.ยอดขาย >= dailyTarget ? "#4A320F" : "#E4D3AC"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* สรุปยอดขายทั้งหมดตั้งแต่เปิดร้าน */}
      <div style={{ background: "#2E1F0D", borderRadius: 14, padding: "18px 24px", margin: "26px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: "#E3A730", fontSize: 13, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>สรุปยอดขายทั้งหมดตั้งแต่เปิดร้าน</div>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 36, fontWeight: 600, color: "#F4D793" }}>฿{fmt(allTimeTotal)}</div>
          <div style={{ color: "#D9B979", fontSize: 13, marginTop: 4 }}>จำนวนเดือนที่มีข้อมูล {monthly.length} เดือน</div>
        </div>
        <div style={{ textAlign: "right", color: "#D9B979", fontSize: 13, fontFamily: "monospace" }}>
          <div>Target รายวัน ฿{fmt(dailyTarget)}/วัน</div>
          <div>Target รายเดือน ฿{fmt(monthlyTarget)}/เดือน</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Expenses tab: 6 หมวดหลัก + ตำแหน่งพนักงาน 5 ตำแหน่ง + หมวดย่อย ----------
function ExpensesTab({ expenses, setExpenses, addExpenseSynced, removeExpenseSynced, updateExpenseSynced, staffPositions, setStaffPositions, rangeProps, totalRevenue, filteredExpenses, revenue }) {
  const [date, setDate] = useState(todayStr());
  const [category, setCategory] = useState(RENT);
  const [subcategory, setSubcategory] = useState("");
  const [staffCount, setStaffCount] = useState(1);
  const [commission, setCommission] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptName, setReceiptName] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const onReceiptSelect = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setReceiptImage(e.target.result);
    reader.readAsDataURL(file);
    setReceiptName(file.name);
  };
  const clearReceipt = () => { setReceiptImage(null); setReceiptName(""); };

  const catDef = expenseMainCategories.find((c) => c.key === category);
  const selectedStaffUnit = staffPositions.find((p) => p.name === subcategory)?.unit || "คน";

  const recalcStaffAmount = (posName, count, comm) => {
    const pos = staffPositions.find((p) => p.name === posName);
    if (!pos) return;
    setAmount(String(pos.rate * (Number(count) || 0) + (Number(comm) || 0)));
  };

  const onCategoryChange = (val) => {
    setCategory(val);
    const def = expenseMainCategories.find((c) => c.key === val);
    if (def.kind === "sub") setSubcategory(def.subs[0]);
    else if (def.kind === "staff") {
      const first = staffPositions[0];
      setSubcategory(first?.name || "");
      setStaffCount(first?.count || 1);
      setCommission("");
      if (first) setAmount(String(first.rate * (first.count || 1)));
    } else setSubcategory("");
  };

  const onStaffChange = (name) => {
    setSubcategory(name);
    const pos = staffPositions.find((p) => p.name === name);
    if (pos) {
      setStaffCount(pos.count || 1);
      recalcStaffAmount(name, pos.count || 1, commission);
    }
  };
  const onStaffCountChange = (val) => { setStaffCount(val); recalcStaffAmount(subcategory, val, commission); };
  const onCommissionChange = (val) => { setCommission(val); recalcStaffAmount(subcategory, staffCount, val); };

  const resetForm = () => {
    setEditingId(null); setDate(todayStr()); setCategory(RENT); setSubcategory("");
    setAmount(""); setNote(""); setCommission(""); setStaffCount(1); clearReceipt();
  };

  const submitExpense = () => {
    if (!amount || Number(amount) <= 0) return;
    const record = { date, category, subcategory, amount: Number(amount), note, receiptImage };
    if (category === STAFF) { record.count = Number(staffCount) || 1; record.commission = Number(commission) || 0; record.unit = selectedStaffUnit; }
    if (editingId) {
      updateExpenseSynced(editingId, record);
    } else {
      addExpenseSynced(record);
    }
    resetForm();
  };
  const startEdit = (e) => {
    setEditingId(e.id); setDate(e.date); setCategory(e.category); setSubcategory(e.subcategory || "");
    setAmount(String(e.amount)); setNote(e.note || ""); setCommission(e.commission ? String(e.commission) : "");
    setStaffCount(e.count || 1); setReceiptImage(e.receiptImage || null);
  };
  const removeExpense = (id) => { removeExpenseSynced(id); if (editingId === id) resetForm(); };
  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1));

  // ตัวกรองตารางบันทึกรายจ่าย: เลือกเดือน หรือกำหนดช่วงวันที่เอง
  const expenseMonths = useMemo(() => {
    const set = new Set(expenses.map((e) => monthKey(e.date)));
    return [...set].sort();
  }, [expenses]);
  const [listSelectedMonth, setListSelectedMonth] = useState(monthKey(todayStr()));
  const [listUseCustomRange, setListUseCustomRange] = useState(false);
  const [listRangeFrom, setListRangeFrom] = useState(todayStr());
  const [listRangeTo, setListRangeTo] = useState(todayStr());
  const listMonthOptions = expenseMonths.includes(listSelectedMonth) ? expenseMonths : [...expenseMonths, listSelectedMonth].sort();

  const filteredSorted = useMemo(() => {
    if (listUseCustomRange) {
      return sorted.filter((e) => e.date >= listRangeFrom && e.date <= listRangeTo);
    }
    return sorted.filter((e) => monthKey(e.date) === listSelectedMonth);
  }, [sorted, listUseCustomRange, listRangeFrom, listRangeTo, listSelectedMonth]);

  const updatePosition = (id, field, val) => {
    setStaffPositions(staffPositions.map((p) => (p.id === id ? { ...p, [field]: (field === "rate" || field === "count") ? Number(val) || 0 : val } : p)));
  };
  const addPosition = () => setStaffPositions([...staffPositions, { id: `p${Date.now()}`, name: "ตำแหน่งใหม่", rate: 0, count: 1, unit: "คน", note: "" }]);
  const removePosition = (id) => setStaffPositions(staffPositions.filter((p) => p.id !== id));

  // สรุปผลรวมรายจ่ายแต่ละหมวด — เงินทุนหมุนเวียนแยกย่อยตาม บาร์/ครัว/เค้ก/ส่วนกลาง + % เทียบยอดขาย
  const categorySummary = useMemo(() => {
    const rows = [];
    [RENT, STAFF, UTILITIES].forEach((cat) => {
      rows.push({ label: cat, amount: filteredExpenses.filter((e) => e.category === cat).reduce((s, e) => s + Number(e.amount || 0), 0) });
    });
    WC_SUBS.forEach((sub) => {
      rows.push({ label: `เงินทุนหมุนเวียน — ${sub}`, amount: filteredExpenses.filter((e) => e.category === WORKING_CAPITAL && e.subcategory === sub).reduce((s, e) => s + Number(e.amount || 0), 0) });
    });
    [TAX, RESERVE].forEach((cat) => {
      rows.push({ label: cat, amount: filteredExpenses.filter((e) => e.category === cat).reduce((s, e) => s + Number(e.amount || 0), 0) });
    });
    return rows.map((r) => ({ ...r, pct: totalRevenue ? (r.amount / totalRevenue) * 100 : 0 }));
  }, [filteredExpenses, totalRevenue]);
  const categoryTotal = categorySummary.reduce((s, c) => s + c.amount, 0);
  const categoryTotalPct = totalRevenue ? (categoryTotal / totalRevenue) * 100 : 0;

  // สรุปรายจ่ายทั้งหมดเทียบเป็นเดือนๆ + ยอดขายเดือนนั้นสำหรับกราฟคู่
  const monthlyComparison = useMemo(() => {
    const expMap = {};
    expenses.forEach((e) => { const k = monthKey(e.date); expMap[k] = (expMap[k] || 0) + Number(e.amount || 0); });
    const revMap = {};
    revenue.forEach((r) => {
      const k = monthKey(r.date);
      revMap[k] = (revMap[k] || 0) + recTotalSum(r);
    });
    const allKeys = [...new Set([...Object.keys(expMap), ...Object.keys(revMap)])].sort();
    return allKeys.map((key) => ({
      key, label: monthLabel(key),
      รายจ่าย: expMap[key] || 0,
      รายรับ: revMap[key] || 0,
    }));
  }, [expenses, revenue]);

  const exportRef = useRef(null);
  const monthlySummaryRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>บันทึกรายจ่าย</h1>
        <ExportButtons targetRef={exportRef} filename="บันทึกรายจ่าย" />
      </div>
      <p style={{ margin: "0 0 20px", color: "#8A6E45", fontSize: 15 }}>แบ่ง 6 หมวดหลัก: ค่าเช่า / ค่าจ้างพนักงาน / ค่าสาธารณูปโภค / เงินทุนหมุนเวียน / ค่าภาษี / เงินทุนสำรองและซ่อมแซม</p>


      {/* จัดการตำแหน่งพนักงานและค่าจ้าง */}
      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showStaffPanel ? 10 : 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B4F2A", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={14} /> ตำแหน่งพนักงานและอัตราค่าจ้าง ({staffPositions.length} ตำแหน่ง)
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            {showStaffPanel && <button onClick={addPosition} style={{ ...primaryBtn, padding: "6px 12px", fontSize: 13 }}><Plus size={14} /> เพิ่มตำแหน่ง</button>}
            <button onClick={() => setShowStaffPanel(!showStaffPanel)} style={{ ...primaryBtn, padding: "6px 12px", fontSize: 13.5, background: showStaffPanel ? "#FBF3E1" : "#2E1F0D", color: showStaffPanel ? "#6B4F2A" : "#FBF3E1", border: showStaffPanel ? "1px solid #EADFC4" : "none" }}>
              {showStaffPanel ? "ซ่อน" : "แก้ไขค่าจ้าง"}
            </button>
          </div>
        </div>
        {showStaffPanel && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {staffPositions.map((p) => (
              <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "6px 0", borderBottom: "1px solid #F1E7D0" }}>
                <input type="text" value={p.name} onChange={(e) => updatePosition(p.id, "name", e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 130 }} />
                <span style={{ fontSize: 13.5, color: "#8A6E45" }}>ค่าจ้าง/{p.unit || "คน"}</span>
                <input type="number" min={0} value={p.rate} onChange={(e) => updatePosition(p.id, "rate", e.target.value)} style={{ ...inputStyle, width: 90, textAlign: "right" }} />
                <span style={{ fontSize: 13.5, color: "#8A6E45" }}>บาท</span>
                <select value={p.unit || "คน"} onChange={(e) => updatePosition(p.id, "unit", e.target.value)} style={{ ...inputStyle, width: 75 }}>
                  <option value="คน">คน</option>
                  <option value="วัน">วัน</option>
                </select>
                <input type="number" min={0} value={p.count} onChange={(e) => updatePosition(p.id, "count", e.target.value)} style={{ ...inputStyle, width: 60, textAlign: "right" }} />
                <input type="text" placeholder="หมายเหตุ" value={p.note || ""} onChange={(e) => updatePosition(p.id, "note", e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
                <span style={{ fontSize: 13, color: "#B99B6B" }}>รวม ฿{fmt(p.rate * p.count)}</span>
                <DeleteBtn onClick={() => removePosition(p.id)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ฟอร์มเพิ่มรายจ่าย */}
      {editingId && (
        <div style={{ marginBottom: 8, fontSize: 13, color: "#8A4A12", display: "flex", alignItems: "center", gap: 8 }}>
          กำลังแก้ไขรายการ
          <button onClick={resetForm} style={{ background: "transparent", border: "none", color: "#B23A2E", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 13 }}>
            <X size={13} /> ยกเลิก
          </button>
        </div>
      )}
      <div style={{ background: "#FFFFFF", border: `1px solid ${editingId ? "#E3A730" : "#EADFC4"}`, borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18, display: "flex", gap: 12, alignItems: "end", marginBottom: 22, flexWrap: "wrap" }}>
        <Field label="วันที่"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} /></Field>
        <Field label="หมวดหมู่หลัก">
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)} style={{ ...inputStyle, minWidth: 190 }}>
            {expenseMainCategories.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
          </select>
        </Field>

        {catDef.kind === "sub" && (
          <Field label="หมวดย่อย">
            <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} style={{ ...inputStyle, minWidth: 120 }}>
              {catDef.subs.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        )}
        {catDef.kind === "staff" && (
          <>
            <Field label="ตำแหน่ง">
              <select value={subcategory} onChange={(e) => onStaffChange(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                {staffPositions.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </Field>
            <Field label={`จำนวน${selectedStaffUnit}`}>
              <input type="number" min={0} value={staffCount} onChange={(e) => onStaffCountChange(e.target.value)} style={{ ...inputStyle, width: 80 }} />
            </Field>
            <Field label="ค่าคอมมิชชั่น (ถ้ามี)">
              <input type="number" min={0} value={commission} onChange={(e) => onCommissionChange(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 110 }} />
            </Field>
          </>
        )}

        <Field label="จำนวนเงิน (บาท)"><input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...inputStyle, width: 120 }} /></Field>
        <Field label="หมายเหตุ"><input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น จ่ายเรียบร้อย" style={{ ...inputStyle, minWidth: 160 }} /></Field>
        <Field label="แนบรูปบิล/สลิป (ถ้ามี)">
          <label style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            border: "1px dashed #D9B979", borderRadius: 8, padding: "7px 12px", fontSize: 13.5, color: "#8A6E45", background: "#FBF3E1",
          }}>
            <ImageIcon size={14} />
            {receiptImage ? "เปลี่ยนรูป" : "เลือกรูป"}
            <input type="file" accept="image/*" onChange={(e) => onReceiptSelect(e.target.files?.[0])} style={{ display: "none" }} />
          </label>
        </Field>
        {receiptImage && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <img src={receiptImage} alt="ตัวอย่างสลิป" onClick={() => setLightboxImage(receiptImage)} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, border: "1px solid #EADFC4", cursor: "pointer" }} />
            <button onClick={clearReceipt} style={{ background: "transparent", border: "none", color: "#B99B6B", cursor: "pointer", display: "flex" }} title="เอารูปออก">
              <Trash2 size={14} />
            </button>
          </div>
        )}
        <button onClick={submitExpense} style={primaryBtn}>{editingId ? <><Pencil size={15} /> บันทึกการแก้ไข</> : <><Plus size={16} /> เพิ่มรายจ่าย</>}</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, margin: "0 0 12px" }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>ตารางบันทึกรายจ่าย</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, background: "#FFFFFF", padding: 4, borderRadius: 10, border: "1px solid #EADFC4" }}>
            <button
              onClick={() => setListUseCustomRange(false)}
              style={{ padding: "6px 12px", borderRadius: 7, border: "none", fontSize: 13, background: !listUseCustomRange ? "#2E1F0D" : "transparent", color: !listUseCustomRange ? "#FBF3E1" : "#6B4F2A", cursor: "pointer", fontWeight: 500 }}
            >ตามเดือน</button>
            <button
              onClick={() => setListUseCustomRange(true)}
              style={{ padding: "6px 12px", borderRadius: 7, border: "none", fontSize: 13, background: listUseCustomRange ? "#2E1F0D" : "transparent", color: listUseCustomRange ? "#FBF3E1" : "#6B4F2A", cursor: "pointer", fontWeight: 500 }}
            >กำหนดวันที่เอง</button>
          </div>
          {!listUseCustomRange ? (
            <select value={listSelectedMonth} onChange={(e) => setListSelectedMonth(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
              {listMonthOptions.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
            </select>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="date" value={listRangeFrom} onChange={(e) => setListRangeFrom(e.target.value)} style={inputStyle} />
              <span style={{ color: "#8A6E45", fontSize: 13 }}>ถึง</span>
              <input type="date" value={listRangeTo} onChange={(e) => setListRangeTo(e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>
      </div>
      <TableShell headers={["วันที่", "หมวดหมู่", "รายละเอียด", "จำนวนเงิน", "หมายเหตุ", "หลักฐาน", "", ""]}>
        {filteredSorted.map((e) => (
          <tr key={e.id} style={{ background: editingId === e.id ? "#FBEFD6" : "transparent" }}>
            <Td>{e.date}</Td>
            <Td>{e.category}</Td>
            <Td style={{ color: "#8A6E45" }}>
              {e.subcategory || "—"}
              {e.category === STAFF && (
                <div style={{ fontSize: 12.5, color: "#B99B6B" }}>
                  {e.count || 1} {e.unit || "คน"}{e.commission ? ` + คอมมิชชั่น ฿${fmt(e.commission)}` : ""}
                </div>
              )}
            </Td>
            <Td style={{ fontWeight: 600, color: "#B23A2E" }}>−฿{fmt(e.amount)}</Td>
            <Td style={{ color: "#8A6E45" }}>{e.note || "—"}</Td>
            <Td>
              {e.receiptImage ? (
                <img src={e.receiptImage} alt="หลักฐาน" onClick={() => setLightboxImage(e.receiptImage)} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid #EADFC4", cursor: "pointer" }} />
              ) : (
                <span style={{ color: "#C9B896", fontSize: 13 }}>—</span>
              )}
            </Td>
            <Td><EditBtn onClick={() => startEdit(e)} /></Td>
            <Td><DeleteBtn onClick={() => removeExpense(e.id)} /></Td>
          </tr>
        ))}
        {filteredSorted.length === 0 && <EmptyRow colSpan={8} text="ไม่มีรายการรายจ่ายในช่วงที่เลือก" />}
      </TableShell>


      <h3 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 4px", fontFamily: "'Roboto', sans-serif" }}>สรุปผลรวมรายจ่ายแต่ละหมวด</h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px", flexWrap: "wrap", gap: 10 }}>
        <RangePicker {...rangeProps} />
      </div>
      <p style={{ margin: "0 0 12px", color: "#B99B6B", fontSize: 13 }}>% คือสัดส่วนรายจ่ายแต่ละหมวดเทียบกับยอดขายรวมในช่วงวันที่ที่เลือก</p>
      <TableShell headers={["หมวดหมู่", "รวมรายจ่าย", "% เทียบยอดขาย"]}>
        {categorySummary.map((c) => (
          <tr key={c.label}>
            <Td style={{ fontWeight: 500 }}>{c.label}</Td>
            <Td style={{ fontWeight: 600, color: "#B23A2E" }}>−฿{fmt(c.amount)}</Td>
            <Td>{c.pct.toFixed(1)}%</Td>
          </tr>
        ))}
        <tr style={{ background: "#FBF3E1" }}>
          <Td style={{ fontWeight: 700 }}>รวมรายจ่ายทั้งหมด</Td>
          <Td style={{ fontWeight: 700, color: "#B23A2E" }}>−฿{fmt(categoryTotal)}</Td>
          <Td style={{ fontWeight: 700 }}>{categoryTotalPct.toFixed(1)}%</Td>
        </tr>
      </TableShell>

      <div ref={monthlySummaryRef}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0 4px", flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>สรุปรายจ่ายทั้งหมดเทียบเป็นเดือนๆ</h3>
          <ExportButtons targetRef={monthlySummaryRef} filename="สรุปรายจ่ายรายเดือน" />
        </div>
        <p style={{ margin: "0 0 12px", color: "#B99B6B", fontSize: 13 }}>เทียบรายจ่ายกับรายรับของแต่ละเดือน (ทุกเดือนที่มีข้อมูล)</p>
        <TableShell headers={["เดือน", "รายรับ", "รายจ่าย", "คงเหลือ"]}>
          {monthlyComparison.map((m) => (
            <tr key={m.key}>
              <Td>{m.label}</Td>
              <Td style={{ color: "#4A320F", fontWeight: 500 }}>฿{fmt(m.รายรับ)}</Td>
              <Td style={{ color: "#B23A2E", fontWeight: 500 }}>−฿{fmt(m.รายจ่าย)}</Td>
              <Td style={{ fontWeight: 700, color: m.รายรับ - m.รายจ่าย >= 0 ? "#4A320F" : "#B23A2E" }}>฿{fmt(m.รายรับ - m.รายจ่าย)}</Td>
            </tr>
          ))}
          {monthlyComparison.length === 0 && <EmptyRow colSpan={4} text="ยังไม่มีข้อมูล" />}
        </TableShell>

        <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "20px", marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid stroke="#EADFC4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#8A6E45" }} axisLine={{ stroke: "#EADFC4" }} tickLine={false} />
              <YAxis tick={{ fontSize: 13, fill: "#8A6E45" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #EADFC4", fontSize: 14 }} formatter={(v) => `฿${fmt(v)}`} />
              <Legend wrapperStyle={{ fontSize: 14 }} />
              <Bar dataKey="รายรับ" fill="#4A320F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="รายจ่าย" fill="#B23A2E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(46,31,13,0.75)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24, cursor: "zoom-out",
          }}
        >
          <button
            onClick={() => setLightboxImage(null)}
            style={{
              position: "absolute", top: 20, right: 24, background: "#FFFFFF", border: "none", borderRadius: 999,
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <X size={18} color="#2E1F0D" />
          </button>
          <img
            src={lightboxImage}
            alt="หลักฐานการจ่าย"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}
          />
        </div>
      )}
    </div>
  );
}

// ---------- สรุปรายได้-รายจ่าย + แบ่งกำไรท้ายเดือน ----------
function SplitTab({ rangeProps, generalTotal, bakeryTotal, foodTotal, drinkTotal, totalRevenue, totalExpenses, menu, revenue, expenses, filteredExpenses }) {
  const [partners, setPartners] = useState([
    { id: "pt1", name: "พี่แบงค์", pct: 76 },
    { id: "pt2", name: "พี่ต้น", pct: 24 },
  ]);
  const [generalPct, setGeneralPct] = useState(30);
  const [taxPct, setTaxPct] = useState(5);
  const [reservePct, setReservePct] = useState(3);

  const isBakeryWC = (e) => e.category === WORKING_CAPITAL && e.subcategory === "เค้ก";

  // ตาราง 1 (ตามช่วงวันที่ที่เลือกด้านบน) — ค่าเช่า/ค่าจ้าง/สาธารณูปโภค จากรายการจริง
  // เงินทุนหมุนเวียน/ภาษี/เงินทุนสำรอง คำนวณจาก % ของยอดขาย (อาหาร+น้ำ)
  const rentRange = filteredExpenses.filter((e) => e.category === RENT).reduce((s, e) => s + Number(e.amount || 0), 0);
  const staffRange = filteredExpenses.filter((e) => e.category === STAFF).reduce((s, e) => s + Number(e.amount || 0), 0);
  const utilitiesRange = filteredExpenses.filter((e) => e.category === UTILITIES).reduce((s, e) => s + Number(e.amount || 0), 0);
  const workingCapitalRange = generalTotal * (generalPct / 100);
  const taxRange = generalTotal * (taxPct / 100);
  const reserveRange = generalTotal * (reservePct / 100);
  const table1ExpenseRange = rentRange + staffRange + utilitiesRange + workingCapitalRange + taxRange + reserveRange;
  const table1Net = generalTotal - table1ExpenseRange;

  // ตาราง 2 (เบเกอรี่ล้วน ตามช่วงวันที่ที่เลือก) — ยังใช้รายจ่ายจริงหมวดเงินทุนหมุนเวียน "เค้ก"
  const table2ExpenseRange = filteredExpenses.filter(isBakeryWC).reduce((s, e) => s + Number(e.amount || 0), 0);
  const table2Net = bakeryTotal - table2ExpenseRange;

  // รายได้สรุปประจำเดือน (ทุกเดือนที่มีข้อมูล)
  const monthlyRevenue = useMemo(() => {
    const map = {};
    revenue.forEach((r) => {
      const key = monthKey(r.date);
      if (!map[key]) map[key] = { bakery: 0, food: 0, drink: 0 };
      map[key].bakery += grpSum(r.bakery);
      map[key].food += grpSum(r.food);
      map[key].drink += grpSum(computeDrinkGroup(r));
    });
    return map;
  }, [revenue]);
  const monthlyRevenueRows = Object.entries(monthlyRevenue).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  // รายจ่ายประจำเดือน — ตาราง 1 (ค่าเช่า/ค่าจ้าง/สาธารณูปโภคจริง + เงินทุนหมุนเวียน/ภาษี/สำรองแบบ %) และตาราง 2 (เบเกอรี่ล้วน จากรายจ่ายจริง)
  const monthlyBreakdown = useMemo(() => {
    const rentMap = {}, staffMap = {}, utilMap = {}, expTable2 = {};
    expenses.forEach((e) => {
      const key = monthKey(e.date);
      if (e.category === RENT) rentMap[key] = (rentMap[key] || 0) + Number(e.amount || 0);
      else if (e.category === STAFF) staffMap[key] = (staffMap[key] || 0) + Number(e.amount || 0);
      else if (e.category === UTILITIES) utilMap[key] = (utilMap[key] || 0) + Number(e.amount || 0);
      else if (isBakeryWC(e)) expTable2[key] = (expTable2[key] || 0) + Number(e.amount || 0);
    });
    const allMonths = new Set([...Object.keys(rentMap), ...Object.keys(staffMap), ...Object.keys(utilMap), ...Object.keys(expTable2), ...Object.keys(monthlyRevenue)]);
    return [...allMonths].sort((a, b) => (a < b ? 1 : -1)).map((key) => {
      const rev = monthlyRevenue[key] || { bakery: 0, food: 0, drink: 0 };
      const revGeneral = rev.food + rev.drink;
      const rent = rentMap[key] || 0;
      const staff = staffMap[key] || 0;
      const utilities = utilMap[key] || 0;
      const workingCapital = revGeneral * (generalPct / 100);
      const tax = revGeneral * (taxPct / 100);
      const reserve = revGeneral * (reservePct / 100);
      const exp1 = rent + staff + utilities + workingCapital + tax + reserve;
      const exp2 = expTable2[key] || 0;
      return {
        key, revGeneral, rent, staff, utilities, workingCapital, tax, reserve, exp1, net1: revGeneral - exp1,
        revBakery: rev.bakery, exp2, net2: rev.bakery - exp2,
      };
    });
  }, [expenses, monthlyRevenue, generalPct, taxPct, reservePct]);

  const allTimeNet1 = monthlyBreakdown.reduce((s, m) => s + m.net1, 0);
  const allTimeNet2 = monthlyBreakdown.reduce((s, m) => s + m.net2, 0);
  const partnerPctTotal = partners.reduce((s, p) => s + p.pct, 0);
  const updatePartner = (id, field, val) => {
    setPartners(partners.map((p) => (p.id === id ? { ...p, [field]: field === "pct" ? Number(val) || 0 : val } : p)));
  };

  const exportRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>สรุปรายได้-รายจ่าย / แบ่งกำไรท้ายเดือน</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <RangePicker {...rangeProps} />
          <ExportButtons targetRef={exportRef} filename="สรุปรายได้-รายจ่าย" />
        </div>
      </div>
      <p style={{ margin: "4px 0 20px", color: "#8A6E45", fontSize: 15 }}>แยกรายงานเบเกอรี่ออกจากเมนูทั่วไป (อาหาร+เครื่องดื่ม) ทั้งฝั่งรายได้และรายจ่าย</p>

      <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 10px", fontFamily: "'Roboto', sans-serif" }}>รายได้สรุปประจำเดือน</h3>
      <TableShell headers={["เดือน", "เบเกอรี่", "เมนูอาหาร", "เมนูน้ำ", "รวมทั้งสิ้น"]}>
        {monthlyRevenueRows.map(([key, v]) => (
          <tr key={key}>
            <Td>{monthLabel(key)}</Td>
            <Td>฿{fmt(v.bakery)}</Td>
            <Td>฿{fmt(v.food)}</Td>
            <Td>฿{fmt(v.drink)}</Td>
            <Td style={{ fontWeight: 600 }}>฿{fmt(v.bakery + v.food + v.drink)}</Td>
          </tr>
        ))}
        {monthlyRevenueRows.length === 0 && <EmptyRow colSpan={5} text="ยังไม่มีข้อมูล" />}
      </TableShell>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 0 10px", flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>รายจ่ายประจำเดือน — ตาราง 1 (เมนูทั่วไป ไม่รวมเบเกอรี่)</h3>
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 13.5, color: "#8A6E45" }}>
          <span>เงินทุนหมุนเวียน (อาหาร+น้ำ) <input type="number" min={0} max={100} value={generalPct} onChange={(e) => setGeneralPct(Number(e.target.value) || 0)} style={{ ...inputStyle, width: 55, textAlign: "right", padding: "4px 6px" }} />%</span>
          <span>ภาษี <input type="number" min={0} max={100} value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value) || 0)} style={{ ...inputStyle, width: 55, textAlign: "right", padding: "4px 6px" }} />%</span>
          <span>สำรอง <input type="number" min={0} max={100} value={reservePct} onChange={(e) => setReservePct(Number(e.target.value) || 0)} style={{ ...inputStyle, width: 55, textAlign: "right", padding: "4px 6px" }} />%</span>
        </div>
      </div>
      <p style={{ margin: "0 0 10px", color: "#B99B6B", fontSize: 13 }}>
        ค่าเช่า / ค่าจ้างพนักงาน / สาธารณูปโภค รวมจากรายการที่บันทึกจริง — เงินทุนหมุนเวียน / ภาษี / เงินทุนสำรอง คำนวณจากยอดขาย (อาหาร+น้ำ) เดือนนั้นตาม % ด้านบน (เบเกอรี่แยกไปตาราง 2)
      </p>
      <TableShell headers={["เดือน", "ค่าเช่า", "ค่าจ้างพนักงาน", "สาธารณูปโภค", "เงินทุนหมุนเวียนทั่วไป", "ภาษี", "เงินทุนสำรอง", "รวมรายจ่าย", "กำไรสุทธิ"]}>
        {monthlyBreakdown.map((m) => (
          <tr key={m.key}>
            <Td>{monthLabel(m.key)}</Td>
            <Td>฿{fmt(m.rent)}</Td>
            <Td>฿{fmt(m.staff)}</Td>
            <Td>฿{fmt(m.utilities)}</Td>
            <Td>฿{fmt(m.workingCapital)}</Td>
            <Td>฿{fmt(m.tax)}</Td>
            <Td>฿{fmt(m.reserve)}</Td>
            <Td style={{ fontWeight: 600, color: "#B23A2E" }}>−฿{fmt(m.exp1)}</Td>
            <Td style={{ fontWeight: 600, color: m.net1 >= 0 ? "#4A320F" : "#B23A2E" }}>฿{fmt(m.net1)}</Td>
          </tr>
        ))}
        {monthlyBreakdown.length === 0 && <EmptyRow colSpan={9} text="ยังไม่มีข้อมูล" />}
      </TableShell>

      <h3 style={{ fontSize: 16, fontWeight: 600, margin: "26px 0 10px", fontFamily: "'Roboto', sans-serif" }}>รายจ่ายประจำเดือน — ตาราง 2 (เบเกอรี่)</h3>
      <TableShell headers={["เดือน", "รายจ่ายเบเกอรี่ประจำเดือน", "ยอดขายเบเกอรี่ประจำเดือน", "กำไรสุทธิ"]}>
        {monthlyBreakdown.map((m) => (
          <tr key={m.key}>
            <Td>{monthLabel(m.key)}</Td>
            <Td style={{ color: "#B23A2E" }}>−฿{fmt(m.exp2)}</Td>
            <Td>฿{fmt(m.revBakery)}</Td>
            <Td style={{ fontWeight: 600, color: m.net2 >= 0 ? "#4A320F" : "#B23A2E" }}>฿{fmt(m.net2)}</Td>
          </tr>
        ))}
        {monthlyBreakdown.length === 0 && <EmptyRow colSpan={4} text="ยังไม่มีข้อมูล" />}
      </TableShell>

      <h3 style={{ fontSize: 18, fontWeight: 600, margin: "30px 0 12px", fontFamily: "'Roboto', sans-serif" }}>สรุปกำไรตามช่วงวันที่ที่เลือกด้านบน</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#4A320F", margin: "0 0 10px" }}>ตาราง 1 — เมนูทั่วไป</h3>
          <div style={{ fontSize: 13.5, color: "#8A6E45", marginBottom: 4 }}>
            ยอดขาย (อาหาร+น้ำ) ฿{fmt(generalTotal)} − รายจ่าย (ค่าเช่า+ค่าจ้าง+สาธารณูปโภคจริง ฿{fmt(rentRange + staffRange + utilitiesRange)} + เงินทุนหมุนเวียน {generalPct}% ฿{fmt(workingCapitalRange)} + ภาษี ฿{fmt(taxRange)} + สำรอง ฿{fmt(reserveRange)})
          </div>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, color: table1Net >= 0 ? "#4A320F" : "#B23A2E" }}>฿{fmt(table1Net)}</div>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#E3A730", margin: "0 0 10px" }}>ตาราง 2 — เบเกอรี่</h3>
          <div style={{ fontSize: 13.5, color: "#8A6E45", marginBottom: 4 }}>ยอดขายเบเกอรี่ ฿{fmt(bakeryTotal)} − รายจ่ายเบเกอรี่ ฿{fmt(table2ExpenseRange)}</div>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, color: table2Net >= 0 ? "#4A320F" : "#B23A2E" }}>฿{fmt(table2Net)}</div>
        </div>
      </div>

      {/* แบ่งกำไรตามหุ้นส่วน */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "30px 0 12px", flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>แบ่งกำไรตามหุ้นส่วน</h3>
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 13.5, color: "#8A6E45", flexWrap: "wrap" }}>
          {partners.map((p) => (
            <span key={p.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="text" value={p.name} onChange={(e) => updatePartner(p.id, "name", e.target.value)} style={{ ...inputStyle, width: 90, padding: "4px 6px" }} />
              <input type="number" min={0} max={100} value={p.pct} onChange={(e) => updatePartner(p.id, "pct", e.target.value)} style={{ ...inputStyle, width: 55, textAlign: "right", padding: "4px 6px" }} />%
            </span>
          ))}
        </div>
      </div>
      {partnerPctTotal !== 100 && (
        <p style={{ margin: "0 0 10px", color: "#B23A2E", fontSize: 13 }}>รวมสัดส่วนหุ้นส่วนตอนนี้ {partnerPctTotal}% — ควรรวมให้ครบ 100%</p>
      )}
      <p style={{ margin: "0 0 12px", color: "#B99B6B", fontSize: 13 }}>คำนวณจากกำไรสุทธิของตาราง 1 และตาราง 2 ตามช่วงวันที่ที่เลือกด้านบน</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div style={{ background: "#2E1F0D", borderRadius: 14, padding: 18 }}>
          <div style={{ color: "#E3A730", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>จากตาราง 1 (เมนูทั่วไป) — กำไร ฿{fmt(table1Net)}</div>
          {partners.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", color: "#F4D793", fontSize: 14, marginBottom: 4 }}>
              <span>{p.name} ({p.pct}%)</span><span>฿{fmt(table1Net * p.pct / 100)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#2E1F0D", borderRadius: 14, padding: 18 }}>
          <div style={{ color: "#E3A730", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>จากตาราง 2 (เบเกอรี่) — กำไร ฿{fmt(table2Net)}</div>
          {partners.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", color: "#F4D793", fontSize: 14, marginBottom: 4 }}>
              <span>{p.name} ({p.pct}%)</span><span>฿{fmt(table2Net * p.pct / 100)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#2E1F0D", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: "#E3A730", fontSize: 13, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>แบ่งกำไรทั้งหมด (ทุกเดือนที่มีข้อมูล — ตาราง 1 + ตาราง 2)</div>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 32, fontWeight: 600, color: (allTimeNet1 + allTimeNet2) >= 0 ? "#F4D793" : "#E8998C" }}>฿{fmt(allTimeNet1 + allTimeNet2)}</div>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {partners.map((p) => (
            <div key={p.id} style={{ textAlign: "right" }}>
              <div style={{ color: "#D9B979", fontSize: 13 }}>{p.name} ({p.pct}%)</div>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 24, fontWeight: 600, color: "#F4D793" }}>฿{fmt((allTimeNet1 + allTimeNet2) * (p.pct / 100))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- วิเคราะห์ยอดขายรายสินค้า: เทียบรายได้-รายจ่ายแยกหมวด บาร์/ครัว/เบเกอรี่ ----------
function AnalysisTab({ revenue, expenses }) {
  const [range, setRange] = useState("today");
  const [customFrom, setCustomFrom] = useState(todayStr());
  const [customTo, setCustomTo] = useState(todayStr());
  const rangeProps = { range, setRange, customFrom, setCustomFrom, customTo, setCustomTo };

  const { cutoff, upper } = useMemo(() => {
    const d = new Date();
    if (range === "today") return { cutoff: todayStr(), upper: todayStr() };
    if (range === "7d") { d.setDate(d.getDate() - 6); return { cutoff: d.toISOString().slice(0, 10), upper: todayStr() }; }
    if (range === "30d") { d.setDate(d.getDate() - 29); return { cutoff: d.toISOString().slice(0, 10), upper: todayStr() }; }
    if (range === "custom") return { cutoff: customFrom, upper: customTo };
    return { cutoff: "0000-00-00", upper: "9999-99-99" };
  }, [range, customFrom, customTo]);

  const filteredRevenue = revenue.filter((r) => r.date >= cutoff && r.date <= upper);
  const filteredExpenses = expenses.filter((e) => e.date >= cutoff && e.date <= upper);

  const totalRevenue = filteredRevenue.reduce((s, r) => s + recTotalSum(r), 0);
  const bakeryRev = filteredRevenue.reduce((s, r) => s + grpSum(r.bakery), 0);
  const foodRev = filteredRevenue.reduce((s, r) => s + grpSum(r.food), 0);
  const drinkRev = filteredRevenue.reduce((s, r) => s + grpSum(computeDrinkGroup(r)), 0);

  const wcAmount = (sub) => filteredExpenses.filter((e) => e.category === WORKING_CAPITAL && e.subcategory === sub).reduce((s, e) => s + Number(e.amount || 0), 0);

  const rows = [
    { label: "หมวดบาร์ (เมนูน้ำ)", revenue: drinkRev, expense: wcAmount("บาร์") },
    { label: "หมวดครัว (เมนูอาหาร)", revenue: foodRev, expense: wcAmount("ครัว") },
    { label: "หมวดเบเกอรี่", revenue: bakeryRev, expense: wcAmount("เค้ก") },
  ].map((r) => ({ ...r, profit: r.revenue - r.expense, pct: r.revenue ? ((r.revenue - r.expense) / r.revenue) * 100 : 0 }));

  const pieData = rows.filter((r) => r.revenue > 0).map((r) => ({ name: r.label, value: r.revenue }));

  const exportRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>วิเคราะห์ยอดขายรายสินค้า</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <RangePicker {...rangeProps} />
          <ExportButtons targetRef={exportRef} filename="วิเคราะห์ยอดขายรายสินค้า" />
        </div>
      </div>
      <p style={{ margin: "4px 0 20px", color: "#8A6E45", fontSize: 15 }}>เทียบรายได้และรายจ่ายแยกตามหมวดสินค้า (ลิงก์ข้อมูลจากหน้าบันทึกยอดขายรายวัน) พร้อม % กำไรของแต่ละหมวด</p>

      <div style={{ background: "#2E1F0D", borderRadius: 14, padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: "#E3A730", fontSize: 12.5, fontWeight: 600, letterSpacing: 1 }}>สรุปรายได้ทั้งหมด (ตามช่วงที่เลือก)</div>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 34, fontWeight: 700, color: "#F4D793" }}>฿{fmt(totalRevenue)}</div>
        </div>
        <TrendingUp size={42} color="#D9B979" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <TableShell headers={["หมวดหมู่", "รายได้", "รายจ่าย", "กำไร", "% กำไร"]}>
          {rows.map((r) => (
            <tr key={r.label}>
              <Td style={{ fontWeight: 500 }}>{r.label}</Td>
              <Td style={{ color: "#4A320F" }}>฿{fmt(r.revenue)}</Td>
              <Td style={{ color: "#B23A2E" }}>−฿{fmt(r.expense)}</Td>
              <Td style={{ fontWeight: 600, color: r.profit >= 0 ? "#4A320F" : "#B23A2E" }}>฿{fmt(r.profit)}</Td>
              <Td>{r.pct.toFixed(1)}%</Td>
            </tr>
          ))}
        </TableShell>
        <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>สัดส่วนรายได้ตามหมวด</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={62}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `฿${fmt(v)}`} contentStyle={{ borderRadius: 8, border: "1px solid #EADFC4", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {pieData.map((c, i) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span style={{ flex: 1, color: "#3A2712" }}>{c.name}</span>
                    <span style={{ color: "#6B4F2A", fontWeight: 500 }}>฿{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p style={{ color: "#B99B6B", fontSize: 13 }}>ไม่มีข้อมูลในช่วงที่เลือก</p>}
        </div>
      </div>
    </div>
  );
}

// ---------- Payroll: สลิปเงินเดือนพนักงาน ----------
const THAI_MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const toBE = (y) => y + 543;
const formatThaiDateFull = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${THAI_MONTHS_FULL[d.getMonth()]} ${toBE(d.getFullYear())}`;
};
const formatThaiRange = (fromStr, toStr) => {
  if (!fromStr || !toStr) return "";
  const f = new Date(fromStr + "T00:00:00");
  const t = new Date(toStr + "T00:00:00");
  const fY = toBE(f.getFullYear()), tY = toBE(t.getFullYear());
  if (f.getFullYear() === t.getFullYear() && f.getMonth() === t.getMonth()) {
    return `${f.getDate()}-${t.getDate()} ${THAI_MONTHS_FULL[f.getMonth()]} ${fY}`;
  }
  if (fY === tY) {
    return `${f.getDate()} ${THAI_MONTHS_FULL[f.getMonth()]} - ${t.getDate()} ${THAI_MONTHS_FULL[t.getMonth()]} ${fY}`;
  }
  return `${f.getDate()} ${THAI_MONTHS_FULL[f.getMonth()]} ${fY} - ${t.getDate()} ${THAI_MONTHS_FULL[t.getMonth()]} ${tY}`;
};

const seedEmployees = [
  { id: "emp1", code: "001", name: "", position: "ผู้จัดการ", employeeType: "รายเดือน", bankAccountName: "", bankAccountNumber: "", baseSalary: 15000 },
];

function PayrollTab({ staffPositions }) {
  const [employees, setEmployees] = useState(seedEmployees);
  const [showRoster, setShowRoster] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(seedEmployees[0]?.id || "");

  const addEmployee = () => {
    const id = `emp${Date.now()}`;
    setEmployees([...employees, { id, code: "", name: "", position: staffPositions[0]?.name || "", employeeType: "รายเดือน", bankAccountName: "", bankAccountNumber: "", baseSalary: staffPositions[0]?.rate || 0 }]);
    setSelectedEmpId(id);
  };
  const updateEmployee = (id, field, val) => {
    setEmployees(employees.map((e) => (e.id === id ? { ...e, [field]: field === "baseSalary" ? Number(val) || 0 : val } : e)));
  };
  const removeEmployee = (id) => {
    const next = employees.filter((e) => e.id !== id);
    setEmployees(next);
    if (selectedEmpId === id) setSelectedEmpId(next[0]?.id || "");
  };

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || null;

  // ฟอร์มสลิป
  const todayIso = todayStr();
  const [periodFrom, setPeriodFrom] = useState(todayIso);
  const [periodTo, setPeriodTo] = useState(todayIso);
  const [paymentDate, setPaymentDate] = useState(todayIso);
  const [salary, setSalary] = useState(0);
  const [otRate, setOtRate] = useState(100);
  const [otHours, setOtHours] = useState(0);
  const [commission, setCommission] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [extraIncomeRows, setExtraIncomeRows] = useState([]);
  const [deductionRows, setDeductionRows] = useState([{ id: "d1", label: "หักลาหยุดไม่ตามเงื่อนไข", amount: 0 }]);
  const [approverName, setApproverName] = useState("นายภูรินท์ จิตโสภา");
  const [approverPosition, setApproverPosition] = useState("ผู้จัดการร้าน");

  // เมื่อเลือกพนักงาน เติมเงินเดือนพื้นฐานให้อัตโนมัติ (ยังแก้ไขเองได้)
  const applyEmployeeDefaults = (emp) => {
    if (!emp) return;
    setSalary(emp.baseSalary || 0);
  };

  const otAmount = (Number(otRate) || 0) * (Number(otHours) || 0);
  const addExtraIncome = () => setExtraIncomeRows([...extraIncomeRows, { id: `ei${Date.now()}`, label: "รายได้เพิ่มเติม", amount: 0 }]);
  const updateExtraIncome = (id, field, val) => setExtraIncomeRows(extraIncomeRows.map((r) => (r.id === id ? { ...r, [field]: field === "amount" ? Number(val) || 0 : val } : r)));
  const removeExtraIncome = (id) => setExtraIncomeRows(extraIncomeRows.filter((r) => r.id !== id));

  const addDeduction = () => setDeductionRows([...deductionRows, { id: `d${Date.now()}`, label: "รายการหักเพิ่มเติม", amount: 0 }]);
  const updateDeduction = (id, field, val) => setDeductionRows(deductionRows.map((r) => (r.id === id ? { ...r, [field]: field === "amount" ? Number(val) || 0 : val } : r)));
  const removeDeduction = (id) => setDeductionRows(deductionRows.filter((r) => r.id !== id));

  const totalIncome = (Number(salary) || 0) + otAmount + (Number(commission) || 0) + (Number(otherIncome) || 0) + (Number(bonus) || 0)
    + extraIncomeRows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalDeduction = deductionRows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const netPay = totalIncome - totalDeduction;

  const slipRef = useRef(null);
  const filenameSafe = `สลิปเงินเดือน-${selectedEmp?.name || "พนักงาน"}-${paymentDate}`.replace(/\s+/g, "_");

  return (
    <div>
      <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: "0 0 4px" }}>สลิปเงินเดือนพนักงาน</h1>
      <p style={{ margin: "0 0 20px", color: "#8A6E45", fontSize: 15 }}>เลือกพนักงาน กรอกรายละเอียดเงินเดือน ระบบคำนวณยอดสุทธิให้อัตโนมัติ แล้ว Export เป็น PDF ได้</p>

      {/* รายชื่อพนักงาน */}
      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showRoster ? 10 : 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B4F2A", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={14} /> รายชื่อพนักงาน ({employees.length} คน)
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            {showRoster && <button onClick={addEmployee} style={{ ...primaryBtn, padding: "6px 12px", fontSize: 13 }}><Plus size={14} /> เพิ่มพนักงาน</button>}
            <button onClick={() => setShowRoster(!showRoster)} style={{ ...primaryBtn, padding: "6px 12px", fontSize: 13.5, background: showRoster ? "#FBF3E1" : "#2E1F0D", color: showRoster ? "#6B4F2A" : "#FBF3E1", border: showRoster ? "1px solid #EADFC4" : "none" }}>
              {showRoster ? "ซ่อน" : "จัดการรายชื่อ"}
            </button>
          </div>
        </div>
        {showRoster && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {employees.map((e) => (
              <div key={e.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "6px 0", borderBottom: "1px solid #F1E7D0" }}>
                <input type="text" placeholder="รหัสพนักงาน" value={e.code} onChange={(ev) => updateEmployee(e.id, "code", ev.target.value)} style={{ ...inputStyle, width: 90 }} />
                <input type="text" placeholder="ชื่อ-นามสกุล" value={e.name} onChange={(ev) => updateEmployee(e.id, "name", ev.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
                <select value={e.position} onChange={(ev) => updateEmployee(e.id, "position", ev.target.value)} style={{ ...inputStyle, minWidth: 130 }}>
                  {staffPositions.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  <option value={e.position}>{staffPositions.some((p) => p.name === e.position) ? "" : e.position}</option>
                </select>
                <select value={e.employeeType} onChange={(ev) => updateEmployee(e.id, "employeeType", ev.target.value)} style={{ ...inputStyle, width: 110 }}>
                  <option value="รายเดือน">รายเดือน</option>
                  <option value="รายวัน">รายวัน</option>
                  <option value="พาร์ทไทม์">พาร์ทไทม์</option>
                </select>
                <input type="text" placeholder="ธนาคาร/บัญชี" value={e.bankAccountName} onChange={(ev) => updateEmployee(e.id, "bankAccountName", ev.target.value)} style={{ ...inputStyle, width: 120 }} />
                <input type="text" placeholder="เลขที่บัญชี" value={e.bankAccountNumber} onChange={(ev) => updateEmployee(e.id, "bankAccountNumber", ev.target.value)} style={{ ...inputStyle, width: 130 }} />
                <span style={{ fontSize: 12.5, color: "#8A6E45" }}>เงินเดือนพื้นฐาน</span>
                <input type="number" min={0} value={e.baseSalary} onChange={(ev) => updateEmployee(e.id, "baseSalary", ev.target.value)} style={{ ...inputStyle, width: 90, textAlign: "right" }} />
                <DeleteBtn onClick={() => removeEmployee(e.id)} />
              </div>
            ))}
            {employees.length === 0 && <p style={{ color: "#B99B6B", fontSize: 13 }}>ยังไม่มีพนักงาน กด "เพิ่มพนักงาน" เพื่อเริ่มต้น</p>}
          </div>
        )}
      </div>

      {/* เลือกพนักงานสำหรับออกสลิป */}
      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18, marginBottom: 22 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", marginBottom: 16 }}>
          <Field label="เลือกพนักงาน">
            <select
              value={selectedEmpId}
              onChange={(e) => { setSelectedEmpId(e.target.value); applyEmployeeDefaults(employees.find((x) => x.id === e.target.value)); }}
              style={{ ...inputStyle, minWidth: 200 }}
            >
              {employees.length === 0 && <option value="">— ยังไม่มีพนักงาน —</option>}
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name || "(ยังไม่ตั้งชื่อ)"} — {e.position}</option>)}
            </select>
          </Field>
          <Field label="งวดวันที่ (จาก)"><input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} style={inputStyle} /></Field>
          <Field label="ถึง"><input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} style={inputStyle} /></Field>
          <Field label="วันที่จ่าย"><input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} style={inputStyle} /></Field>
        </div>

        {selectedEmp ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
              {/* รายได้ */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#4A320F", margin: "0 0 10px" }}>รายได้</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 13.5 }}>เงินเดือน</span>
                    <input type="number" min={0} value={salary} onChange={(e) => setSalary(e.target.value)} style={{ ...inputStyle, width: 110, textAlign: "right" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 13.5 }}>ค่าล่วงเวลา (อัตรา×ชม.)</span>
                    <input type="number" min={0} value={otRate} onChange={(e) => setOtRate(e.target.value)} title="อัตราบาท/ชม." style={{ ...inputStyle, width: 70, textAlign: "right" }} />
                    <span style={{ fontSize: 12.5, color: "#8A6E45" }}>×</span>
                    <input type="number" min={0} value={otHours} onChange={(e) => setOtHours(e.target.value)} title="จำนวนชั่วโมง" style={{ ...inputStyle, width: 60, textAlign: "right" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 70, textAlign: "right" }}>฿{fmt(otAmount)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 13.5 }}>ค่าคอมมิชชั่น</span>
                    <input type="number" min={0} value={commission} onChange={(e) => setCommission(e.target.value)} style={{ ...inputStyle, width: 110, textAlign: "right" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 13.5 }}>เงินได้อื่นๆ</span>
                    <input type="number" min={0} value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} style={{ ...inputStyle, width: 110, textAlign: "right" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 13.5 }}>เงินพิเศษ</span>
                    <input type="number" min={0} value={bonus} onChange={(e) => setBonus(e.target.value)} style={{ ...inputStyle, width: 110, textAlign: "right" }} />
                  </div>
                  {extraIncomeRows.map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="text" value={r.label} onChange={(e) => updateExtraIncome(r.id, "label", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      <input type="number" min={0} value={r.amount} onChange={(e) => updateExtraIncome(r.id, "amount", e.target.value)} style={{ ...inputStyle, width: 110, textAlign: "right" }} />
                      <DeleteBtn onClick={() => removeExtraIncome(r.id)} />
                    </div>
                  ))}
                  <button onClick={addExtraIncome} style={{ ...ghostBtn, alignSelf: "flex-start", marginTop: 4 }}><Plus size={13} /> เพิ่มรายได้</button>
                </div>
              </div>

              {/* รายการหัก */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#B23A2E", margin: "0 0 10px" }}>รายการหัก</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {deductionRows.map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="text" value={r.label} onChange={(e) => updateDeduction(r.id, "label", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      <input type="number" min={0} value={r.amount} onChange={(e) => updateDeduction(r.id, "amount", e.target.value)} style={{ ...inputStyle, width: 110, textAlign: "right" }} />
                      <DeleteBtn onClick={() => removeDeduction(r.id)} />
                    </div>
                  ))}
                  <button onClick={addDeduction} style={{ ...ghostBtn, alignSelf: "flex-start", marginTop: 4 }}><Plus size={13} /> เพิ่มรายการหัก</button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
              <Field label="ผู้อนุมัติ"><input type="text" value={approverName} onChange={(e) => setApproverName(e.target.value)} style={{ ...inputStyle, minWidth: 160 }} /></Field>
              <Field label="ตำแหน่งผู้อนุมัติ"><input type="text" value={approverPosition} onChange={(e) => setApproverPosition(e.target.value)} style={{ ...inputStyle, minWidth: 140 }} /></Field>
            </div>
          </>
        ) : (
          <p style={{ color: "#B99B6B", fontSize: 13.5 }}>เพิ่มพนักงานในรายชื่อด้านบนก่อน จึงจะออกสลิปได้</p>
        )}
      </div>

      {selectedEmp && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Roboto', sans-serif" }}>ตัวอย่างสลิปเงินเดือน</h3>
            <ExportButtons targetRef={slipRef} filename={filenameSafe} />
          </div>

          {/* ตัวสลิป — เค้าโครงตามไฟล์ตัวอย่าง */}
          <div ref={slipRef} style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 12, padding: 32, maxWidth: 820, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
              <img src={LOGO_DATA_URI} alt="Rove & Rounds Coffee" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>ROVE AND ROUND COFFEE</div>
                <div style={{ fontSize: 12.5, color: "#3A2712" }}>เลขที่ 1/18 ถ.ไทรบุรี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา 90000</div>
                <div style={{ fontSize: 12.5, color: "#3A2712" }}>E-mail : roveandround1@gmail.com</div>
              </div>
            </div>
            <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              สลิปเงินเดือน ประจำเดือนวันที่ {formatThaiRange(periodFrom, periodTo)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 13, marginBottom: 16 }}>
              <div>รหัสพนักงาน &nbsp; {selectedEmp.code}</div>
              <div>ชื่อ-นามสกุล &nbsp; {selectedEmp.name}</div>
              <div>ตำแหน่ง &nbsp; {selectedEmp.position}</div>
              <div>โอนเข้าบัญชี &nbsp; {selectedEmp.bankAccountName}</div>
              <div>ประเภทพนักงาน &nbsp; {selectedEmp.employeeType}</div>
              <div>เลขที่บัญชี &nbsp; {selectedEmp.bankAccountNumber}</div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "#FBF3E1" }}>
                  <th style={{ border: "1px solid #EADFC4", padding: "8px 10px", textAlign: "left" }}>รายได้</th>
                  <th style={{ border: "1px solid #EADFC4", padding: "8px 10px", textAlign: "right", width: 100 }}>จำนวนเงิน (บาท)</th>
                  <th style={{ border: "1px solid #EADFC4", padding: "8px 10px", textAlign: "left" }}>รายการหัก</th>
                  <th style={{ border: "1px solid #EADFC4", padding: "8px 10px", textAlign: "right", width: 100 }}>จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(5 + extraIncomeRows.length, deductionRows.length) }).map((_, i) => {
                  const incomeLabels = [
                    { label: "เงินเดือน", amount: salary },
                    { label: "ค่าล่วงเวลา", amount: otAmount },
                    { label: "ค่าคอมมิชชั่น", amount: commission },
                    { label: "เงินได้อื่นๆ", amount: otherIncome },
                    { label: "เงินพิเศษ", amount: bonus },
                    ...extraIncomeRows,
                  ];
                  const inc = incomeLabels[i];
                  const ded = deductionRows[i];
                  return (
                    <tr key={i}>
                      <Td style={{ borderBottom: "none" }}>{inc ? inc.label : ""}</Td>
                      <Td style={{ borderBottom: "none", textAlign: "right" }}>{inc ? (Number(inc.amount) ? fmt(inc.amount) : "-") : ""}</Td>
                      <Td style={{ borderBottom: "none" }}>{ded ? ded.label : ""}</Td>
                      <Td style={{ borderBottom: "none", textAlign: "right" }}>{ded ? (Number(ded.amount) ? fmt(ded.amount) : "-") : ""}</Td>
                    </tr>
                  );
                })}
                <tr style={{ background: "#FBF3E1", fontWeight: 700 }}>
                  <Td style={{ borderBottom: "none" }}>รวมเงินรายได้ทั้งหมด</Td>
                  <Td style={{ borderBottom: "none", textAlign: "right" }}>{fmt(totalIncome)}</Td>
                  <Td style={{ borderBottom: "none" }}>รวมรายการหักทั้งหมด</Td>
                  <Td style={{ borderBottom: "none", textAlign: "right" }}>{fmt(totalDeduction)}</Td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#FBF3E1" }}>
                      <th style={{ border: "1px solid #EADFC4", padding: "8px 10px", textAlign: "left" }}>วัน/เดือน/ปี ที่จ่าย</th>
                      <th style={{ border: "1px solid #EADFC4", padding: "8px 10px", textAlign: "right" }}>ยอดเงินสุทธิ (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <Td style={{ borderBottom: "1px solid #EADFC4" }}>{formatThaiDateFull(paymentDate)}</Td>
                      <Td style={{ borderBottom: "1px solid #EADFC4", textAlign: "right", fontWeight: 700 }}>{fmt(netPay)}</Td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ fontSize: 12, color: "#8A6E45", marginTop: 8 }}>ลายมือชื่อพนักงาน …………………………</p>
              </div>
              <div style={{ textAlign: "center", fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 30 }}>ลายมือผู้อนุมัติ</div>
                <div>ลงชื่อ………………………………………………</div>
                <div style={{ marginTop: 4 }}>({approverName})</div>
                <div>ตำแหน่ง {approverPosition}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Menu tab: หมวดหมู่ (รวมเบเกอรี่) ----------
function MenuTab({ menu, setMenu, menuCats, setMenuCats }) {
  const allCats = [...menuCats, BAKERY];
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState(allCats[0]);
  const [activeCat, setActiveCat] = useState("ทั้งหมด");
  const [newCat, setNewCat] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const addItem = () => {
    if (!name || !price || !cost) return;
    setMenu([...menu, { id: `m${Date.now()}`, name, price: Number(price), cost: Number(cost), category }]);
    setName(""); setPrice(""); setCost("");
  };
  const removeItem = (id) => setMenu(menu.filter((m) => m.id !== id));

  const addCategory = () => {
    const trimmed = newCat.trim();
    if (!trimmed || allCats.includes(trimmed)) return;
    setMenuCats([...menuCats, trimmed]);
    setCategory(trimmed);
    setNewCat("");
    setShowAddCat(false);
  };
  const removeCategory = (cat) => {
    if (cat === BAKERY) return;
    if (menu.some((m) => m.category === cat)) return;
    setMenuCats(menuCats.filter((c) => c !== cat));
    if (activeCat === cat) setActiveCat("ทั้งหมด");
    if (category === cat) setCategory(allCats.find((c) => c !== cat) || "");
  };

  const filterTabs = ["ทั้งหมด", ...allCats];
  const shown = activeCat === "ทั้งหมด" ? menu : menu.filter((m) => m.category === activeCat);
  const grouped = allCats.map((cat) => ({ cat, items: shown.filter((m) => m.category === cat) })).filter((g) => g.items.length > 0);

  const exportRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>เมนู (ราคา / ต้นทุน)</h1>
        <ExportButtons targetRef={exportRef} filename="เมนู-ราคาต้นทุน" />
      </div>
      <p style={{ margin: "0 0 20px", color: "#8A6E45", fontSize: 15 }}>
        แยกหมวดหมู่ครบ 7 หมวด รวมเบเกอรี่ — ใช้ดูกำไรต่อเมนู และเป็นฐานคำนวณกำไร/ต้นทุนเบเกอรี่ในหน้า "สรุปรายได้-รายจ่าย"
      </p>

      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B4F2A", margin: 0 }}>หมวดหมู่เมนูทั้งหมด</h3>
          {!showAddCat && <button onClick={() => setShowAddCat(true)} style={{ ...primaryBtn, padding: "6px 12px", fontSize: 13.5 }}><Plus size={14} /> เพิ่มหมวดหมู่</button>}
        </div>
        {showAddCat && (
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่" style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addCategory()} />
            <button onClick={addCategory} style={primaryBtn}>บันทึก</button>
            <button onClick={() => { setShowAddCat(false); setNewCat(""); }} style={{ ...primaryBtn, background: "#FBF3E1", color: "#6B4F2A", border: "1px solid #EADFC4" }}>ยกเลิก</button>
          </div>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {allCats.map((c) => {
            const inUse = menu.some((m) => m.category === c);
            const isBakery = c === BAKERY;
            return (
              <span key={c} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 12px", borderRadius: 20, background: isBakery ? "#FBEFD6" : "#FBF3E1", border: "1px solid #EADFC4", fontSize: 13.5 }}>
                {isBakery && <Cookie size={12} color="#E3A730" />}
                {c}
                {!isBakery && (
                  <button onClick={() => removeCategory(c)} disabled={inUse} title={inUse ? "ยังมีเมนูในหมวดนี้ ลบเมนูออกก่อน" : "ลบหมวดหมู่"} style={{ background: "transparent", border: "none", cursor: inUse ? "not-allowed" : "pointer", color: inUse ? "#C9B896" : "#B99B6B", display: "flex", padding: 0 }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18, display: "flex", gap: 12, alignItems: "end", marginBottom: 18, flexWrap: "wrap" }}>
        <Field label="ชื่อเมนู"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น มอคค่า" style={{ ...inputStyle, minWidth: 180 }} /></Field>
        <Field label="หมวดหมู่">
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
            {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="ราคาขาย (บาท)"><input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} style={{ ...inputStyle, width: 110 }} /></Field>
        <Field label="ต้นทุน (บาท)"><input type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} style={{ ...inputStyle, width: 110 }} /></Field>
        <button onClick={addItem} style={primaryBtn}><Plus size={16} /> เพิ่มเมนู</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {filterTabs.map((c) => (
          <button key={c} onClick={() => setActiveCat(c)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid #EADFC4",
            background: activeCat === c ? "#2E1F0D" : "#FFFFFF", color: activeCat === c ? "#FBF3E1" : "#3A2712",
            fontSize: 13.5, fontWeight: 500, cursor: "pointer",
          }}>{c}</button>
        ))}
      </div>

      {grouped.length === 0 && (
        <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "24px 16px", textAlign: "center", color: "#B99B6B", fontSize: 14.5 }}>ยังไม่มีเมนูในหมวดนี้</div>
      )}

      {grouped.map((g) => (
        <div key={g.cat} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#6B4F2A", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: g.cat === BAKERY ? "#E3A730" : "#4A320F" }} />
            {g.cat} <span style={{ color: "#B99B6B", fontWeight: 400 }}>({g.items.length} รายการ)</span>
          </h3>
          <TableShell headers={["ชื่อเมนู", "ราคาขาย", "ต้นทุน", "กำไร/หน่วย", "% กำไร", ""]}>
            {g.items.map((m) => {
              const margin = m.price - m.cost;
              const pct = m.price ? (margin / m.price) * 100 : 0;
              return (
                <tr key={m.id}>
                  <Td style={{ fontWeight: 500 }}>{m.name}</Td>
                  <Td>฿{fmt(m.price)}</Td>
                  <Td>฿{fmt(m.cost)}</Td>
                  <Td style={{ color: "#4A320F", fontWeight: 600 }}>฿{fmt(margin)}</Td>
                  <Td>{pct.toFixed(0)}%</Td>
                  <Td><DeleteBtn onClick={() => removeItem(m.id)} /></Td>
                </tr>
              );
            })}
          </TableShell>
        </div>
      ))}
    </div>
  );
}

// ---------- Cost detail tab: รายละเอียดต้นทุนวัตถุดิบ แยก 3 หมวด (บาร์/ครัว/เบเกอรี่) ----------
function CostDetailTab({ costItems, setCostItems }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [brand, setBrand] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState(costCategories[0]);
  const [activeCat, setActiveCat] = useState("ทั้งหมด");

  const addItem = () => {
    if (!name || !unit || !pricePerUnit) return;
    setCostItems([...costItems, { id: `c${Date.now()}`, category, name, unit, brand, pricePerUnit: Number(pricePerUnit), source }]);
    setName(""); setUnit(""); setBrand(""); setPricePerUnit(""); setSource("");
  };
  const removeItem = (id) => setCostItems(costItems.filter((c) => c.id !== id));

  const filterTabs = ["ทั้งหมด", ...costCategories];
  const shown = activeCat === "ทั้งหมด" ? costItems : costItems.filter((c) => c.category === activeCat);
  const grouped = costCategories.map((cat) => ({ cat, items: shown.filter((c) => c.category === cat) })).filter((g) => g.items.length > 0);

  const exportRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>รายละเอียดต้นทุน</h1>
        <ExportButtons targetRef={exportRef} filename="รายละเอียดต้นทุน" />
      </div>
      <p style={{ margin: "0 0 20px", color: "#8A6E45", fontSize: 15 }}>รายการวัตถุดิบแยกตามหมวด บาร์ / ครัว / เบเกอรี่ พร้อมหน่วย ยี่ห้อ ราคาต่อหน่วย และแหล่งซื้อ</p>

      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18, display: "flex", gap: 12, alignItems: "end", marginBottom: 18, flexWrap: "wrap" }}>
        <Field label="หมวดหมู่">
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, minWidth: 130 }}>
            {costCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="รายการ"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น เมล็ดกาแฟ" style={{ ...inputStyle, minWidth: 160 }} /></Field>
        <Field label="หน่วย"><input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="เช่น กิโลกรัม" style={{ ...inputStyle, width: 120 }} /></Field>
        <Field label="ยี่ห้อ"><input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="เช่น Doi Chaang" style={{ ...inputStyle, width: 140 }} /></Field>
        <Field label="ราคาต่อหน่วย (บาท)"><input type="number" min={0} value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} style={{ ...inputStyle, width: 120 }} /></Field>
        <Field label="แหล่งซื้อ"><input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="เช่น แม็คโคร" style={{ ...inputStyle, minWidth: 140 }} /></Field>
        <button onClick={addItem} style={primaryBtn}><Plus size={16} /> เพิ่มรายการ</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {filterTabs.map((c) => (
          <button key={c} onClick={() => setActiveCat(c)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid #EADFC4",
            background: activeCat === c ? "#2E1F0D" : "#FFFFFF", color: activeCat === c ? "#FBF3E1" : "#3A2712",
            fontSize: 13.5, fontWeight: 500, cursor: "pointer",
          }}>{c}</button>
        ))}
      </div>

      {grouped.length === 0 && (
        <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "24px 16px", textAlign: "center", color: "#B99B6B", fontSize: 14.5 }}>ยังไม่มีรายการวัตถุดิบในหมวดนี้</div>
      )}

      {grouped.map((g) => (
        <div key={g.cat} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#6B4F2A", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "#4A320F" }} />
            {g.cat} <span style={{ color: "#B99B6B", fontWeight: 400 }}>({g.items.length} รายการ)</span>
          </h3>
          <TableShell headers={["รายการ", "หน่วย", "ยี่ห้อ", "ราคาต่อหน่วย", "แหล่งซื้อ", ""]}>
            {g.items.map((c) => (
              <tr key={c.id}>
                <Td style={{ fontWeight: 500 }}>{c.name}</Td>
                <Td>{c.unit}</Td>
                <Td style={{ color: "#8A6E45" }}>{c.brand || "—"}</Td>
                <Td style={{ fontWeight: 600 }}>฿{fmt(c.pricePerUnit)}</Td>
                <Td style={{ color: "#8A6E45" }}>{c.source || "—"}</Td>
                <Td><DeleteBtn onClick={() => removeItem(c.id)} /></Td>
              </tr>
            ))}
          </TableShell>
        </div>
      ))}
    </div>
  );
}

// ---------- Recipe cost tab: คำนวณต้นทุนเมนู จากวัตถุดิบในหน้ารายละเอียดต้นทุน ----------
function RecipeCostTab({ costItems, recipes, setRecipes }) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(costCategories[0]);
  const [activeCat, setActiveCat] = useState("ทั้งหมด");

  const addRecipe = () => {
    if (!newName) return;
    setRecipes([...recipes, { id: `rc${Date.now()}`, name: newName, category: newCategory, ingredients: [] }]);
    setNewName("");
  };
  const removeRecipe = (id) => setRecipes(recipes.filter((r) => r.id !== id));

  const addIngredient = (recipeId) => {
    setRecipes(recipes.map((r) => {
      if (r.id !== recipeId) return r;
      const firstMatch = costItems.find((c) => c.category === r.category);
      return { ...r, ingredients: [...r.ingredients, { id: `ing${Date.now()}`, costItemId: firstMatch?.id || "", qty: 1, unit: firstMatch?.unit || "" }] };
    }));
  };
  const updateIngredient = (recipeId, ingId, field, val) => {
    setRecipes(recipes.map((r) => {
      if (r.id !== recipeId) return r;
      return {
        ...r,
        ingredients: r.ingredients.map((ing) => {
          if (ing.id !== ingId) return ing;
          if (field === "qty") return { ...ing, qty: Number(val) || 0 };
          if (field === "costItemId") {
            // เปลี่ยนวัตถุดิบ -> รีเซ็ตหน่วยเป็นหน่วยตั้งต้นของวัตถุดิบนั้น
            const newItem = costItems.find((c) => c.id === val);
            return { ...ing, costItemId: val, unit: newItem?.unit || "" };
          }
          return { ...ing, [field]: val };
        }),
      };
    }));
  };
  const removeIngredient = (recipeId, ingId) => {
    setRecipes(recipes.map((r) => r.id === recipeId ? { ...r, ingredients: r.ingredients.filter((ing) => ing.id !== ingId) } : r));
  };

  const recipeCost = (recipe) => recipe.ingredients.reduce((sum, ing) => {
    const item = costItems.find((c) => c.id === ing.costItemId);
    const unitPrice = pricePerConvertedUnit(item, ing.unit || item?.unit);
    return sum + unitPrice * ing.qty;
  }, 0);

  const filterTabs = ["ทั้งหมด", ...costCategories];
  const shownRecipes = activeCat === "ทั้งหมด" ? recipes : recipes.filter((r) => r.category === activeCat);
  const grouped = costCategories.map((cat) => ({ cat, items: shownRecipes.filter((r) => r.category === cat) })).filter((g) => g.items.length > 0);

  const exportRef = useRef(null);

  return (
    <div ref={exportRef}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>คำนวณต้นทุนเมนู</h1>
        <ExportButtons targetRef={exportRef} filename="คำนวณต้นทุนเมนู" />
      </div>
      <p style={{ margin: "0 0 20px", color: "#8A6E45", fontSize: 15 }}>
        เลือกวัตถุดิบจากหน้า "รายละเอียดต้นทุน" มาประกอบเป็นเมนู ระบุปริมาณและเลือกหน่วยที่ใช้ได้ (เช่น ตั้งราคาต่อกิโลกรัมไว้ แต่ใช้จริงเป็นกรัม) ระบบแปลงหน่วยและคำนวณต้นทุนรวมให้อัตโนมัติ — แยกหมวดบาร์ / ครัว / เบเกอรี่
      </p>

      {costItems.length === 0 && (
        <div style={{ background: "#FBEFD6", border: "1px solid #F0D9A0", borderRadius: 14, padding: 16, marginBottom: 18, color: "#8A4A12", fontSize: 14 }}>
          ยังไม่มีวัตถุดิบในหน้า "รายละเอียดต้นทุน" กรุณาเพิ่มวัตถุดิบก่อน จึงจะเลือกมาประกอบเมนูได้
        </div>
      )}

      <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18, display: "flex", gap: 12, alignItems: "end", marginBottom: 18, flexWrap: "wrap" }}>
        <Field label="ชื่อเมนู"><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="เช่น ลาเต้เย็น" style={{ ...inputStyle, minWidth: 180 }} /></Field>
        <Field label="หมวดหมู่">
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
            {costCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <button onClick={addRecipe} style={primaryBtn}><Plus size={16} /> เพิ่มเมนู</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {filterTabs.map((c) => (
          <button key={c} onClick={() => setActiveCat(c)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid #EADFC4",
            background: activeCat === c ? "#2E1F0D" : "#FFFFFF", color: activeCat === c ? "#FBF3E1" : "#3A2712",
            fontSize: 13.5, fontWeight: 500, cursor: "pointer",
          }}>{c}</button>
        ))}
      </div>

      {grouped.length === 0 && (
        <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: "24px 16px", textAlign: "center", color: "#B99B6B", fontSize: 14.5 }}>ยังไม่มีเมนูในหมวดนี้</div>
      )}

      {grouped.map((g) => (
        <div key={g.cat} style={{ marginBottom: 22 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#6B4F2A", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "#4A320F" }} />
            {g.cat} <span style={{ color: "#B99B6B", fontWeight: 400 }}>({g.items.length} เมนู)</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {g.items.map((recipe) => (
              <div key={recipe.id} style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{recipe.name}</h4>
                  <DeleteBtn onClick={() => removeRecipe(recipe.id)} />
                </div>

                <TableShell headers={["วัตถุดิบ", "ปริมาณที่ใช้", "หน่วยที่ใช้", "ราคาต่อหน่วย", "ต้นทุน", ""]}>
                  {recipe.ingredients.map((ing) => {
                    const item = costItems.find((c) => c.id === ing.costItemId);
                    const unitOptions = getUnitOptions(item?.unit);
                    const effectiveUnit = ing.unit || item?.unit || "";
                    const unitPrice = pricePerConvertedUnit(item, effectiveUnit);
                    const cost = unitPrice * ing.qty;
                    const categoryItems = costItems.filter((c) => c.category === recipe.category);
                    return (
                      <tr key={ing.id}>
                        <Td>
                          <select value={ing.costItemId} onChange={(e) => updateIngredient(recipe.id, ing.id, "costItemId", e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                            {categoryItems.length === 0 && <option value="">ไม่มีวัตถุดิบในหมวดนี้</option>}
                            {categoryItems.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </Td>
                        <Td>
                          <input type="number" min={0} step="0.01" value={ing.qty} onChange={(e) => updateIngredient(recipe.id, ing.id, "qty", e.target.value)} style={{ ...inputStyle, width: 80, textAlign: "right" }} />
                        </Td>
                        <Td>
                          <select value={effectiveUnit} onChange={(e) => updateIngredient(recipe.id, ing.id, "unit", e.target.value)} style={{ ...inputStyle, width: 100 }}>
                            {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </Td>
                        <Td>฿{fmt(unitPrice)} <span style={{ color: "#B99B6B", fontSize: 12 }}>/{effectiveUnit}</span></Td>
                        <Td style={{ fontWeight: 600, color: "#4A320F" }}>฿{fmt(cost)}</Td>
                        <Td><DeleteBtn onClick={() => removeIngredient(recipe.id, ing.id)} /></Td>
                      </tr>
                    );
                  })}
                  {recipe.ingredients.length === 0 && <EmptyRow colSpan={6} text="ยังไม่มีวัตถุดิบในเมนูนี้" />}
                </TableShell>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                  {(() => {
                    const hasCategoryItems = costItems.some((c) => c.category === recipe.category);
                    return (
                      <button onClick={() => addIngredient(recipe.id)} disabled={!hasCategoryItems} title={!hasCategoryItems ? `ยังไม่มีวัตถุดิบในหมวด ${recipe.category}` : ""} style={{ ...primaryBtn, padding: "6px 12px", fontSize: 13.5, opacity: !hasCategoryItems ? 0.5 : 1 }}>
                        <Plus size={14} /> เพิ่มวัตถุดิบ
                      </button>
                    );
                  })()}
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 13, color: "#8A6E45", marginRight: 8 }}>ต้นทุนรวมของเมนูนี้</span>
                    <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 24, fontWeight: 600, color: "#2E1F0D" }}>฿{fmt(recipeCost(recipe))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- shared bits ----------
const inputStyle = { border: "1px solid #EADFC4", borderRadius: 8, padding: "8px 10px", fontSize: 14.5, background: "#FBF3E1", color: "#2E1F0D", outline: "none" };
const primaryBtn = { display: "flex", alignItems: "center", gap: 6, background: "#4A320F", color: "#FFFFFF", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(74,50,15,0.35)" };
const primaryBtnGhost = { display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", color: "#4A320F", border: "1px solid #EADFC4", borderRadius: 9, padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" };

function Field({ label, children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={{ fontSize: 13, color: "#8A6E45", fontWeight: 500 }}>{label}</label>{children}</div>;
}
function TableShell({ headers, children }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #EADFC4", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,42,32,0.06)", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 560 }}>
        <thead>
          <tr style={{ background: "#FBF3E1", borderBottom: "1px solid #EADFC4" }}>
            {headers.map((h, i) => <th key={i} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6B4F2A", fontSize: 13, whiteSpace: "nowrap" }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Td({ children, style }) { return <td style={{ padding: "10px 14px", borderBottom: "1px solid #F5E9CE", whiteSpace: "nowrap", ...style }}>{children}</td>; }
function EmptyRow({ colSpan, text }) { return <tr><td colSpan={colSpan} style={{ padding: "24px 16px", textAlign: "center", color: "#B99B6B", fontSize: 14.5 }}>{text}</td></tr>; }
function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B99B6B", padding: 4, borderRadius: 6, display: "flex" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#B23A2E")} onMouseLeave={(e) => (e.currentTarget.style.color = "#B99B6B")}>
      <Trash2 size={15} />
    </button>
  );
}
function EditBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B99B6B", padding: 4, borderRadius: 6, display: "flex" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#4A320F")} onMouseLeave={(e) => (e.currentTarget.style.color = "#B99B6B")}>
      <Pencil size={15} />
    </button>
  );
}

// ---------- หน้าล็อกอิน ----------
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const data = await supaSignIn(email, password);
      onLogin(data.access_token, data.user?.email || email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Roboto', 'Noto Sans Thai', sans-serif", background: "#FBF3E1", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", color: "#2E1F0D",
    }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button, input { font-family: inherit; }
      `}</style>

      <div style={{
        background: "#FFFFFF", borderRadius: 20, padding: "36px 32px", width: 340,
        boxShadow: "0 8px 30px rgba(74,50,15,0.15)", border: "1px solid #EADFC4",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: 20, overflow: "hidden",
          boxShadow: "0 6px 18px rgba(74,50,15,0.28)", border: "3px solid #E3A730",
        }}>
          <img src={LOGO_DATA_URI} alt="Rove & Rounds Coffee" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 20, color: "#4A320F" }}>Rove & Rounds</div>
          <div style={{ fontSize: 13, color: "#8A6E45", letterSpacing: 1.5 }}>COFFEE — ระบบจัดการร้าน</div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <Field label="อีเมล">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" style={{ ...inputStyle, width: "100%" }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>
          <Field label="รหัสผ่าน">
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" style={{ ...inputStyle, width: "100%" }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>
        </div>

        {error && (
          <div style={{ width: "100%", background: "#FBEFD6", border: "1px solid #F0D9A0", borderRadius: 8, padding: "8px 10px", fontSize: 12.5, color: "#B23A2E" }}>
            {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{ ...primaryBtn, width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <p style={{ fontSize: 11.5, color: "#B99B6B", textAlign: "center", margin: 0 }}>
          บัญชีสร้างโดยแอดมินใน Supabase Authentication เท่านั้น
        </p>
      </div>
    </div>
  );
}

// ---------- Root: จัดการสถานะล็อกอิน ----------
export default function Root() {
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  if (!token) {
    return <LoginScreen onLogin={(t, email) => { setToken(t); setUserEmail(email); }} />;
  }

  return (
    <CafeManager
      token={token}
      userEmail={userEmail}
      onLogout={() => { setToken(null); setUserEmail(""); }}
    />
  );
}

